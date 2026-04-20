import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../lib/api';

const emptyForm = (u) => ({
  name: u?.name || '',
  bio: u?.bio || '',
  profileImage: u?.profileImage || '',
  skills: (u?.skills || []).join(', '),
  graduationYear: u?.graduationYear ?? '',
  branch: u?.branch || u?.major || '',
  company: u?.company || '',
  jobTitle: u?.jobTitle || '',
  location: u?.location || '',
  linkedin: u?.socialLinks?.linkedin || '',
  twitter: u?.socialLinks?.twitter || '',
  website: u?.socialLinks?.website || '',
  password: '',
});

const ProfilePage = () => {
  const { user, refreshUser } = useAuth();
  const token = user?.token;
  const [form, setForm] = useState(emptyForm(user));
  const [msg, setMsg] = useState('');

  useEffect(() => {
    setForm(emptyForm(user));
  }, [user]);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setMsg('');
    try {
      const skills = form.skills
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
      const body = {
        name: form.name,
        bio: form.bio,
        profileImage: form.profileImage,
        skills,
        graduationYear: form.graduationYear === '' ? undefined : Number(form.graduationYear),
        branch: form.branch,
        company: form.company,
        jobTitle: form.jobTitle,
        location: form.location,
        socialLinks: {
          linkedin: form.linkedin,
          twitter: form.twitter,
          website: form.website,
        },
      };
      if (form.password) body.password = form.password;
      await api('/api/users/me', { method: 'PATCH', token, body });
      await refreshUser();
      setMsg('Profile saved.');
    } catch (err) {
      setMsg(err.message);
    }
  };

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Your profile</h2>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
          Keep your alumni card up to date — skills, company, and links help others find you.
        </p>
      </div>

      <form
        onSubmit={onSubmit}
        className="bg-white dark:bg-dark-card rounded-xl shadow-md p-6 border border-gray-200 dark:border-gray-700 space-y-4"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-gray-500">Full name</label>
            <input
              name="name"
              value={form.name}
              onChange={onChange}
              className="mt-1 w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 px-3 py-2 focus:ring-2 focus:ring-primary outline-none"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500">Graduation year</label>
            <input
              type="number"
              name="graduationYear"
              value={form.graduationYear}
              onChange={onChange}
              className="mt-1 w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 px-3 py-2 focus:ring-2 focus:ring-primary outline-none"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500">Branch / major</label>
            <input
              name="branch"
              value={form.branch}
              onChange={onChange}
              className="mt-1 w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 px-3 py-2 focus:ring-2 focus:ring-primary outline-none"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500">Location</label>
            <input
              name="location"
              value={form.location}
              onChange={onChange}
              className="mt-1 w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 px-3 py-2 focus:ring-2 focus:ring-primary outline-none"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500">Company</label>
            <input
              name="company"
              value={form.company}
              onChange={onChange}
              className="mt-1 w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 px-3 py-2 focus:ring-2 focus:ring-primary outline-none"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500">Job title</label>
            <input
              name="jobTitle"
              value={form.jobTitle}
              onChange={onChange}
              className="mt-1 w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 px-3 py-2 focus:ring-2 focus:ring-primary outline-none"
            />
          </div>
        </div>
        <div>
          <label className="text-xs font-semibold text-gray-500">Profile image URL</label>
          <input
            name="profileImage"
            value={form.profileImage}
            onChange={onChange}
            placeholder="https://…"
            className="mt-1 w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 px-3 py-2 focus:ring-2 focus:ring-primary outline-none"
          />
        </div>
        <div>
          <label className="text-xs font-semibold text-gray-500">Bio</label>
          <textarea
            name="bio"
            rows={4}
            value={form.bio}
            onChange={onChange}
            className="mt-1 w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 px-3 py-2 focus:ring-2 focus:ring-primary outline-none"
          />
        </div>
        <div>
          <label className="text-xs font-semibold text-gray-500">Skills (comma separated)</label>
          <input
            name="skills"
            value={form.skills}
            onChange={onChange}
            className="mt-1 w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 px-3 py-2 focus:ring-2 focus:ring-primary outline-none"
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-xs font-semibold text-gray-500">LinkedIn</label>
            <input
              name="linkedin"
              value={form.linkedin}
              onChange={onChange}
              className="mt-1 w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 px-3 py-2 focus:ring-2 focus:ring-primary outline-none"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500">Twitter / X</label>
            <input
              name="twitter"
              value={form.twitter}
              onChange={onChange}
              className="mt-1 w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 px-3 py-2 focus:ring-2 focus:ring-primary outline-none"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500">Website</label>
            <input
              name="website"
              value={form.website}
              onChange={onChange}
              className="mt-1 w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 px-3 py-2 focus:ring-2 focus:ring-primary outline-none"
            />
          </div>
        </div>
        <div>
          <label className="text-xs font-semibold text-gray-500">New password (optional)</label>
          <input
            type="password"
            name="password"
            value={form.password}
            onChange={onChange}
            className="mt-1 w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 px-3 py-2 focus:ring-2 focus:ring-primary outline-none"
          />
        </div>
        {msg && <p className="text-sm text-gray-600 dark:text-gray-300">{msg}</p>}
        <div className="flex justify-end">
          <button type="submit" className="px-5 py-2 rounded-lg bg-primary text-white font-semibold hover:bg-primary-hover">
            Save changes
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProfilePage;
