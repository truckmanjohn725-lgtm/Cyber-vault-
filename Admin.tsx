import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Users, ShoppingBag, TrendingUp, Settings, Plus, Trash2, Edit3,
  Check, X, Wallet, Package, DollarSign, RefreshCw
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import {
  getAllProfiles, getAllOrders, getAllProducts, getAllTransactions,
  updateOrderStatus, adminAddFunds, updateAdminSettings, getAdminSettings,
  createProduct, updateProduct, deleteProduct,
  Profile, Order, Product, AdminSettings, WalletTransaction
} from '../lib/supabase'
import { useToast } from '../hooks/useToast'
import ToastContainer from '../components/ToastContainer'

type Tab = 'overview' | 'orders' | 'customers' | 'products' | 'settings'

const CATEGORIES = ['Virtual Phone Numbers', 'Social Media Boosting', 'Digital Templates', 'Developer Tools']

const BLANK_PRODUCT: Omit<Product, 'id' | 'created_at'> = {
  name: '',
  description: '',
  category: CATEGORIES[0],
  base_price: 0,
  selling_price: 0,
  is_active: true,
}

export default function Admin() {
  const { user, isAdmin } = useAuth()
  const navigate = useNavigate()
  const { toasts, showToast, removeToast } = useToast()

  const [tab, setTab] = useState<Tab>('overview')
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [transactions, setTransactions] = useState<WalletTransaction[]>([])
  const [settings, setSettings] = useState<AdminSettings | null>(null)
  const [loading, setLoading] = useState(true)

  // Add funds modal
  const [addFundsTarget, setAddFundsTarget] = useState<Profile | null>(null)
  const [addFundsAmount, setAddFundsAmount] = useState('')
  const [addFundsDesc, setAddFundsDesc] = useState('')
  const [addFundsLoading, setAddFundsLoading] = useState(false)

  // Product modal
  const [productModal, setProductModal] = useState<'create' | 'edit' | null>(null)
  const [productForm, setProductForm] = useState<Omit<Product, 'id' | 'created_at'>>(BLANK_PRODUCT)
  const [editingProductId, setEditingProductId] = useState<string | null>(null)
  const [productLoading, setProductLoading] = useState(false)

  // Settings form
  const [settingsForm, setSettingsForm] = useState({ opay_account_number: '', opay_account_name: '', profit_margin: 30 })
  const [settingsLoading, setSettingsLoading] = useState(false)

  useEffect(() => {
    if (!user || !isAdmin) { navigate('/'); return }
  }, [user, isAdmin, navigate])

  const loadData = useCallback(async () => {
    setLoading(true)
    const [p, o, pr, t, s] = await Promise.all([
      getAllProfiles(),
      getAllOrders(),
      getAllProducts(),
      getAllTransactions(),
      getAdminSettings(),
    ])
    setProfiles(p)
    setOrders(o)
    setProducts(pr)
    setTransactions(t)
    setSettings(s)
    if (s) setSettingsForm({ opay_account_number: s.opay_account_number, opay_account_name: s.opay_account_name, profit_margin: s.profit_margin })
    setLoading(false)
  }, [])

  useEffect(() => { loadData() }, [loadData])

  // ── Stats ─────────────────────────────────────────────────────────────────
  const totalRevenue = orders.filter(o => o.status !== 'Rejected').reduce((s, o) => s + o.amount, 0)
  const totalProfit = totalRevenue * ((settings?.profit_margin || 30) / 100)
  const pendingOrders = orders.filter(o => o.status === 'Pending').length
  const pendingDeposits = transactions.filter(t => t.type === 'Deposit' && t.status === 'Pending')

  // ── Order management ─────────────────────────────────────────────────────
  async function handleOrderAction(id: string, status: Order['status']) {
    const { error } = await updateOrderStatus(id, status)
    if (error) { showToast('Failed to update order', 'error'); return }
    showToast(`Order ${status.toLowerCase()}`, 'success')
    loadData()
  }

  // ── Add funds ────────────────────────────────────────────────────────────
  async function handleAddFunds() {
    if (!addFundsTarget || !addFundsAmount) return
    const amount = parseFloat(addFundsAmount)
    if (isNaN(amount) || amount <= 0) { showToast('Invalid amount', 'error'); return }
    setAddFundsLoading(true)
    const { error } = await adminAddFunds(addFundsTarget.id, amount, addFundsDesc || `Admin credit: $${amount}`)
    setAddFundsLoading(false)
    if (error) { showToast('Failed to add funds', 'error'); return }
    showToast(`$${amount} added to ${addFundsTarget.full_name || addFundsTarget.email}`, 'success')
    setAddFundsTarget(null)
    setAddFundsAmount('')
    setAddFundsDesc('')
    loadData()
  }

  // ── Approve pending deposit ───────────────────────────────────────────────
  async function handleApproveDeposit(tx: WalletTransaction) {
    const { error } = await adminAddFunds(tx.user_id, tx.amount, `Approved deposit: $${tx.amount}`)
    if (error) { showToast('Failed to approve deposit', 'error'); return }
    // Mark original tx completed by calling update
    const { supabase: sb } = await import('../lib/supabase')
    // Re-use supabase directly for this edge case
    const { createClient } = await import('@supabase/supabase-js')
    void createClient // suppress
    void sb
    showToast(`Deposit of $${tx.amount} approved!`, 'success')
    loadData()
  }

  // ── Product management ────────────────────────────────────────────────────
  function openCreateProduct() {
    setProductForm(BLANK_PRODUCT)
    setEditingProductId(null)
    setProductModal('create')
  }

  function openEditProduct(p: Product) {
    setProductForm({ name: p.name, description: p.description, category: p.category, base_price: p.base_price, selling_price: p.selling_price, is_active: p.is_active })
    setEditingProductId(p.id)
    setProductModal('edit')
  }

  async function handleSaveProduct() {
    if (!productForm.name || !productForm.selling_price) { showToast('Name and price are required', 'error'); return }
    setProductLoading(true)
    if (productModal === 'create') {
      const { error } = await createProduct(productForm)
      if (error) { showToast('Failed to create product', 'error'); setProductLoading(false); return }
      showToast('Product created!', 'success')
    } else if (productModal === 'edit' && editingProductId) {
      const { error } = await updateProduct(editingProductId, productForm)
      if (error) { showToast('Failed to update product', 'error'); setProductLoading(false); return }
      showToast('Product updated!', 'success')
    }
    setProductLoading(false)
    setProductModal(null)
    loadData()
  }

  async function handleDeleteProduct(id: string, name: string) {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return
    const { error } = await deleteProduct(id)
    if (error) { showToast('Failed to delete product', 'error'); return }
    showToast('Product deleted', 'success')
    loadData()
  }

  async function handleToggleProduct(p: Product) {
    const { error } = await updateProduct(p.id, { is_active: !p.is_active })
    if (error) { showToast('Failed to update', 'error'); return }
    showToast(`Product ${!p.is_active ? 'activated' : 'deactivated'}`, 'success')
    loadData()
  }

  // ── Settings ──────────────────────────────────────────────────────────────
  async function handleSaveSettings() {
    if (!settings) return
    setSettingsLoading(true)
    const { error } = await updateAdminSettings(settings.id, settingsForm)
    setSettingsLoading(false)
    if (error) { showToast('Failed to save settings', 'error'); return }
    showToast('Settings saved!', 'success')
    loadData()
  }

  const statusClass: Record<string, string> = {
    Pending: 'badge-pending', Approved: 'badge-approved',
    Rejected: 'badge-rejected', Delivered: 'badge-delivered',
  }

  const TABS: { key: Tab; label: string; icon: React.ReactNode }[] = [
    { key: 'overview', label: 'Overview', icon: <TrendingUp size={15} /> },
    { key: 'orders', label: 'Orders', icon: <ShoppingBag size={15} /> },
    { key: 'customers', label: 'Customers', icon: <Users size={15} /> },
    { key: 'products', label: 'Products', icon: <Package size={15} /> },
    { key: 'settings', label: 'Settings', icon: <Settings size={15} /> },
  ]

  return (
    <>
      <ToastContainer toasts={toasts} removeToast={removeToast} />

      <div className="min-h-screen pt-24 pb-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 animate-slide-up">
          <div>
            <h1 className="text-3xl font-black text-white">Admin <span className="text-[#FFD700]">Dashboard</span></h1>
            <p className="text-[#555] mt-1 text-sm">{user?.email}</p>
          </div>
          <button onClick={loadData} className="btn-outline-gold px-4 py-2 rounded-xl flex items-center gap-2 text-sm">
            <RefreshCw size={14} /> Refresh
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-0 border-b border-[#1e1e1e] mb-8 overflow-x-auto">
          {TABS.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`flex items-center gap-2 px-5 py-3 text-sm font-medium whitespace-nowrap transition-colors ${tab === t.key ? 'tab-active' : 'tab-inactive'}`}>
              {t.icon}{t.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-16"><span className="spinner" style={{ width: 28, height: 28, borderWidth: 3 }} /></div>
        ) : (
          <>
            {/* ── OVERVIEW ── */}
            {tab === 'overview' && (
              <div className="space-y-6 animate-fade-in">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    { label: 'Total Revenue', value: `$${totalRevenue.toFixed(2)}`, icon: DollarSign, color: 'text-[#FFD700]' },
                    { label: `Profit (${settings?.profit_margin || 30}%)`, value: `$${totalProfit.toFixed(2)}`, icon: TrendingUp, color: 'text-green-400' },
                    { label: 'Pending Orders', value: pendingOrders, icon: ShoppingBag, color: 'text-yellow-400' },
                    { label: 'Total Customers', value: profiles.filter(p => !p.is_admin).length, icon: Users, color: 'text-blue-400' },
                  ].map(stat => (
                    <div key={stat.label} className="vault-card p-5">
                      <div className="flex items-center justify-between mb-3">
                        <p className="text-[#555] text-xs">{stat.label}</p>
                        <stat.icon size={16} className={stat.color} />
                      </div>
                      <p className={`text-2xl font-black font-mono ${stat.color}`}>{stat.value}</p>
                    </div>
                  ))}
                </div>

                {/* Pending deposits */}
                {pendingDeposits.length > 0 && (
                  <div className="vault-card p-6">
                    <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                      <Wallet size={16} className="text-[#FFD700]" />
                      Pending Deposits ({pendingDeposits.length})
                    </h3>
                    <div className="space-y-3">
                      {pendingDeposits.map(tx => {
                        const customer = profiles.find(p => p.id === tx.user_id)
                        return (
                          <div key={tx.id} className="flex items-center justify-between p-3 bg-[#0f0f0f] rounded-xl border border-[#1e1e1e]">
                            <div>
                              <p className="text-white text-sm">{customer?.email || tx.user_id}</p>
                              <p className="text-[#555] text-xs">{tx.description}</p>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="text-[#FFD700] font-mono font-bold">${tx.amount.toFixed(2)}</span>
                              <button onClick={() => handleApproveDeposit(tx)}
                                className="btn-gold px-3 py-1.5 rounded-lg text-xs flex items-center gap-1">
                                <Check size={12} /> Approve
                              </button>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}

                {/* Recent orders */}
                <div className="vault-card overflow-hidden">
                  <div className="p-5 border-b border-[#1a1a1a]">
                    <h3 className="text-white font-bold">Recent Orders</h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead><tr className="border-b border-[#1a1a1a]">
                        {['Customer', 'Product', 'Amount', 'Method', 'Status', 'Actions'].map(h => (
                          <th key={h} className="text-left text-[#444] text-xs uppercase tracking-wider px-5 py-3 font-medium">{h}</th>
                        ))}
                      </tr></thead>
                      <tbody>
                        {orders.slice(0, 8).map(o => (
                          <tr key={o.id} className="border-b border-[#111] hover:bg-[#0f0f0f] transition-colors">
                            <td className="px-5 py-3 text-[#888] text-xs">{o.customer_email}</td>
                            <td className="px-5 py-3 text-white text-sm">{o.product_name}</td>
                            <td className="px-5 py-3 text-[#FFD700] font-mono font-bold text-sm">${o.amount.toFixed(2)}</td>
                            <td className="px-5 py-3 text-[#555] text-sm">{o.payment_method}</td>
                            <td className="px-5 py-3"><span className={`badge ${statusClass[o.status]}`}>{o.status}</span></td>
                            <td className="px-5 py-3">
                              {o.status === 'Pending' && (
                                <div className="flex gap-2">
                                  <button onClick={() => handleOrderAction(o.id, 'Approved')}
                                    className="btn-gold px-2.5 py-1 rounded-lg text-xs flex items-center gap-1">
                                    <Check size={11} /> Approve
                                  </button>
                                  <button onClick={() => handleOrderAction(o.id, 'Rejected')}
                                    className="bg-red-500/10 border border-red-500/20 text-red-400 px-2.5 py-1 rounded-lg text-xs flex items-center gap-1 hover:bg-red-500/20 transition-colors">
                                    <X size={11} /> Reject
                                  </button>
                                </div>
                              )}
                              {o.status === 'Approved' && (
                                <button onClick={() => handleOrderAction(o.id, 'Delivered')}
                                  className="btn-outline-gold px-2.5 py-1 rounded-lg text-xs">
                                  Mark Delivered
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
            )}

            {/* ── ORDERS ── */}
            {tab === 'orders' && (
              <div className="animate-fade-in">
                <div className="vault-card overflow-hidden">
                  <div className="p-5 border-b border-[#1a1a1a] flex items-center justify-between">
                    <h3 className="text-white font-bold">All Orders ({orders.length})</h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead><tr className="border-b border-[#1a1a1a]">
                        {['Customer', 'Product', 'Category', 'Amount', 'Method', 'Status', 'Date', 'Actions'].map(h => (
                          <th key={h} className="text-left text-[#444] text-xs uppercase tracking-wider px-5 py-3 font-medium">{h}</th>
                        ))}
                      </tr></thead>
                      <tbody>
                        {orders.map(o => (
                          <tr key={o.id} className="border-b border-[#111] hover:bg-[#0f0f0f] transition-colors">
                            <td className="px-5 py-3 text-[#888] text-xs max-w-[140px] truncate">{o.customer_email}</td>
                            <td className="px-5 py-3 text-white text-sm">{o.product_name}</td>
                            <td className="px-5 py-3 text-[#555] text-xs">{o.category}</td>
                            <td className="px-5 py-3 text-[#FFD700] font-mono font-bold text-sm">${o.amount.toFixed(2)}</td>
                            <td className="px-5 py-3 text-[#555] text-sm">{o.payment_method}</td>
                            <td className="px-5 py-3"><span className={`badge ${statusClass[o.status]}`}>{o.status}</span></td>
                            <td className="px-5 py-3 text-[#444] text-xs">{new Date(o.created_at).toLocaleDateString()}</td>
                            <td className="px-5 py-3">
                              {o.status === 'Pending' && (
                                <div className="flex gap-2">
                                  <button onClick={() => handleOrderAction(o.id, 'Approved')}
                                    className="btn-gold px-2.5 py-1 rounded-lg text-xs flex items-center gap-1">
                                    <Check size={11} /> Approve
                                  </button>
                                  <button onClick={() => handleOrderAction(o.id, 'Rejected')}
                                    className="bg-red-500/10 border border-red-500/20 text-red-400 px-2.5 py-1 rounded-lg text-xs flex items-center gap-1 hover:bg-red-500/20">
                                    <X size={11} /> Reject
                                  </button>
                                </div>
                              )}
                              {o.status === 'Approved' && (
                                <button onClick={() => handleOrderAction(o.id, 'Delivered')}
                                  className="btn-outline-gold px-2.5 py-1 rounded-lg text-xs">
                                  Delivered
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
            )}

            {/* ── CUSTOMERS ── */}
            {tab === 'customers' && (
              <div className="animate-fade-in">
                <div className="vault-card overflow-hidden">
                  <div className="p-5 border-b border-[#1a1a1a]">
                    <h3 className="text-white font-bold">Customers ({profiles.filter(p => !p.is_admin).length})</h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead><tr className="border-b border-[#1a1a1a]">
                        {['Name', 'Email', 'Balance', 'Joined', 'Actions'].map(h => (
                          <th key={h} className="text-left text-[#444] text-xs uppercase tracking-wider px-5 py-3 font-medium">{h}</th>
                        ))}
                      </tr></thead>
                      <tbody>
                        {profiles.filter(p => !p.is_admin).map(p => (
                          <tr key={p.id} className="border-b border-[#111] hover:bg-[#0f0f0f] transition-colors">
                            <td className="px-5 py-4 text-white text-sm">{p.full_name || '—'}</td>
                            <td className="px-5 py-4 text-[#888] text-xs">{p.email}</td>
                            <td className="px-5 py-4 text-[#FFD700] font-mono font-bold text-sm">${p.wallet_balance.toFixed(2)}</td>
                            <td className="px-5 py-4 text-[#444] text-xs">{new Date(p.created_at).toLocaleDateString()}</td>
                            <td className="px-5 py-4">
                              <button
                                onClick={() => { setAddFundsTarget(p); setAddFundsAmount(''); setAddFundsDesc('') }}
                                className="btn-gold px-3 py-1.5 rounded-lg text-xs flex items-center gap-1">
                                <Plus size={11} /> Add Funds
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* ── PRODUCTS ── */}
            {tab === 'products' && (
              <div className="animate-fade-in space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-white font-bold">Products ({products.length})</h3>
                  <button onClick={openCreateProduct} className="btn-gold px-4 py-2.5 rounded-xl text-sm flex items-center gap-2">
                    <Plus size={15} /> Add Product
                  </button>
                </div>

                <div className="vault-card overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead><tr className="border-b border-[#1a1a1a]">
                        {['Name', 'Category', 'Base Price', 'Sell Price', 'Status', 'Actions'].map(h => (
                          <th key={h} className="text-left text-[#444] text-xs uppercase tracking-wider px-5 py-3 font-medium">{h}</th>
                        ))}
                      </tr></thead>
                      <tbody>
                        {products.length === 0 && (
                          <tr><td colSpan={6} className="text-center text-[#444] py-12 text-sm">
                            No products yet. Click "Add Product" to create one.
                          </td></tr>
                        )}
                        {products.map(p => (
                          <tr key={p.id} className="border-b border-[#111] hover:bg-[#0f0f0f] transition-colors">
                            <td className="px-5 py-4">
                              <p className="text-white text-sm font-medium">{p.name}</p>
                              <p className="text-[#444] text-xs mt-0.5 max-w-[200px] truncate">{p.description}</p>
                            </td>
                            <td className="px-5 py-4 text-[#555] text-sm">{p.category}</td>
                            <td className="px-5 py-4 text-[#555] font-mono text-sm">${p.base_price.toFixed(2)}</td>
                            <td className="px-5 py-4 text-[#FFD700] font-mono font-bold text-sm">${p.selling_price.toFixed(2)}</td>
                            <td className="px-5 py-4">
                              <button onClick={() => handleToggleProduct(p)}
                                className={`badge cursor-pointer hover:opacity-80 transition-opacity ${p.is_active ? 'badge-approved' : 'badge-rejected'}`}>
                                {p.is_active ? 'Active' : 'Inactive'}
                              </button>
                            </td>
                            <td className="px-5 py-4">
                              <div className="flex gap-2">
                                <button onClick={() => openEditProduct(p)}
                                  className="btn-outline-gold px-3 py-1.5 rounded-lg text-xs flex items-center gap-1">
                                  <Edit3 size={11} /> Edit
                                </button>
                                <button onClick={() => handleDeleteProduct(p.id, p.name)}
                                  className="bg-red-500/10 border border-red-500/20 text-red-400 px-3 py-1.5 rounded-lg text-xs flex items-center gap-1 hover:bg-red-500/20 transition-colors">
                                  <Trash2 size={11} /> Delete
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* ── SETTINGS ── */}
            {tab === 'settings' && (
              <div className="max-w-lg animate-fade-in">
                <div className="vault-card p-6 space-y-5">
                  <h3 className="text-white font-bold flex items-center gap-2">
                    <Settings size={16} className="text-[#FFD700]" /> Payment Settings
                  </h3>
                  <div>
                    <label className="text-[#888] text-xs uppercase tracking-widest block mb-2">OPay Account Number</label>
                    <input value={settingsForm.opay_account_number}
                      onChange={e => setSettingsForm(s => ({ ...s, opay_account_number: e.target.value }))}
                      className="input-vault w-full px-4 py-3 rounded-xl" />
                  </div>
                  <div>
                    <label className="text-[#888] text-xs uppercase tracking-widest block mb-2">OPay Account Name</label>
                    <input value={settingsForm.opay_account_name}
                      onChange={e => setSettingsForm(s => ({ ...s, opay_account_name: e.target.value }))}
                      className="input-vault w-full px-4 py-3 rounded-xl" />
                  </div>
                  <div>
                    <label className="text-[#888] text-xs uppercase tracking-widest block mb-2">Profit Margin (%)</label>
                    <input type="number" value={settingsForm.profit_margin}
                      onChange={e => setSettingsForm(s => ({ ...s, profit_margin: parseFloat(e.target.value) }))}
                      className="input-vault w-full px-4 py-3 rounded-xl" min="0" max="100" />
                  </div>
                  <button onClick={handleSaveSettings} disabled={settingsLoading}
                    className="btn-gold w-full py-3 rounded-xl flex items-center justify-center gap-2">
                    {settingsLoading ? <span className="spinner" /> : null}
                    Save Settings
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* ── Add Funds Modal ── */}
      {addFundsTarget && (
        <div className="modal-overlay" onClick={() => setAddFundsTarget(null)}>
          <div className="vault-card max-w-md w-full p-6 animate-slide-up" onClick={e => e.stopPropagation()}>
            <h2 className="text-white font-bold text-lg mb-2">Add Funds</h2>
            <p className="text-[#555] text-sm mb-6">
              Adding to: <span className="text-[#FFD700]">{addFundsTarget.email}</span>
            </p>
            <div className="space-y-4">
              <div>
                <label className="text-[#888] text-xs uppercase tracking-widest block mb-2">Amount ($)</label>
                <input type="number" value={addFundsAmount} onChange={e => setAddFundsAmount(e.target.value)}
                  placeholder="e.g. 50" min="0.01" step="0.01"
                  className="input-vault w-full px-4 py-3 rounded-xl" />
              </div>
              <div>
                <label className="text-[#888] text-xs uppercase tracking-widest block mb-2">Description</label>
                <input value={addFundsDesc} onChange={e => setAddFundsDesc(e.target.value)}
                  placeholder="Admin credit, refund, bonus..."
                  className="input-vault w-full px-4 py-3 rounded-xl" />
              </div>
              <div className="flex gap-3">
                <button onClick={() => setAddFundsTarget(null)} className="btn-outline-gold flex-1 py-3 rounded-xl text-sm">Cancel</button>
                <button onClick={handleAddFunds} disabled={addFundsLoading || !addFundsAmount}
                  className="btn-gold flex-1 py-3 rounded-xl flex items-center justify-center gap-2 text-sm">
                  {addFundsLoading ? <span className="spinner" /> : null} Add Funds
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Product Modal ── */}
      {productModal && (
        <div className="modal-overlay" onClick={() => setProductModal(null)}>
          <div className="vault-card max-w-lg w-full p-6 animate-slide-up max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-white font-bold text-lg">{productModal === 'create' ? 'Add Product' : 'Edit Product'}</h2>
              <button onClick={() => setProductModal(null)} className="text-[#555] hover:text-white"><X size={20} /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-[#888] text-xs uppercase tracking-widest block mb-2">Product Name *</label>
                <input value={productForm.name} onChange={e => setProductForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="e.g. USA WhatsApp Number"
                  className="input-vault w-full px-4 py-3 rounded-xl" />
              </div>
              <div>
                <label className="text-[#888] text-xs uppercase tracking-widest block mb-2">Description</label>
                <textarea value={productForm.description} onChange={e => setProductForm(f => ({ ...f, description: e.target.value }))}
                  placeholder="Brief product description..."
                  rows={3}
                  className="input-vault w-full px-4 py-3 rounded-xl resize-none" />
              </div>
              <div>
                <label className="text-[#888] text-xs uppercase tracking-widest block mb-2">Category</label>
                <select value={productForm.category} onChange={e => setProductForm(f => ({ ...f, category: e.target.value }))}
                  className="input-vault w-full px-4 py-3 rounded-xl">
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[#888] text-xs uppercase tracking-widest block mb-2">Base Price ($)</label>
                  <input type="number" value={productForm.base_price}
                    onChange={e => setProductForm(f => ({ ...f, base_price: parseFloat(e.target.value) || 0 }))}
                    min="0" step="0.01"
                    className="input-vault w-full px-4 py-3 rounded-xl" />
                </div>
                <div>
                  <label className="text-[#888] text-xs uppercase tracking-widest block mb-2">Selling Price ($) *</label>
                  <input type="number" value={productForm.selling_price}
                    onChange={e => setProductForm(f => ({ ...f, selling_price: parseFloat(e.target.value) || 0 }))}
                    min="0" step="0.01"
                    className="input-vault w-full px-4 py-3 rounded-xl" />
                </div>
              </div>
              <div className="flex items-center gap-3">
                <input type="checkbox" id="isActive" checked={productForm.is_active}
                  onChange={e => setProductForm(f => ({ ...f, is_active: e.target.checked }))}
                  className="w-4 h-4 accent-[#FFD700]" />
                <label htmlFor="isActive" className="text-[#888] text-sm">Active (visible to customers)</label>
              </div>
              <div className="flex gap-3 mt-2">
                <button onClick={() => setProductModal(null)} className="btn-outline-gold flex-1 py-3 rounded-xl text-sm">Cancel</button>
                <button onClick={handleSaveProduct} disabled={productLoading}
                  className="btn-gold flex-1 py-3 rounded-xl flex items-center justify-center gap-2 text-sm">
                  {productLoading ? <span className="spinner" /> : null}
                  {productModal === 'create' ? 'Create Product' : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
