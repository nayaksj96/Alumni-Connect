import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Heart, MessageCircle, Send, UserPlus } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../lib/api';

const DashboardHome = () => {
  const { user } = useAuth();
  const token = user?.token;
  const [feed, setFeed] = useState({ items: [], page: 1, pages: 1 });
  const [suggested, setSuggested] = useState([]);
  const [loading, setLoading] = useState(true);
  const [postText, setPostText] = useState('');
  const [commentDraft, setCommentDraft] = useState({});

  const load = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const [f, s] = await Promise.all([
        api('/api/posts?page=1&limit=10', { token }),
        api('/api/users/suggested', { token }),
      ]);
      setFeed(f);
      setSuggested(s);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [token]);

  const createPost = async (e) => {
    e.preventDefault();
    if (!postText.trim()) return;
    try {
      await api('/api/posts', { method: 'POST', token, body: { content: postText.trim() } });
      setPostText('');
      await load();
    } catch (err) {
      alert(err.message);
    }
  };

  const toggleLike = async (id) => {
    try {
      await api(`/api/posts/${id}/like`, { method: 'POST', token });
      await load();
    } catch (e) {
      console.error(e);
    }
  };

  const sendComment = async (postId) => {
    const text = (commentDraft[postId] || '').trim();
    if (!text) return;
    try {
      await api(`/api/posts/${postId}/comments`, { method: 'POST', token, body: { content: text } });
      setCommentDraft((d) => ({ ...d, [postId]: '' }));
      await load();
    } catch (e) {
      alert(e.message);
    }
  };

  const sendConnect = async (id) => {
    try {
      await api(`/api/connections/${id}/request`, { method: 'POST', token });
      await load();
    } catch (e) {
      alert(e.message);
    }
  };

  const firstName = user?.name?.split(' ')[0] || 'there';

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <h2 className="text-3xl font-bold mb-2">Welcome back, {firstName}!</h2>
        <p className="text-gray-500 dark:text-gray-400">Your network activity and feed in one place.</p>
      </motion.div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-6">
          <div className="bg-white dark:bg-dark-card rounded-xl shadow-md p-5 border border-gray-200 dark:border-gray-700">
            <h3 className="font-semibold mb-3">Share an update</h3>
            <form onSubmit={createPost} className="space-y-3">
              <textarea
                value={postText}
                onChange={(e) => setPostText(e.target.value)}
                rows={3}
                placeholder="What are you working on?"
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 p-3 focus:ring-2 focus:ring-primary outline-none"
              />
              <div className="flex justify-end">
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white font-medium hover:bg-primary-hover"
                >
                  <Send size={16} /> Post
                </button>
              </div>
            </form>
          </div>

          <div className="space-y-4">
            {loading ? (
              <p className="text-gray-500">Loading feed…</p>
            ) : (
              feed.items.map((p) => (
                <article
                  key={p._id}
                  className="bg-white dark:bg-dark-card rounded-xl shadow-md p-5 border border-gray-200 dark:border-gray-700"
                >
                  <div className="flex items-start gap-3">
                    <img
                      src={
                        p.author?.profileImage ||
                        `https://i.pravatar.cc/80?u=${encodeURIComponent(p.author?.email || '')}`
                      }
                      alt=""
                      className="w-11 h-11 rounded-full object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-semibold">{p.author?.name}</span>
                        {p.author?.alumniVerified && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-primary/15 text-primary">Verified</span>
                        )}
                        <span className="text-xs text-gray-500">
                          {new Date(p.createdAt).toLocaleString()}
                        </span>
                      </div>
                      <p className="mt-2 whitespace-pre-wrap text-gray-800 dark:text-gray-100">{p.content}</p>
                      {p.image ? (
                        <img src={p.image} alt="" className="mt-3 rounded-lg max-h-64 object-cover border border-gray-200 dark:border-gray-600" />
                      ) : null}
                      <div className="flex items-center gap-4 mt-4 text-sm text-gray-500">
                        <button
                          type="button"
                          onClick={() => toggleLike(p._id)}
                          className={`inline-flex items-center gap-1 ${p.likedByMe ? 'text-primary' : ''}`}
                        >
                          <Heart size={18} className={p.likedByMe ? 'fill-primary text-primary' : ''} />
                          {(p.likes || []).length}
                        </button>
                        <span className="inline-flex items-center gap-1">
                          <MessageCircle size={18} />
                          {(p.comments || []).length}
                        </span>
                      </div>
                      <div className="mt-4 space-y-2 border-t border-gray-100 dark:border-gray-700 pt-3">
                        {(p.comments || []).slice(-4).map((c) => (
                          <div key={c._id} className="text-sm">
                            <span className="font-medium">{c.author?.name}</span>
                            <span className="text-gray-600 dark:text-gray-300 ml-2">{c.content}</span>
                          </div>
                        ))}
                        <div className="flex gap-2">
                          <input
                            value={commentDraft[p._id] || ''}
                            onChange={(e) => setCommentDraft((d) => ({ ...d, [p._id]: e.target.value }))}
                            placeholder="Write a comment…"
                            className="flex-1 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none"
                          />
                          <button
                            type="button"
                            onClick={() => sendComment(p._id)}
                            className="px-3 py-2 rounded-lg bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900 text-sm font-medium"
                          >
                            Reply
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </article>
              ))
            )}
            {!loading && feed.items.length === 0 && (
              <p className="text-gray-500">No posts yet. Be the first to share something.</p>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-white dark:bg-dark-card rounded-xl shadow-md p-5 border border-gray-200 dark:border-gray-700">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <UserPlus size={18} /> Suggested connections
            </h3>
            <div className="space-y-3">
              {suggested.length === 0 && <p className="text-sm text-gray-500">No suggestions right now.</p>}
              {suggested.map((s) => (
                <div key={s._id} className="flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-medium truncate">{s.name}</p>
                    <p className="text-xs text-gray-500 truncate">
                      {s.branch || 'Member'} · {s.company || 'Open to connect'}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => sendConnect(s._id)}
                    className="text-xs px-2 py-1 rounded-lg bg-primary/15 text-primary font-medium shrink-0"
                  >
                    Connect
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardHome;
