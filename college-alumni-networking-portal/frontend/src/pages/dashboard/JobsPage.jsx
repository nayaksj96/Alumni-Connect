import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Briefcase, Plus } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../lib/api';

const JobsPage = () => {
  const { user } = useAuth();
  const token = user?.token;
  const canPost = user?.role === 'admin' || user?.role === 'alumni';
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    title: '',
    company: '',
    location: '',
    description: '',
  });

  const load = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const data = await api('/api/jobs', { token });
      setJobs(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [token]);

  const apply = async (id) => {
    try {
      await api(`/api/jobs/${id}/apply`, { method: 'POST', token });
      await load();
    } catch (e) {
      alert(e.message);
    }
  };

  const createJob = async (e) => {
    e.preventDefault();
    try {
      await api('/api/jobs', { method: 'POST', token, body: form });
      setForm({ title: '', company: '', location: '', description: '' });
      setShowForm(false);
      await load();
    } catch (e) {
      alert(e.message);
    }
  };

  const removeJob = async (id) => {
    if (!window.confirm('Remove this job listing?')) return;
    try {
      await api(`/api/jobs/${id}`, { method: 'DELETE', token });
      await load();
    } catch (e) {
      alert(e.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold">Jobs</h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
            Discover roles shared by alumni and apply in one click.
          </p>
        </div>
        {canPost && (
          <button
            type="button"
            onClick={() => setShowForm((v) => !v)}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-primary text-white font-semibold hover:bg-primary-hover"
          >
            <Plus size={18} /> Post a job
          </button>
        )}
      </div>

      {showForm && canPost && (
        <motion.form
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={createJob}
          className="bg-white dark:bg-dark-card rounded-xl shadow-md p-5 border border-gray-200 dark:border-gray-700 space-y-3"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input
              required
              placeholder="Title"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 px-3 py-2 focus:ring-2 focus:ring-primary outline-none"
            />
            <input
              required
              placeholder="Company"
              value={form.company}
              onChange={(e) => setForm({ ...form, company: e.target.value })}
              className="rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 px-3 py-2 focus:ring-2 focus:ring-primary outline-none"
            />
            <input
              placeholder="Location"
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
              className="rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 px-3 py-2 focus:ring-2 focus:ring-primary outline-none"
            />
          </div>
          <textarea
            required
            rows={4}
            placeholder="Description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 px-3 py-2 focus:ring-2 focus:ring-primary outline-none"
          />
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600"
            >
              Cancel
            </button>
            <button type="submit" className="px-4 py-2 rounded-lg bg-primary text-white font-semibold">
              Publish
            </button>
          </div>
        </motion.form>
      )}

      {loading ? (
        <p className="text-gray-500">Loading jobs…</p>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {jobs.map((j) => (
            <div
              key={j._id}
              className="bg-white dark:bg-dark-card rounded-xl shadow-md p-5 border border-gray-200 dark:border-gray-700 flex flex-col"
            >
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-primary/10 text-primary">
                  <Briefcase size={22} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-bold">{j.title}</h3>
                  <p className="text-sm text-gray-500">
                    {j.company}
                    {j.location ? ` · ${j.location}` : ''}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    Posted by {j.postedBy?.name}
                    {j.postedBy?.alumniVerified ? ' · Verified alumni' : ''}
                  </p>
                </div>
              </div>
              <p className="mt-3 text-sm text-gray-700 dark:text-gray-200 whitespace-pre-wrap flex-1">{j.description}</p>
              <p className="text-xs text-gray-500 mt-2">{(j.applicants || []).length} applicants</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {(user?.role === 'student' || user?.role === 'alumni') && (
                  <button
                    type="button"
                    disabled={j.hasApplied}
                    onClick={() => apply(j._id)}
                    className="px-4 py-2 rounded-lg bg-primary text-white text-sm font-semibold disabled:bg-gray-400"
                  >
                    {j.hasApplied ? 'Applied' : 'Apply'}
                  </button>
                )}
                {(user?.role === 'admin' ||
                  String(j.postedBy?._id || j.postedBy) === String(user?._id)) && (
                  <button
                    type="button"
                    onClick={() => removeJob(j._id)}
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

      {!loading && jobs.length === 0 && <p className="text-gray-500">No jobs posted yet.</p>}
    </div>
  );
};

export default JobsPage;
