import Connection from '../models/Connection.js';
import User from '../models/User.js';
import { findConnectionBetween } from '../services/connectionService.js';

export const sendRequest = async (req, res) => {
  try {
    const { id } = req.params;
    if (id === req.user._id.toString()) {
      return res.status(400).json({ message: 'Cannot connect to yourself' });
    }
    const target = await User.findById(id).select('role');
    if (!target || target.role === 'admin') {
      return res.status(404).json({ message: 'User not found' });
    }
    const existing = await findConnectionBetween(req.user._id, id);
    if (existing) {
      if (existing.status === 'accepted') {
        return res.status(400).json({ message: 'Already connected' });
      }
      if (existing.status === 'pending') {
        if (existing.sender.toString() === req.user._id.toString()) {
          return res.status(400).json({ message: 'Connection request already sent' });
        }
        return res.status(400).json({ message: 'You already have an incoming request from this user' });
      }
      if (existing.status === 'rejected') {
        existing.status = 'pending';
        existing.sender = req.user._id;
        existing.receiver = id;
        await existing.save();
        return res.json(existing);
      }
    }
    const conn = await Connection.create({
      sender: req.user._id,
      receiver: id,
      status: 'pending',
    });
    res.status(201).json(conn);
  } catch (e) {
    if (e.code === 11000) {
      return res.status(400).json({ message: 'Duplicate connection' });
    }
    console.error(e);
    res.status(500).json({ message: 'Server error' });
  }
};

export const acceptRequest = async (req, res) => {
  try {
    const c = await Connection.findById(req.params.id);
    if (!c) return res.status(404).json({ message: 'Not found' });
    if (c.receiver.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only the receiver can accept' });
    }
    if (c.status !== 'pending') {
      return res.status(400).json({ message: 'Not a pending request' });
    }
    c.status = 'accepted';
    await c.save();
    res.json(c);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Server error' });
  }
};

export const rejectRequest = async (req, res) => {
  try {
    const c = await Connection.findById(req.params.id);
    if (!c) return res.status(404).json({ message: 'Not found' });
    if (c.receiver.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only the receiver can reject' });
    }
    c.status = 'rejected';
    await c.save();
    res.json(c);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Server error' });
  }
};

export const listMine = async (req, res) => {
  try {
    const list = await Connection.find({
      $or: [{ sender: req.user._id }, { receiver: req.user._id }],
    })
      .populate('sender', 'name email role profileImage graduationYear branch major company jobTitle alumniVerified')
      .populate('receiver', 'name email role profileImage graduationYear branch major company jobTitle alumniVerified')
      .sort({ updatedAt: -1 })
      .lean();

    const shaped = list.map((c) => ({
      ...c,
      peer:
        c.sender._id.toString() === req.user._id.toString()
          ? { ...c.receiver, branch: c.receiver.branch || c.receiver.major }
          : { ...c.sender, branch: c.sender.branch || c.sender.major },
    }));
    res.json(shaped);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Server error' });
  }
};
