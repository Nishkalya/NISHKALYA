import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Lock, 
  Unlock, 
  Trash2, 
  Edit, 
  Plus, 
  UserPlus, 
  ShieldAlert, 
  Check, 
  RefreshCw,
  Search,
  KeyRound,
  X
} from 'lucide-react';
import { marketingUserService, MarketingUser } from '../services/marketingUserService';

export default function AdminUserManagement() {
  const [users, setUsers] = useState<MarketingUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Create account modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createUsername, setCreateUsername] = useState('');
  const [createPassword, setCreatePassword] = useState('');
  const [createError, setCreateError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  // Edit / Password Reset modal states
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<MarketingUser | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [editError, setEditError] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const allUsers = await marketingUserService.getUsers();
      setUsers(allUsers);
    } catch (error) {
      console.error('Failed to load user accounts', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError(null);
    setIsCreating(true);

    const normalUsername = createUsername.trim();
    if (!normalUsername || !createPassword) {
      setCreateError('All fields are required.');
      setIsCreating(false);
      return;
    }

    try {
      await marketingUserService.createUser(normalUsername, createPassword);
      setShowCreateModal(false);
      setCreateUsername('');
      setCreatePassword('');
      fetchUsers();
    } catch (err: any) {
      setCreateError(err?.message || 'Failed to create user account.');
    } finally {
      setIsCreating(false);
    }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setEditError(null);
    setIsUpdating(true);

    if (!selectedUser) return;
    const pwd = newPassword.trim();
    if (!pwd) {
      setEditError('Please enter a new password.');
      setIsUpdating(false);
      return;
    }

    try {
      await marketingUserService.updateUser(selectedUser.username, { passwordPlain: pwd });
      setShowEditModal(false);
      setNewPassword('');
      setSelectedUser(null);
      fetchUsers();
    } catch (err: any) {
      setEditError(err?.message || 'Failed to update user password.');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleToggleLock = async (user: MarketingUser) => {
    try {
      const nextLockState = !user.isLocked;
      await marketingUserService.updateUser(user.username, { isLocked: nextLockState });
      fetchUsers();
    } catch (error) {
      console.error('Failed to change user lock status', error);
    }
  };

  const handleDelete = async (username: string) => {
    if (username === 'Vishal') {
      alert('The seed user "Vishal" cannot be deleted because it is the primary entry point.');
      return;
    }

    if (!window.confirm(`Are you absolutely sure you want to permanently delete the custom marketer account for "${username}"?`)) {
      return;
    }

    try {
      await marketingUserService.deleteUser(username);
      fetchUsers();
    } catch (error: any) {
      alert(error?.message || 'Failed to delete user.');
    }
  };

  const filteredUsers = users.filter(user => 
    user.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Top action bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-5 bg-[#161b22]/70 border border-[#30363d]/60 rounded-2xl">
        <div className="relative flex-1 max-w-md">
          <span className="absolute left-4 top-3 text-zinc-500">
            <Search size={16} />
          </span>
          <input 
            type="text" 
            placeholder="Search custom marketing users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#0d1117] border border-[#30363d] rounded-xl pl-11 pr-4 py-2.5 text-xs text-white outline-none focus:border-[#58a6ff]/50 font-sans"
          />
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={fetchUsers}
            className="p-3 bg-[#21262d] border border-[#30363d] text-[#8b949e] hover:text-white rounded-xl transition-colors cursor-pointer"
            title="Refresh user list"
          >
            <RefreshCw size={14} className={isLoading ? "animate-spin" : ""} />
          </button>
          
          <button 
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2.5 bg-[#238636] hover:bg-[#2eaa44] text-white rounded-xl text-xs font-bold font-mono uppercase tracking-wider flex items-center gap-2 cursor-pointer shadow-md shadow-emerald-900/10"
          >
            <UserPlus size={14} />
            <span>Create Account</span>
          </button>
        </div>
      </div>

      {/* Main Table view */}
      <div className="bg-[#161b22]/40 border border-[#30363d]/60 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-5 border-b border-[#30363d] flex items-center justify-between bg-[#161b22]/50">
          <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
            <Users size={16} className="text-[#58a6ff]" />
            <span>Marketer Account Directory</span>
          </h3>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded border border-zinc-800 text-zinc-500 bg-zinc-950 font-bold">
            {filteredUsers.length} Recorded
          </span>
        </div>

        {isLoading ? (
          <div className="py-20 text-center text-xs font-mono text-zinc-500">
            <RefreshCw size={24} className="animate-spin mx-auto mb-3 text-[#58a6ff]" />
            <span>Synchronizing Directory Schema...</span>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="py-20 text-center text-xs text-[#8b949e] font-sans">
            <ShieldAlert size={28} className="mx-auto mb-3 text-zinc-600" />
            <p>No matching user directories discovered.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-sans">
              <thead className="bg-[#0c1017] text-zinc-500 border-b border-[#30363d] text-[10px] font-bold uppercase tracking-wider font-mono">
                <tr>
                  <th className="p-4 pl-6">User ID (Username)</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Secure Password Signature</th>
                  <th className="p-4 text-center pr-6">Action Command Controls</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#30363d]/45">
                {filteredUsers.map((user) => (
                  <tr key={user.username} className="hover:bg-[#161b22]/30 transition-colors">
                    <td className="p-4 pl-6 font-bold text-white">
                      {user.username}
                    </td>
                    <td className="p-4">
                      {user.isLocked ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-red-950/40 text-red-400 border border-red-900/40 text-[10px] font-mono font-bold uppercase tracking-wider">
                          <Lock size={10} />
                          Locked
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-emerald-950/40 text-emerald-400 border border-emerald-900/40 text-[10px] font-mono font-bold uppercase tracking-wider">
                          <Unlock size={10} />
                          Active
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-[#8b949e]/40 font-mono text-[10px]">
                      {user.passwordHash ? `${user.passwordHash.substring(0, 16)}... [SHA-256]` : 'unsecured'}
                    </td>
                    <td className="p-4 text-center pr-6 flex items-center justify-center gap-2">
                      {/* Lock / Unlock Toggle button */}
                      <button
                        onClick={() => handleToggleLock(user)}
                        className={`p-2 rounded-lg border transition-all cursor-pointer ${
                          user.isLocked 
                            ? 'bg-emerald-950/20 text-emerald-400 border-emerald-900/20 hover:bg-emerald-950' 
                            : 'bg-red-950/20 text-red-500 border-red-900/20 hover:bg-red-950'
                        }`}
                        title={user.isLocked ? 'Unlock access' : 'Lock/Suspend access'}
                      >
                        {user.isLocked ? <Unlock size={13} /> : <Lock size={13} />}
                      </button>

                      {/* Reset Password Button */}
                      <button
                        onClick={() => {
                          setSelectedUser(user);
                          setShowEditModal(true);
                        }}
                        className="p-2 bg-[#21262d] text-[#8b949e] hover:text-white border border-[#30363d] rounded-lg cursor-pointer"
                        title="Reset secure credential"
                      >
                        <KeyRound size={13} />
                      </button>

                      {/* Delete user button */}
                      <button
                        onClick={() => handleDelete(user.username)}
                        disabled={user.username === 'Vishal'}
                        className={`p-2 rounded-lg border transition-all ${
                          user.username === 'Vishal'
                            ? 'bg-zinc-900/20 text-zinc-700 border-transparent cursor-not-allowed'
                            : 'bg-red-990/10 text-red-400 border-red-990/20 hover:bg-red-950/80 cursor-pointer'
                        }`}
                        title="Permanently remove"
                      >
                        <Trash2 size={13} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* CREATE MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setShowCreateModal(false)} />
          <div className="relative w-full max-w-sm bg-[#0a0a0c] border border-zinc-800 rounded-3xl p-8 shadow-2xl space-y-6">
            <button 
              onClick={() => setShowCreateModal(false)}
              className="absolute top-5 right-5 text-zinc-500 hover:text-white transition-colors"
            >
              <X size={18} />
            </button>

            <div className="text-center">
              <div className="w-11 h-11 bg-emerald-950/30 border border-emerald-900 text-emerald-400 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <UserPlus size={18} />
              </div>
              <h3 className="text-lg font-bold text-white tracking-tight">Add New Marketer</h3>
              <p className="text-[10px] uppercase font-mono tracking-widest text-[#8b949e] mt-1">Directory Registration</p>
            </div>

            {createError && (
              <p className="p-3 bg-red-950/40 border border-red-900/60 text-red-400 text-[11px] rounded-xl font-medium">{createError}</p>
            )}

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-[9px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5 font-mono">User ID / Username</label>
                <input 
                  type="text" 
                  required
                  value={createUsername}
                  onChange={(e) => setCreateUsername(e.target.value)}
                  placeholder="e.g. nishkalya"
                  className="w-full bg-[#121216] border border-zinc-850 rounded-xl px-4 py-2.5 text-xs text-white outline-none focus:border-[#58a6ff]/50"
                />
              </div>

              <div>
                <label className="block text-[9px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5 font-mono">Password</label>
                <input 
                  type="password" 
                  required
                  value={createPassword}
                  onChange={(e) => setCreatePassword(e.target.value)}
                  placeholder="Set account password"
                  className="w-full bg-[#121216] border border-zinc-850 rounded-xl px-4 py-2.5 text-xs text-white outline-none focus:border-[#58a6ff]/50"
                />
              </div>

              <button
                type="submit"
                disabled={isCreating}
                className="w-full mt-2 bg-[#238636] hover:bg-[#2eaa44] text-white py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider font-mono flex items-center justify-center gap-1.5 cursor-pointer"
              >
                {isCreating ? 'Provisioning...' : 'Provision Account'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* EDIT MODAL / PASSWORD RESET */}
      {showEditModal && selectedUser && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => { setShowEditModal(false); setSelectedUser(null); }} />
          <div className="relative w-full max-w-sm bg-[#0a0a0c] border border-zinc-800 rounded-3xl p-8 shadow-2xl space-y-6">
            <button 
              onClick={() => { setShowEditModal(false); setSelectedUser(null); }}
              className="absolute top-5 right-5 text-zinc-500 hover:text-white transition-colors"
            >
              <X size={18} />
            </button>

            <div className="text-center">
              <div className="w-11 h-11 bg-amber-950/30 border border-amber-900 text-amber-500 rounded-2xl flex items-center justify-center mx-auto mb-3 font-semibold">
                <KeyRound size={18} />
              </div>
              <h3 className="text-lg font-bold text-white tracking-tight">Reset Credential</h3>
              <p className="text-[10px] uppercase font-mono tracking-widest text-zinc-400 mt-1">User ID: {selectedUser.username}</p>
            </div>

            {editError && (
              <p className="p-3 bg-red-950/40 border border-red-900/60 text-red-400 text-[11px] rounded-xl font-medium">{editError}</p>
            )}

            <form onSubmit={handlePasswordReset} className="space-y-4">
              <div>
                <label className="block text-[9px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5 font-mono">New Secure Password</label>
                <input 
                  type="password" 
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Initialize new password"
                  className="w-full bg-[#121216] border border-zinc-850 rounded-xl px-4 py-2.5 text-xs text-white outline-none focus:border-[#58a6ff]/50"
                />
              </div>

              <button
                type="submit"
                disabled={isUpdating}
                className="w-full mt-2 bg-amber-600 hover:bg-amber-500 text-white py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider font-mono flex items-center justify-center gap-1.5 cursor-pointer"
              >
                {isUpdating ? 'Rekeying...' : 'Update Password Signature'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
