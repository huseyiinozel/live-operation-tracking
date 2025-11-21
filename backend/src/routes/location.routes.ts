import { Router, Response } from 'express';
import Location from '../models/Location';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();

// Get all locations
router.get('/', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const locations = await Location.find().sort({ createdAt: -1 });
    res.json(locations);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get location by ID
router.get('/:id', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const location = await Location.findById(req.params.id);
    if (!location) {
      res.status(404).json({ error: 'Location not found' });
      return;
    }
    res.json(location);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Create location
router.post('/', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, coordinates, address, type } = req.body;

    const location = await Location.create({
      name,
      coordinates,
      address,
      type,
    });

    res.status(201).json(location);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Update location
router.put('/:id', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const location = await Location.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!location) {
      res.status(404).json({ error: 'Location not found' });
      return;
    }

    res.json(location);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Delete location
router.delete('/:id', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const location = await Location.findByIdAndDelete(req.params.id);
    if (!location) {
      res.status(404).json({ error: 'Location not found' });
      return;
    }
    res.json({ message: 'Location deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;

