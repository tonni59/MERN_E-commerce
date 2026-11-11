# Client handover / go-live notes

## Required client decisions
- Store name, logo, brand colors and domain
- Product categories, SKU rules and product image ownership
- Shipping zones, fees, delivery estimates and COD rules
- SSLCOMMERZ merchant onboarding and settlement bank account
- Return/refund policy, privacy policy, terms and support contact
- Tax/VAT requirements and invoice format

## Before launch
1. Replace ShopEase branding and placeholder footer links.
2. Add business-specific shipping charges and calculate them on the server.
3. Add email/SMS notifications and order confirmation templates.
4. Add proper transactional inventory reservation/rollback for online payment timeouts.
5. Move uploads to durable object storage.
6. Add unit/integration tests, error monitoring, structured logs and database backups.
7. Have the client approve mobile and desktop UI and complete UAT.
8. Verify payment callbacks, duplicate IPNs, amount mismatch, invalid signatures, refunds and reconciliation.
9. Configure legal pages and analytics/cookie consent as applicable.
10. Rotate all credentials and remove seed/default secrets.

## Security reminders
- The admin user is created by a server-side seed script; public registration always creates customer role.
- Never put payment secrets or JWT secrets in Next.js `NEXT_PUBLIC_*` variables.
- Never trust browser cart prices; the API calculates order totals from MongoDB.
- Use a strong unique `JWT_SECRET` and HTTPS.
