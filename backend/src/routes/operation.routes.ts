import { Router, Response } from 'express';
import { startOfDay, endOfDay, parseISO } from 'date-fns';
import Operation from '../models/Operation';
import Pax from '../models/Pax';
import EventLog from '../models/EventLog';
import { authenticate, AuthRequest } from '../middleware/auth';
import { v4 as uuidv4 } from 'uuid';
import { getIO } from '../socket';

const router = Router();

// Get operations with filters
router.get('/', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { date, status } = req.query;
    
    let filter: any = {};
    
    if (date) {
      let targetDate: Date;
      
      // Handle "today" and "tomorrow" keywords
      if (date === 'today') {
        targetDate = new Date();
      } else if (date === 'tomorrow') {
        targetDate = new Date();
        targetDate.setDate(targetDate.getDate() + 1);
      } else {
        targetDate = parseISO(date as string);
      }
      
      filter.date = {
        $gte: startOfDay(targetDate),
        $lte: endOfDay(targetDate),
      };
    }
    
    if (status) {
      filter.status = status;
    }
    
    const operations = await Operation.find(filter)
      .populate('vehicleId')
      .populate('driverId', 'name email phone')
      .populate('guideId', 'name email phone')
      .sort({ date: 1, startTime: 1 });
    
    res.json(operations);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get operation by ID
router.get('/:id', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const operation = await Operation.findById(req.params.id)
      .populate('vehicleId')
      .populate('driverId', 'name email phone')
      .populate('guideId', 'name email phone');
    
    if (!operation) {
      res.status(404).json({ error: 'Operation not found' });
      return;
    }
    
    res.json(operation);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Create operation
router.post('/', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { code, tourName, date, startTime, vehicleId, driverId, guideId, route } = req.body;

    const operation = await Operation.create({
      code,
      tourName,
      date: parseISO(date),
      startTime,
      vehicleId,
      driverId,
      guideId,
      totalPax: 0,
      checkedInCount: 0,
      status: 'planned',
      route,
    });

    const populatedOperation = await operation.populate([
      { path: 'vehicleId' },
      { path: 'driverId', select: 'name email phone' },
      { path: 'guideId', select: 'name email phone' },
    ]);

    res.status(201).json(populatedOperation);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Start operation
router.post('/:id/start', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const operation = await Operation.findById(req.params.id);
    
    if (!operation) {
      res.status(404).json({ error: 'Operation not found' });
      return;
    }

    if (operation.status !== 'planned') {
      res.status(400).json({ error: 'Operation cannot be started' });
      return;
    }

    operation.status = 'active';
    await operation.save();

    // Create event log
    const eventId = uuidv4();
    await EventLog.create({
      eventId,
      type: 'operation_start',
      operationId: operation._id,
      userId: req.user?.userId,
      message: `Operation ${operation.code} started`,
    });

    // Emit WebSocket event
    const io = getIO();
    io.to(`operation:${operation._id}`).emit('operation:status_change', {
      operationId: operation._id,
      status: 'active',
      timestamp: new Date(),
    });

    const populatedOperation = await operation.populate([
      { path: 'vehicleId' },
      { path: 'driverId', select: 'name email phone' },
      { path: 'guideId', select: 'name email phone' },
    ]);

    res.json(populatedOperation);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Complete operation
router.post('/:id/complete', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const operation = await Operation.findById(req.params.id);
    
    if (!operation) {
      res.status(404).json({ error: 'Operation not found' });
      return;
    }

    operation.status = 'completed';
    await operation.save();

    // Create event log
    const eventId = uuidv4();
    await EventLog.create({
      eventId,
      type: 'operation_complete',
      operationId: operation._id,
      userId: req.user?.userId,
      message: `Operation ${operation.code} completed`,
    });

    // Emit WebSocket event
    const io = getIO();
    io.to(`operation:${operation._id}`).emit('operation:status_change', {
      operationId: operation._id,
      status: 'completed',
      timestamp: new Date(),
    });

    res.json(operation);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Update operation
router.put('/:id', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (req.body.date) {
      req.body.date = parseISO(req.body.date);
    }

    const operation = await Operation.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate([
      { path: 'vehicleId' },
      { path: 'driverId', select: 'name email phone' },
      { path: 'guideId', select: 'name email phone' },
    ]);

    if (!operation) {
      res.status(404).json({ error: 'Operation not found' });
      return;
    }

    res.json(operation);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Delete operation
router.delete('/:id', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const operation = await Operation.findByIdAndDelete(req.params.id);
    if (!operation) {
      res.status(404).json({ error: 'Operation not found' });
      return;
    }
    
    // Also delete related pax
    await Pax.deleteMany({ operationId: req.params.id });
    
    res.json({ message: 'Operation deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;

