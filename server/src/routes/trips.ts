import { Router, Request, Response } from 'express';
import { Trip } from '../models/Trip.js';
import { Truck } from '../models/Truck.js';
import {
  prepareTripData,
  syncTripsForDate,
  getExpenseTotalForDate,
  formatTripResponse,
} from '../services/tripService.js';

const router = Router();

// GET /api/trips?truck=&start=&end=
router.get('/', async (req: Request, res: Response) => {
  try {
    const { truck, start, end } = req.query;

    const filter: any = {};

    if (truck) {
      const truckDoc = await Truck.findById(truck);
      if (!truckDoc) {
        res.json({ rows: [] });
        return;
      }
      filter.truck = truckDoc._id;
    }

    if (start || end) {
      filter.date = {};
      if (start) filter.date.$gte = new Date(start as string);
      if (end) {
        const endDate = new Date(end as string);
        endDate.setHours(23, 59, 59, 999);
        filter.date.$lte = endDate;
      }
    }

    const trips = await Trip.find(filter)
      .populate('truck', 'truckName')
      .sort({ date: 1, createdAt: 1 });

    const rows = trips.map((t) => formatTripResponse(t as any));
    res.json({ rows });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/trips
router.post('/', async (req: Request, res: Response) => {
  try {
    const { truckId, date, status, shipmentNumber, rate, trips, crewSalary, cashAdvance, reimbursements, note } = req.body;

    if (!truckId) {
      res.status(400).json({ error: 'Truck is required.' });
      return;
    }

    const truck = await Truck.findById(truckId);
    if (!truck) {
      res.status(404).json({ error: 'Truck not found.' });
      return;
    }

    if (!date) {
      res.status(400).json({ error: 'Date is required.' });
      return;
    }

    const parsedDate = new Date(date);
    const { total: expenseTotal } = await getExpenseTotalForDate(truck._id as any, parsedDate);

    // Check if this is the first trip for this date
    const startOfDay = new Date(parsedDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(parsedDate);
    endOfDay.setHours(23, 59, 59, 999);
    const existingTrips = await Trip.countDocuments({
      truck: truck._id,
      date: { $gte: startOfDay, $lte: endOfDay },
    });
    const applyExpense = existingTrips === 0;

    const tripData = prepareTripData({
      date: parsedDate,
      status,
      dayOff: truck.dayOff,
      shipmentNumber,
      rate: Number(rate) || 0,
      trips: Number(trips) || 0,
      crewSalary: Number(crewSalary) || 0,
      cashAdvance: Number(cashAdvance) || 0,
      reimbursements: Number(reimbursements) || 0,
      note,
      expenses: applyExpense ? expenseTotal : 0,
    });

    const trip = await Trip.create({
      truck: truck._id,
      ...tripData,
    });

    // Re-sync all trips for this date if there are multiple
    if (existingTrips > 0) {
      await syncTripsForDate(truck._id as any, parsedDate);
    }

    const populated = await Trip.findById(trip._id).populate('truck', 'truckName');
    res.status(201).json(formatTripResponse(populated as any));
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/trips/:id
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { date, status, shipmentNumber, rate, trips, crewSalary, cashAdvance, reimbursements, note } = req.body;

    const existingTrip = await Trip.findById(req.params.id).populate('truck', 'truckName dayOff');
    if (!existingTrip) {
      res.status(404).json({ error: 'Trip not found.' });
      return;
    }

    const truck = await Truck.findById(existingTrip.truck);
    const parsedDate = date ? new Date(date) : existingTrip.date;

    const tripData = prepareTripData({
      date: parsedDate,
      status,
      dayOff: truck?.dayOff ?? 0,
      shipmentNumber,
      rate: Number(rate) || 0,
      trips: Number(trips) || 0,
      crewSalary: Number(crewSalary) || 0,
      cashAdvance: Number(cashAdvance) || 0,
      reimbursements: Number(reimbursements) || 0,
      note,
      paid: existingTrip.paid,
      expenses: existingTrip.expenses,
    });

    await Trip.findByIdAndUpdate(req.params.id, tripData);

    // Re-sync expenses for both old and new dates
    await syncTripsForDate(existingTrip.truck as any, existingTrip.date);
    if (parsedDate.toDateString() !== existingTrip.date.toDateString()) {
      await syncTripsForDate(existingTrip.truck as any, parsedDate);
    }

    const updated = await Trip.findById(req.params.id).populate('truck', 'truckName');
    res.json(formatTripResponse(updated as any));
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/trips/:id
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const trip = await Trip.findById(req.params.id);
    if (!trip) {
      res.status(404).json({ error: 'Trip not found.' });
      return;
    }

    const truckId = trip.truck;
    const tripDate = trip.date;

    await Trip.findByIdAndDelete(req.params.id);

    // Re-sync remaining trips for this date
    await syncTripsForDate(truckId as any, tripDate);

    res.json({ ok: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/trips/:id/toggle-paid
router.patch('/:id/toggle-paid', async (req: Request, res: Response) => {
  try {
    const trip = await Trip.findById(req.params.id);
    if (!trip) {
      res.status(404).json({ error: 'Trip not found.' });
      return;
    }

    const newPaid = !trip.paid;
    const totalPayable = trip.crewSalary - trip.cashAdvance + trip.reimbursements;

    await Trip.findByIdAndUpdate(req.params.id, {
      paid: newPaid,
      payable: newPaid ? 0 : totalPayable,
    });

    const updated = await Trip.findById(req.params.id).populate('truck', 'truckName');
    res.json(formatTripResponse(updated as any));
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
