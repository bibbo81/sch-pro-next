# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Next.js 15 application for shipment management, tracking, and cost analysis. It uses Supabase for authentication and database, with a comprehensive dashboard for logistics operations.

## Commands

```bash
# Development with Turbopack
npm run dev

# Production build
npm run build

# Start production server
npm run start

# Run linting
npm run lint
```

## Architecture

### Tech Stack
- **Next.js 15.4.6** with React 19.1.0 and App Router
- **Supabase** for auth and PostgreSQL database
- **TypeScript** for type safety
- **Tailwind CSS** with Radix UI components
- **XLSX** for Excel import/export functionality

### Core Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── (dashboard)/       # Protected dashboard routes
│   │   └── dashboard/     # Main dashboard pages (tracking, shipments, products)
│   ├── api/               # API routes (serverless functions)
│   ├── login/             # Authentication page
│   └── settings/          # User settings
├── components/            # React components
│   ├── layout/           # App layout (Sidebar, Header, Navigation)
│   ├── products/         # Product management components
│   ├── shipments/        # Shipment management components
│   ├── shipment-details/ # Shipment detail views
│   └── ui/               # Reusable UI components (shadcn/ui)
├── hooks/                # Custom React hooks
│   ├── useAuth.ts       # Authentication hook
│   ├── useShipments.ts  # Shipment data management
│   └── useProducts.ts   # Product data management
├── lib/                  # Core utilities
│   ├── auth.ts          # Auth helpers (requireAuth, createSupabaseServer)
│   ├── supabase.ts      # Supabase client configuration
│   └── shipmentService.ts # Shipment business logic
├── types/                # TypeScript definitions
│   ├── database.types.ts # Supabase generated types
│   └── shipment.ts      # Domain types
└── middleware.tsx        # Next.js middleware for auth
```

### Authentication Flow

All API routes and dashboard pages require authentication via Supabase. The `requireAuth()` function in `lib/auth.ts` returns the authenticated user and their organization ID. Protected routes use this pattern:

```typescript
const { user, organizationId } = await requireAuth()
const supabase = await createSupabaseServer()
```

### Database Schema

Main tables in Supabase:
- `organizations` - Multi-tenant support
- `shipments` - Core shipment records
- `shipment_items` - Products in shipments
- `products` - Product catalog
- `trackings` - Shipment tracking data
- `additional_costs` - Extra shipment costs
- `documents` - Shipment documents

### API Pattern

All API routes follow this structure:
1. Authentication check via `requireAuth()`
2. Organization-scoped queries using `organizationId`
3. Consistent error handling with NextResponse
4. Support for filtering, pagination, and search

### State Management

- Server Components for initial data fetching
- Client hooks (`useShipments`, `useProducts`) for data management
- Real-time updates via Supabase subscriptions where needed
- Form state managed locally in components

### Key Features

1. **Shipment Management**: CRUD operations with status tracking
2. **Product Catalog**: Import from Excel, link to shipments
3. **Cost Analysis**: Track additional costs per shipment
4. **Document Management**: Attach and manage shipment documents
5. **Tracking Integration**: External tracking API integration (ShipsGo)
6. **Multi-tenant**: Organization-based data isolation
7. **Dark Mode**: Theme toggle support

### Development Notes

- All data operations are organization-scoped for security
- API routes return paginated results by default (limit: 50)
- Excel import uses XLSX library for parsing
- UI components use shadcn/ui pattern with Radix primitives
- Authentication state is managed via Supabase SSR package