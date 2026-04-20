import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../lib/api';

const MessagesPage = () => {
  const { user } = useAuth();
  const token = user?.token;
  const [conversations, setConversations] = useState([]);
  const [activePeerId, setActivePeerId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState('');
  const [loadingList, setLoadingList] = useState(true);

  const loadConversations = async () => {
    if (!token) return;
    setLoadingList(true);
    try {
      const data = await api('/api/messages/conversations', { token });
      setConversations(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingList(false);
    }
  };

  useEffect(() => {
    loadConversations();
  }, [token]);

  const loadThread = async (peerId) => {
    if (!token || !peerId) return;
    try {
      const data = await api(`/api/messages/with/${peerId}`, { token });
      setMessages(data);
    } catch (e) {
      alert(e.message);
    }
  };

  useEffect(() => {
    if (activePeerId) loadThread(activePeerId);
  }, [activePeerId, token]);

  const send = async (e) => {
    e.preventDefault();
    if (!draft.trim() || !activePeerId) return;
    try {
      await api('/api/messages', {
        method: 'POST',
        token,
        body: { receiverId: activePeerId, content: draft.trim() },
      });
      setDraft('');
      await loadThread(activePeerId);
      await loadConversations();
    } catch (err) {
      alert(err.message);
    }
  };

  const activePeer = conversations.find((c) => String(c.peer._id) === String(activePeerId))?.peer;

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold">Messages</h2>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
          You can message people after you are connected.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-[calc(100vh-220px)] min-h-[420px]">
        <div className="lg:col-span-1 bg-white dark:bg-dark-card rounded-xl border border-gray-200 dark:border-gray-700 overflow-y-auto">
          {loadingList ? (
            <p className="p-4 text-sm text-gray-500">Loading…</p>
          ) : conversations.length === 0 ? (
            <p className="p-4 text-sm text-gray-500">No conversations yet.</p>
          ) : (
            conversations.map((c) => (
              <button
                key={c.peer._id}
                type="button"
                onClick={() => setActivePeerId(c.peer._id)}
                className={`w-full text-left px-4 py-3 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 ${
                  activePeerId === c.peer._id ? 'bg-primary/10' : ''
                }`}
              >
                <p className="font-semibold">{c.peer.name}</p>
                <p className="text-xs text-gray-500 truncate">
                  {c.lastMessage?.content || 'Start a conversation'}
                </p>
              </button>
            ))
          )}
        </div>

        <div className="lg:col-span-2 bg-white dark:bg-dark-card rounded-xl border border-gray-200 dark:border-gray-700 flex flex-col">
          {!activePeerId && (
            <div className="flex-1 flex items-center justify-center text-gray-500 text-sm p-6">
              Select a conversation to start chatting.
            </div>
          )}
          {activePeerId && (
            <>
              <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex items-center gap-3">
                <img
                  src={
                    activePeer?.profileImage ||
                    `https://i.pravatar.cc/64?u=${encodeURIComponent(activePeer?.email || '')}`
                  }
                  alt=""
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div>
                  <p className="font-semibold">{activePeer?.name}</p>
                  <p className="text-xs text-gray-500">{activePeer?.branch || activePeer?.major}</p>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-2">
                {messages.map((m) => {
                  const mine = String(m.sender._id) === String(user?._id);
                  return (
                    <div key={m._id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                      <div
                        className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm ${
                          mine ? 'bg-primary text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100'
                        }`}
                      >
                        {m.content}
                      </div>
                    </div>
                  );
                })}
              </div>
              <form onSubmit={send} className="p-3 border-t border-gray-100 dark:border-gray-700 flex gap-2">
                <input
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  placeholder="Type a message…"
                  className="flex-1 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none"
                />
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-primary text-white text-sm font-semibold disabled:bg-gray-400"
                  disabled={!draft.trim()}
                >
                  Send
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessagesPage;
