import Message from '../models/Message.js';
import User from '../models/User.js';
import Connection from '../models/Connection.js';
import { isAcceptedConnection } from '../services/connectionService.js';

const miniUser = 'name email profileImage role graduationYear branch major company jobTitle';

export const listConversations = async (req, res) => {
  try {
    const msgs = await Message.find({
      $or: [{ sender: req.user._id }, { receiver: req.user._id }],
    })
      .sort({ createdAt: -1 })
      .populate('sender', miniUser)
      .populate('receiver', miniUser)
      .lean();

    const byPeer = new Map();
    for (const m of msgs) {
      const peerId =
        m.sender._id.toString() === req.user._id.toString() ? m.receiver._id.toString() : m.sender._id.toString();
      if (!byPeer.has(peerId)) {
        const peer = m.sender._id.toString() === req.user._id.toString() ? m.receiver : m.sender;
        byPeer.set(peerId, {
          peer: { ...peer, branch: peer.branch || peer.major },
          lastMessage: { content: m.content, createdAt: m.createdAt },
        });
      }
    }

    // Also include accepted connections that don't have messages yet
    const connections = await Connection.find({
      status: 'accepted',
      $or: [{ sender: req.user._id }, { receiver: req.user._id }],
    })
      .populate('sender', miniUser)
      .populate('receiver', miniUser)
      .lean();

    for (const c of connections) {
      const peerId = c.sender._id.toString() === req.user._id.toString() ? c.receiver._id.toString() : c.sender._id.toString();
      if (!byPeer.has(peerId)) {
        const peer = c.sender._id.toString() === req.user._id.toString() ? c.receiver : c.sender;
        byPeer.set(peerId, {
          peer: { ...peer, branch: peer.branch || peer.major },
          lastMessage: null,
        });
      }
    }

    res.json([...byPeer.values()].sort((a, b) => {
      const aTime = a.lastMessage?.createdAt ? new Date(a.lastMessage.createdAt) : new Date(0);
      const bTime = b.lastMessage?.createdAt ? new Date(b.lastMessage.createdAt) : new Date(0);
      return bTime - aTime;
    }));
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Server error' });
  }
};

export const listMessagesWith = async (req, res) => {
  try {
    const otherId = req.params.userId;
    if (otherId === req.user._id.toString()) {
      return res.status(400).json({ message: 'Invalid peer' });
    }
    const ok = await isAcceptedConnection(req.user._id, otherId);
    if (!ok) {
      return res.status(403).json({ message: 'You can only message accepted connections' });
    }
    const list = await Message.find({
      $or: [
        { sender: req.user._id, receiver: otherId },
        { sender: otherId, receiver: req.user._id },
      ],
    })
      .sort({ createdAt: 1 })
      .populate('sender', miniUser)
      .populate('receiver', miniUser)
      .lean();
    res.json(list);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Server error' });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const { receiverId, content } = req.body;
    if (receiverId === req.user._id.toString()) {
      return res.status(400).json({ message: 'Cannot message yourself' });
    }
    const target = await User.findById(receiverId).select('_id');
    if (!target) return res.status(404).json({ message: 'User not found' });
    const ok = await isAcceptedConnection(req.user._id, receiverId);
    if (!ok) {
      return res.status(403).json({ message: 'You can only message accepted connections' });
    }
    const msg = await Message.create({
      sender: req.user._id,
      receiver: receiverId,
      content,
    });
    await msg.populate('sender', miniUser);
    await msg.populate('receiver', miniUser);
    res.status(201).json(msg);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Server error' });
  }
};
