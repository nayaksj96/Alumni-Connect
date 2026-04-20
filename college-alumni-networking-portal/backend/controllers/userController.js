import mongoose from 'mongoose';
import User from '../models/User.js';
import Connection from '../models/Connection.js';
import { toPublicUser } from '../utils/userPublic.js';

export const getMe = async (req, res) => {
  res.json(toPublicUser(req.user));
};

export const updateMe = async (req, res) => {
  try {
    const u = await User.findById(req.user._id);
    if (!u) return res.status(404).json({ message: 'User not found' });

    const {
      name,
      bio,
      profileImage,
      skills,
      graduationYear,
      branch,
      company,
      jobTitle,
      location,
      socialLinks,
      password,
    } = req.body;

    if (name !== undefined) u.name = name;
    if (bio !== undefined) u.bio = bio;
    if (profileImage !== undefined) u.profileImage = profileImage;
    if (skills !== undefined) u.skills = skills;
    if (graduationYear !== undefined) u.graduationYear = graduationYear;
    if (branch !== undefined) {
      u.branch = branch;
      u.major = branch;
    }
    if (company !== undefined) u.company = company;
    if (jobTitle !== undefined) u.jobTitle = jobTitle;
    if (location !== undefined) u.location = location;
    if (socialLinks !== undefined) {
      const prev = u.socialLinks?.toObject?.() ?? u.socialLinks ?? {};
      u.socialLinks = { ...prev, ...socialLinks };
    }
    if (password) u.password = password;

    await u.save();
    res.json(toPublicUser(u));
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getUserById = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).json({ message: 'User not found' });
    }
    const u = await User.findById(req.params.id).select('-password');
    if (!u) return res.status(404).json({ message: 'User not found' });
    res.json(toPublicUser(u));
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Server error' });
  }
};

/** Directory: alumni + students (not admin), with filters + pagination */
export const getDirectory = async (req, res) => {
  try {
    const { search, graduationYear, branch, company, skill, page, limit } = req.query;
    const filter = {
      role: { $in: ['alumni', 'student'] },
      _id: { $ne: req.user._id },
    };

    if (search) {
      filter.$or = [
        { name: new RegExp(search.trim(), 'i') },
        { email: new RegExp(search.trim(), 'i') },
        { company: new RegExp(search.trim(), 'i') },
      ];
    }
    if (graduationYear) filter.graduationYear = Number(graduationYear);
    if (branch) {
      filter.$and = filter.$and || [];
      filter.$and.push({
        $or: [{ branch: new RegExp(branch.trim(), 'i') }, { major: new RegExp(branch.trim(), 'i') }],
      });
    }
    if (company) filter.company = new RegExp(company.trim(), 'i');
    if (skill) filter.skills = new RegExp(skill.trim(), 'i');

    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      User.find(filter)
        .select('-password')
        .sort({ name: 1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      User.countDocuments(filter),
    ]);

    const ids = items.map((i) => i._id);
    const connections = await Connection.find({
      $or: [
        { sender: req.user._id, receiver: { $in: ids } },
        { receiver: req.user._id, sender: { $in: ids } },
      ],
    }).lean();

    const statusByPeer = {};
    for (const c of connections) {
      const peer = c.sender.toString() === req.user._id.toString() ? c.receiver.toString() : c.sender.toString();
      statusByPeer[peer] = { status: c.status, id: c._id, iAmSender: c.sender.toString() === req.user._id.toString() };
    }

    const enriched = items.map((u) => ({
      ...u,
      branch: u.branch || u.major,
      connection: statusByPeer[u._id.toString()] || null,
    }));

    res.json({ items: enriched, page, limit, total, pages: Math.ceil(total / limit) || 1 });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Server error' });
  }
};

/** Suggested connections: same branch or overlapping skills */
export const getSuggested = async (req, res) => {
  try {
    const me = await User.findById(req.user._id).lean();
    const myBranch = me.branch || me.major;
    const filter = {
      role: { $in: ['alumni', 'student'] },
      _id: { $ne: req.user._id },
    };
    const orConditions = [];
    if (myBranch) {
      const br = new RegExp(`^${escapeRegex(myBranch)}$`, 'i');
      orConditions.push({ branch: br }, { major: br });
    }
    if (me.skills?.length) {
      orConditions.push({ skills: { $in: me.skills } });
    }
    if (orConditions.length) {
      filter.$or = orConditions;
    }
    const peers = await User.find(filter).select('-password').limit(8).lean();
    const ids = peers.map((p) => p._id);
    const existing = await Connection.find({
      $or: [
        { sender: req.user._id, receiver: { $in: ids } },
        { receiver: req.user._id, sender: { $in: ids } },
      ],
    }).lean();
    const connected = new Set(
      existing.map((c) => (c.sender.toString() === req.user._id.toString() ? c.receiver.toString() : c.sender.toString()))
    );
    const out = peers
      .filter((p) => !connected.has(p._id.toString()))
      .map((u) => ({ ...u, branch: u.branch || u.major }));
    res.json(out);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Server error' });
  }
};

function escapeRegex(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
