# FoodLogin Project Structure & Status

## Project Overview
FoodLogin is a fullstack food ordering web application built with Next.js (App Router), TypeScript, and MongoDB. It supports user and admin roles, menu management, cart, checkout with Razorpay integration, and order management. The app is designed for both end-users (ordering food) and admins (managing menu and orders).

## Tech Stack
- **Frontend/Backend:** Next.js (App Router, TypeScript)
- **Database:** MongoDB (via Mongoose, Atlas or local)
- **Authentication:** NextAuth.js (credentials provider)
- **Payments:** Razorpay (test mode supported)
- **Styling:** Tailwind CSS
- **State Management:** React hooks, context (where needed)

## Directory Structure (Key Parts)
- `src/app/` — Next.js app directory (pages, API routes)
  - `api/` — All backend API endpoints (auth, cart, orders, admin, etc.)
  - `menu/`, `cart/`, `orders/`, `profile/`, `checkout/` — Main user-facing pages
  - `admin/` — Admin dashboard and menu management pages
- `src/components/` — Reusable React components (Navbar, AddToCartButton, admin components, etc.)
- `src/models/` — Mongoose models (User, Item, Order)
- `src/lib/` — Utility libraries (DB connection, NextAuth providers)
- `public/` — Static assets (images, icons)

## Completed Features
- User authentication (sign up, login, session management)
- User profile management (name, address, phone)
- Menu browsing (all users)
- Add to cart, view cart, update/remove items
- Checkout flow with Razorpay (test mode)
- Order placement (address/phone attached to order)
- Admin dashboard: view all orders, update order status
- Admin menu management: add, edit, delete menu items
- Filtering/search in admin dashboard
- Route protection (user/admin)
- Responsive design (basic)
- Order Confirmation Page

## Pending/Optional Features
- **Order History Page:** Let users view their past orders
- **Cart Count in Navbar:** Show number of items in cart
- **UI/UX Polish:** Toast notifications, better mobile support, improved visuals
- **Image Upload for Menu Items:** (currently uses URLs)
- **Pagination:** For orders/menu if data grows
- **Admin Analytics:** Show stats (total orders, revenue, etc.)
- **Notifications:** Email/SMS or in-app for order status
- **Production Readiness:** Remove/restore any disabled routes, fix all ESLint/type errors, remove `ignoreDuringBuilds: true` before going live
- **Zod Validation:** Add schema validation for API endpoints and forms

## Special Notes
- **Razorpay is in test mode** (no real money is charged).
- **MongoDB Atlas free tier** is used for database (no cost for small projects).
- **Environment variables** must be set in Vercel for deployment (see `.env.local`).
- **Some routes may be temporarily disabled** (e.g., admin PATCH endpoint) for deployment/testing.
- **ESLint errors are currently ignored during build** for rapid prototyping; fix before production.

## Zod Validation & TypeScript Types

- **Zod** is used for validating all incoming data to API endpoints (e.g., register, cart, profile, items, orders, etc.).
- This ensures that only well-formed, expected data is processed by the backend, preventing bugs and security issues.
- **How it works:** Each API route that accepts data defines a Zod schema (e.g., `registerSchema`, `itemSchema`) and uses `.safeParse()` to validate the request body.
- **Error Handling:** If validation fails, the API returns a 400 error with details, making it easy to debug and preventing bad data from entering the database.

### TypeScript Types from Zod Schemas

- You can auto-generate TypeScript types from Zod schemas using:
  ```ts
  type MyType = z.infer<typeof mySchema>;
  ```
- **Why:** This keeps your TypeScript types always in sync with your validation logic, so you never have mismatches between what your code expects and what your API actually accepts.
- **How to use:** Use these types for function arguments, variables, or API payloads that should match your schema. For frontend usage, export the types from a shared file.
- **If you use these types, you won't run into bugs where your code expects one shape of data but gets another.**

---

**Tip:**  
If you want to see Zod in action, try sending invalid data to any API endpoint (e.g., missing fields, wrong types) and observe the clear error messages and safe handling.

## How to Onboard/Continue
- See this file for project context.
- Check `src/app/api/` for backend logic, `src/app/` for pages, and `src/components/` for UI.
- Review pending features above for next steps.
- For validation, consider using Zod (already installed).

---
**This file is intended to give future developers or AI assistants a clear understanding of the project's current state, structure, and priorities.** 