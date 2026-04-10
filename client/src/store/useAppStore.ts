import { create } from 'zustand';
import api from '../api/client';
import { type RangePreset, getDateRangeForPreset } from '../lib/dateHelpers';

export interface TruckOption {
  _id: string;
  truckName: string;
  cutoffStart: number;
  cutoffEnd: number;
  payday: number;
  dayOff: number;
}

export interface TripRow {
  _id: string;
  truck: string | { _id: string; truckName: string };
  truckName: string;
  date: string;
  dateIso: string;
  dateText: string;
  week: string;
  status: string;
  shipmentNumber: string;
  rate: number;
  trips: number;
  crewSalary: number;
  cashAdvance: number;
  reimbursements: number;
  expenses: number;
  note: string;
  grossIncome: number;
  netIncome: number;
  payable: number;
  paid: boolean;
  reportPayable?: number;
  reportNetIncome?: number;
}

export interface ExpenseRow {
  _id: string;
  truck: string | { _id: string; truckName: string };
  truckName: string;
  date: string;
  dateIso: string;
  dateText: string;
  category: string;
  amount: number;
  description: string;
}

export interface TruckRow {
  _id: string;
  truckName: string;
  status: string;
  notes: string;
  cutoffStart: number;
  cutoffEnd: number;
  payday: number;
  dayOff: number;
  cutoffStartText: string;
  cutoffEndText: string;
  paydayText: string;
  dayOffText: string;
  dateAdded: string;
}

export interface KPIs {
  gross: number;
  net: number;
  trips: number;
  payable: number;
  cashOutflow: number;
  expenses: number;
}

export interface ChartPoint {
  label: string;
  gross: number;
  net: number;
  trips: number;
}

interface AppState {
  // UI
  sidebarCollapsed: boolean;
  theme: 'light' | 'dark';
  loading: boolean;
  initialized: boolean;

  // Data
  truckOptions: TruckOption[];
  tripRows: TripRow[];
  expenseRows: ExpenseRow[];
  truckRows: TruckRow[];
  kpis: KPIs;
  chartData: ChartPoint[];
  reportRows: TripRow[];
  truckStats: { total: number; active: number; inactive: number; sheets: number };

  // Filters
  selectedTruck: string;
  rangePreset: RangePreset;
  startDate: string;
  endDate: string;
  expensesMonth: string;
  reportsMonth: string;
  searchQuery: string;

  // Actions
  toggleSidebar: () => void;
  toggleTheme: () => void;
  setTheme: (theme: 'light' | 'dark') => void;
  setSelectedTruck: (id: string) => void;
  setRangePreset: (preset: RangePreset) => void;
  setStartDate: (date: string) => void;
  setEndDate: (date: string) => void;
  setExpensesMonth: (month: string) => void;
  setReportsMonth: (month: string) => void;
  setSearchQuery: (q: string) => void;

  // Data fetching
  initApp: () => Promise<void>;
  fetchDashboard: () => Promise<void>;
  fetchExpenses: () => Promise<void>;
  fetchTrucks: () => Promise<void>;
  fetchReports: () => Promise<void>;

  // CRUD
  addTrip: (data: Record<string, unknown>) => Promise<void>;
  updateTrip: (id: string, data: Record<string, unknown>) => Promise<void>;
  deleteTrip: (id: string) => Promise<void>;
  toggleTripPaid: (id: string) => Promise<void>;
  addExpense: (data: Record<string, unknown>) => Promise<void>;
  updateExpense: (id: string, data: Record<string, unknown>) => Promise<void>;
  deleteExpense: (id: string) => Promise<void>;
  addTruck: (data: Record<string, unknown>) => Promise<void>;
  updateTruck: (id: string, data: Record<string, unknown>) => Promise<void>;
  deleteTruck: (id: string) => Promise<void>;
}

const getStoredTheme = (): 'light' | 'dark' => {
  try {
    const saved = localStorage.getItem('nm_theme');
    if (saved === 'dark' || saved === 'light') return saved;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  } catch {
    return 'light';
  }
};

