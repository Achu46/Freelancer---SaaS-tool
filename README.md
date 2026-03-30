# QueFlow 🌊 — Premium Freelancer Client Portal

QueFlow is a production-ready Micro-SaaS designed for freelancers who want to eliminate the chaos of "email tag." Give every client a single, secure, no-login portal link where they can upload files, track tasks, and message you in real-time.

![QueFlow Dashboard](https://via.placeholder.com/1200x600?text=QueFlow+Client+Portal+Preview)

## 🚀 Key Features

- **One-Link Portals**: Clients access their dedicated space via a secure public link. No signup required for clients.
- **Role-Based Access (RBAC)**: Unified login for both Freelancers (Dashboard) and Admins (System Oversight).
- **Task Management**: Real-time task tracking with status updates.
- **File Exchange**: Secure file uploads and management via Firebase Storage.
- **Messaging**: Integrated project communication.
- **Premium Subscriptions**: Integrated Lemon Squeezy checkout for Starter and Pro plans.

## 🛠️ Tech Stack

- **Frontend**: React 19 + Vite
- **Styling**: Tailwind CSS v4 (Modern & High-Performance)
- **Backend**: Firebase (Auth, Firestore, Storage)
- **Payments**: Lemon Squeezy (Subscriptions & SaaS Billing)
- **Notifications**: EmailJS (System & User Alerts)

---

## ⚡ Quick Start

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/your-username/queflow.git
cd queflow
npm install
```

### 2. Configure Environment
Copy `.env.example` to `.env` and fill in your credentials:
```bash
cp .env.example .env
```

| Variable | Source |
|---|---|
| `VITE_FIREBASE_*` | Firebase Console → Project Settings |
| `VITE_LS_STARTER_CHECKOUT_URL` | Lemon Squeezy → Products → Starter Plan |
| `VITE_LS_PRO_CHECKOUT_URL` | Lemon Squeezy → Products → Pro Plan |
| `VITE_EMAILJS_*` | EmailJS Dashboard → Services / Templates |

### 3. Run Development Server
```bash
npm run dev
```

---

## 🏗️ Firebase Setup

1. **Authentication**: Enable **Email/Password** in the Firebase Console.
2. **Firestore**: Create a database in **Production Mode**.
   - Deploy rules: `firebase deploy --only firestore:rules`
3. **Storage**: Enable Storage and deploy rules: `firebase deploy --only storage`.

## 🍋 Lemon Squeezy Setup

1. Create a **Starter** and **Pro** product in your Lemon Squeezy dashboard.
2. Copy the **Checkout Links** for each product to your `.env` file.
3. Configure **Webhooks** if you are using server-side listeners (optional for this frontend-focused version).

---

## 📁 Project Structure

```text
src/
├── components/      # UI components & AdminRoute guards
├── contexts/        # Auth & Role-based context
├── hooks/           # useProjects, useTasks, useMessages, useFiles
├── lib/             # Firebase, Lemon Squeezy, EmailJS configs
└── pages/           # Landing, Auth, Dashboard, AdminPanel, ClientPortal
```

---

## 🎯 Admin Access

To access the sophisticated **Admin Panel** (`/admin`):
1. Set `VITE_ADMIN_EMAIL` and `VITE_ADMIN_PASSWORD` in your `.env`.
2. Login through the unified `/login` page with these credentials.
3. You will be automatically redirected to the system oversight dashboard.

---

## 📄 License

This project is open-source and available under the **MIT License**.

Built with ❤️ for Freelancers.
