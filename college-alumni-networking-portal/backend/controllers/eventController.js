import Event from '../models/Event.js';
import { assertAlumniCanPublish } from '../utils/alumniGate.js';

const creatorSelect = 'name email role profileImage company alumniVerified';

export const listEvents = async (req, res) => {
  try {
    const events = await Event.find({ hidden: false })
      .sort({ date: 1 })
      .populate('createdBy', creatorSelect)
      .populate('attendees', 'name email profileImage')
      .lean();
    const uid = req.user._id.toString();
    const shaped = events.map((ev) => ({
      ...ev,
      attending: (ev.attendees || []).some((a) => a._id.toString() === uid),
    }));
    res.json(shaped);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Server error' });
  }
};

export const createEvent = async (req, res) => {
  try {
    if (!['admin', 'alumni'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Only alumni or admin can create events' });
    }
    assertAlumniCanPublish(req.user);
    const event = await Event.create({
      ...req.body,
      createdBy: req.user._id,
    });
    await event.populate('createdBy', creatorSelect);
    res.status(201).json(event);
  } catch (e) {
    if (e.status === 403) return res.status(403).json({ message: e.message });
    console.error(e);
    res.status(500).json({ message: 'Server error' });
  }
};

export const rsvpEvent = async (req, res) => {
  try {
    const ev = await Event.findById(req.params.id);
    if (!ev || ev.hidden) return res.status(404).json({ message: 'Event not found' });
    const uid = req.user._id;
    const idx = ev.attendees.findIndex((id) => id.toString() === uid.toString());
    if (idx >= 0) ev.attendees.splice(idx, 1);
    else ev.attendees.push(uid);
    await ev.save();
    await ev.populate('createdBy', creatorSelect);
    await ev.populate('attendees', 'name email profileImage');
    res.json(ev);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Server error' });
  }
};

export const deleteEvent = async (req, res) => {
  try {
    const ev = await Event.findById(req.params.id);
    if (!ev) return res.status(404).json({ message: 'Not found' });
    if (req.user.role !== 'admin' && ev.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    await ev.deleteOne();
    res.json({ message: 'Deleted' });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Server error' });
  }
};
