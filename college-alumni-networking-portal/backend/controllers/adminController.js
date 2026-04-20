import User from '../models/User.js';
import Post from '../models/Post.js';
import Job from '../models/Job.js';
import Event from '../models/Event.js';
import { toPublicUser } from '../utils/userPublic.js';

export const createUser = async (req, res) => {
  try {
    const { name, email, password, graduationYear, major, branch, role } = req.body;
    const branchVal = branch || major || '';
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: 'Email already in use' });
    const user = await User.create({
      name,
      email,
      password,
      graduationYear,
      branch: branchVal,
      major: branchVal,
      role,
    });
    res.status(201).json(toPublicUser(user));
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Server error' });
  }
};

export const listUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 }).lean();
    res.json(users.map((u) => ({ ...u, branch: u.branch || u.major })));
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateUser = async (req, res) => {
  try {
    const u = await User.findById(req.params.id);
    if (!u) return res.status(404).json({ message: 'User not found' });
    const { name, role, alumniVerified, alumniApprovalStatus, branch, company } = req.body;
    if (name !== undefined) u.name = name;
    if (role !== undefined) u.role = role;
    if (alumniVerified !== undefined) u.alumniVerified = alumniVerified;
    if (alumniApprovalStatus !== undefined) u.alumniApprovalStatus = alumniApprovalStatus;
    if (branch !== undefined) {
      u.branch = branch;
      u.major = branch;
    }
    if (company !== undefined) u.company = company;
    await u.save();
    res.json(toPublicUser(u));
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Server error' });
  }
};

export const deleteUser = async (req, res) => {
  try {
    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({ message: 'Cannot delete your own admin account here' });
    }
    const u = await User.findByIdAndDelete(req.params.id);
    if (!u) return res.status(404).json({ message: 'User not found' });
    res.json({ message: 'Deleted' });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getAnalytics = async (req, res) => {
  try {
    const [byRole, posts, jobs, events, recentUsers] = await Promise.all([
      User.aggregate([{ $group: { _id: '$role', count: { $sum: 1 } } }]),
      Post.countDocuments({ hidden: false }),
      Job.countDocuments({ hidden: false }),
      Event.countDocuments({ hidden: false }),
      User.find().sort({ createdAt: -1 }).limit(5).select('name email role createdAt').lean(),
    ]);
    res.json({
      usersByRole: byRole,
      posts,
      jobs,
      events,
      recentUsers,
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Server error' });
  }
};

export const moderateDeletePost = async (req, res) => {
  try {
    await Post.findByIdAndDelete(req.params.id);
    res.json({ message: 'Post removed' });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Server error' });
  }
};

export const moderateDeleteJob = async (req, res) => {
  try {
    await Job.findByIdAndDelete(req.params.id);
    res.json({ message: 'Job removed' });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Server error' });
  }
};

export const moderateDeleteEvent = async (req, res) => {
  try {
    await Event.findByIdAndDelete(req.params.id);
    res.json({ message: 'Event removed' });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Server error' });
  }
};
