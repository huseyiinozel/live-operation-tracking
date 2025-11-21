import { Router, Response } from 'express';
import Customer from '../models/Customer';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();

// Get all customers
router.get('/', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { locationId } = req.query;
    const filter = locationId ? { locationId } : {};
    
    const customers = await Customer.find(filter)
      .populate('locationId')
      .sort({ createdAt: -1 });
    
    res.json(customers);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get customer by ID
router.get('/:id', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const customer = await Customer.findById(req.params.id).populate('locationId');
    if (!customer) {
      res.status(404).json({ error: 'Customer not found' });
      return;
    }
    res.json(customer);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Create customer
router.post('/', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, email, phone, locationId, notes } = req.body;

    const customer = await Customer.create({
      name,
      email,
      phone,
      locationId,
      notes,
    });

    const populatedCustomer = await customer.populate('locationId');
    res.status(201).json(populatedCustomer);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Update customer
router.put('/:id', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const customer = await Customer.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('locationId');

    if (!customer) {
      res.status(404).json({ error: 'Customer not found' });
      return;
    }

    res.json(customer);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Delete customer
router.delete('/:id', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const customer = await Customer.findByIdAndDelete(req.params.id);
    if (!customer) {
      res.status(404).json({ error: 'Customer not found' });
      return;
    }
    res.json({ message: 'Customer deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;

