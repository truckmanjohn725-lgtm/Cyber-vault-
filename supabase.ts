import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://jnygjngzwochodogmlsbt.supabase.co'
const supabaseKey = 'sb_publishable_cPoXhxgZ7kAM6Ds0wASn1Q_4V-pdD_6'

export const supabase = createClient(supabaseUrl, supabaseKey)

// ── Types ────────────────────────────────────────────────────────────────────

export interface Profile {
  id: string
  email: string
  full_name: string
  wallet_balance: number
  is_admin: boolean
  created_at: string
}

export interface Order {
  id: string
  user_id: string
  customer_email: string
  product_name: string
  category: string
  amount: number
  payment_method: 'Wallet' | 'OPay' | 'Crypto'
  payment_proof_url?: string
  status: 'Pending' | 'Approved' | 'Rejected' | 'Delivered'
  created_at: string
}

export interface WalletTransaction {
  id: string
  user_id: string
  amount: number
  type: 'Deposit' | 'Purchase' | 'Refund'
  description: string
  status: 'Pending' | 'Completed'
  created_at: string
}

export interface AdminSettings {
  id: string
  opay_account_number: string
  opay_account_name: string
  profit_margin: number
  updated_at: string
}

export interface Product {
  id: string
  name: string
  description: string
  category: string
  base_price: number
  selling_price: number
  is_active: boolean
  created_at: string
}

// ── Profile helpers ───────────────────────────────────────────────────────────

export async function getProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()
  if (error) return null
  return data
}

export async function updateProfile(userId: string, updates: Partial<Profile>) {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single()
  return { data, error }
}

export async function getAllProfiles(): Promise<Profile[]> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) return []
  return data || []
}

// ── Order helpers ─────────────────────────────────────────────────────────────

export async function createOrder(order: Omit<Order, 'id' | 'created_at'>) {
  const { data, error } = await supabase
    .from('orders')
    .insert(order)
    .select()
    .single()
  return { data, error }
}

export async function getUserOrders(userId: string): Promise<Order[]> {
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  if (error) return []
  return data || []
}

export async function getAllOrders(): Promise<Order[]> {
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) return []
  return data || []
}

export async function updateOrderStatus(orderId: string, status: Order['status']) {
  const { data, error } = await supabase
    .from('orders')
    .update({ status })
    .eq('id', orderId)
    .select()
    .single()
  return { data, error }
}

// ── Wallet helpers ────────────────────────────────────────────────────────────

export async function createWalletTransaction(tx: Omit<WalletTransaction, 'id' | 'created_at'>) {
  const { data, error } = await supabase
    .from('wallet_transactions')
    .insert(tx)
    .select()
    .single()
  return { data, error }
}

export async function getUserTransactions(userId: string): Promise<WalletTransaction[]> {
  const { data, error } = await supabase
    .from('wallet_transactions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  if (error) return []
  return data || []
}

export async function getAllTransactions(): Promise<WalletTransaction[]> {
  const { data, error } = await supabase
    .from('wallet_transactions')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) return []
  return data || []
}

export async function adminAddFunds(userId: string, amount: number, description: string) {
  // Create completed transaction
  const { error: txError } = await supabase
    .from('wallet_transactions')
    .insert({ user_id: userId, amount, type: 'Deposit', description, status: 'Completed' })
  if (txError) return { error: txError }

  // Update wallet balance
  const { data: profile } = await supabase
    .from('profiles')
    .select('wallet_balance')
    .eq('id', userId)
    .single()

  const newBalance = (profile?.wallet_balance || 0) + amount
  const { error: profileError } = await supabase
    .from('profiles')
    .update({ wallet_balance: newBalance })
    .eq('id', userId)

  return { error: profileError }
}

export async function approveDepositTransaction(txId: string, userId: string, amount: number) {
  // Mark transaction complete
  const { error: txError } = await supabase
    .from('wallet_transactions')
    .update({ status: 'Completed' })
    .eq('id', txId)
  if (txError) return { error: txError }

  // Credit wallet
  const { data: profile } = await supabase
    .from('profiles')
    .select('wallet_balance')
    .eq('id', userId)
    .single()
  const newBalance = (profile?.wallet_balance || 0) + amount
  const { error } = await supabase
    .from('profiles')
    .update({ wallet_balance: newBalance })
    .eq('id', userId)
  return { error }
}

export async function processWalletPurchase(
  userId: string,
  email: string,
  amount: number,
  productName: string,
  category: string
) {
  // Check balance
  const { data: profile } = await supabase
    .from('profiles')
    .select('wallet_balance')
    .eq('id', userId)
    .single()

  if (!profile || profile.wallet_balance < amount) {
    return { error: { message: 'Insufficient wallet balance' } }
  }

  // Deduct balance
  const { error: balErr } = await supabase
    .from('profiles')
    .update({ wallet_balance: profile.wallet_balance - amount })
    .eq('id', userId)
  if (balErr) return { error: balErr }

  // Create transaction record
  await supabase.from('wallet_transactions').insert({
    user_id: userId,
    amount,
    type: 'Purchase',
    description: `Purchase: ${productName}`,
    status: 'Completed'
  })

  // Create order
  const { data, error } = await supabase
    .from('orders')
    .insert({
      user_id: userId,
      customer_email: email,
      product_name: productName,
      category,
      amount,
      payment_method: 'Wallet',
      status: 'Approved'
    })
    .select()
    .single()

  return { data, error }
}

// ── Admin settings ────────────────────────────────────────────────────────────

export async function getAdminSettings(): Promise<AdminSettings | null> {
  const { data, error } = await supabase
    .from('admin_settings')
    .select('*')
    .limit(1)
    .single()
  if (error) return null
  return data
}

export async function updateAdminSettings(id: string, updates: Partial<AdminSettings>) {
  const { data, error } = await supabase
    .from('admin_settings')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()
  return { data, error }
}

// ── Products ──────────────────────────────────────────────────────────────────

export async function getProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('is_active', true)
    .order('category')
  if (error) return []
  return data || []
}

export async function getAllProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('category')
  if (error) return []
  return data || []
}

export async function createProduct(product: Omit<Product, 'id' | 'created_at'>) {
  const { data, error } = await supabase
    .from('products')
    .insert(product)
    .select()
    .single()
  return { data, error }
}

export async function updateProduct(id: string, updates: Partial<Product>) {
  const { data, error } = await supabase
    .from('products')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  return { data, error }
}

export async function deleteProduct(id: string) {
  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', id)
  return { error }
}
