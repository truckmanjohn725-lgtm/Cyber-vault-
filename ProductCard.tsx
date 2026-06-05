import { useState } from 'react'
import { ShoppingCart, Tag } from 'lucide-react'
import { Product } from '../lib/supabase'
import CheckoutModal from './CheckoutModal'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'

interface ProductCardProps {
  product: Product
  onPurchaseSuccess: () => void
  showToast: (msg: string, type: 'success' | 'error' | 'info') => void
}

const CATEGORY_ICONS: Record<string, string> = {
  'Virtual Phone Numbers': '📱',
  'Social Media Boosting': '📈',
  'Digital Templates': '🎨',
  'Developer Tools': '⚙️',
}

export default function ProductCard({ product, onPurchaseSuccess, showToast }: ProductCardProps) {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [checkoutOpen, setCheckoutOpen] = useState(false)

  const icon = CATEGORY_ICONS[product.category] || '📦'

  function handleBuyClick() {
    if (!user) {
      navigate('/login')
      return
    }
    setCheckoutOpen(true)
  }

  return (
    <>
      <div className="vault-card p-5 flex flex-col gap-4 group hover:border-[#FFD700]/30 transition-all duration-300">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#1a1500] border border-[#FFD700]/10 flex items-center justify-center text-xl">
              {icon}
            </div>
            <div>
              <span className="text-[10px] text-[#555] uppercase tracking-widest font-medium">{product.category}</span>
              <h3 className="text-white font-semibold text-sm leading-tight mt-0.5">{product.name}</h3>
            </div>
          </div>
        </div>

        {/* Description */}
        <p className="text-[#555] text-xs leading-relaxed flex-1">{product.description}</p>

        {/* Pricing */}
        <div className="flex items-end justify-between">
          <div>
            <div className="flex items-center gap-1.5 mb-0.5">
              <Tag size={10} className="text-[#333]" />
              <span className="text-[#333] text-xs line-through font-mono">${product.base_price.toFixed(2)}</span>
            </div>
            <div className="text-[#FFD700] text-xl font-bold font-mono">${product.selling_price.toFixed(2)}</div>
          </div>

          <button
            onClick={handleBuyClick}
            className="btn-gold flex items-center gap-2 px-4 py-2 rounded-lg text-sm"
          >
            <ShoppingCart size={14} />
            Buy Now
          </button>
        </div>
      </div>

      {checkoutOpen && (
        <CheckoutModal
          product={product}
          onClose={() => setCheckoutOpen(false)}
          onSuccess={() => {
            setCheckoutOpen(false)
            onPurchaseSuccess()
          }}
          showToast={showToast}
        />
      )}
    </>
  )
}
