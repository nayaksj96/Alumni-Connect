import User from '../models/User.js';
import { toPublicUser } from '../utils/userPublic.js';

/** @deprecated Kept for compatibility — prefer POST /api/admin/users/bootstrap */
export const addAlumni = async (req, res) => {
  try {
    const { name, email, password, graduationYear, major, branch, role } = req.body;
    const branchVal = branch || major || '';
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }
    const r = role === 'alumni' ? 'alumni' : 'student';
    const user = await User.create({
      name,
      email,
      password,
      graduationYear,
      branch: branchVal,
      major: branchVal,
      role: r,
    });
    res.status(201).json(toPublicUser(user));
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

/** @deprecated Use GET /api/users/directory */
export const getAllAlumni = async (req, res) => {
  try {
    const users = await User.find({ role: { $in: ['student', 'alumni'] } })
      .select('-password')
      .sort({ name: 1 })
      .lean();
    res.json(users.map((u) => ({ ...u, branch: u.branch || u.major })));
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};
