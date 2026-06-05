import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ShieldCheck, Menu, X, Wallet, LogOut, LayoutDashboard, ShoppingBag } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export default function Navbar() {
  const { user, profile, isAdmin, signOut } = useAuth()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)

  async function handleSignOut() {
    await signOut()
    navigate('/')
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass-dark border-b border-[#1a1a1a]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#FFD700] to-[#D4AF37] flex items-center justify-center">
              <ShieldCheck size={16} className="text-black" />
            </div>
            <span className="text-white font-bold text-lg tracking-tight group-hover:text-[#FFD700] transition-colors">
              Cyber<span className="text-[#FFD700]">Vault</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-6">
            <Link to="/products" className="text-sm text-gray-400 hover:text-white transition-colors font-medium">
              Products
            </Link>

            {user ? (
              <>
                <Link
                  to={isAdmin ? '/admin' : '/dashboard'}
                  className="text-sm text-gray-400 hover:text-white transition-colors font-medium flex items-center gap-1.5"
                >
                  <LayoutDashboard size={14} />
                  {isAdmin ? 'Admin' : 'Dashboard'}
                </Link>

                {!isAdmin && profile && (
                  <div className="flex items-center gap-1.5 bg-[#1a1500] border border-[#FFD700]/20 rounded-full px-3 py-1">
                    <Wallet size={13} className="text-[#FFD700]" />
                    <span className="text-[#FFD700] text-sm font-bold font-mono">
                      ${profile.wallet_balance.toFixed(2)}
                    </span>
                  </div>
                )}

                <button
                  onClick={handleSignOut}
                  className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-red-400 transition-colors"
                >
                  <LogOut size={14} />
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-sm text-gray-400 hover:text-white transition-colors font-medium">
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="btn-gold text-sm px-4 py-2 rounded-lg"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden text-gray-400 hover:text-white"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden glass-dark border-t border-[#1a1a1a] animate-slide-down">
          <div className="px-4 py-4 flex flex-col gap-3">
            <Link
              to="/products"
              className="flex items-center gap-2 text-gray-300 hover:text-white py-2"
              onClick={() => setMenuOpen(false)}
            >
              <ShoppingBag size={16} />
              Products
            </Link>

            {user ? (
              <>
                <Link
                  to={isAdmin ? '/admin' : '/dashboard'}
                  className="flex items-center gap-2 text-gray-300 hover:text-white py-2"
                  onClick={() => setMenuOpen(false)}
                >
                  <LayoutDashboard size={16} />
                  {isAdmin ? 'Admin Dashboard' : 'Dashboard'}
                </Link>

                {!isAdmin && profile && (
                  <div className="flex items-center gap-2 bg-[#1a1500] border border-[#FFD700]/20 rounded-lg px-3 py-2 w-fit">
                    <Wallet size={14} className="text-[#FFD700]" />
                    <span className="text-[#FFD700] font-bold font-mono">
                      ${profile.wallet_balance.toFixed(2)}
                    </span>
                  </div>
                )}

                <button
                  onClick={() => { handleSignOut(); setMenuOpen(false) }}
                  className="flex items-center gap-2 text-gray-500 hover:text-red-400 py-2 text-left"
                >
                  <LogOut size={16} />
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-gray-300 hover:text-white py-2"
                  onClick={() => setMenuOpen(false)}
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="btn-gold px-4 py-2 rounded-lg text-center w-full"
                  onClick={() => setMenuOpen(false)}
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}
