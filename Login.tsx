import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ShieldCheck, Eye, EyeOff } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const ADMIN_EMAIL = 'olakunleomogbolahan3@gmail.com'

export default function Login() {
  const { signIn } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const { error } = await signIn(email, password)
    setLoading(false)
    if (error) {
      setError(error.message || 'Invalid credentials. Please try again.')
      return
    }
    navigate(email === ADMIN_EMAIL ? '/admin' : '/dashboard')
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-24">
      <div className="w-full max-w-md animate-slide-up">
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-[#FFD700] to-[#D4AF37] mb-4">
            <ShieldCheck size={26} className="text-black" />
          </div>
          <h1 className="text-2xl font-black text-white">Welcome back</h1>
          <p className="text-[#555] text-sm mt-1">Sign in to your CyberVault account</p>
        </div>

        <div className="vault-card p-8">
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div>
              <label className="text-[#888] text-xs uppercase tracking-widest block mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                placeholder="you@example.com"
                className="input-vault w-full px-4 py-3 rounded-xl"
              />
            </div>

            <div>
              <label className="text-[#888] text-xs uppercase tracking-widest block mb-2">Password</label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="input-vault w-full px-4 py-3 rounded-xl pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#444] hover:text-[#888]"
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-gold w-full py-3.5 rounded-xl flex items-center justify-center gap-2 mt-1"
            >
              {loading ? <span className="spinner" /> : null}
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <p className="text-center text-[#555] text-sm mt-6">
            Don't have an account?{' '}
            <Link to="/signup" className="text-[#FFD700] hover:text-[#ffe033] font-medium">
              Sign Up
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
