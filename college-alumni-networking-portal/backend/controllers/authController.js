import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { toPublicUser } from '../utils/userPublic.js';

dotenv.config();

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });

const authResponse = (user) => ({
  ...toPublicUser(user),
  token: generateToken(user._id),
});

export const registerUser = async (req, res) => {
  try {
    const { name, email, password, graduationYear, branch, major, role } = req.body;
    const branchVal = branch || major || '';

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const user = await User.create({
      name,
      email,
      password,
      graduationYear,
      branch: branchVal,
      major: branchVal,
      role: role === 'alumni' ? 'alumni' : 'student',
    });

    res.status(201).json(authResponse(user));
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (user && (await user.matchPassword(password))) {
      res.json(authResponse(user));
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};
