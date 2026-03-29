# KalClone — Premium Scheduling Infrastructure

**KalClone** is a high-performance, SaaS-grade scheduling platform designed for modern professionals. Built with a focus on speed, aesthetics, and user experience, it serves as a powerful clone of Cal.com with advanced features like real-time availability computation, intelligent buffer times, and granular date overrides.

![Dashboard Preview](https://via.placeholder.com/1200x600?text=KalClone+Admin+Dashboard+Preview)

## 🚀 Key Features

- **Dynamic Admin Dashboard**: A glassmorphic, fluid interface for managing event types, availability, and bookings.
- **Intelligent Slot Computation**: Real-time conflict detection with support for `bufferAfterMinutes` and `DateOverrides`.
- **Public Booking Flow**: A beautiful, triple-pane public interface with instant slot selection and confirmation.
- **Premium Design System**: Built with **Tailwind CSS**, **Framer Motion** animations, and the **Outfit** typography system for a high-end app feel.
- **Robust Backend**: Powered by **Next.js App Router**, **Prisma ORM**, and **MySQL**, ensuring data integrity and scalability.

## 🛠️ Tech Stack

- **Framework**: [Next.js 15+](https://nextjs.org/) (App Router)
- **Database**: [MySQL 8](https://www.mysql.com/) (Managed via Prisma)
- **Auth**: [NextAuth.js](https://next-auth.js.org/) (Credentials & JWT)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **ORM**: [Prisma](https://www.prisma.io/)
- **Icons**: [Lucide React](https://lucide.dev/)

## 🏁 Getting Started

### 1. Prerequisites
- Node.js 18+
- A running MySQL 8 instance (PlanetScale, Railway, or local)

### 2. Installation
```bash
git clone <repository-url>
cd cal_clone
npm install
```

### 3. Environment Setup
Copy `.env.example` to `.env` and fill in your values:

```bash
cp .env.example .env
```

If you are on Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

Then update `.env`:

```env
# Database
DATABASE_URL="mysql://user:password@host:3306/db_name"

# Auth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-super-secret-key"

# (Optional) Email
RESEND_API_KEY="re_..."
```

### 4. Database Initialization
```bash
npx prisma generate
npx prisma migrate dev
npx prisma db seed # Adds test user admin@example.com / password123
```

### 5. Start Development
```bash
npm run dev
```

## 🚢 Deployment

### 1. Database (Railway/PlanetScale)
Ensure your production database allows external connections and update `DATABASE_URL` in your production environment settings.

Apply migrations and seed production data:

```bash
npx prisma generate
npx prisma migrate deploy
npx prisma db seed
```

### 2. Frontend (Vercel)
- Connect your repository to Vercel.
- Configure all environment variables from your `.env` file.
- Vercel will automatically detect the Next.js project and deploy.

## Assumptions

- Database engine is MySQL 8.
- Production schema changes are applied through Prisma migrations, not `db push`.
- Seed data is safe to run repeatedly for demo/testing purposes.

## 📄 License
This project is licensed under the MIT License.
