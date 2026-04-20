import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { CalendarPlus, MapPin } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../lib/api';

const EventsPage = () => {
  const { user } = useAuth();
  const token = user?.token;
  const canCreate = user?.role === 'admin' || user?.role === 'alumni';
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    title: '',
    description: '',
    location: '',
    date: '',
  });

  const load = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const data = await api('/api/events', { token });
      setEvents(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [token]);

  const rsvp = async (id) => {
    try {
      await api(`/api/events/${id}/rsvp`, { method: 'POST', token });
      await load();
    } catch (e) {
      alert(e.message);
    }
  };

  const createEvent = async (e) => {
    e.preventDefault();
    try {
      await api('/api/events', {
        method: 'POST',
        token,
        body: {
          ...form,
          date: new Date(form.date).toISOString(),
        },
      });
      setForm({ title: '', description: '', location: '', date: '' });
      setShowForm(false);
      await load();
    } catch (e) {
      alert(e.message);
    }
  };

  const remove = async (id) => {
    if (!window.confirm('Delete this event?')) return;
    try {
      await api(`/api/events/${id}`, { method: 'DELETE', token });
      await load();
    } catch (e) {
      alert(e.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold">Events</h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
            Meetups, webinars, and campus reunions.
          </p>
        </div>
        {canCreate && (
          <button
            type="button"
            onClick={() => setShowForm((v) => !v)}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-primary text-white font-semibold hover:bg-primary-hover"
          >
            <CalendarPlus size={18} /> New event
          </button>
        )}
      </div>

      {showForm && canCreate && (
        <motion.form
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={createEvent}
          className="bg-white dark:bg-dark-card rounded-xl shadow-md p-5 border border-gray-200 dark:border-gray-700 space-y-3"
        >
          <input
            required
            placeholder="Title"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 px-3 py-2 focus:ring-2 focus:ring-primary outline-none"
          />
          <textarea
            placeholder="Description"
            rows={3}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 px-3 py-2 focus:ring-2 focus:ring-primary outline-none"
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input
              type="datetime-local"
              required
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
              className="rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 px-3 py-2 focus:ring-2 focus:ring-primary outline-none"
            />
            <input
              placeholder="Location / link"
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
              className="rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 px-3 py-2 focus:ring-2 focus:ring-primary outline-none"
            />
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600"
            >
              Cancel
            </button>
            <button type="submit" className="px-4 py-2 rounded-lg bg-primary text-white font-semibold">
              Create
            </button>
          </div>
        </motion.form>
      )}

      {loading ? (
        <p className="text-gray-500">Loading events…</p>
      ) : (
        <div className="space-y-4">
          {events.map((ev) => (
            <div
              key={ev._id}
              className="bg-white dark:bg-dark-card rounded-xl shadow-md p-5 border border-gray-200 dark:border-gray-700 flex flex-col md:flex-row md:items-center md:justify-between gap-4"
            >
              <div>
                <h3 className="text-lg font-bold">{ev.title}</h3>
                <p className="text-sm text-gray-500 mt-1">
                  {new Date(ev.date).toLocaleString()} · Hosted by {ev.createdBy?.name}
                </p>
                {ev.location && (
                  <p className="text-sm text-gray-600 dark:text-gray-300 mt-2 inline-flex items-center gap-1">
                    <MapPin size={16} /> {ev.location}
                  </p>
                )}
                {ev.description && (
                  <p className="text-sm text-gray-700 dark:text-gray-200 mt-2 whitespace-pre-wrap">{ev.description}</p>
                )}
                <p className="text-xs text-gray-500 mt-2">{(ev.attendees || []).length} attending</p>
              </div>
              <div className="flex flex-col gap-2 min-w-[140px]">
                <button
                  type="button"
                  onClick={() => rsvp(ev._id)}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold ${
                    ev.attending ? 'bg-gray-200 dark:bg-gray-700' : 'bg-primary text-white'
                  }`}
                >
                  {ev.attending ? 'Leave RSVP' : 'RSVP'}
                </button>
                {(user?.role === 'admin' ||
                  String(ev.createdBy?._id || ev.createdBy) === String(user?._id)) && (
                  <button
                    type="button"
                    onClick={() => remove(ev._id)}
                    className="px-4 py-2 rounded-lg border border-red-200 text-red-600 text-sm"
                  >
                    Delete
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && events.length === 0 && <p className="text-gray-500">No upcoming events.</p>}
    </div>
  );
};

export default EventsPage;
