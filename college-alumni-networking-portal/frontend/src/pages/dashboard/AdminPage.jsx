import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../lib/api';

const AdminPage = () => {
  const { user } = useAuth();
  const token = user?.token;
  const [analytics, setAnalytics] = useState(null);
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    graduationYear: new Date().getFullYear(),
    branch: '',
    role: 'student',
  });
  const [note, setNote] = useState('');

  const load = async () => {
    if (!token) return;
    try {
      const [a, u] = await Promise.all([
        api('/api/admin/analytics', { token }),
        api('/api/admin/users', { token }),
      ]);
      setAnalytics(a);
      setUsers(u);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    load();
  }, [token]);

  if (user?.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  const createUser = async (e) => {
    e.preventDefault();
    setNote('');
    try {
      await api('/api/admin/users', {
        method: 'POST',
        token,
        body: {
          ...form,
          graduationYear: Number(form.graduationYear),
          major: form.branch,
        },
      });
      setForm({
        name: '',
        email: '',
        password: '',
        graduationYear: new Date().getFullYear(),
        branch: '',
        role: 'student',
      });
      setNote('User created.');
      await load();
    } catch (err) {
      setNote(err.message);
    }
  };

  const patchUser = async (id, body) => {
    try {
      await api(`/api/admin/users/${id}`, { method: 'PATCH', token, body });
      await load();
    } catch (e) {
      alert(e.message);
    }
  };

  const deleteUser = async (id) => {
    if (!window.confirm('Delete this user?')) return;
    try {
      await api(`/api/admin/users/${id}`, { method: 'DELETE', token });
      await load();
    } catch (e) {
      alert(e.message);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold">Administration</h2>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
          User management, alumni verification, and platform analytics.
        </p>
      </div>

      {analytics && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {analytics.usersByRole?.map((r) => (
            <div
              key={r._id}
              className="bg-white dark:bg-dark-card rounded-xl border border-gray-200 dark:border-gray-700 p-4 shadow-sm"
            >
              <p className="text-xs uppercase text-gray-500">{r._id}</p>
              <p className="text-2xl font-bold mt-1">{r.count}</p>
            </div>
          ))}
          <div className="bg-white dark:bg-dark-card rounded-xl border border-gray-200 dark:border-gray-700 p-4 shadow-sm">
            <p className="text-xs uppercase text-gray-500">Posts</p>
            <p className="text-2xl font-bold mt-1">{analytics.posts}</p>
          </div>
          <div className="bg-white dark:bg-dark-card rounded-xl border border-gray-200 dark:border-gray-700 p-4 shadow-sm">
            <p className="text-xs uppercase text-gray-500">Jobs</p>
            <p className="text-2xl font-bold mt-1">{analytics.jobs}</p>
          </div>
          <div className="bg-white dark:bg-dark-card rounded-xl border border-gray-200 dark:border-gray-700 p-4 shadow-sm">
            <p className="text-xs uppercase text-gray-500">Events</p>
            <p className="text-2xl font-bold mt-1">{analytics.events}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <form
          onSubmit={createUser}
          className="bg-white dark:bg-dark-card rounded-xl shadow-md p-5 border border-gray-200 dark:border-gray-700 space-y-3"
        >
          <h3 className="font-semibold">Create user</h3>
          <input
            required
            placeholder="Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 px-3 py-2"
          />
          <input
            required
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 px-3 py-2"
          />
          <input
            required
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 px-3 py-2"
          />
          <input
            type="number"
            placeholder="Graduation year"
            value={form.graduationYear}
            onChange={(e) => setForm({ ...form, graduationYear: e.target.value })}
            className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 px-3 py-2"
          />
          <input
            placeholder="Branch"
            value={form.branch}
            onChange={(e) => setForm({ ...form, branch: e.target.value })}
            className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 px-3 py-2"
          />
          <select
            value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value })}
            className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 px-3 py-2"
          >
            <option value="student">Student</option>
            <option value="alumni">Alumni</option>
          </select>
          {note && <p className="text-sm text-gray-600">{note}</p>}
          <button type="submit" className="w-full py-2 rounded-lg bg-primary text-white font-semibold">
            Add user
          </button>
        </form>

        <div className="xl:col-span-2 bg-white dark:bg-dark-card rounded-xl shadow-md border border-gray-200 dark:border-gray-700 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 dark:bg-gray-800/80">
              <tr>
                <th className="p-3">Name</th>
                <th className="p-3">Role</th>
                <th className="p-3">Alumni</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u._id} className="border-t border-gray-100 dark:border-gray-700">
                  <td className="p-3">
                    <div className="font-medium">{u.name}</div>
                    <div className="text-xs text-gray-500">{u.email}</div>
                  </td>
                  <td className="p-3 capitalize">{u.role}</td>
                  <td className="p-3 space-y-1">
                    {u.role === 'alumni' && (
                      <>
                        <label className="flex items-center gap-2 text-xs">
                          <input
                            type="checkbox"
                            checked={!!u.alumniVerified}
                            onChange={(e) => patchUser(u._id, { alumniVerified: e.target.checked })}
                          />
                          Verified badge
                        </label>
                        <select
                          value={u.alumniApprovalStatus}
                          onChange={(e) => patchUser(u._id, { alumniApprovalStatus: e.target.value })}
                          className="w-full rounded border border-gray-300 dark:border-gray-600 bg-transparent text-xs px-2 py-1"
                        >
                          <option value="approved">Approved</option>
                          <option value="pending">Pending approval</option>
                        </select>
                      </>
                    )}
                  </td>
                  <td className="p-3">
                    {u._id !== user._id && (
                      <button
                        type="button"
                        onClick={() => deleteUser(u._id)}
                        className="text-xs text-red-600 underline"
                      >
                        Delete
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminPage;
