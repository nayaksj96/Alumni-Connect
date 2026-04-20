import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useDebounce } from '../../hooks/useDebounce';
import { api } from '../../lib/api';

const DirectoryPage = () => {
  const { user } = useAuth();
  const token = user?.token;
  const [searchInput, setSearchInput] = useState('');
  const search = useDebounce(searchInput, 400);
  const [year, setYear] = useState('');
  const [branch, setBranch] = useState('');
  const [company, setCompany] = useState('');
  const [skill, setSkill] = useState('');
  const [page, setPage] = useState(1);
  const [data, setData] = useState({ items: [], total: 0, pages: 1 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setPage(1);
  }, [search, year, branch, company, skill]);

  useEffect(() => {
    if (!token) return;
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (year) params.set('graduationYear', year);
    if (branch) params.set('branch', branch);
    if (company) params.set('company', company);
    if (skill) params.set('skill', skill);
    params.set('page', String(page));
    params.set('limit', '12');
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const res = await api(`/api/users/directory?${params.toString()}`, { token });
        if (!cancelled) setData(res);
      } catch (e) {
        console.error(e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [token, search, year, branch, company, skill, page]);

  const actOnConnection = async (peerId, conn) => {
    try {
      if (!conn || conn.status === 'rejected') {
        await api(`/api/connections/${peerId}/request`, { method: 'POST', token });
      } else if (conn.status === 'pending' && !conn.iAmSender) {
        await api(`/api/connections/${conn.id}/accept`, { method: 'PATCH', token });
      }
      const params = new URLSearchParams();
      params.set('page', String(page));
      params.set('limit', '12');
      if (search) params.set('search', search);
      if (year) params.set('graduationYear', year);
      if (branch) params.set('branch', branch);
      if (company) params.set('company', company);
      if (skill) params.set('skill', skill);
      const res = await api(`/api/users/directory?${params.toString()}`, { token });
      setData(res);
    } catch (e) {
      alert(e.message);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Alumni directory</h2>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
          Search and filter by graduation year, branch, company, and skills.
        </p>
      </div>

      <div className="bg-white dark:bg-dark-card p-4 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 space-y-3">
        <div className="relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search by name, email, or company…"
            className="w-full pl-10 pr-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary outline-none"
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <input
            type="number"
            value={year}
            onChange={(e) => setYear(e.target.value)}
            placeholder="Graduation year"
            className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 focus:ring-2 focus:ring-primary outline-none"
          />
          <input
            value={branch}
            onChange={(e) => setBranch(e.target.value)}
            placeholder="Branch / major"
            className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 focus:ring-2 focus:ring-primary outline-none"
          />
          <input
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            placeholder="Company"
            className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 focus:ring-2 focus:ring-primary outline-none"
          />
          <input
            value={skill}
            onChange={(e) => setSkill(e.target.value)}
            placeholder="Skill"
            className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 focus:ring-2 focus:ring-primary outline-none"
          />
        </div>
      </div>

      {loading ? (
        <p className="text-gray-500">Loading directory…</p>
      ) : (
        <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
          {data.items.map((a) => {
            const img =
              a.profileImage || `https://i.pravatar.cc/150?u=${encodeURIComponent(a.email || '')}`;
            const conn = a.connection;
            let btn = { label: 'Connect', disabled: false };
            if (conn?.status === 'pending' && conn.iAmSender) btn = { label: 'Pending', disabled: true };
            if (conn?.status === 'pending' && !conn.iAmSender) btn = { label: 'Accept', disabled: false };
            if (conn?.status === 'accepted') btn = { label: 'Connected', disabled: true };
            if (conn?.status === 'rejected') btn = { label: 'Connect', disabled: false };
            return (
              <motion.div
                layout
                key={a._id}
                className="bg-white dark:bg-dark-card p-6 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 flex flex-col items-center text-center"
              >
                <img src={img} alt="" className="w-24 h-24 rounded-full mb-4 ring-2 ring-primary/50 object-cover" />
                <h4 className="text-lg font-bold">{a.name}</h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">{a.email}</p>
                <div className="text-sm text-gray-500 dark:text-gray-400 mt-2 bg-primary/10 px-3 py-1 rounded-full">
                  Class of {a.graduationYear || '—'} · {a.branch || a.major || 'Branch N/A'}
                </div>
                {a.company ? (
                  <p className="text-xs text-gray-500 mt-2">
                    {a.jobTitle ? `${a.jobTitle} @ ` : ''}
                    {a.company}
                  </p>
                ) : null}
                {String(a._id) !== String(user?._id) && (
                  <button
                    type="button"
                    disabled={btn.disabled}
                    onClick={() => actOnConnection(a._id, conn)}
                    className="mt-4 w-full py-2 rounded-lg bg-primary text-white text-sm font-semibold disabled:bg-gray-400 disabled:cursor-not-allowed hover:bg-primary-hover"
                  >
                    {btn.label}
                  </button>
                )}
              </motion.div>
            );
          })}
        </motion.div>
      )}

      <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-300">
        <span>
          Page {data.page} of {data.pages} · {data.total} members
        </span>
        <div className="flex gap-2">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="inline-flex items-center gap-1 px-3 py-1 rounded-lg border border-gray-300 dark:border-gray-600 disabled:opacity-40"
          >
            <ChevronLeft size={16} /> Prev
          </button>
          <button
            type="button"
            disabled={page >= (data.pages || 1)}
            onClick={() => setPage((p) => p + 1)}
            className="inline-flex items-center gap-1 px-3 py-1 rounded-lg border border-gray-300 dark:border-gray-600 disabled:opacity-40"
          >
            Next <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default DirectoryPage;
