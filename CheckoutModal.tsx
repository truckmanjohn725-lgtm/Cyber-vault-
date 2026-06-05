import { useState } from 'react'
import { X, Wallet, Building2, Bitcoin, CheckCircle } from 'lucide-react'
import { Product, processWalletPurchase, createOrder, createWalletTransaction, getAdminSettings } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

interface CheckoutModalProps {
  product: Product
  onClose: () => void
  onSuccess: () => void
  showToast: (msg: string, type: 'success' | 'error' | 'info') => void
}

type PaymentMethod = 'Wallet' | 'OPay' | 'Crypto'

export default function CheckoutModal({ product, onClose, onSuccess, showToast }: CheckoutModalProps) {
  const { user, profile, refreshProfile } = useAuth()
  const [method, setMethod] = useState<PaymentMethod>('Wallet')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [orderId, setOrderId] = useState('')
  const [proofFile, setProofFile] = useState<File | null>(null)

  async function handlePurchase() {
    if (!user || !profile) return
    setLoading(true)

    try {
      if (method === 'Wallet') {
        if (profile.wallet_balance < product.selling_price) {
          showToast('Insufficient wallet balance. Please add funds.', 'error')
          setLoading(false)
          return
        }
        const { data, error } = await processWalletPurchase(
          user.id,
          user.email!,
          product.selling_price,
          product.name,
          product.category
        )
        if (error) throw new Error(error.message)
        setOrderId(data?.id || 'N/A')
        await refreshProfile()
      } else {
        // OPay or Crypto — create pending order
        const settings = await getAdminSettings()
        const { data, error } = await createOrder({
          user_id: user.id,
          customer_email: user.email!,
          product_name: product.name,
          category: product.category,
          amount: product.selling_price,
          payment_method: method,
          payment_proof_url: proofFile ? `proof_${Date.now()}.jpg` : undefined,
          status: 'Pending'
        })
        if (error) throw new Error(error.message)

        // Create pending wallet transaction record
        await createWalletTransaction({
          user_id: user.id,
          amount: product.selling_price,
          type: 'Purchase',
          description: `Pending: ${product.name} via ${method}`,
          status: 'Pending'
        })

        setOrderId(data?.id || 'N/A')
        void settings // suppress unused warning
      }

      setSuccess(true)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Purchase failed'
      showToast(msg, 'error')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="modal-overlay" onClick={onClose}>
        <div
          className="vault-card max-w-md w-full p-8 text-center animate-slide-up"
          onClick={e => e.stopPropagation()}
        >
          <div className="w-16 h-16 rounded-full bg-green-500/10 border border-green-500/30 flex items-center justify-center mx-auto mb-4">
            <CheckCircle size={32} className="text-green-400" />
          </div>
          <h2 className="text-white text-xl font-bold mb-2">Order Placed!</h2>
          <p className="text-[#666] text-sm mb-4">
            {method === 'Wallet'
              ? 'Your order has been approved and is being processed.'
              : 'Your order is pending. Admin will confirm your payment shortly.'}
          </p>
          <div className="bg-[#0f0f0f] rounded-lg p-3 mb-6 border border-[#222]">
            <p className="text-[#555] text-xs mb-1">Order ID</p>
            <p className="text-[#FFD700] font-mono text-xs break-all">{orderId}</p>
          </div>
          <button onClick={onSuccess} className="btn-gold w-full py-3 rounded-lg">
            View My Orders
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="vault-card max-w-md w-full p-6 animate-slide-up max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-white font-bold text-lg">Checkout</h2>
          <button onClick={onClose} className="text-[#555] hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Product summary */}
        <div className="bg-[#0f0f0f] rounded-xl p-4 mb-6 border border-[#1e1e1e]">
          <p className="text-[#555] text-xs mb-1">{product.category}</p>
          <p className="text-white font-semibold mb-3">{product.name}</p>
          <div className="flex justify-between items-center">
            <span className="text-[#555] text-sm">Total</span>
            <span className="text-[#FFD700] font-bold text-xl font-mono">${product.selling_price.toFixed(2)}</span>
          </div>
        </div>

        {/* Payment method */}
        <div className="mb-6">
          <p className="text-[#888] text-xs uppercase tracking-widest mb-3">Payment Method</p>
          <div className="grid grid-cols-3 gap-2">
            {(['Wallet', 'OPay', 'Crypto'] as PaymentMethod[]).map(m => (
              <button
                key={m}
                onClick={() => setMethod(m)}
                className={`p-3 rounded-xl border text-sm font-medium flex flex-col items-center gap-1.5 transition-all ${
                  method === m
                    ? 'border-[#FFD700] bg-[#1a1500] text-[#FFD700]'
                    : 'border-[#222] text-[#555] hover:border-[#333] hover:text-[#888]'
                }`}
              >
                {m === 'Wallet' && <Wallet size={16} />}
                {m === 'OPay' && <Building2 size={16} />}
                {m === 'Crypto' && <Bitcoin size={16} />}
                {m}
              </button>
            ))}
          </div>
        </div>

        {/* Method-specific UI */}
        {method === 'Wallet' && profile && (
          <div className="bg-[#0f0f0f] rounded-xl p-4 mb-6 border border-[#1e1e1e]">
            <div className="flex justify-between items-center mb-2">
              <span className="text-[#555] text-sm">Your balance</span>
              <span className={`font-mono font-bold ${profile.wallet_balance >= product.selling_price ? 'text-green-400' : 'text-red-400'}`}>
                ${profile.wallet_balance.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[#555] text-sm">After purchase</span>
              <span className="font-mono text-[#888]">
                ${Math.max(0, profile.wallet_balance - product.selling_price).toFixed(2)}
              </span>
            </div>
            {profile.wallet_balance < product.selling_price && (
              <p className="text-red-400 text-xs mt-3">⚠ Insufficient balance. Please add funds to your wallet first.</p>
            )}
          </div>
        )}

        {method === 'OPay' && (
          <div className="bg-[#0f0f0f] rounded-xl p-4 mb-6 border border-[#1e1e1e]">
            <p className="text-[#888] text-xs mb-3">Transfer to this account:</p>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-[#555] text-sm">Bank</span>
                <span className="text-white text-sm font-medium">OPay</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#555] text-sm">Account No.</span>
                <span className="text-[#FFD700] font-mono text-sm">8123456789</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#555] text-sm">Account Name</span>
                <span className="text-white text-sm">Cyber Vault Admin</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#555] text-sm">Amount</span>
                <span className="text-[#FFD700] font-mono font-bold">${product.selling_price.toFixed(2)}</span>
              </div>
            </div>
            <div className="mt-4">
              <label className="text-[#888] text-xs block mb-2">Upload Payment Proof</label>
              <input
                type="file"
                accept="image/*"
                onChange={e => setProofFile(e.target.files?.[0] || null)}
                className="input-vault w-full text-xs px-3 py-2 rounded-lg"
              />
            </div>
          </div>
        )}

        {method === 'Crypto' && (
          <div className="bg-[#0f0f0f] rounded-xl p-4 mb-6 border border-[#1e1e1e]">
            <p className="text-[#888] text-xs mb-3">Send to any of these addresses:</p>
            <div className="space-y-3">
              <div>
                <span className="text-[#555] text-xs">BTC</span>
                <p className="text-white font-mono text-xs break-all mt-0.5">bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh</p>
              </div>
              <div>
                <span className="text-[#555] text-xs">USDT (TRC20)</span>
                <p className="text-white font-mono text-xs break-all mt-0.5">TRx4gBVoqNJv83VKB7YGe2vJSXWUBQtX1</p>
              </div>
            </div>
            <div className="mt-4">
              <label className="text-[#888] text-xs block mb-2">Upload Payment Proof</label>
              <input
                type="file"
                accept="image/*"
                onChange={e => setProofFile(e.target.files?.[0] || null)}
                className="input-vault w-full text-xs px-3 py-2 rounded-lg"
              />
            </div>
          </div>
        )}

        <button
          onClick={handlePurchase}
          disabled={loading || (method === 'Wallet' && (profile?.wallet_balance || 0) < product.selling_price)}
          className="btn-gold w-full py-3 rounded-xl flex items-center justify-center gap-2"
        >
          {loading ? <span className="spinner" /> : null}
          {loading ? 'Processing...' : `Confirm Purchase · $${product.selling_price.toFixed(2)}`}
        </button>
      </div>
    </div>
  )
}
