import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  UsersIcon,
  CheckCircleIcon,
  ShieldCheckIcon,
  ClockIcon,
  ArrowRightIcon,
} from '@heroicons/react/24/outline';
import { adminApi } from '../api';
import { useAuth } from '../contexts/AuthContext';

function StatCard({ icon: Icon, label, value, color, loading }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center gap-4">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
        <Icon className="w-6 h-6" />
      </div>
      <div>
        <p className="text-2xl font-bold text-gray-900">
          {loading ? (
            <span className="inline-block w-10 h-7 bg-gray-100 rounded animate-pulse" />
          ) : value}
        </p>
        <p className="text-sm text-gray-500 mt-0.5">{label}</p>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats]     = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminApi
      .stats()
      .then((r) => setStats(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const cards = [
    { icon: UsersIcon,       label: 'Total Users',         value: stats?.total,         color: 'bg-blue-50 text-blue-600' },
    { icon: CheckCircleIcon, label: 'Active Users',         value: stats?.active,        color: 'bg-emerald-50 text-emerald-600' },
    { icon: ShieldCheckIcon, label: 'Admin Users',          value: stats?.admins,        color: 'bg-purple-50 text-purple-600' },
    { icon: ClockIcon,       label: 'Logins (last 7 days)', value: stats?.recent_logins, color: 'bg-orange-50 text-orange-600' },
  ];

  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-1 text-sm">
          Welcome back, <span className="font-medium text-gray-700">{user?.name || user?.email}</span>.
          Here's an overview of your application.
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        {cards.map(({ icon, label, value, color }) => (
          <StatCard
            key={label}
            icon={icon}
            label={label}
            value={value ?? 0}
            color={color}
            loading={loading}
          />
        ))}
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link
          to="/users"
          className="group bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:border-brand-200 hover:shadow-md transition-all"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-brand-50 rounded-xl flex items-center justify-center">
                <UsersIcon className="w-5 h-5 text-brand-600" />
              </div>
              <div>
                <p className="font-semibold text-gray-900 text-sm">Manage Users</p>
                <p className="text-xs text-gray-500 mt-0.5">Add, edit, or remove user access</p>
              </div>
            </div>
            <ArrowRightIcon className="w-4 h-4 text-gray-300 group-hover:text-brand-500 transition-colors" />
          </div>
        </Link>

        <a
          href="/"
          className="group bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:border-slate-200 hover:shadow-md transition-all"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center">
                <svg className="w-5 h-5 text-slate-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                </svg>
              </div>
              <div>
                <p className="font-semibold text-gray-900 text-sm">Open Explorer</p>
                <p className="text-xs text-gray-500 mt-0.5">Go to the Tekmetric API Explorer</p>
              </div>
            </div>
            <ArrowRightIcon className="w-4 h-4 text-gray-300 group-hover:text-slate-500 transition-colors" />
          </div>
        </a>
      </div>

      {/* System info */}
      <div className="mt-6 bg-slate-50 rounded-2xl border border-slate-100 p-5">
        <h3 className="text-sm font-semibold text-slate-700 mb-3">System Information</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-slate-500">
          <div>
            <span className="font-medium text-slate-600">Authentication</span>
            <p className="mt-0.5">AI Center SSO</p>
          </div>
          <div>
            <span className="font-medium text-slate-600">Session</span>
            <p className="mt-0.5">8-hour expiry</p>
          </div>
          <div>
            <span className="font-medium text-slate-600">Database</span>
            <p className="mt-0.5">Azure SQL (gemba)</p>
          </div>
        </div>
      </div>
    </div>
  );
}
