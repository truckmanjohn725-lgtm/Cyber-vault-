import { Link } from 'react-router-dom'
import { ShieldCheck, Zap, Lock, HeadphonesIcon, ArrowRight, Star } from 'lucide-react'

const FEATURES = [
  { icon: Zap, title: 'Instant Delivery', desc: 'Wallet payments processed in seconds. No waiting.' },
  { icon: Lock, title: 'Secure & Encrypted', desc: 'All transactions protected with bank-level encryption.' },
  { icon: HeadphonesIcon, title: '24/7 Support', desc: 'Our team responds within minutes, day or night.' },
  { icon: ShieldCheck, title: 'Verified Products', desc: 'Every product is tested and verified before listing.' },
]

const CATEGORIES = [
  { emoji: '📱', name: 'Virtual Phone Numbers', desc: 'USA, UK, Nigeria numbers for any verification' },
  { emoji: '📈', name: 'Social Media Boosting', desc: 'Followers, likes, views — grow your presence' },
  { emoji: '🎨', name: 'Digital Templates', desc: 'Notion, Canva, Excel templates for productivity' },
  { emoji: '⚙️', name: 'Developer Tools', desc: 'Scripts, bots, and automation tools' },
]

const STATS = [
  { value: '2,400+', label: 'Happy Customers' },
  { value: '99.8%', label: 'Delivery Rate' },
  { value: '<5 min', label: 'Avg. Delivery' },
  { value: '24/7', label: 'Support' },
]

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
        {/* Watermark */}
        <div className="watermark">
          <span className="watermark-text">CYBER VAULT</span>
        </div>

        {/* Radial glow */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse 80% 60% at 50% 40%, rgba(255,215,0,0.04) 0%, transparent 70%)'
          }}
        />

        <div className="relative z-10 text-center max-w-4xl mx-auto px-4 animate-slide-up">
          <div className="inline-flex items-center gap-2 bg-[#1a1500] border border-[#FFD700]/20 rounded-full px-4 py-1.5 mb-8">
            <Star size={12} className="text-[#FFD700] fill-[#FFD700]" />
            <span className="text-[#FFD700] text-xs font-medium tracking-wide">Premium Digital Marketplace</span>
          </div>

          <h1 className="text-5xl sm:text-7xl font-black text-white mb-6 leading-none tracking-tight">
            Your <span className="text-[#FFD700]">Digital</span>
            <br />
            Goods Vault
          </h1>

          <p className="text-[#666] text-lg sm:text-xl max-w-xl mx-auto mb-10 leading-relaxed">
            Premium virtual numbers, social boosting, templates, and dev tools. 
            Instant delivery. Trusted by thousands.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/products"
              className="btn-gold px-8 py-4 rounded-xl text-base flex items-center justify-center gap-2"
            >
              Browse Products
              <ArrowRight size={18} />
            </Link>
            <Link
              to="/signup"
              className="btn-outline-gold px-8 py-4 rounded-xl text-base flex items-center justify-center"
            >
              Create Account
            </Link>
          </div>
        </div>

        {/* Bottom gradient fade */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#0a0a0a] to-transparent pointer-events-none" />
      </section>

      {/* Stats */}
      <section className="py-16 border-y border-[#161616]">
        <div className="max-w-5xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {STATS.map(stat => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl font-black text-[#FFD700] mb-1">{stat.value}</div>
                <div className="text-[#555] text-sm">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <h2 className="text-3xl sm:text-4xl font-black text-white mb-3">
            What We <span className="text-[#FFD700]">Offer</span>
          </h2>
          <p className="text-[#555] max-w-md mx-auto">Four curated categories of premium digital goods, all delivered fast.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {CATEGORIES.map(cat => (
            <Link
              key={cat.name}
              to="/products"
              className="vault-card p-6 flex flex-col gap-4 hover:border-[#FFD700]/30 hover:-translate-y-1 transition-all duration-300 group"
            >
              <div className="text-4xl">{cat.emoji}</div>
              <div>
                <h3 className="text-white font-bold mb-1 text-sm group-hover:text-[#FFD700] transition-colors">{cat.name}</h3>
                <p className="text-[#555] text-xs leading-relaxed">{cat.desc}</p>
              </div>
              <div className="flex items-center gap-1 text-[#FFD700] text-xs opacity-0 group-hover:opacity-100 transition-opacity">
                Browse <ArrowRight size={12} />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="py-24 border-t border-[#161616]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-black text-white mb-3">
              Why <span className="text-[#FFD700]">CyberVault?</span>
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {FEATURES.map(f => (
              <div key={f.title} className="vault-card p-6">
                <div className="w-10 h-10 rounded-xl bg-[#1a1500] border border-[#FFD700]/15 flex items-center justify-center mb-4">
                  <f.icon size={18} className="text-[#FFD700]" />
                </div>
                <h3 className="text-white font-bold mb-2 text-sm">{f.title}</h3>
                <p className="text-[#555] text-xs leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          className="rounded-2xl p-12 text-center relative overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, #1a1500 0%, #0f0f00 50%, #1a1500 100%)',
            border: '1px solid rgba(255,215,0,0.2)'
          }}
        >
          <div
            className="absolute inset-0 pointer-events-none"
            style={{ background: 'radial-gradient(ellipse 60% 70% at 50% 50%, rgba(255,215,0,0.05) 0%, transparent 70%)' }}
          />
          <h2 className="text-3xl sm:text-4xl font-black text-white mb-4 relative z-10">
            Ready to get started?
          </h2>
          <p className="text-[#888] mb-8 relative z-10">Create a free account and start shopping in under a minute.</p>
          <Link to="/signup" className="btn-gold px-10 py-4 rounded-xl text-base inline-flex items-center gap-2 relative z-10">
            Get Started Free <ArrowRight size={18} />
          </Link>
        </div>
      </section>
    </div>
  )
}
