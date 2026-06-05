import { useState, useEffect, useCallback } from 'react'
import { Wallet, ShoppingBag, Clock, Plus, User, Key, ArrowUpRight, ArrowDownLeft } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import {
  getUserOrders, getUserTransactions, createWalletTransaction,
  getAdminSettings, Order, WalletTransaction, AdminSettings
} from '../lib/supabase'
import { useToast } from '../hooks/useToast'
import ToastContainer from '../components/ToastContainer'
import { supabase } from '../lib/supabase'

type Tab = 'overview' | 'orders' | 'wallet' | 'profile'

export default function Dashboard() {
  const { user, profile, refreshProfile, signOut } = useAuth()
  const navigate = useNavigate()
  const { toasts, showToast, removeToast } = useToast()
  const [tab, setTab] = useState<Tab>('overview')
  const [orders, setOrders] = useState<Order[]>([])
  const [transactions, setTransactions] = useState<WalletTransaction[]>([])
  const [settings, setSettings] = useState<AdminSettings | null>(null)
  const [loading, setLoading] = useState(true)

  // Add funds modal
  const [addFundsOpen, setAddFundsOpen] = useState(false)
  const [addAmount, setAddAmount] = useState('')
  const [proofFile, setProofFile] = useState<File | null>(null)
  const [addLoading, setAddLoading] = useState(false)

  // Profile edit
  const [newName, setNewName] = useState(profile?.full_name || '')
  const [newPassword, setNewPassword] = useState('')
  const [profileLoading, setProfileLoading] = useState(false)

  useEffect(() => {
    if (!user) { navigate('/login'); return }
    setNewName(profile?.full_name || '')
  }, [user, profile, navigate])

  const loadData = useCallback(async () => {
    if (!user) return
    setLoading(true)
    const [o, t, s] = await Promise.all([
      getUserOrders(user.id),
      getUserTransactions(user.id),
      getAdminSettings()
    ])
    setOrders(o)
    setTransactions(t)
    setSettings(s)
    setLoading(false)
  }, [user])

  useEffect(() => { loadData() }, [loadData])

  async function handleAddFunds() {
    if (!user || !addAmount) return
    const amount = parseFloat(addAmount)
    if (isNaN(amount) || amount <= 0) { showToast('Enter a valid amount', 'error'); return }

    setAddLoading(true)
    const { error } = await createWalletTransaction({
      user_id: user.id,
      amount,
      type: 'Deposit',
      description: `Deposit request via ${proofFile ? 'OPay' : 'manual'} — proof: ${proofFile?.name || 'none'}`,
      status: 'Pending'
    })
    setAddLoading(false)

    if (error) { showToast('Failed to submit request', 'error'); return }

    showToast('Deposit request submitted! Admin will credit your wallet shortly.', 'success')
    setAddFundsOpen(false)
    setAddAmount('')
    setProofFile(null)
    loadData()
  }

  async function handleUpdateProfile() {
    if (!user) return
    setProfileLoading(true)
    try {
      if (newName && newName !== profile?.full_name) {
        const { error } = await supabase.from('profiles').update({ full_name: newName }).eq('id', user.id)
        if (error) throw error
        await refreshProfile()
        showToast('Name updated!', 'success')
      }
      if (newPassword) {
        const { error } = await supabase.auth.updateUser({ password: newPassword })
        if (error) throw error
        showToast('Password updated!', 'success')
        setNewPassword('')
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Update failed'
      showToast(msg, 'error')
    } finally {
      setProfileLoading(false)
    }
  }

  const statusClass: Record<string, string> = {
    Pending: 'badge-pending',
    Approved: 'badge-approved',
    Rejected: 'badge-rejected',
    Delivered: 'badge-delivered',
  }

  const TABS: { key: Tab; label: string; icon: React.ReactNode }[] = [
    { key: 'overview', label: 'Overview', icon: <Wallet size={15} /> },
    { key: 'orders', label: 'Orders', icon: <ShoppingBag size={15} /> },
    { key: 'wallet', label: 'Wallet', icon: <Clock size={15} /> },
    { key: 'profile', label: 'Profile', icon: <User size={15} /> },
  ]

  return (
    <>
      <ToastContainer toasts={toasts} removeToast={removeToast} />

      <div className="min-h-screen pt-24 pb-16 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 animate-slide-up">
          <h1 className="text-3xl font-black text-white">
            Welcome back, <span className="text-[#FFD700]">{profile?.full_name || 'User'}</span>
          </h1>
          <p className="text-[#555] mt-1">{user?.email}</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-0 border-b border-[#1e1e1e] mb-8">
          {TABS.map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex items-center gap-2 px-5 py-3 text-sm font-medium transition-colors ${
                tab === t.key ? 'tab-active' : 'tab-inactive'
              }`}
            >
              {t.icon}
              {t.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-16"><span className="spinner" style={{ width: 28, height: 28, borderWidth: 3 }} /></div>
        ) : (
          <>
            {/* OVERVIEW TAB */}
            {tab === 'overview' && (
              <div className="space-y-6 animate-fade-in">
                {/* Wallet card */}
                <div
                  className="rounded-2xl p-8 relative overflow-hidden gold-glow"
                  style={{
                    background: 'linear-gradient(135deg, #1a1500 0%, #0f0d00 100%)',
                    border: '1px solid rgba(255,215,0,0.3)'
                  }}
                >
                  <div className="absolute top-0 right-0 w-48 h-48 rounded-full opacity-10"
                    style={{ background: 'radial-gradient(circle, #FFD700, transparent)', transform: 'translate(30%, -30%)' }} />
                  <p className="text-[#888] text-xs uppercase tracking-widest mb-2">Wallet Balance</p>
                  <p className="text-5xl font-black text-[#FFD700] font-mono mb-6">
                    ${(profile?.wallet_balance || 0).toFixed(2)}
                  </p>
                  <button
                    onClick={() => setAddFundsOpen(true)}
                    className="btn-gold flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm"
                  >
                    <Plus size={15} /> Add Funds
                  </button>
                </div>

                {/* Quick stats */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  <div className="vault-card p-5">
                    <p className="text-[#555] text-xs mb-1">Total Orders</p>
                    <p className="text-2xl font-bold text-white">{orders.length}</p>
                  </div>
                  <div className="vault-card p-5">
                    <p className="text-[#555] text-xs mb-1">Completed</p>
                    <p className="text-2xl font-bold text-green-400">
                      {orders.filter(o => o.status === 'Approved' || o.status === 'Delivered').length}
                    </p>
                  </div>
                  <div className="vault-card p-5">
                    <p className="text-[#555] text-xs mb-1">Pending</p>
                    <p className="text-2xl font-bold text-yellow-400">
                      {orders.filter(o => o.status === 'Pending').length}
                    </p>
                  </div>
                </div>

                {/* Recent orders */}
                <div className="vault-card p-6">
                  <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                    <ShoppingBag size={16} className="text-[#FFD700]" /> Recent Orders
                  </h3>
                  {orders.slice(0, 4).length === 0 ? (
                    <p className="text-[#444] text-sm py-4 text-center">No orders yet. Browse products to get started!</p>
                  ) : (
                    <div className="space-y-3">
                      {orders.slice(0, 4).map(o => (
                        <div key={o.id} className="flex items-center justify-between py-2 border-b border-[#1a1a1a] last:border-0">
                          <div>
                            <p className="text-white text-sm font-medium">{o.product_name}</p>
                            <p className="text-[#444] text-xs">{new Date(o.created_at).toLocaleDateString()}</p>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-[#FFD700] font-mono text-sm font-bold">${o.amount.toFixed(2)}</span>
                            <span className={`badge ${statusClass[o.status]}`}>{o.status}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ORDERS TAB */}
            {tab === 'orders' && (
              <div className="animate-fade-in">
                <div className="vault-card overflow-hidden">
                  <div className="p-5 border-b border-[#1a1a1a]">
                    <h3 className="text-white font-bold">Order History ({orders.length})</h3>
                  </div>
                  {orders.length === 0 ? (
                    <p className="text-[#444] text-sm text-center py-12">No orders yet</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-[#1a1a1a]">
                            {['Product', 'Category', 'Amount', 'Method', 'Status', 'Date'].map(h => (
                              <th key={h} className="text-left text-[#444] text-xs uppercase tracking-wider px-5 py-3 font-medium">{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {orders.map(o => (
                            <tr key={o.id} className="border-b border-[#111] hover:bg-[#0f0f0f] transition-colors">
                              <td className="px-5 py-4 text-white text-sm font-medium">{o.product_name}</td>
                              <td className="px-5 py-4 text-[#555] text-sm">{o.category}</td>
                              <td className="px-5 py-4 text-[#FFD700] font-mono font-bold text-sm">${o.amount.toFixed(2)}</td>
                              <td className="px-5 py-4 text-[#555] text-sm">{o.payment_method}</td>
                              <td className="px-5 py-4"><span className={`badge ${statusClass[o.status]}`}>{o.status}</span></td>
                              <td className="px-5 py-4 text-[#444] text-xs">{new Date(o.created_at).toLocaleDateString()}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* WALLET TAB */}
            {tab === 'wallet' && (
              <div className="space-y-6 animate-fade-in">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[#555] text-xs uppercase tracking-widest mb-1">Balance</p>
                    <p className="text-3xl font-black text-[#FFD700] font-mono">${(profile?.wallet_balance || 0).toFixed(2)}</p>
                  </div>
                  <button
                    onClick={() => setAddFundsOpen(true)}
                    className="btn-gold flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm"
                  >
                    <Plus size={15} /> Add Funds
                  </button>
                </div>

                {settings && (
                  <div className="vault-card p-5 border-[#FFD700]/10">
                    <p className="text-[#888] text-xs mb-3 uppercase tracking-widest">OPay Transfer Details</p>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div><p className="text-[#444]">Account</p><p className="text-white font-mono">{settings.opay_account_number}</p></div>
                      <div><p className="text-[#444]">Name</p><p className="text-white">{settings.opay_account_name}</p></div>
                    </div>
                  </div>
                )}

                <div className="vault-card overflow-hidden">
                  <div className="p-5 border-b border-[#1a1a1a]">
                    <h3 className="text-white font-bold">Transaction History</h3>
                  </div>
                  {transactions.length === 0 ? (
                    <p className="text-[#444] text-sm text-center py-12">No transactions yet</p>
                  ) : (
                    <div className="divide-y divide-[#111]">
                      {transactions.map(tx => (
                        <div key={tx.id} className="flex items-center justify-between px-5 py-4 hover:bg-[#0f0f0f] transition-colors">
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                              tx.type === 'Deposit' ? 'bg-green-500/10' : 'bg-red-500/10'
                            }`}>
                              {tx.type === 'Deposit'
                                ? <ArrowDownLeft size={14} className="text-green-400" />
                                : <ArrowUpRight size={14} className="text-red-400" />
                              }
                            </div>
                            <div>
                              <p className="text-white text-sm">{tx.description || tx.type}</p>
                              <p className="text-[#444] text-xs">{new Date(tx.created_at).toLocaleDateString()}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className={`font-mono font-bold ${tx.type === 'Deposit' ? 'text-green-400' : 'text-red-400'}`}>
                              {tx.type === 'Deposit' ? '+' : '-'}${tx.amount.toFixed(2)}
                            </p>
                            <span className={`badge text-[10px] ${tx.status === 'Completed' ? 'badge-approved' : 'badge-pending'}`}>
                              {tx.status}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* PROFILE TAB */}
            {tab === 'profile' && (
              <div className="max-w-md space-y-6 animate-fade-in">
                <div className="vault-card p-6">
                  <h3 className="text-white font-bold mb-5 flex items-center gap-2">
                    <User size={16} className="text-[#FFD700]" /> Edit Profile
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="text-[#888] text-xs uppercase tracking-widest block mb-2">Full Name</label>
                      <input
                        value={newName}
                        onChange={e => setNewName(e.target.value)}
                        className="input-vault w-full px-4 py-3 rounded-xl"
                      />
                    </div>
                    <div>
                      <label className="text-[#888] text-xs uppercase tracking-widest block mb-2">Email</label>
                      <input value={user?.email || ''} disabled className="input-vault w-full px-4 py-3 rounded-xl opacity-40 cursor-not-allowed" />
                    </div>
                    <button
                      onClick={handleUpdateProfile}
                      disabled={profileLoading}
                      className="btn-gold w-full py-3 rounded-xl flex items-center justify-center gap-2"
                    >
                      {profileLoading ? <span className="spinner" /> : null}
                      Save Changes
                    </button>
                  </div>
                </div>

                <div className="vault-card p-6">
                  <h3 className="text-white font-bold mb-5 flex items-center gap-2">
                    <Key size={16} className="text-[#FFD700]" /> Change Password
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="text-[#888] text-xs uppercase tracking-widest block mb-2">New Password</label>
                      <input
                        type="password"
                        value={newPassword}
                        onChange={e => setNewPassword(e.target.value)}
                        placeholder="Min. 6 characters"
                        className="input-vault w-full px-4 py-3 rounded-xl"
                      />
                    </div>
                    <button
                      onClick={handleUpdateProfile}
                      disabled={profileLoading || !newPassword}
                      className="btn-gold w-full py-3 rounded-xl flex items-center justify-center gap-2"
                    >
                      {profileLoading ? <span className="spinner" /> : null}
                      Update Password
                    </button>
                  </div>
                </div>

                <button
                  onClick={async () => { await signOut(); navigate('/') }}
                  className="btn-outline-gold w-full py-3 rounded-xl text-sm"
                >
                  Sign Out
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Add Funds Modal */}
      {addFundsOpen && (
        <div className="modal-overlay" onClick={() => setAddFundsOpen(false)}>
          <div className="vault-card max-w-md w-full p-6 animate-slide-up" onClick={e => e.stopPropagation()}>
            <h2 className="text-white font-bold text-lg mb-6">Add Funds to Wallet</h2>

            {settings && (
              <div className="bg-[#0f0f0f] rounded-xl p-4 mb-5 border border-[#1e1e1e]">
                <p className="text-[#888] text-xs mb-3">Transfer to:</p>
                <div className="space-y-1.5 text-sm">
                  <div className="flex justify-between">
                    <span className="text-[#555]">Bank</span>
                    <span className="text-white">OPay</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#555]">Account No.</span>
                    <span className="text-[#FFD700] font-mono">{settings.opay_account_number}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#555]">Name</span>
                    <span className="text-white">{settings.opay_account_name}</span>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="text-[#888] text-xs uppercase tracking-widest block mb-2">Amount ($)</label>
                <input
                  type="number"
                  value={addAmount}
                  onChange={e => setAddAmount(e.target.value)}
                  placeholder="e.g. 50"
                  min="1"
                  className="input-vault w-full px-4 py-3 rounded-xl"
                />
              </div>
              <div>
                <label className="text-[#888] text-xs uppercase tracking-widest block mb-2">Payment Proof</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={e => setProofFile(e.target.files?.[0] || null)}
                  className="input-vault w-full px-3 py-2.5 rounded-xl text-sm"
                />
              </div>
              <div className="flex gap-3 mt-2">
                <button onClick={() => setAddFundsOpen(false)} className="btn-outline-gold flex-1 py-3 rounded-xl text-sm">
                  Cancel
                </button>
                <button
                  onClick={handleAddFunds}
                  disabled={addLoading || !addAmount}
                  className="btn-gold flex-1 py-3 rounded-xl flex items-center justify-center gap-2 text-sm"
                >
                  {addLoading ? <span className="spinner" /> : null}
                  Submit Request
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
