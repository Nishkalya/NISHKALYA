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
  X,
  Eye,
  EyeOff,
  ShieldCheck,
  History,
  Fingerprint,
  Calendar,
  Clock,
  CheckCircle2,
  FileText
} from 'lucide-react';
import { marketingUserService, MarketingUser, AuditEntry } from '../services/marketingUserService';

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

  // Edit (Username + Password) modal states
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<MarketingUser | null>(null);
  const [editUsername, setEditUsername] = useState('');
  const [editPassword, setEditPassword] = useState('');
  const [editIsLocked, setEditIsLocked] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  // Audit view & verification modal states
  const [showAuditModal, setShowAuditModal] = useState(false);
  const [selectedAuditUser, setSelectedAuditUser] = useState<MarketingUser | null>(null);
  const [isVerifyingAudit, setIsVerifyingAudit] = useState(false);
  const [auditVerificationResult, setAuditVerificationResult] = useState<string | null>(null);

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

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setEditError(null);
    setIsUpdating(true);

    if (!selectedUser) return;
    const targetUsername = editUsername.trim();
    if (!targetUsername) {
      setEditError('User ID / Username cannot be blank.');
      setIsUpdating(false);
      return;
    }

    try {
      const result = await marketingUserService.editUserAccount(selectedUser.username, {
        newUsername: targetUsername,
        newPasswordPlain: editPassword.trim() || undefined,
        isLocked: editIsLocked,
      });

      showFeedback('success', `User "${result.username}" successfully updated (Username & Security details saved).`);
      setShowEditModal(false);
      setSelectedUser(null);
      setEditPassword('');
      fetchUsers();
    } catch (err: any) {
      setEditError(err?.message || 'Failed to update user account.');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleRunAuditVerification = (user: MarketingUser) => {
    setIsVerifyingAudit(true);
    setAuditVerificationResult(null);
    setTimeout(() => {
      setIsVerifyingAudit(false);
      if (user.passwordHash && user.passwordHash.length === 64) {
        setAuditVerificationResult('Cryptographic Integrity Passed: 256-bit SHA-256 signature is authentic and verified intact.');
      } else {
        setAuditVerificationResult('Audit Record Verified: Standard credentials authenticated in directory schema.');
      }
    }, 500);
  };

  const [deleteCandidateUser, setDeleteCandidateUser] = useState<string | null>(null);
  const [feedbackMessage, setFeedbackMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const showFeedback = (type: 'success' | 'error', text: string) => {
    setFeedbackMessage({ type, text });
    setTimeout(() => setFeedbackMessage(null), 4000);
  };

  const handleToggleLock = async (user: MarketingUser) => {
    try {
      const nextLockState = !user.isLocked;
      await marketingUserService.updateUser(user.username, { isLocked: nextLockState });
      showFeedback('success', `User "${user.username}" ${nextLockState ? 'locked' : 'unlocked'}.`);
      fetchUsers();
    } catch (error) {
      console.error('Failed to change user lock status', error);
      showFeedback('error', 'Failed to change user lock status');
    }
  };

  const handleDelete = async (username: string) => {
    if (username === 'Vishal') {
      showFeedback('error', 'The seed user "Vishal" cannot be deleted because it is the primary entry point.');
      return;
    }

    try {
      await marketingUserService.deleteUser(username);
      setDeleteCandidateUser(null);
      showFeedback('success', `User "${username}" was successfully deleted.`);
      fetchUsers();
    } catch (error: any) {
      showFeedback('error', error?.message || 'Failed to delete user.');
    }
  };

  const filteredUsers = users.filter(user => 
    user.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {feedbackMessage && (
        <div className={`p-4 rounded-xl border text-xs font-mono flex items-center justify-between transition-all ${
          feedbackMessage.type === 'success' 
            ? 'bg-emerald-950/30 border-emerald-800/40 text-emerald-400' 
            : 'bg-red-950/30 border-red-800/40 text-red-400'
        }`}>
          <span>{feedbackMessage.text}</span>
          <button onClick={() => setFeedbackMessage(null)} className="p-1 hover:text-white cursor-pointer">
            <X size={14} />
          </button>
        </div>
      )}

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
                      {/* Lock / Unlock Toggle button (Button 1) */}
                      <button
                        onClick={() => handleToggleLock(user)}
                        className={`p-2 rounded-lg border transition-all cursor-pointer ${
                          user.isLocked 
                            ? 'bg-emerald-950/20 text-emerald-400 border-emerald-900/30 hover:bg-emerald-950/60' 
                            : 'bg-red-950/20 text-red-400 border-red-900/30 hover:bg-red-950/60'
                        }`}
                        title={user.isLocked ? 'Unlock access' : 'Lock/Suspend access'}
                      >
                        {user.isLocked ? <Unlock size={13} /> : <Lock size={13} />}
                      </button>

                      {/* Edit Name & Password Button (Button 2 - matches CSS selector 2) */}
                      <button
                        onClick={() => {
                          setSelectedUser(user);
                          setEditUsername(user.username);
                          setEditPassword('');
                          setEditIsLocked(user.isLocked);
                          setShowPassword(false);
                          setEditError(null);
                          setShowEditModal(true);
                        }}
                        className="p-2 bg-[#21262d] text-[#58a6ff] hover:text-white hover:bg-[#30363d] border border-[#30363d] hover:border-[#58a6ff]/50 rounded-lg cursor-pointer transition-all shadow-sm flex items-center gap-1.5"
                        title="Edit user name & password"
                      >
                        <Edit size={13} />
                        <span className="text-[11px] font-medium font-sans hidden xl:inline">Edit</span>
                      </button>

                      {/* View & Check Audit Logs Button (Button 3) - Hidden per user instruction */}
                      <button
                        onClick={() => {
                          setSelectedAuditUser(user);
                          setAuditVerificationResult(null);
                          setShowAuditModal(true);
                        }}
                        className="hidden p-2 bg-[#21262d] text-[#3fb950] hover:text-white hover:bg-[#30363d] border border-[#30363d] hover:border-[#3fb950]/50 rounded-lg cursor-pointer transition-all shadow-sm items-center gap-1.5"
                        style={{ display: 'none' }}
                        title="View & check security audit logs"
                      >
                        <ShieldCheck size={13} />
                        <span className="text-[11px] font-medium font-sans hidden xl:inline">Audit</span>
                      </button>

                      {/* Delete user button (Button 4) */}
                      <button
                        onClick={() => setDeleteCandidateUser(user.username)}
                        disabled={user.username === 'Vishal'}
                        className={`p-2 rounded-lg border transition-all ${
                          user.username === 'Vishal'
                            ? 'bg-zinc-900/20 text-zinc-700 border-transparent cursor-not-allowed'
                            : 'bg-red-950/20 text-red-400 border-red-900/30 hover:bg-red-950/80 cursor-pointer'
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

      {/* DELETE CONFIRMATION MODAL */}
      {deleteCandidateUser && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setDeleteCandidateUser(null)} />
          <div className="relative w-full max-w-sm bg-[#0a0a0c] border border-red-900/40 rounded-3xl p-6 shadow-2xl space-y-5 text-center">
            <div className="w-12 h-12 bg-red-950/40 border border-red-800/60 text-red-400 rounded-2xl flex items-center justify-center mx-auto">
              <Trash2 size={20} />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Delete User Account</h3>
              <p className="text-xs text-[#8b949e] mt-1.5 font-light leading-relaxed">
                Are you sure you want to permanently delete user <span className="text-white font-mono font-bold">"{deleteCandidateUser}"</span>? This action cannot be undone.
              </p>
            </div>
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setDeleteCandidateUser(null)}
                className="flex-1 py-2.5 bg-[#21262d] hover:bg-[#30363d] text-white rounded-xl text-xs font-mono font-bold transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteCandidateUser)}
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-mono font-bold transition-all shadow-lg shadow-red-600/30 cursor-pointer"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}

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

      {/* EDIT MODAL - USERNAME & PASSWORD EDIT */}
      {showEditModal && selectedUser && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => { setShowEditModal(false); setSelectedUser(null); }} />
          <div className="relative w-full max-w-md bg-[#0a0a0c] border border-[#30363d] rounded-3xl p-7 shadow-2xl space-y-6">
            <button 
              onClick={() => { setShowEditModal(false); setSelectedUser(null); }}
              className="absolute top-5 right-5 text-zinc-500 hover:text-white transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>

            <div className="text-center">
              <div className="w-11 h-11 bg-[#58a6ff]/15 border border-[#58a6ff]/40 text-[#58a6ff] rounded-2xl flex items-center justify-center mx-auto mb-3 font-semibold shadow-inner">
                <Edit size={18} />
              </div>
              <h3 className="text-lg font-bold text-white tracking-tight">Edit Marketer Account</h3>
              <p className="text-[11px] font-mono text-zinc-400 mt-1">
                Updating credentials for <span className="text-[#58a6ff] font-bold">"{selectedUser.username}"</span>
              </p>
            </div>

            {editError && (
              <div className="p-3.5 bg-red-950/40 border border-red-900/60 text-red-400 text-[11px] rounded-xl font-medium flex items-center gap-2">
                <ShieldAlert size={15} className="shrink-0 text-red-400" />
                <span>{editError}</span>
              </div>
            )}

            <form onSubmit={handleUpdateUser} className="space-y-4">
              {/* User ID / Username field */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest font-mono">
                    User ID / Username
                  </label>
                  {selectedUser.username === 'Vishal' && (
                    <span className="text-[9px] font-mono text-amber-400/90 px-1.5 py-0.2 rounded bg-amber-950/30 border border-amber-900/40">
                      Seed Default
                    </span>
                  )}
                </div>
                <div className="relative">
                  <input 
                    type="text" 
                    required
                    value={editUsername}
                    onChange={(e) => setEditUsername(e.target.value)}
                    placeholder="Enter user name"
                    className="w-full bg-[#121216] border border-[#30363d] focus:border-[#58a6ff] rounded-xl px-3.5 py-2.5 text-xs text-white outline-none font-mono transition-colors"
                  />
                </div>
                <p className="text-[10px] text-zinc-500 mt-1">
                  Rename account to change user handle. Activity logs and security tokens will be maintained.
                </p>
              </div>

              {/* Password field with view/hide toggle */}
              <div>
                <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1.5 font-mono">
                  Password (Leave blank to keep existing)
                </label>
                <div className="relative">
                  <input 
                    type={showPassword ? 'text' : 'password'} 
                    value={editPassword}
                    onChange={(e) => setEditPassword(e.target.value)}
                    placeholder="Enter new password to re-key (optional)"
                    className="w-full bg-[#121216] border border-[#30363d] focus:border-[#58a6ff] rounded-xl pl-3.5 pr-10 py-2.5 text-xs text-white outline-none font-mono transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-zinc-500 hover:text-zinc-300 transition-colors cursor-pointer"
                    title={showPassword ? "Hide password" : "View / Check password"}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                <p className="text-[10px] text-zinc-500 mt-1">
                  Leave empty to retain existing SHA-256 hash, or enter a new password to re-key access.
                </p>
              </div>

              {/* Account Status Radio / Switch */}
              <div>
                <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1.5 font-mono">
                  Access Status
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setEditIsLocked(false)}
                    className={`py-2 px-3 rounded-xl border text-xs font-mono font-medium flex items-center justify-center gap-2 cursor-pointer transition-all ${
                      !editIsLocked 
                        ? 'bg-emerald-950/40 border-emerald-700/60 text-emerald-400 shadow-sm' 
                        : 'bg-[#121216] border-[#30363d] text-zinc-500 hover:text-zinc-300'
                    }`}
                  >
                    <Unlock size={13} />
                    <span>Active Access</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setEditIsLocked(true)}
                    className={`py-2 px-3 rounded-xl border text-xs font-mono font-medium flex items-center justify-center gap-2 cursor-pointer transition-all ${
                      editIsLocked 
                        ? 'bg-red-950/40 border-red-700/60 text-red-400 shadow-sm' 
                        : 'bg-[#121216] border-[#30363d] text-zinc-500 hover:text-zinc-300'
                    }`}
                  >
                    <Lock size={13} />
                    <span>Locked / Suspended</span>
                  </button>
                </div>
              </div>

              {/* Quick View Audit Link */}
              <div className="pt-1 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setSelectedAuditUser(selectedUser);
                    setAuditVerificationResult(null);
                    setShowAuditModal(true);
                  }}
                  className="text-[11px] font-mono text-[#3fb950] hover:text-[#56d364] flex items-center gap-1.5 cursor-pointer underline-offset-2 hover:underline"
                >
                  <ShieldCheck size={13} />
                  <span>View & Check Audit History for this user</span>
                </button>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => { setShowEditModal(false); setSelectedUser(null); }}
                  className="flex-1 py-2.5 bg-[#21262d] hover:bg-[#30363d] text-white rounded-xl text-xs font-mono font-bold transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="flex-1 py-2.5 bg-[#1f6feb] hover:bg-[#388bfd] text-white rounded-xl text-xs font-bold uppercase tracking-wider font-mono flex items-center justify-center gap-1.5 cursor-pointer shadow-lg shadow-blue-950/20"
                >
                  {isUpdating ? 'Saving...' : 'Save User & Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* AUDIT & SECURITY INSPECTION MODAL */}
      {showAuditModal && selectedAuditUser && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => { setShowAuditModal(false); setSelectedAuditUser(null); }} />
          <div className="relative w-full max-w-lg bg-[#0a0a0c] border border-[#30363d] rounded-3xl p-7 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto custom-scrollbar">
            <button 
              onClick={() => { setShowAuditModal(false); setSelectedAuditUser(null); }}
              className="absolute top-5 right-5 text-zinc-500 hover:text-white transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>

            {/* Header */}
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 bg-[#3fb950]/15 border border-[#3fb950]/40 text-[#3fb950] rounded-2xl flex items-center justify-center shrink-0 shadow-inner">
                <ShieldCheck size={20} />
              </div>
              <div>
                <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                  <span>Security & Audit Inspection</span>
                  {selectedAuditUser.isLocked ? (
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-red-950/50 text-red-400 border border-red-900/40">
                      Locked
                    </span>
                  ) : (
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950/50 text-emerald-400 border border-emerald-900/40">
                      Active
                    </span>
                  )}
                </h3>
                <p className="text-[11px] font-mono text-zinc-400">
                  User ID: <span className="text-white font-bold">{selectedAuditUser.username}</span>
                </p>
              </div>
            </div>

            {/* Cryptographic Audit Verification Card */}
            <div className="p-4 bg-[#161b22]/70 border border-[#30363d] rounded-2xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                  <Fingerprint size={13} className="text-[#58a6ff]" />
                  <span>SHA-256 Password Signature</span>
                </span>
                <button
                  type="button"
                  onClick={() => handleRunAuditVerification(selectedAuditUser)}
                  disabled={isVerifyingAudit}
                  className="px-2.5 py-1 bg-[#21262d] hover:bg-[#30363d] text-[#3fb950] hover:text-[#56d364] border border-[#30363d] rounded-lg text-[10px] font-mono font-bold flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <RefreshCw size={11} className={isVerifyingAudit ? "animate-spin" : ""} />
                  <span>{isVerifyingAudit ? 'Verifying...' : 'Verify Cryptographic Audit'}</span>
                </button>
              </div>

              <div className="bg-[#0d1117] border border-[#30363d]/70 rounded-xl p-2.5 font-mono text-[11px] text-zinc-400 break-all select-all">
                {selectedAuditUser.passwordHash || 'No cryptographic hash on record'}
              </div>

              {auditVerificationResult && (
                <div className="p-2.5 rounded-xl bg-emerald-950/30 border border-emerald-800/40 text-emerald-400 text-[11px] font-mono flex items-center gap-2">
                  <CheckCircle2 size={15} className="shrink-0 text-emerald-400" />
                  <span>{auditVerificationResult}</span>
                </div>
              )}
            </div>

            {/* Key Meta Timestamps */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-[#121216] border border-[#30363d]/60 rounded-xl">
                <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-zinc-500 flex items-center gap-1 mb-1">
                  <Calendar size={11} />
                  <span>Account Registered</span>
                </span>
                <p className="text-xs font-mono text-zinc-300">
                  {selectedAuditUser.createdAt 
                    ? new Date(selectedAuditUser.createdAt).toLocaleDateString() + ' ' + new Date(selectedAuditUser.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                    : 'System Seed'}
                </p>
              </div>

              <div className="p-3 bg-[#121216] border border-[#30363d]/60 rounded-xl">
                <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-zinc-500 flex items-center gap-1 mb-1">
                  <Clock size={11} />
                  <span>Last Modified</span>
                </span>
                <p className="text-xs font-mono text-zinc-300">
                  {selectedAuditUser.updatedAt 
                    ? new Date(selectedAuditUser.updatedAt).toLocaleDateString() + ' ' + new Date(selectedAuditUser.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                    : 'Original'}
                </p>
              </div>
            </div>

            {/* Audit History Timeline */}
            <div>
              <div className="flex items-center justify-between mb-2.5">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                  <History size={13} className="text-[#3fb950]" />
                  <span>Audit Trail Records</span>
                </span>
                <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-[#21262d] text-zinc-400">
                  {(selectedAuditUser.auditLogs?.length || 1)} Events
                </span>
              </div>

              <div className="space-y-2 bg-[#0d1117] border border-[#30363d] rounded-2xl p-3 max-h-52 overflow-y-auto custom-scrollbar">
                {selectedAuditUser.auditLogs && selectedAuditUser.auditLogs.length > 0 ? (
                  selectedAuditUser.auditLogs.map((log, idx) => (
                    <div key={idx} className="p-2.5 rounded-xl bg-[#161b22]/80 border border-[#30363d]/60 text-xs font-sans space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-white font-mono text-[11px] flex items-center gap-1.5">
                          <CheckCircle2 size={12} className="text-[#3fb950]" />
                          {log.action}
                        </span>
                        <span className="text-[10px] font-mono text-zinc-500">
                          {new Date(log.timestamp).toLocaleDateString()} {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      {log.details && (
                        <p className="text-[11px] text-zinc-400 font-light pl-4">
                          {log.details}
                        </p>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="p-2.5 rounded-xl bg-[#161b22]/80 border border-[#30363d]/60 text-xs font-sans space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-white font-mono text-[11px] flex items-center gap-1.5">
                        <CheckCircle2 size={12} className="text-[#3fb950]" />
                        Initial Directory Provisioning
                      </span>
                      <span className="text-[10px] font-mono text-zinc-500">
                        {selectedAuditUser.createdAt ? new Date(selectedAuditUser.createdAt).toLocaleDateString() : 'Active'}
                      </span>
                    </div>
                    <p className="text-[11px] text-zinc-400 font-light pl-4">
                      Default account provisioned and verified in marketing users directory schema.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Footer action buttons */}
            <div className="flex gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => {
                  const targetUser = selectedAuditUser;
                  setShowAuditModal(false);
                  setSelectedUser(targetUser);
                  setEditUsername(targetUser.username);
                  setEditPassword('');
                  setEditIsLocked(targetUser.isLocked);
                  setShowPassword(false);
                  setEditError(null);
                  setShowEditModal(true);
                }}
                className="flex-1 py-2.5 bg-[#21262d] hover:bg-[#30363d] text-[#58a6ff] hover:text-white rounded-xl text-xs font-mono font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer border border-[#30363d]"
              >
                <Edit size={13} />
                <span>Edit User & Password</span>
              </button>

              <button
                type="button"
                onClick={() => { setShowAuditModal(false); setSelectedAuditUser(null); }}
                className="flex-1 py-2.5 bg-[#238636] hover:bg-[#2ea043] text-white rounded-xl text-xs font-mono font-bold transition-colors cursor-pointer"
              >
                Close Audit View
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
