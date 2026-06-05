import { useState, useEffect, useCallback } from 'react'
import { Search, Filter } from 'lucide-react'
import { Product, getProducts } from '../lib/supabase'
import ProductCard from '../components/ProductCard'
import { useToast } from '../hooks/useToast'
import ToastContainer from '../components/ToastContainer'
import { useAuth } from '../context/AuthContext'

const CATEGORIES = ['All', 'Virtual Phone Numbers', 'Social Media Boosting', 'Digital Templates', 'Developer Tools']

export default function Products() {
  const { refreshProfile } = useAuth()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All')
  const { toasts, showToast, removeToast } = useToast()

  const load = useCallback(async () => {
    setLoading(true)
    const data = await getProducts()
    setProducts(data)
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  const filtered = products.filter(p => {
    const matchCat = category === 'All' || p.category === category
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.description.toLowerCase().includes(search.toLowerCase())
    return matchCat && matchSearch
  })

  const grouped = CATEGORIES.slice(1).reduce<Record<string, Product[]>>((acc, cat) => {
    const items = filtered.filter(p => p.category === cat)
    if (items.length) acc[cat] = items
    return acc
  }, {})

  return (
    <>
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      <div className="min-h-screen pt-24 pb-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-10 animate-slide-up">
          <h1 className="text-4xl font-black text-white mb-2">
            All <span className="text-[#FFD700]">Products</span>
          </h1>
          <p className="text-[#555]">Browse our full catalogue of premium digital goods</p>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-10 animate-slide-up">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#444]" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search products..."
              className="input-vault w-full pl-10 pr-4 py-3 rounded-xl"
            />
          </div>
          <div className="relative">
            <Filter size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#444]" />
            <select
              value={category}
              onChange={e => setCategory(e.target.value)}
              className="input-vault pl-9 pr-10 py-3 rounded-xl appearance-none cursor-pointer"
            >
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-24">
            <div className="spinner w-8 h-8" style={{ width: 32, height: 32, borderWidth: 3 }} />
          </div>
        )}

        {/* Empty */}
        {!loading && filtered.length === 0 && (
          <div className="text-center py-24">
            <p className="text-[#333] text-5xl mb-4">🔍</p>
            <p className="text-[#555] font-medium">No products found</p>
            <p className="text-[#333] text-sm mt-1">Try adjusting your search or filter</p>
          </div>
        )}

        {/* Products grouped by category */}
        {!loading && Object.entries(grouped).map(([cat, items]) => (
          <div key={cat} className="mb-14">
            <div className="flex items-center gap-3 mb-6">
              <h2 className="text-lg font-bold text-white">{cat}</h2>
              <span className="text-[#333] text-sm">({items.length})</span>
              <div className="flex-1 h-px bg-[#1a1a1a]" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {items.map(product => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onPurchaseSuccess={() => { load(); refreshProfile() }}
                  showToast={showToast}
                />
              ))}
            </div>
          </div>
        ))}

        {/* Show all if category filter active and no grouped results */}
        {!loading && category !== 'All' && filtered.length > 0 && Object.keys(grouped).length === 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filtered.map(product => (
              <ProductCard
                key={product.id}
                product={product}
                onPurchaseSuccess={() => { load(); refreshProfile() }}
                showToast={showToast}
              />
            ))}
          </div>
        )}
      </div>
    </>
  )
}
