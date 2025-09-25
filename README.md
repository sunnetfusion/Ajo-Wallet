# Wallet + Ajo (Rotational Savings) Demo

A modern digital wallet with traditional Ajo (rotational savings) functionality built with Next.js, Supabase, and TypeScript.

## 🚀 Features

- **Authentication**: Email/password signup and signin with Supabase Auth
- **Profile & KYC**: User profiles with KYC verification workflow
- **Digital Wallet**: Fund, withdraw, and track transactions
- **Ajo Groups**: Create and join rotational savings groups
- **Admin Panel**: Approve KYC and manage groups
- **Mobile-First**: Responsive design with Tailwind CSS

## 🛠 Tech Stack

- **Frontend**: Next.js 13 (App Router), React, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Auth + RLS)
- **State Management**: React Query (TanStack Query)
- **Deployment**: Vercel (frontend), Docker (containerized)
- **Database**: PostgreSQL with Row Level Security

## 📋 Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account
- Docker (optional, for containerization)

## 🚀 Quick Start

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd ajo-wallet
npm install --legacy-peer-deps
```

### 2. Environment Setup

Create `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
ADMIN_EMAIL=your_admin_email@domain.com
```

### 3. Database Setup

Run the migration in Supabase SQL Editor:

1. Go to Supabase Dashboard → Your Project → SQL Editor
2. Copy and run the content from `supabase/migrations/20250924193632_blue_canyon_safe.sql`

### 4. Run Development Server

```bash
npm run dev
```

Visit `http://localhost:3000`

## 🐳 Docker Deployment

### Build and Run with Docker

```bash
# Build the image
docker build -t ajo-wallet .

# Run the container
docker run -p 3000:3000 \
  -e NEXT_PUBLIC_SUPABASE_URL=your_url \
  -e NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key \
  -e SUPABASE_SERVICE_ROLE_KEY=your_service_key \
  -e ADMIN_EMAIL=your_email \
  ajo-wallet
```

### Using Docker Compose

```bash
# Copy environment variables
cp .env.local.example .env.local

# Start services
docker-compose up -d

# View logs
docker-compose logs -f app
```

## 🧪 Test Accounts

### Demo Users
- **User**: `user@example.com` / `password123`
- **Admin**: `admin@example.com` / `password123`

### Admin Access
- Set `ADMIN_EMAIL` in your environment to your admin email
- Sign in with that email to access `/admin` panel

## 📁 Project Structure

```
├── app/                    # Next.js App Router pages
│   ├── admin/             # Admin panel
│   ├── ajo/               # Ajo groups
│   ├── auth/              # Authentication pages
│   └── api/               # API routes
├── components/            # React components
│   └── ui/                # Reusable UI components
├── contexts/              # React contexts
├── hooks/                 # Custom hooks
├── lib/                   # Utility functions
├── supabase/              # Database migrations
└── public/                # Static assets
```

## 🔐 Security Features

- **Row Level Security (RLS)**: Users can only access their own data
- **Admin Authentication**: Server-side admin operations with service role
- **Input Validation**: Type-safe forms with Zod validation
- **CSRF Protection**: Built-in Next.js security features

## 🚀 Deployment

### Vercel (Recommended)

1. Connect your GitHub repo to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on push

### Docker

```bash
# Build for production
docker build -t ajo-wallet:latest .

# Run with environment variables
docker run -d \
  --name ajo-wallet \
  -p 3000:3000 \
  --env-file .env.local \
  ajo-wallet:latest
```

## 🧪 Testing

```bash
# Run linting
npm run lint

# Run type checking
npm run type-check

# Run build
npm run build
```

## 📝 API Endpoints

### Public
- `GET /api/health` - Health check

### Admin (requires admin email)
- `GET /api/admin/kyc/pending` - List pending KYC
- `POST /api/admin/kyc/approve` - Approve KYC

### Ajo
- `POST /api/ajo/add-member` - Add member to group by email

## 🐛 Troubleshooting

### Common Issues

1. **400 errors on startup**: Database not migrated - run the SQL migration
2. **Authentication issues**: Check Supabase URL and keys
3. **Admin access denied**: Ensure `ADMIN_EMAIL` matches your sign-in email
4. **Docker build fails**: Use `--legacy-peer-deps` for npm install

### Debug Mode

```bash
# Enable debug logging
DEBUG=* npm run dev

# Docker debug
docker run -it --rm ajo-wallet sh
```

## 📄 License

MIT License - see LICENSE file for details

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📞 Support

For issues and questions:
- Create an issue in the GitHub repository
- Check the troubleshooting section above
- Review Supabase documentation for database issues
