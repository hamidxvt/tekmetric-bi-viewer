import React, { useEffect, useState, useMemo } from 'react';
import {
  UserPlusIcon,
  PencilSquareIcon,
  TrashIcon,
  MagnifyingGlassIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';
import { adminApi } from '../api';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../components/Toast';
import UserModal from '../components/UserModal';
import ConfirmDialog from '../components/ConfirmDialog';

function RoleBadge({ role }) {
  return role === 'admin' ? (
    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-700">
      Admin
    </span>
  ) : (
    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">
      Viewer
    </span>
  );
}

function StatusBadge({ active }) {
  return active ? (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700">
      <CheckCircleIcon className="w-3 h-3" /> Active
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-700">
      <XCircleIcon className="w-3 h-3" /> Inactive
    </span>
  );
}

function formatDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

export default function Users() {
  const { user: me }    = useAuth();
  const toast           = useToast();

  const [users, setUsers]         = useState([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editUser, setEditUser]   = useState(null);
  const [confirmOpen, setConfirmOpen]   = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [togglingId, setTogglingId] = useState(null);

  async function load() {
    setLoading(true);
    try {
      const res = await adminApi.listUsers();
      setUsers(res.data.users);
    } catch {
      toast('Failed to load users.', 'error');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return users.filter(
      (u) =>
        u.email.toLowerCase().includes(q) ||
        (u.display_name || '').toLowerCase().includes(q) ||
        u.role.toLowerCase().includes(q)
    );
  }, [users, search]);

  function openCreate() { setEditUser(null); setModalOpen(true); }
  function openEdit(u)  { setEditUser(u);    setModalOpen(true); }

  async function handleSave(form) {
    if (editUser) {
      const res = await adminApi.updateUser(editUser.id, {
        display_name: form.display_name,
        role: form.role,
      });
      setUsers((prev) => prev.map((u) => (u.id === editUser.id ? res.data.user : u)));
      toast('User updated successfully.');
    } else {
      const res = await adminApi.createUser(form);
      setUsers((prev) => [res.data.user, ...prev]);
      toast('User added successfully.');
    }
  }

  function openDelete(u) { setDeleteTarget(u); setConfirmOpen(true); }

  async function handleDelete() {
    setDeleteLoading(true);
    try {
      await adminApi.deleteUser(deleteTarget.id);
      setUsers((prev) => prev.filter((u) => u.id !== deleteTarget.id));
      toast('User deleted.');
      setConfirmOpen(false);
    } catch (err) {
      toast(err.response?.data?.error || 'Failed to delete user.', 'error');
    } finally {
      setDeleteLoading(false);
    }
  }

  async function toggleActive(u) {
    setTogglingId(u.id);
    try {
      const res = await adminApi.updateUser(u.id, { is_active: !u.is_active });
      setUsers((prev) => prev.map((x) => (x.id === u.id ? res.data.user : x)));
      toast(`User ${res.data.user.is_active ? 'activated' : 'deactivated'}.`);
    } catch (err) {
      toast(err.response?.data?.error || 'Failed to update user.', 'error');
    } finally {
      setTogglingId(null);
    }
  }

  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Users</h1>
          <p className="text-gray-500 text-sm mt-0.5">
            Manage who can access the Gemba Api Center platform.
          </p>
        </div>
        <button
          onClick={openCreate}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-brand-600 text-white text-sm font-semibold rounded-xl hover:bg-brand-700 transition-colors shadow-sm"
        >
          <UserPlusIcon className="w-4 h-4" />
          Add User
        </button>
      </div>

      {/* Search + refresh */}
      <div className="flex items-center gap-3 mb-5">
        <div className="relative flex-1 max-w-xs">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search users…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-900
              focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent placeholder-gray-400"
          />
        </div>
        <button
          onClick={load}
          disabled={loading}
          className="p-2.5 rounded-xl border border-gray-200 text-gray-500 hover:text-gray-700 hover:bg-gray-50 transition-colors"
          title="Refresh"
        >
          <ArrowPathIcon className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
        <span className="text-sm text-gray-400 ml-1">
          {filtered.length} {filtered.length === 1 ? 'user' : 'users'}
        </span>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="flex flex-col items-center gap-3">
              <div className="w-7 h-7 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
              <span className="text-sm text-gray-400">Loading users…</span>
            </div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center px-4">
            <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center mb-3">
              <UserPlusIcon className="w-7 h-7 text-gray-300" />
            </div>
            <p className="text-gray-500 font-medium">
              {search ? 'No users match your search.' : 'No users yet.'}
            </p>
            {!search && (
              <button
                onClick={openCreate}
                className="mt-3 text-brand-600 hover:text-brand-700 text-sm font-medium"
              >
                Add the first user →
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <th className="text-left px-5 py-3.5 font-semibold text-gray-500 text-xs uppercase tracking-wide">User</th>
                  <th className="text-left px-4 py-3.5 font-semibold text-gray-500 text-xs uppercase tracking-wide">Role</th>
                  <th className="text-left px-4 py-3.5 font-semibold text-gray-500 text-xs uppercase tracking-wide">Status</th>
                  <th className="text-left px-4 py-3.5 font-semibold text-gray-500 text-xs uppercase tracking-wide hidden md:table-cell">Last Login</th>
                  <th className="text-left px-4 py-3.5 font-semibold text-gray-500 text-xs uppercase tracking-wide hidden lg:table-cell">Added</th>
                  <th className="px-4 py-3.5" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((u) => (
                  <tr key={u.id} className="hover:bg-gray-50/60 transition-colors group">
                    {/* User */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-brand-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                          {(u.display_name || u.email)[0].toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-gray-900 truncate">
                            {u.display_name || u.email}
                            {u.id === me?.id && (
                              <span className="ml-1.5 text-[10px] font-semibold text-brand-500 bg-brand-50 px-1.5 py-0.5 rounded-full">You</span>
                            )}
                          </p>
                          <p className="text-xs text-gray-400 truncate">{u.display_name ? u.email : ''}</p>
                        </div>
                      </div>
                    </td>

                    {/* Role */}
                    <td className="px-4 py-4"><RoleBadge role={u.role} /></td>

                    {/* Status */}
                    <td className="px-4 py-4"><StatusBadge active={u.is_active} /></td>

                    {/* Last login */}
                    <td className="px-4 py-4 text-gray-400 text-xs hidden md:table-cell whitespace-nowrap">
                      {formatDate(u.last_login)}
                    </td>

                    {/* Added */}
                    <td className="px-4 py-4 text-gray-400 text-xs hidden lg:table-cell whitespace-nowrap">
                      {formatDate(u.created_at)}
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-4">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {/* Toggle active */}
                        <button
                          onClick={() => toggleActive(u)}
                          disabled={togglingId === u.id}
                          title={u.is_active ? 'Deactivate' : 'Activate'}
                          className={`p-1.5 rounded-lg transition-colors ${
                            u.is_active
                              ? 'text-gray-400 hover:text-red-500 hover:bg-red-50'
                              : 'text-gray-400 hover:text-emerald-600 hover:bg-emerald-50'
                          }`}
                        >
                          {togglingId === u.id ? (
                            <div className="w-4 h-4 border border-current border-t-transparent rounded-full animate-spin" />
                          ) : u.is_active ? (
                            <XCircleIcon className="w-4 h-4" />
                          ) : (
                            <CheckCircleIcon className="w-4 h-4" />
                          )}
                        </button>

                        {/* Edit */}
                        <button
                          onClick={() => openEdit(u)}
                          title="Edit"
                          className="p-1.5 rounded-lg text-gray-400 hover:text-brand-600 hover:bg-brand-50 transition-colors"
                        >
                          <PencilSquareIcon className="w-4 h-4" />
                        </button>

                        {/* Delete */}
                        <button
                          onClick={() => openDelete(u)}
                          disabled={u.id === me?.id}
                          title={u.id === me?.id ? "Can't delete yourself" : 'Delete'}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modals */}
      <UserModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
        editUser={editUser}
      />

      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleDelete}
        loading={deleteLoading}
        title="Delete User"
        message={`Are you sure you want to permanently delete "${deleteTarget?.display_name || deleteTarget?.email}"? This action cannot be undone.`}
      />
    </div>
  );
}
