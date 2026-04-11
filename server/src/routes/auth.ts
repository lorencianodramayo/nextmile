import { Router, Response } from 'express';
import { User } from '../models/User.js';
import { generateToken, requireAuth, type AuthRequest } from '../middleware/auth.js';

const router = Router();

// POST /api/auth/login
router.post('/login', async (req: AuthRequest, res: Response) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      res.status(400).json({ error: 'Username and password are required' });
      return;
    }

    const user = await User.findOne({ username: username.toLowerCase().trim() });
    if (!user || !user.active) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    const token = generateToken(String(user._id), user.role);

    res.json({
      token,
      user: {
        _id: user._id,
        username: user.username,
        displayName: user.displayName,
        role: user.role,
        truck: user.truck,
      },
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/auth/me
router.get('/me', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.user!._id)
      .select('-password')
      .populate('truck', 'truckName');

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.json({
      user: {
        _id: user._id,
        username: user.username,
        displayName: user.displayName,
        role: user.role,
        truck: user.truck,
      },
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Seed default admin if no users exist
router.post('/seed-admin', async (_req: AuthRequest, res: Response) => {
  try {
    const count = await User.countDocuments();
    if (count > 0) {
      res.status(400).json({ error: 'Users already exist. Cannot seed.' });
      return;
    }

    const admin = await User.create({
      username: 'admin',
      password: 'admin123',
      displayName: 'Robin Santos',
      role: 'admin',
      active: true,
    });

    res.status(201).json({
      message: 'Default admin created',
      username: admin.username,
      password: 'admin123 (change this!)',
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
