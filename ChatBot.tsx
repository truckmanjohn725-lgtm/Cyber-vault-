import { useState, useRef, useEffect } from 'react'
import { MessageCircle, X, Send, Bot } from 'lucide-react'

interface Message {
  id: number
  text: string
  from: 'user' | 'bot'
  time: string
}

const RESPONSES: Array<{ keywords: string[]; reply: string }> = [
  {
    keywords: ['wallet', 'balance'],
    reply: 'You can check your balance in the top navbar! To add funds, go to Dashboard → Add Funds and follow the instructions.'
  },
  {
    keywords: ['buy', 'how to', 'purchase', 'order'],
    reply: 'To buy: 1) Browse products 2) Click "Buy Now" 3) Choose payment (Wallet/OPay/Crypto) 4) Complete payment 5) Receive your product!'
  },
  {
    keywords: ['payment', 'pay', 'method'],
    reply: 'We accept: 1) Wallet (instant) 2) OPay bank transfer 3) Cryptocurrency. Wallet payments are fastest!'
  },
  {
    keywords: ['delivery', 'time', 'how long', 'fast'],
    reply: 'Wallet payments are instant! OPay and Crypto payments take 5–30 minutes after admin confirmation.'
  },
  {
    keywords: ['products', 'sell', 'offer', 'available'],
    reply: 'We offer: 1) Virtual Phone Numbers 2) Social Media Boosting 3) Digital Templates 4) Developer Tools. Check the Products page!'
  },
  {
    keywords: ['safe', 'secure', 'legit', 'trust'],
    reply: 'CyberVault is 100% secure! We use encrypted payments and deliver quality products. Thousands of satisfied customers.'
  },
  {
    keywords: ['contact', 'support', 'help', 'email'],
    reply: 'Email us at olakunleomogbolahan3@gmail.com or chat here. We respond within minutes!'
  },
  {
    keywords: ['refund', 'cancel', 'return'],
    reply: 'If there is an issue with your order, contact us at olakunleomogbolahan3@gmail.com and we will resolve it quickly!'
  },
  {
    keywords: ['admin', 'owner'],
    reply: 'For admin inquiries, email olakunleomogbolahan3@gmail.com'
  },
  {
    keywords: ['phone', 'number', 'virtual'],
    reply: 'We offer virtual phone numbers for USA, UK, and Nigeria — perfect for app verification. Check the Products page!'
  },
  {
    keywords: ['instagram', 'followers', 'tiktok', 'youtube', 'social'],
    reply: 'Our Social Media Boosting packages include Instagram followers, TikTok likes, and YouTube views. Fast delivery guaranteed!'
  },
]

const DEFAULT_REPLY = "I'm not sure about that. Contact olakunleomogbolahan3@gmail.com or ask me about: buying, wallet, payments, products, delivery, or refunds."

function getReply(input: string): string {
  const lower = input.toLowerCase()
  for (const item of RESPONSES) {
    if (item.keywords.some(k => lower.includes(k))) {
      return item.reply
    }
  }
  return DEFAULT_REPLY
}

const STORAGE_KEY = 'cybervault_chat'

export default function ChatBot() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      return saved ? JSON.parse(saved) : [{
        id: 1,
        text: "👋 Hi! I'm the CyberVault Assistant. How can I help you today?",
        from: 'bot',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]
    } catch {
      return [{
        id: 1,
        text: "👋 Hi! I'm the CyberVault Assistant. How can I help you today?",
        from: 'bot',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]
    }
  })
  const [input, setInput] = useState('')
  const [typing, setTyping] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  let nextId = messages.length + 2

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(messages))
  }, [messages])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, typing])

  function send() {
    const text = input.trim()
    if (!text) return

    const userMsg: Message = {
      id: nextId++,
      text,
      from: 'user',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setTyping(true)

    setTimeout(() => {
      const botMsg: Message = {
        id: nextId++,
        text: getReply(text),
        from: 'bot',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
      setMessages(prev => [...prev, botMsg])
      setTyping(false)
    }, 800 + Math.random() * 600)
  }

  function clearChat() {
    const initial = [{
      id: 1,
      text: "👋 Hi! I'm the CyberVault Assistant. How can I help you today?",
      from: 'bot' as const,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }]
    setMessages(initial)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(initial))
  }

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full btn-gold flex items-center justify-center shadow-2xl animate-pulse-gold"
        aria-label="Open chat"
      >
        {open ? <X size={22} /> : <MessageCircle size={22} />}
      </button>

      {/* Chat window */}
      {open && (
        <div className="fixed bottom-24 right-6 z-50 w-80 sm:w-96 animate-slide-up">
          <div className="glass rounded-2xl overflow-hidden shadow-2xl border border-[#FFD700]/15">
            {/* Header */}
            <div className="bg-gradient-to-r from-[#1a1500] to-[#0f0f00] px-4 py-3 flex items-center justify-between border-b border-[#FFD700]/10">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#FFD700] to-[#D4AF37] flex items-center justify-center">
                  <Bot size={16} className="text-black" />
                </div>
                <div>
                  <p className="text-white text-sm font-bold">CyberVault Assistant</p>
                  <p className="text-green-400 text-xs flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-green-400 rounded-full inline-block" />
                    Online
                  </p>
                </div>
              </div>
              <button onClick={clearChat} className="text-[#444] hover:text-[#FFD700] text-xs transition-colors">
                Clear
              </button>
            </div>

            {/* Messages */}
            <div className="h-72 overflow-y-auto p-4 flex flex-col gap-3 bg-[#0d0d0d]">
              {messages.map(msg => (
                <div key={msg.id} className={`flex ${msg.from === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm leading-relaxed ${
                      msg.from === 'user'
                        ? 'bg-gradient-to-br from-[#FFD700] to-[#D4AF37] text-black font-medium rounded-br-sm'
                        : 'bg-[#1a1a1a] text-[#ccc] border border-[#222] rounded-bl-sm'
                    }`}
                  >
                    {msg.text}
                    <div className={`text-[10px] mt-1 opacity-60 ${msg.from === 'user' ? 'text-right' : ''}`}>
                      {msg.time}
                    </div>
                  </div>
                </div>
              ))}
              {typing && (
                <div className="flex justify-start">
                  <div className="bg-[#1a1a1a] border border-[#222] rounded-2xl rounded-bl-sm px-4 py-2.5">
                    <div className="flex gap-1">
                      {[0, 1, 2].map(i => (
                        <div
                          key={i}
                          className="w-1.5 h-1.5 bg-[#FFD700] rounded-full animate-bounce"
                          style={{ animationDelay: `${i * 0.15}s` }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div className="p-3 border-t border-[#1a1a1a] bg-[#0f0f0f] flex gap-2">
              <input
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && send()}
                placeholder="Ask anything..."
                className="input-vault flex-1 px-3 py-2 rounded-xl text-sm"
              />
              <button
                onClick={send}
                disabled={!input.trim()}
                className="btn-gold px-3 py-2 rounded-xl disabled:opacity-40"
              >
                <Send size={14} />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
