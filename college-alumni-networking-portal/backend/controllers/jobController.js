import Job from '../models/Job.js';
import { assertAlumniCanPublish } from '../utils/alumniGate.js';

const posterSelect = 'name email role profileImage company jobTitle alumniVerified';

export const listJobs = async (req, res) => {
  try {
    const jobs = await Job.find({ hidden: false })
      .sort({ createdAt: -1 })
      .populate('postedBy', posterSelect)
      .populate('applicants.user', 'name email role profileImage graduationYear branch major')
      .lean();
    const uid = req.user._id.toString();
    const shaped = jobs.map((j) => ({
      ...j,
      hasApplied: (j.applicants || []).some((a) => a.user && a.user._id.toString() === uid),
    }));
    res.json(shaped);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Server error' });
  }
};

export const createJob = async (req, res) => {
  try {
    if (!['admin', 'alumni'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Only alumni or admin can post jobs' });
    }
    assertAlumniCanPublish(req.user);
    const job = await Job.create({
      ...req.body,
      postedBy: req.user._id,
    });
    await job.populate('postedBy', posterSelect);
    res.status(201).json(job);
  } catch (e) {
    if (e.status === 403) return res.status(403).json({ message: e.message });
    console.error(e);
    res.status(500).json({ message: 'Server error' });
  }
};

export const applyJob = async (req, res) => {
  try {
    if (!['student', 'alumni'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Only students or alumni can apply' });
    }
    const job = await Job.findById(req.params.id);
    if (!job || job.hidden) return res.status(404).json({ message: 'Job not found' });
    const exists = job.applicants.some((a) => a.user.toString() === req.user._id.toString());
    if (exists) return res.status(400).json({ message: 'Already applied' });
    job.applicants.push({ user: req.user._id });
    await job.save();
    await job.populate('postedBy', posterSelect);
    await job.populate('applicants.user', 'name email role profileImage');
    res.json(job);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Server error' });
  }
};

export const deleteJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: 'Not found' });
    if (req.user.role !== 'admin' && job.postedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    await job.deleteOne();
    res.json({ message: 'Deleted' });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Server error' });
  }
};
