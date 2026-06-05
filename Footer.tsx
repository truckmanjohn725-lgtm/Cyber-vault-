import { Link } from 'react-router-dom'
import { ShieldCheck, Mail } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="border-t border-[#1a1a1a] mt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#FFD700] to-[#D4AF37] flex items-center justify-center">
                <ShieldCheck size={16} className="text-black" />
              </div>
              <span className="text-white font-bold text-lg">
                Cyber<span className="text-[#FFD700]">Vault</span>
              </span>
            </div>
            <p className="text-[#555] text-sm leading-relaxed">
              Premium digital goods marketplace. Fast delivery, secure payments, trusted products.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-4 uppercase tracking-widest">Navigation</h4>
            <ul className="space-y-2">
              {[
                { to: '/', label: 'Home' },
                { to: '/products', label: 'Products' },
                { to: '/login', label: 'Login' },
                { to: '/signup', label: 'Sign Up' },
              ].map(link => (
                <li key={link.to}>
                  <Link to={link.to} className="text-[#555] hover:text-[#FFD700] text-sm transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-4 uppercase tracking-widest">Support</h4>
            <a
              href="mailto:olakunleomogbolahan3@gmail.com"
              className="flex items-center gap-2 text-[#555] hover:text-[#FFD700] text-sm transition-colors"
            >
              <Mail size={14} />
              olakunleomogbolahan3@gmail.com
            </a>
            <p className="text-[#444] text-xs mt-4">
              Response time: within minutes
            </p>
          </div>
        </div>

        <div className="border-t border-[#151515] mt-10 pt-6 flex flex-col sm:flex-row justify-between items-center gap-3">
          <p className="text-[#333] text-xs">© 2024 CyberVault. All rights reserved.</p>
          <p className="text-[#333] text-xs">Secure · Fast · Trusted</p>
        </div>
      </div>
    </footer>
  )
}
