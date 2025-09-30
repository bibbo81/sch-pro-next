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

## ⚠️ CRITICAL: Database Analysis Required

**BEFORE making any changes that involve database tables:**

1. **ALWAYS analyze the Supabase database structure first**
2. **Check table schemas, column names, and data types**
3. **Verify relationships and constraints**
4. **Ensure all code aligns with the actual database structure**

### How to analyze database structure:
- Use Supabase dashboard to inspect table schemas
- Check `src/types/database.types.ts` for generated types
- Verify column existence before writing queries
- Test queries against actual database structure

### Common issues to avoid:
- References to non-existent columns (e.g., `description` in organizations)
- Incorrect data types or constraints
- Missing foreign key relationships
- RLS policy conflicts

**Never assume database structure - always verify first to prevent runtime errors and deployment issues.**

## ⚠️ CRITICAL: Supabase Table Permissions

**AFTER creating new tables in Supabase migrations:**

### Required GRANT statements for every new table:

```sql
-- Always add these GRANT statements after CREATE TABLE
GRANT ALL ON TABLE table_name TO service_role;
GRANT ALL ON TABLE table_name TO authenticated;
GRANT ALL ON TABLE table_name TO anon;  -- Only if table needs public access
```

### Why this is critical:
- Supabase service role key **does NOT automatically** have permissions on new tables
- Even with RLS disabled, explicit GRANTs are required
- Without GRANTs, API routes using service_role will get `permission denied` errors (code 42501)
- This applies to ALL tables created via SQL migrations

### Migration template:

```sql
-- 1. Create table
CREATE TABLE table_name (...);

-- 2. Create indexes
CREATE INDEX ...;

-- 3. Enable RLS (optional)
ALTER TABLE table_name ENABLE ROW LEVEL SECURITY;

-- 4. Create policies (optional)
CREATE POLICY ...;

-- 5. ⚠️ CRITICAL: Grant permissions
GRANT ALL ON TABLE table_name TO service_role;
GRANT ALL ON TABLE table_name TO authenticated;
```

### Troubleshooting permission errors:
If you get `permission denied for table` errors:
1. Check if table exists: `SELECT * FROM table_name LIMIT 1;` in SQL Editor
2. Add missing GRANTs using the template above
3. Test with service_role endpoint before deploying