export const useAppStore = create<AppState>((set, get) => ({
  // UI
  sidebarCollapsed: false,
  theme: getStoredTheme(),
  loading: false,
  initialized: false,

  // Data
  truckOptions: [],
  tripRows: [],
  expenseRows: [],
  truckRows: [],
  kpis: { gross: 0, net: 0, trips: 0, payable: 0, cashOutflow: 0, expenses: 0 },
  chartData: [],
  reportRows: [],
  truckStats: { total: 0, active: 0, inactive: 0, sheets: 0 },

  // Filters
  selectedTruck: '',
  rangePreset: 'CC',
  startDate: '',
  endDate: '',
  expensesMonth: 'ALL',
  reportsMonth: 'ALL',
  searchQuery: '',

  // Actions
  toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
  toggleTheme: () => {
    const next = get().theme === 'dark' ? 'light' : 'dark';
    localStorage.setItem('nm_theme', next);
    set({ theme: next });
  },
  setTheme: (theme) => {
    localStorage.setItem('nm_theme', theme);
    set({ theme });
  },
  setSelectedTruck: (id) => set({ selectedTruck: id }),
  setRangePreset: (preset) => set({ rangePreset: preset }),
  setStartDate: (date) => set({ startDate: date }),
  setEndDate: (date) => set({ endDate: date }),
  setExpensesMonth: (month) => set({ expensesMonth: month }),
  setReportsMonth: (month) => set({ reportsMonth: month }),
  setSearchQuery: (q) => set({ searchQuery: q }),

  // Initialize: fetch trucks first, then dashboard
  initApp: async () => {
    if (get().initialized) return;
    try {
      // Fetch trucks first to get options
      const trucksRes = await api.get('/trucks');
      const truckRows = trucksRes.data.rows || [];
      const activeTrucks = truckRows.filter((t: TruckRow) => t.status === 'Active');

      set({
        truckRows,
        truckStats: {
          total: trucksRes.data.total || 0,
          active: trucksRes.data.active || 0,
          inactive: trucksRes.data.inactive || 0,
          sheets: trucksRes.data.sheets || 0,
        },
      });

      // Build truck options for dashboard from the trucks list
      const truckOptions: TruckOption[] = activeTrucks.map((t: TruckRow) => ({
        _id: t._id,
        truckName: t.truckName,
        cutoffStart: t.cutoffStart,
        cutoffEnd: t.cutoffEnd,
        payday: t.payday,
        dayOff: t.dayOff,
      }));
      set({ truckOptions });

      // Auto-select first truck if none selected
      if (!get().selectedTruck && truckOptions.length > 0) {
        set({ selectedTruck: truckOptions[0]._id });
      }

      set({ initialized: true });

      // Now fetch dashboard data
      await get().fetchDashboard();
      await get().fetchExpenses();
    } catch (err) {
      console.error('Failed to init app:', err);
      set({ initialized: true });
    }
  },

  // Data fetching
  fetchDashboard: async () => {
    const state = get();
    set({ loading: true });
    try {
      const truckConfig = state.truckOptions.find((t) => t._id === state.selectedTruck);
      const range = getDateRangeForPreset(
        state.rangePreset,
        truckConfig?.cutoffStart ?? 1,
        truckConfig?.cutoffEnd ?? 6,
        state.startDate,
        state.endDate
      );

      const params: Record<string, string> = {};
      if (state.selectedTruck) params.truck = state.selectedTruck;
      if (range.start) params.start = range.start;
      if (range.end) params.end = range.end;

      const { data } = await api.get('/dashboard', { params });

      // Update truck options from response if available
      const newTruckOptions = data.truckOptions && data.truckOptions.length > 0
        ? data.truckOptions
        : state.truckOptions;

      set({
        tripRows: data.rows || [],
        kpis: data.kpis || { gross: 0, net: 0, trips: 0, payable: 0, cashOutflow: 0, expenses: 0 },
        chartData: data.chartData || [],
        truckOptions: newTruckOptions,
        startDate: range.start,
        endDate: range.end,
      });
    } catch (err) {
      console.error('Failed to fetch dashboard:', err);
    } finally {
      set({ loading: false });
    }
  },

  fetchExpenses: async () => {
    const state = get();
    try {
      const params: Record<string, string> = {};
      if (state.selectedTruck) params.truck = state.selectedTruck;
      if (state.expensesMonth !== 'ALL') params.month = state.expensesMonth;

      const { data } = await api.get('/expenses', { params });
      set({ expenseRows: data.rows || [] });
    } catch (err) {
      console.error('Failed to fetch expenses:', err);
    }
  },

  fetchTrucks: async () => {
    try {
      const { data } = await api.get('/trucks');
      const truckRows = data.rows || [];
      const activeTrucks = truckRows.filter((t: TruckRow) => t.status === 'Active');

      set({
        truckRows,
        truckStats: {
          total: data.total || 0,
          active: data.active || 0,
          inactive: data.inactive || 0,
          sheets: data.sheets || 0,
        },
        truckOptions: activeTrucks.map((t: TruckRow) => ({
          _id: t._id,
          truckName: t.truckName,
          cutoffStart: t.cutoffStart,
          cutoffEnd: t.cutoffEnd,
          payday: t.payday,
          dayOff: t.dayOff,
        })),
      });
    } catch (err) {
      console.error('Failed to fetch trucks:', err);
    }
  },

  fetchReports: async () => {
    const state = get();
    try {
      const params: Record<string, string> = {};
      if (state.selectedTruck) params.truck = state.selectedTruck;
      if (state.reportsMonth !== 'ALL') params.month = state.reportsMonth;

      const { data } = await api.get('/dashboard/reports', { params });
      set({ reportRows: data.rows || [] });
    } catch (err) {
      console.error('Failed to fetch reports:', err);
    }
  },

  // CRUD - Trips
  addTrip: async (tripData) => {
    await api.post('/trips', tripData);
    await get().fetchDashboard();
    await get().fetchExpenses();
  },
  updateTrip: async (id, tripData) => {
    await api.put(`/trips/${id}`, tripData);
    await get().fetchDashboard();
    await get().fetchExpenses();
  },
  deleteTrip: async (id) => {
    await api.delete(`/trips/${id}`);
    await get().fetchDashboard();
  },
  toggleTripPaid: async (id) => {
    await api.patch(`/trips/${id}/toggle-paid`);
    await get().fetchDashboard();
  },

  // CRUD - Expenses
  addExpense: async (expenseData) => {
    await api.post('/expenses', expenseData);
    await get().fetchExpenses();
    await get().fetchDashboard();
  },
  updateExpense: async (id, expenseData) => {
    await api.put(`/expenses/${id}`, expenseData);
    await get().fetchExpenses();
    await get().fetchDashboard();
  },
  deleteExpense: async (id) => {
    await api.delete(`/expenses/${id}`);
    await get().fetchExpenses();
    await get().fetchDashboard();
  },

  // CRUD - Trucks
  addTruck: async (truckData) => {
    await api.post('/trucks', truckData);
    await get().fetchTrucks();
    await get().fetchDashboard();
  },
  updateTruck: async (id, truckData) => {
    await api.put(`/trucks/${id}`, truckData);
    await get().fetchTrucks();
    await get().fetchDashboard();
  },
  deleteTruck: async (id) => {
    await api.delete(`/trucks/${id}`);
    const state = get();
    // If deleted truck was selected, select first available
    if (state.selectedTruck === id) {
      const remaining = state.truckOptions.filter((t) => t._id !== id);
      set({ selectedTruck: remaining.length > 0 ? remaining[0]._id : '' });
    }
    await get().fetchTrucks();
    await get().fetchDashboard();
  },
}));
