import Post from '../models/Post.js';
import { assertAlumniCanPublish } from '../utils/alumniGate.js';

const authorSelect = 'name email role profileImage graduationYear branch major company jobTitle alumniVerified';

export const listFeed = async (req, res) => {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(30, Math.max(1, Number(req.query.limit) || 10));
    const skip = (page - 1) * limit;
    const q = { hidden: false };
    const [items, total] = await Promise.all([
      Post.find(q)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('author', authorSelect)
        .populate('comments.author', authorSelect)
        .lean(),
      Post.countDocuments(q),
    ]);
    const userId = req.user._id.toString();
    const withFlags = items.map((p) => ({
      ...p,
      likedByMe: (p.likes || []).some((id) => id.toString() === userId),
    }));
    res.json({ items: withFlags, page, limit, total, pages: Math.ceil(total / limit) || 1 });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Server error' });
  }
};

export const createPost = async (req, res) => {
  try {
    assertAlumniCanPublish(req.user);
    if (!['admin', 'alumni', 'student'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Cannot post' });
    }
    const post = await Post.create({
      author: req.user._id,
      content: req.body.content,
      image: req.body.image || '',
    });
    await post.populate('author', authorSelect);
    res.status(201).json(post);
  } catch (e) {
    if (e.status === 403) return res.status(403).json({ message: e.message });
    console.error(e);
    res.status(500).json({ message: 'Server error' });
  }
};

export const toggleLike = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post || post.hidden) return res.status(404).json({ message: 'Not found' });
    const uid = req.user._id;
    const idx = post.likes.findIndex((id) => id.toString() === uid.toString());
    if (idx >= 0) post.likes.splice(idx, 1);
    else post.likes.push(uid);
    await post.save();
    res.json({ likes: post.likes, likedByMe: idx < 0 });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Server error' });
  }
};

export const addComment = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post || post.hidden) return res.status(404).json({ message: 'Not found' });
    post.comments.push({ author: req.user._id, content: req.body.content });
    await post.save();
    await post.populate('comments.author', authorSelect);
    res.status(201).json(post.comments[post.comments.length - 1]);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Server error' });
  }
};

export const deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Not found' });
    if (req.user.role !== 'admin' && post.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    await post.deleteOne();
    res.json({ message: 'Deleted' });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Server error' });
  }
};
