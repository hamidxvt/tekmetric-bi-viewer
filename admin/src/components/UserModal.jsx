import React, { useEffect, useState } from 'react';
import { Dialog } from '@headlessui/react';
import { XMarkIcon, UserPlusIcon, PencilSquareIcon } from '@heroicons/react/24/outline';

const ROLES = [
  { value: 'viewer', label: 'Viewer', desc: 'Can access the Tekmetric Explorer' },
  { value: 'admin',  label: 'Admin',  desc: 'Full access including admin panel' },
];

export default function UserModal({ open, onClose, onSave, editUser }) {
  const isEdit = Boolean(editUser);

  const [form, setForm]     = useState({ email: '', display_name: '', role: 'viewer' });
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState('');

  useEffect(() => {
    if (open) {
      setError('');
      setForm(
        editUser
          ? { email: editUser.email, display_name: editUser.display_name || '', role: editUser.role }
          : { email: '', display_name: '', role: 'viewer' }
      );
    }
  }, [open, editUser]);

  function change(e) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
    setError('');
  }

  async function submit(e) {
    e.preventDefault();
    if (!form.email.trim()) { setError('Email is required.'); return; }
    setLoading(true);
    setError('');
    try {
      await onSave(form);
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onClose={onClose} className="relative z-50">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" aria-hidden="true" />

      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
          {/* Header */}
          <div className="flex items-center gap-3 px-6 py-5 border-b border-gray-100">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${isEdit ? 'bg-blue-50' : 'bg-emerald-50'}`}>
              {isEdit
                ? <PencilSquareIcon className="w-5 h-5 text-blue-600" />
                : <UserPlusIcon     className="w-5 h-5 text-emerald-600" />}
            </div>
            <Dialog.Title className="text-gray-900 font-semibold text-base">
              {isEdit ? 'Edit User' : 'Add New User'}
            </Dialog.Title>
            <button
              onClick={onClose}
              className="ml-auto p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <XMarkIcon className="w-4.5 h-4.5 w-[18px] h-[18px]" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={submit} className="px-6 py-5 space-y-4">
            {error && (
              <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-lg border border-red-100">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Email address <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={change}
                disabled={isEdit}
                placeholder="user@example.com"
                className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 text-gray-900 text-sm
                  focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent
                  disabled:bg-gray-50 disabled:text-gray-400"
              />
              {isEdit && (
                <p className="mt-1 text-xs text-gray-400">Email cannot be changed.</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Display name <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              <input
                type="text"
                name="display_name"
                value={form.display_name}
                onChange={change}
                placeholder="John Smith"
                className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 text-gray-900 text-sm
                  focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
              <div className="space-y-2">
                {ROLES.map(({ value, label, desc }) => (
                  <label
                    key={value}
                    className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-colors
                      ${form.role === value
                        ? 'border-brand-500 bg-brand-50'
                        : 'border-gray-200 hover:bg-gray-50'}`}
                  >
                    <input
                      type="radio"
                      name="role"
                      value={value}
                      checked={form.role === value}
                      onChange={change}
                      className="mt-0.5 accent-brand-600"
                    />
                    <div>
                      <p className={`text-sm font-semibold ${form.role === value ? 'text-brand-700' : 'text-gray-800'}`}>
                        {label}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">{desc}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-1">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-gray-700 text-sm font-medium hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-4 py-2.5 rounded-xl bg-brand-600 text-white text-sm font-semibold
                  hover:bg-brand-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors
                  flex items-center justify-center gap-2"
              >
                {loading && (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                )}
                {isEdit ? 'Save Changes' : 'Add User'}
              </button>
            </div>
          </form>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}
