# Next.js + MERN E-commerce (No Vite)

A three-app monorepo:
- `frontend/` — customer storefront (Next.js App Router)
- `backend/` — Express REST API + MongoDB/Mongoose
- `admin/` — separate admin dashboard (Next.js App Router)

## Features
- Customer registration/login with bcrypt password hashing and JWT bearer authentication
- Role-based admin protection
- Product catalogue, product detail, search, categories, stock and product image uploads
- Cart persisted in browser local storage
- Checkout and order creation
- SSLCOMMERZ sandbox payment integration (Bangladesh-oriented); COD fallback
- Payment success/fail/cancel/IPN callbacks and server-side validation
- Admin product create/update/delete, order listing and order status updates
- Seed script for the first administrator
- Deployment notes for MongoDB Atlas, Render and Vercel

> This is a runnable client-project foundation, not a substitute for production acceptance testing. Before taking real payments, obtain SSLCOMMERZ merchant credentials, configure HTTPS callback URLs, test all payment states and complete a real low-value transaction. Never commit `.env` files. For high-volume production, move uploaded files to Cloudinary/S3 and add monitoring, backups, rate-limit tuning and automated tests.

## Requirements
- Node.js 20+
- npm 10+
- MongoDB local or MongoDB Atlas account
- SSLCOMMERZ sandbox account for online-payment testing (optional; COD works without it)

## 1. Backend setup

```bash
cd backend
cp .env.example .env
npm install
```

Edit `backend/.env`:
- `MONGODB_URI`
- `JWT_SECRET` (use a long random secret)
- `CLIENT_URL` and `ADMIN_URL`
- `SSL_*` values if testing SSLCOMMERZ

Create the first admin:
```bash
npm run seed:admin
```
The script reads `ADMIN_NAME`, `ADMIN_EMAIL`, and `ADMIN_PASSWORD` from `.env`. Change the password after first login.

Start API:
```bash
npm run dev
```
API health check: http://localhost:5000/api/health

## 2. Customer frontend

```bash
cd frontend
cp .env.local.example .env.local
npm install
npm run dev
```
Open http://localhost:3000

## 3. Admin panel

```bash
cd admin
cp .env.local.example .env.local
npm install
npm run dev
```
Open http://localhost:3001

Use the admin email/password created by the seed script. The admin UI and API both enforce admin role checks.

## 4. Local development ports

| App | URL |
|---|---|
| Storefront | http://localhost:3000 |
| Admin | http://localhost:3001 |
| API | http://localhost:5000 |
| MongoDB | mongodb://127.0.0.1:27017/next_mern_shop |

Set the same API URL in both Next.js `.env.local` files:
`NEXT_PUBLIC_API_URL=http://localhost:5000/api`

## 5. SSLCOMMERZ payment setup

1. Create an SSLCOMMERZ merchant account and obtain sandbox store ID/password.
2. Put credentials in `backend/.env`.
3. Keep `SSL_IS_LIVE=false` while testing.
4. Deploy the API with a public HTTPS URL.
5. Set `BACKEND_PUBLIC_URL` to that API origin. The backend generates success/fail/cancel/IPN callback URLs.
6. In the SSLCOMMERZ merchant dashboard, configure the IPN URL if required by your account.
7. Test successful, failed, cancelled, duplicate callback and invalid transaction scenarios.
8. Switch to live only after merchant approval and end-to-end verification.

If SSLCOMMERZ credentials are absent, online checkout returns a clear configuration error; Cash on Delivery remains available. Do not mark an online order paid based only on a browser redirect. The backend validates the transaction with SSLCOMMERZ.

## 6. Add products and photos

Log in to the admin panel, open **Products**, and create a product. Select an image file; the API stores it under `backend/uploads/` and serves it from `/uploads/...`.

For deployment, local disk may be ephemeral. Configure a persistent disk or replace the upload service with Cloudinary/S3 before production. The current implementation supports one main image per product; add a gallery field if your catalogue requires multiple images.

## 7. Deployment

### MongoDB Atlas
1. Create a cluster and database user.
2. Allow the deployed API host in Network Access (avoid `0.0.0.0/0` unless you understand the risk).
3. Copy the Atlas connection string to `MONGODB_URI`.

### Backend on Render
1. Create a Web Service from the repository.
2. Root directory: `backend`
3. Build command: `npm install`
4. Start command: `npm start`
5. Add all variables from `.env.example` in Render Environment.
6. Set `BACKEND_PUBLIC_URL` to the deployed API origin.
7. Set `CLIENT_URL` and `ADMIN_URL` to the two Vercel origins.
8. Use persistent storage for `uploads`, or migrate images to object storage.

### Frontend and admin on Vercel
Create two Vercel projects from the same repository:
- Storefront root directory: `frontend`
- Admin root directory: `admin`

Add `NEXT_PUBLIC_API_URL=https://YOUR-API-DOMAIN/api` to both projects. Redeploy after setting variables.

### Production checklist
- HTTPS on all origins
- Strong unique JWT secret; rotate credentials
- SSLCOMMERZ live credentials only after approval
- Correct CORS origins
- Persistent/object image storage
- MongoDB backups and least-privilege database user
- Set `NODE_ENV=production`
- Configure real domain URLs and payment callbacks
- Test mobile layout, accessibility, stock race conditions, refund/return policy and transactional emails
- Add privacy policy, terms, shipping, returns and contact pages appropriate to your business

## API overview

| Method | Endpoint | Auth | Purpose |
|---|---|---|---|
| GET | `/api/health` | No | Health check |
| POST | `/api/auth/register` | No | Create customer |
| POST | `/api/auth/login` | No | Login |
| GET | `/api/auth/me` | User | Current user |
| GET | `/api/products` | No | List/search/filter |
| GET | `/api/products/:id` | No | Product detail |
| POST | `/api/orders` | User | Create order / COD |
| GET | `/api/orders/my` | User | Customer orders |
| POST | `/api/payments/ssl/init` | User | Start SSLCOMMERZ payment |
| POST | `/api/payments/ssl/success` | No | Payment return (server validates) |
| POST | `/api/payments/ssl/fail` | No | Failed payment return |
| POST | `/api/payments/ssl/cancel` | No | Cancelled payment return |
| POST | `/api/payments/ssl/ipn` | No | Payment notification |
| GET | `/api/admin/orders` | Admin | List orders |
| PATCH | `/api/admin/orders/:id` | Admin | Update order status |
| POST | `/api/admin/products` | Admin | Create product with image |
| PATCH | `/api/admin/products/:id` | Admin | Update product |
| DELETE | `/api/admin/products/:id` | Admin | Delete product |

## Notes
- API returns `{ success, ... }` response objects.
- Auth token is stored in browser local storage in this starter. For stricter production security, consider short-lived access tokens plus httpOnly refresh cookies and CSRF protections.
- Prices are stored in BDT as integer taka. Never trust client-submitted totals; the API recalculates from database product prices.
- This starter does not include tax/shipping rules, coupons, refunds, inventory reservations, email/SMS, or automated test suites. Add these based on the client's actual business requirements.
# E-Commerce-MERN
