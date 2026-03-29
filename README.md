# KalClone - Project Submission

KalClone is a scheduling application inspired by Cal.com. It includes:
- Admin dashboard for event types, availability, and bookings
- Public booking page by username and event slug
- Slot computation with conflict checks and buffer time
- Date overrides and timezone-aware availability
- Booking lifecycle (create, cancel, reschedule, confirm)

## Tech Stack
- Framework: Next.js 16 (App Router)
- Language: TypeScript
- UI: Tailwind CSS, shadcn/ui, Framer Motion, Lucide icons
- Auth: NextAuth (Credentials, JWT session strategy)
- Database: MySQL 8
- ORM: Prisma
- Date/Time: date-fns, date-fns-tz
- Email: Resend or SMTP (Nodemailer fallback)

## Setup Instructions

### 1. Prerequisites
- Node.js 18+
- npm 9+
- MySQL 8 database (local or hosted: Railway/PlanetScale)

### 2. Install dependencies
```bash
npm install
```

### 3. Configure environment variables
Copy env template:

```bash
cp .env.example .env
```

Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

Minimum required values in `.env`:

```env
DATABASE_URL="mysql://user:password@host:3306/db_name"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="replace-with-a-long-random-secret"
```

Optional values (email):

```env
RESEND_API_KEY=""
SMTP_HOST=""
SMTP_PORT="587"
SMTP_USER=""
SMTP_PASS=""
SMTP_FROM=""
```

### 4. Initialize database
```bash
npx prisma generate
npx prisma migrate dev
npx prisma db seed
```

### 5. Run locally
```bash
npm run dev
```

App runs at `http://localhost:3000`.

## Scripts
- `npm run dev` - start local dev server
- `npm run build` - production build
- `npm run start` - run production server
- `npm run lint` - lint checks

## Demo Credentials
- Email: `admin@example.com`
- Password: `password123`

## Key Routes
- Dashboard: `/event-types`, `/availability`, `/bookings`, `/developer`
- Public booking: `/:username/:slug`
- Confirmation: `/booking/confirmed?id=<bookingId>`

## Folder Structure
```text
cal_clone/
|- prisma/
|  |- migrations/
|  |- schema.prisma
|  |- seed.ts
|- public/
|  |- saran formal.jpg
|- src/
|  |- app/
|  |  |- layout.tsx
|  |  |- page.tsx
|  |  |- login/page.tsx
|  |  |- booking/confirmed/page.tsx
|  |  |- (dashboard)/
|  |  |  |- layout.tsx
|  |  |  |- availability/page.tsx
|  |  |  |- bookings/page.tsx
|  |  |  |- developer/page.tsx
|  |  |  |- event-types/page.tsx
|  |  |- [username]/[slug]/page.tsx
|  |  |- api/
|  |  |  |- auth/[...nextauth]/route.ts
|  |  |  |- availability/route.ts
|  |  |  |- booking/[id]/confirm/route.ts
|  |  |  |- bookings/route.ts
|  |  |  |- bookings/[id]/route.ts
|  |  |  |- bookings/[id]/cancel/route.ts
|  |  |  |- bookings/[id]/reschedule/route.ts
|  |  |  |- date-overrides/route.ts
|  |  |  |- date-overrides/[id]/route.ts
|  |  |  |- event-types/route.ts
|  |  |  |- event-types/[id]/route.ts
|  |  |  |- slots/[slug]/route.ts
|  |  |  |- user/route.ts
|  |- components/
|  |  |- dashboard/DashboardShell.tsx
|  |  |- ui/*
|  |- lib/
|     |- auth.ts
|     |- db.ts
|     |- email.ts
|- .env.example
|- package.json
|- README.md
```

## Assumptions Made
- MySQL 8 is the target database.
- Prisma migrations are the source of truth for schema changes.
- Availability times and overrides are handled in a timezone-aware flow.
- Only authenticated owner can manage dashboard resources.
- Seed script is intended for development/demo data and is idempotent enough for local resets.
- Public booking page is accessible without login.

## Deployment Notes

### Database
Use a MySQL connection string in production `DATABASE_URL`, then apply:

```bash
npx prisma generate
npx prisma migrate deploy
npx prisma db seed
```

### Vercel
- Connect repository
- Set environment variables from `.env`
- Deploy with standard Next.js settings

## Submission Checklist
- Build passes (`npm run build`)
- Lint passes without errors (`npm run lint`)
- Database migrations applied
- Public booking flow tested end-to-end

