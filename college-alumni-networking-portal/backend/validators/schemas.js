import Joi from 'joi';

export const registerSchema = Joi.object({
  name: Joi.string().trim().min(2).max(120).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).max(128).required(),
  graduationYear: Joi.number().integer().min(1950).max(2100).required(),
  branch: Joi.string().trim().max(120).optional(),
  major: Joi.string().trim().max(120).optional(),
  role: Joi.string().valid('student', 'alumni').default('student'),
});

export const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

export const updateProfileSchema = Joi.object({
  name: Joi.string().trim().min(2).max(120),
  bio: Joi.string().allow('').max(2000),
  profileImage: Joi.string().allow('').max(2000),
  skills: Joi.array().items(Joi.string().trim().max(80)).max(50),
  graduationYear: Joi.number().integer().min(1950).max(2100),
  branch: Joi.string().allow('').max(120),
  company: Joi.string().allow('').max(120),
  jobTitle: Joi.string().allow('').max(120),
  location: Joi.string().allow('').max(120),
  socialLinks: Joi.object({
    linkedin: Joi.string().allow('').max(500),
    twitter: Joi.string().allow('').max(500),
    website: Joi.string().allow('').max(500),
  }).optional(),
  password: Joi.string().min(6).max(128).optional(),
}).min(1);

export const directoryQuerySchema = Joi.object({
  search: Joi.string().allow('').max(200),
  graduationYear: Joi.number().integer().optional(),
  branch: Joi.string().allow('').max(120),
  company: Joi.string().allow('').max(120),
  skill: Joi.string().allow('').max(80),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(50).default(12),
});

export const adminCreateUserSchema = Joi.object({
  name: Joi.string().trim().min(2).max(120).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).max(128).required(),
  graduationYear: Joi.number().integer().min(1950).max(2100).optional(),
  branch: Joi.string().allow('').max(120).optional(),
  major: Joi.string().allow('').max(120).optional(),
  role: Joi.string().valid('student', 'alumni').required(),
});

export const adminUpdateUserSchema = Joi.object({
  name: Joi.string().trim().min(2).max(120),
  role: Joi.string().valid('admin', 'alumni', 'student'),
  alumniVerified: Joi.boolean(),
  alumniApprovalStatus: Joi.string().valid('pending', 'approved'),
  branch: Joi.string().allow('').max(120),
  company: Joi.string().allow('').max(120),
}).min(1);

export const postCreateSchema = Joi.object({
  content: Joi.string().trim().min(1).max(8000).required(),
  image: Joi.string().allow('').max(2000),
});

export const postCommentSchema = Joi.object({
  content: Joi.string().trim().min(1).max(2000).required(),
});

export const jobCreateSchema = Joi.object({
  title: Joi.string().trim().min(1).max(200).required(),
  company: Joi.string().trim().min(1).max(200).required(),
  description: Joi.string().trim().min(1).max(20000).required(),
  location: Joi.string().allow('').max(200),
});

export const eventCreateSchema = Joi.object({
  title: Joi.string().trim().min(1).max(200).required(),
  description: Joi.string().allow('').max(20000),
  date: Joi.date().iso().required(),
  location: Joi.string().allow('').max(200),
});

export const messageCreateSchema = Joi.object({
  receiverId: Joi.string().hex().length(24).required(),
  content: Joi.string().trim().min(1).max(5000).required(),
});
