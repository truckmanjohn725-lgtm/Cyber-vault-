# CyberVault — Digital Goods Marketplace

Premium digital goods marketplace built with React, Supabase, and Tailwind CSS.

---

## STEP 1 — Set Up Supabase Database

1. Go to **https://supabase.com** and sign in
2. Open your project: `https://jnygjngzwochodogmlsbt.supabase.co`
3. In the left sidebar click **SQL Editor**
4. Click **New query**
5. Copy the entire contents of `database.sql` and paste it in
6. Click **Run** (or press Ctrl+Enter)
7. You should see "Success. No rows returned" — that means it worked

---

## STEP 2 — Create Your Admin Account

1. In Supabase, go to **Authentication → Users**
2. Click **Add user → Create new user**
3. Enter:
   - Email: `olakunleomogbolahan3@gmail.com`
   - Password: (choose a strong password)
   - Check **Auto Confirm User**
4. Click **Create User**

The trigger will automatically create a profile with `is_admin = true` for this email.

---

## STEP 3 — Deploy to Netlify

### Option A: Drag & Drop (Easiest)

1. Install Node.js from https://nodejs.org (version 18 or higher)
2. Open a terminal in the `cyber-vault` folder
3. Run these commands:
   ```
   npm install
   npm run build
   ```
4. This creates a `dist` folder
5. Go to **https://netlify.com** and sign in
6. Go to **Sites → Add new site → Deploy manually**
7. Drag and drop the `dist` folder onto the page
8. Your site is live! Copy the URL Netlify gives you

### Option B: GitHub + Netlify (Best for updates)

1. Create a free account at https://github.com
2. Create a new repository called `cyber-vault`
3. Upload all the project files to the repository
4. Go to **https://netlify.com** and sign in
5. Click **Add new site → Import an existing project**
6. Connect your GitHub account and select the `cyber-vault` repo
7. Configure build settings:
   - **Build command:** `npm run build`
   - **Publish directory:** `dist`
8. Click **Deploy site**
9. Every time you push changes to GitHub, Netlify auto-deploys

---

## STEP 4 — Test Your Site

1. Visit your Netlify URL
2. Click **Sign Up** and create a test customer account
3. Browse products, test checkout
4. Log in with `olakunleomogbolahan3@gmail.com` → goes to Admin dashboard
5. In Admin → Products, add/edit/delete products
6. In Admin → Customers, add funds to customer wallets
7. In Admin → Orders, approve or reject pending orders

---

## Project Structure

```
cyber-vault/
├── public/
│   └── _redirects          ← Netlify routing fix
├── src/
│   ├── components/
│   │   ├── Navbar.tsx
│   │   ├── Footer.tsx
│   │   ├── ProductCard.tsx
│   │   ├── CheckoutModal.tsx
│   │   ├── ChatBot.tsx
│   │   └── ToastContainer.tsx
│   ├── pages/
│   │   ├── Home.tsx
│   │   ├── Login.tsx
│   │   ├── Signup.tsx
│   │   ├── Dashboard.tsx
│   │   ├── Admin.tsx
│   │   └── Products.tsx
│   ├── lib/
│   │   └── supabase.ts      ← All database functions
│   ├── context/
│   │   └── AuthContext.tsx  ← Auth state
│   ├── hooks/
│   │   └── useToast.ts
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── database.sql             ← Run this in Supabase first
├── netlify.toml
├── package.json
└── vite.config.ts
```

---

## Features

- **Authentication** — Sign up, login, logout with Supabase Auth
- **Admin Dashboard** — Full product management (add/edit/delete), order management, customer management
- **Customer Dashboard** — Wallet balance, order history, transaction history, profile settings
- **Wallet System** — Add funds via OPay, admin approves deposits, instant wallet checkout
- **Product Catalog** — 4 categories, search and filter, live from database
- **Checkout** — Wallet (instant), OPay (pending approval), Crypto
- **AI Chatbot** — Floating chat assistant with keyword responses
- **Responsive** — Works on mobile and desktop

---

## Admin Features

From `/admin` you can:

- **Add products** — Name, description, category, base price, selling price
- **Edit products** — Update any product details
- **Delete products** — Permanently remove products
- **Toggle active/inactive** — Hide products without deleting
- **Approve/reject orders** — Manage pending OPay and Crypto orders
- **Mark orders delivered** — Update order status
- **Add funds to customers** — Credit any customer's wallet directly
- **Approve deposits** — Approve customer fund requests
- **Update OPay details** — Change account number/name
- **Update profit margin** — Change the margin shown in stats

---

## Common Issues

**Blank page after deploy?**
- Make sure `public/_redirects` file exists with `/*    /index.html   200`
- Make sure `netlify.toml` is in the root folder

**Login not working?**
- Make sure you ran the SQL in Supabase
- Make sure you created the admin user in Supabase Auth → Users
- Check the email is exactly `olakunleomogbolahan3@gmail.com`

**Products not showing?**
- The SQL inserts 12 default products — make sure the SQL ran successfully
- Check Supabase → Table Editor → products table has rows

**"Permission denied" errors?**
- The RLS policies in the SQL handle this — make sure you ran the full SQL file

---

## Support

Email: olakunleomogbolahan3@gmail.com
