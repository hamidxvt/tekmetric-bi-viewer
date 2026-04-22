import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import {
  HomeIcon,
  UsersIcon,
  ArrowRightStartOnRectangleIcon,
  Bars3Icon,
  XMarkIcon,
  BoltIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '../contexts/AuthContext';

const navItems = [
  { to: '/dashboard', label: 'Dashboard', Icon: HomeIcon },
  { to: '/users',     label: 'Users',     Icon: UsersIcon },
];

function Sidebar({ onClose }) {
  const { user, logout } = useAuth();

  return (
    <aside className="flex flex-col h-full bg-sidebar w-64 shrink-0">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-slate-800">
        <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center shrink-0">
          <BoltIcon className="w-4 h-4 text-white" />
        </div>
        <div>
          <p className="text-white font-semibold text-sm leading-tight">Gemba Api Center</p>
          <p className="text-slate-400 text-xs">Admin Panel</p>
        </div>
        {/* Mobile close */}
        {onClose && (
          <button
            onClick={onClose}
            className="ml-auto p-1.5 text-slate-400 hover:text-white lg:hidden"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        <p className="px-3 text-[10px] font-semibold text-slate-500 uppercase tracking-widest mb-2">
          Management
        </p>
        {navItems.map(({ to, label, Icon }) => (
          <NavLink
            key={to}
            to={to}
            onClick={onClose}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-brand-600/20 text-brand-400'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`
            }
          >
            <Icon className="w-4.5 h-4.5 w-[18px] h-[18px] shrink-0" />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* User info + logout */}
      <div className="px-3 pb-5 border-t border-slate-800 pt-4">
        <div className="flex items-center gap-3 px-3 py-2 mb-1">
          <div className="w-8 h-8 rounded-full bg-brand-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
            {(user?.name || user?.email || '?')[0].toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-white text-sm font-medium truncate">{user?.name || user?.email}</p>
            <p className="text-slate-400 text-xs truncate">{user?.role}</p>
          </div>
        </div>
        <button
          onClick={logout}
          className="flex items-center gap-2.5 w-full px-3 py-2 text-slate-400 hover:text-red-400 hover:bg-red-900/20 rounded-lg text-sm transition-colors"
        >
          <ArrowRightStartOnRectangleIcon className="w-4 h-4 shrink-0" />
          Sign Out
        </button>
        <a
          href="/"
          className="flex items-center gap-2.5 w-full px-3 py-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg text-sm transition-colors mt-0.5"
        >
          <BoltIcon className="w-4 h-4 shrink-0" />
          Back to Explorer
        </a>
      </div>
    </aside>
  );
}

export default function Layout() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Desktop sidebar */}
      <div className="hidden lg:flex">
        <Sidebar />
      </div>

      {/* Mobile sidebar overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() => setMobileOpen(false)}
          />
          <div className="absolute inset-y-0 left-0 w-64 z-50">
            <Sidebar onClose={() => setMobileOpen(false)} />
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar (mobile) */}
        <div className="lg:hidden flex items-center gap-3 px-4 py-3 bg-sidebar border-b border-slate-800">
          <button
            onClick={() => setMobileOpen(true)}
            className="p-1.5 text-slate-400 hover:text-white"
          >
            <Bars3Icon className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-brand-600 rounded flex items-center justify-center">
              <BoltIcon className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="text-white text-sm font-semibold">Admin</span>
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
