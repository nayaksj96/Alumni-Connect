import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const socialLinksSchema = new mongoose.Schema(
  {
    linkedin: { type: String, default: '' },
    twitter: { type: String, default: '' },
    website: { type: String, default: '' },
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 6 },
    role: {
      type: String,
      enum: ['admin', 'alumni', 'student'],
      default: 'student',
    },
    profileImage: { type: String, default: '' },
    bio: { type: String, default: '', maxlength: 2000 },
    skills: [{ type: String, trim: true }],
    graduationYear: { type: Number },
    /** Academic branch / major */
    branch: { type: String, default: '' },
    /** Legacy field from earlier versions; treated as branch when branch empty */
    major: { type: String, default: '' },
    company: { type: String, default: '' },
    jobTitle: { type: String, default: '' },
    location: { type: String, default: '' },
    socialLinks: { type: socialLinksSchema, default: () => ({}) },
    /** Admin-granted verification badge for alumni */
    alumniVerified: { type: Boolean, default: false },
    /** Optional gate for alumni accounts */
    alumniApprovalStatus: {
      type: String,
      enum: ['pending', 'approved'],
      default: 'approved',
    },
  },
  { timestamps: true }
);

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

userSchema.statics.seedAdmin = async function () {
  try {
    const adminExists = await this.findOne({ role: 'admin' });
    if (!adminExists) {
      await this.create({
        name: 'Admin',
        email: 'admin@example.com',
        password: 'adminpassword',
        role: 'admin',
        graduationYear: new Date().getFullYear(),
        branch: 'Administration',
        major: 'Administration',
      });
      console.log('Default admin user has been created.');
    }
  } catch (error) {
    console.error('Error seeding admin user:', error);
  }
};

const User = mongoose.model('User', userSchema);
export default User;
