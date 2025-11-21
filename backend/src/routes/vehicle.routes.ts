import { Router, Response } from 'express';
import Vehicle from '../models/Vehicle';
import VehicleTelemetry from '../models/VehicleTelemetry';
import Operation from '../models/Operation';
import { authenticate, AuthRequest } from '../middleware/auth';
import { getIO } from '../socket';

const router = Router();

// Get all vehicles
router.get('/', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const vehicles = await Vehicle.find().sort({ plate: 1 });
    res.json(vehicles);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get vehicle by ID
router.get('/:id', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);
    if (!vehicle) {
      res.status(404).json({ error: 'Vehicle not found' });
      return;
    }
    res.json(vehicle);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Create vehicle
router.post('/', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { plate, model, capacity } = req.body;

    const vehicle = await Vehicle.create({
      plate,
      model,
      capacity,
      status: 'available',
    });

    res.status(201).json(vehicle);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Vehicle heartbeat (GPS update)
router.post('/:id/heartbeat', async (req: any, res: Response): Promise<void> => {
  try {
    const { lat, lng, heading, speed, timestamp } = req.body;
    const vehicleId = req.params.id;

    // Update vehicle's last ping
    const vehicle = await Vehicle.findByIdAndUpdate(
      vehicleId,
      {
        lastPing: {
          lat,
          lng,
          heading,
          speed,
          timestamp: timestamp ? new Date(timestamp) : new Date(),
        },
      },
      { new: true }
    );

    if (!vehicle) {
      res.status(404).json({ error: 'Vehicle not found' });
      return;
    }

    // Find active operation for this vehicle
    const activeOperation = await Operation.findOne({
      vehicleId,
      status: 'active',
    });

    // Save to telemetry history
    await VehicleTelemetry.create({
      vehicleId,
      operationId: activeOperation?._id,
      lat,
      lng,
      heading,
      speed,
      timestamp: timestamp ? new Date(timestamp) : new Date(),
    });

    // Emit WebSocket events
    const io = getIO();
    
    // Emit to vehicle channel
    io.to(`vehicle:${vehicleId}`).emit('vehicle:position', {
      vehicleId,
      lat,
      lng,
      heading,
      speed,
      timestamp: new Date(),
    });

    // Emit to operation channel if vehicle is in an active operation
    if (activeOperation) {
      io.to(`operation:${activeOperation._id}`).emit('operation:vehicle_position', {
        operationId: activeOperation._id,
        vehicleId,
        lat,
        lng,
        heading,
        speed,
        timestamp: new Date(),
      });
    }

    res.json({ message: 'Heartbeat received', vehicle });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get vehicle telemetry history
router.get('/:id/telemetry', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { limit = 100 } = req.query;
    
    const telemetry = await VehicleTelemetry.find({ vehicleId: req.params.id })
      .sort({ timestamp: -1 })
      .limit(Number(limit));
    
    res.json(telemetry);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Update vehicle
router.put('/:id', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const vehicle = await Vehicle.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!vehicle) {
      res.status(404).json({ error: 'Vehicle not found' });
      return;
    }

    res.json(vehicle);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Delete vehicle
router.delete('/:id', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const vehicle = await Vehicle.findByIdAndDelete(req.params.id);
    if (!vehicle) {
      res.status(404).json({ error: 'Vehicle not found' });
      return;
    }
    res.json({ message: 'Vehicle deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;

