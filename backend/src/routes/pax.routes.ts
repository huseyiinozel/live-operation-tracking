import { Router, Response } from 'express';
import Pax from '../models/Pax';
import Operation from '../models/Operation';
import EventLog from '../models/EventLog';
import { authenticate, AuthRequest } from '../middleware/auth';
import { v4 as uuidv4 } from 'uuid';
import { getIO } from '../socket';

const router = Router();

// Get all pax (with optional operation filter)
router.get('/', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { operationId } = req.query;
    const filter = operationId ? { operationId } : {};
    
    const paxList = await Pax.find(filter)
      .populate('operationId', 'code tourName date')
      .sort({ createdAt: -1 });
    
    res.json(paxList);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get pax by operation
router.get('/operation/:operationId', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const paxList = await Pax.find({ operationId: req.params.operationId })
      .sort({ seatNo: 1 });
    
    res.json(paxList);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get pax by ID
router.get('/:id', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const pax = await Pax.findById(req.params.id).populate('operationId');
    if (!pax) {
      res.status(404).json({ error: 'Pax not found' });
      return;
    }
    res.json(pax);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Create pax
router.post('/', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { paxId, name, phone, pickupPoint, seatNo, reservationId, operationId, notes } = req.body;

    const pax = await Pax.create({
      paxId: paxId || uuidv4(),
      name,
      phone,
      pickupPoint,
      seatNo,
      status: 'waiting',
      reservationId,
      operationId,
      notes,
    });

    // Update operation totalPax count
    await Operation.findByIdAndUpdate(operationId, {
      $inc: { totalPax: 1 },
    });

    const populatedPax = await pax.populate('operationId', 'code tourName date');
    res.status(201).json(populatedPax);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Check-in pax
router.post('/:id/checkin', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { method, gps, photoUrl } = req.body;
    const eventId = uuidv4();

    // Check if event already exists (idempotency)
    const existingEvent = await EventLog.findOne({ eventId });
    if (existingEvent) {
      res.status(200).json({ message: 'Check-in already processed' });
      return;
    }

    const pax = await Pax.findById(req.params.id);
    if (!pax) {
      res.status(404).json({ error: 'Pax not found' });
      return;
    }

    if (pax.status === 'checked_in') {
      res.status(400).json({ error: 'Pax already checked in' });
      return;
    }

    // Update pax status
    pax.status = 'checked_in';
    pax.checkinDetails = {
      method: method || 'manual',
      gps,
      photoUrl,
      timestamp: new Date(),
      eventId,
    };
    await pax.save();

    // Update operation checked-in count
    const operation = await Operation.findByIdAndUpdate(
      pax.operationId,
      { $inc: { checkedInCount: 1 } },
      { new: true }
    );

    // Create event log
    await EventLog.create({
      eventId,
      type: 'checkin',
      operationId: pax.operationId,
      paxId: pax._id,
      userId: req.user?.userId,
      message: `${pax.name} checked in`,
      data: { method, gps },
    });

    // Emit WebSocket event
    const io = getIO();
    io.to(`operation:${pax.operationId}`).emit('pax:checkin', {
      paxId: pax._id,
      paxName: pax.name,
      operationId: pax.operationId,
      checkedInCount: operation?.checkedInCount || 0,
      totalPax: operation?.totalPax || 0,
      timestamp: new Date(),
    });

    res.json({ message: 'Check-in successful', pax });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Update pax
router.put('/:id', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const pax = await Pax.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('operationId', 'code tourName date');

    if (!pax) {
      res.status(404).json({ error: 'Pax not found' });
      return;
    }

    res.json(pax);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Delete pax
router.delete('/:id', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const pax = await Pax.findByIdAndDelete(req.params.id);
    if (!pax) {
      res.status(404).json({ error: 'Pax not found' });
      return;
    }

    // Update operation totalPax count
    const updateData: any = { $inc: { totalPax: -1 } };
    if (pax.status === 'checked_in') {
      updateData.$inc.checkedInCount = -1;
    }
    await Operation.findByIdAndUpdate(pax.operationId, updateData);

    res.json({ message: 'Pax deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;

