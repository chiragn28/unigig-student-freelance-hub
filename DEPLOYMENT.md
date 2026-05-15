# Deployment guide

This codebase is architected so you can deploy without restructuring. The frontend, backend, database, file storage, and email service are all swappable behind clean interfaces.

> **Status:** these are recommendations + checklists, **not yet implemented**. Each section calls out what changes when you ship.

---

## Recommended hosts

| Concern             | Recommended                          | Alternative                                  |
|---------------------|--------------------------------------|----------------------------------------------|
| **Frontend (SSR)**  | **Vercel**                           | Cloudflare Workers (already configured via `client/wrangler.jsonc`) |
| **Backend (API)**   | **Railway** or **Render**            | Fly.io · Heroku · self-hosted VM             |
| **Postgres**        | Railway / Render / **Neon**          | Supabase · AWS RDS                           |
| **File storage**    | **Cloudflare R2** (S3-compatible, no egress fees) | AWS S3 · Backblaze B2          |
| **Email**           | **Resend**                           | SendGrid · Postmark                          |
| **Domain + DNS**    | Cloudflare or your registrar         |                                              |
| **Monitoring**      | Sentry (errors) + Logtail (logs)     |                                              |

If you're optimizing for one bill: **Vercel (frontend) + Railway (backend + Postgres) + Resend (email) + Cloudflare R2 (storage)** is a clean three-vendor stack.

---

## Environment variables to change for production

### Backend (set on Railway/Render/etc.)

| Variable                       | Dev value                                      | Prod value                                                                   |
|--------------------------------|------------------------------------------------|------------------------------------------------------------------------------|
| `NODE_ENV`                     | `development`                                  | `production`                                                                 |
| `PORT`                         | `4000`                                         | Provider's `$PORT`                                                            |
| `DATABASE_URL`                 | local Docker Postgres                          | Managed Postgres connection string                                            |
| `JWT_ACCESS_SECRET`            | dev placeholder                                | **64+ random bytes** — `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"` |
| `JWT_REFRESH_SECRET`           | dev placeholder                                | **Different** 64+ random bytes                                                |
| `CORS_ORIGINS`                 | `http://localhost:3000,http://localhost:5173`  | `https://unigig.app,https://www.unigig.app`                                  |
| `APP_URL`                      | `http://localhost:3000`                        | `https://unigig.app`                                                          |
| `EMAIL_PROVIDER`               | `console`                                      | `resend`                                                                      |
| `RESEND_API_KEY`               | —                                              | from resend.com                                                               |
| `EMAIL_FROM`                   | `noreply@unigig.local`                         | `verify@unigig.app` (must be a verified Resend domain)                        |
| `STORAGE_DRIVER`               | `local`                                        | `s3`                                                                          |
| `S3_ENDPOINT`                  | —                                              | e.g. `https://<account-id>.r2.cloudflarestorage.com`                          |
| `S3_BUCKET`                    | —                                              | your bucket name                                                              |
| `S3_ACCESS_KEY_ID`             | —                                              | from R2/S3 IAM                                                                |
| `S3_SECRET_ACCESS_KEY`         | —                                              | from R2/S3 IAM                                                                |
| `S3_PUBLIC_URL`                | —                                              | `https://cdn.unigig.app` (custom domain in front of R2) or R2 public URL      |
| `GOOGLE_AUTH_ENABLED`          | `false`                                        | `true` only when you trust the deploy (see "Enabling Google OAuth")           |

### Frontend (set on Vercel/Cloudflare)

| Variable        | Prod value                          |
|-----------------|-------------------------------------|
| `VITE_API_URL`  | `https://api.unigig.app/api`        |

`VITE_*` vars are **baked into the build** at build time — they're public. Never put secrets there.

---

## Running Prisma migrations against managed Postgres

Two flows: one for first deploy, one for every subsequent deploy.

### First deploy

```bash
# Locally, against the prod DATABASE_URL:
DATABASE_URL="postgresql://user:pass@prod-host:5432/db" \
  npx prisma migrate deploy
```

Or run it as a release/deploy step on your host:
- **Railway** — set a deploy command: `npx prisma migrate deploy && node server/dist/index.js`
- **Render** — add a "Pre-deploy command": `npx prisma migrate deploy`
- **Fly.io** — `release_command = ["npx", "prisma", "migrate", "deploy"]` in `fly.toml`

### Subsequent deploys

Every code push that ships should run `prisma migrate deploy` before starting the server. It's idempotent and only applies pending migrations. **Never** run `prisma migrate dev` in production — it can prompt and can create migrations.

### Schema changes workflow
1. Edit `server/prisma/schema.prisma`
2. Locally: `npm run db:migrate -w server` → creates a migration in `server/prisma/migrations/`
3. Commit both the schema file and the new migration folder
4. Deploy — your deploy step applies the new migration

### Seeding production
**Don't.** The seed script is for local dev. If you need initial admin users or skill taxonomies in prod, write a separate, idempotent one-off script.

---

## Swapping local file storage for S3 / R2

1. Provision an R2 bucket (or S3 bucket) and an API token with `Object Read/Write` permission.
2. Add `@aws-sdk/client-s3` to `server/package.json`:
   ```bash
   npm i @aws-sdk/client-s3 -w server
   ```
3. In `server/src/lib/storage.ts`, replace the `S3FileStorage` stub with the real implementation. The interface (`upload`, `delete`, `publicUrl`) is already finalized — only the bodies need filling in. Use `PutObjectCommand` with `Bucket`, `Key`, `Body`, `ContentType`, `ACL: 'public-read'` (or, preferably, put a CDN with signed URLs in front for portfolio images).
4. Set the env vars in your backend host:
   ```
   STORAGE_DRIVER=s3
   S3_ENDPOINT=https://<account-id>.r2.cloudflarestorage.com
   S3_REGION=auto
   S3_BUCKET=unigig-prod
   S3_ACCESS_KEY_ID=...
   S3_SECRET_ACCESS_KEY=...
   S3_PUBLIC_URL=https://cdn.unigig.app
   ```
5. No route changes — every upload route already calls `storage.upload(...)`.

For R2 specifically, consider putting Cloudflare's transform rules + signed URLs in front of the bucket so portfolio images aren't enumerable.

---

## Wiring a real email service (Resend)

1. Create a Resend account and verify the sending domain (`unigig.app`).
2. Add the package:
   ```bash
   npm i resend -w server
   ```
3. In `server/src/lib/email.ts`, fill in `ResendEmailProvider.send`:
   ```ts
   import { Resend } from "resend";
   class ResendEmailProvider implements EmailProvider {
     private client = new Resend(env.RESEND_API_KEY!);
     async send(m: EmailMessage) {
       await this.client.emails.send({
         from: env.EMAIL_FROM,
         to: m.to,
         subject: m.subject,
         html: m.html,
         text: m.text,
       });
     }
   }
   ```
4. Set env in prod:
   ```
   EMAIL_PROVIDER=resend
   RESEND_API_KEY=re_...
   EMAIL_FROM=verify@unigig.app
   ```

Other templates (password reset, proposal-accepted notifications, message digests) all go through the same `EmailProvider` interface.

---

## Enabling Google OAuth (after launch)

You said: *"add the feature of google login… which I will be using later after the website is completely made and we trust it."* Here's the exact turn-on sequence:

1. **Create OAuth credentials** at https://console.cloud.google.com/apis/credentials
   - Application type: **Web application**
   - Authorized JavaScript origins: `https://unigig.app`, `https://www.unigig.app`
   - Authorized redirect URIs: *(none needed — we use the ID-token flow, not redirect flow)*
   - Copy the **Client ID** (the secret isn't needed for the ID-token flow)

2. **Backend env** — set on Railway/Render:
   ```
   GOOGLE_AUTH_ENABLED=true
   GOOGLE_CLIENT_ID=<your-client-id>.apps.googleusercontent.com
   ```

3. **Frontend** — add the Google Identity Services script + a button.
   ```bash
   npm i @react-oauth/google -w client
   ```
   Wrap the app in `GoogleOAuthProvider` (somewhere inside `__root.tsx`), then drop a `<GoogleLogin onSuccess={...} />` on the login + signup pages. In the `onSuccess` handler:
   ```ts
   import { api } from "@/lib/api";
   import { tokenStore } from "@/lib/auth-store";
   const res = await api.post("/auth/google", { credential: cred.credential });
   tokenStore.set(res.data.accessToken, res.data.refreshToken);
   // navigate to /hire, refresh AuthContext, etc.
   ```

4. The server-side `POST /api/auth/google` route is already implemented (`server/src/routes/auth.ts`) — it verifies the ID token via `google-auth-library`, finds-or-creates the user, links to an existing local account by email if one exists, and returns the same `{ user, accessToken, refreshToken }` shape as `/login`.

5. **What happens if a Google user already has a local account?** They're linked by email — `googleId` is set, `emailVerified` is set to whatever Google says, and on subsequent logins either flow works.

---

## Adding Stripe Connect (for payments) later

When you're ready to handle payments between students:

1. Add the `Payment`, `PayoutAccount`, and `Transfer` Prisma models (or use `Contract` as the payment anchor).
2. Use **Stripe Connect Express** accounts for freelancers (lightweight onboarding, Stripe handles KYC/1099s).
3. Flow:
   - When a contract is accepted, take the client's payment + hold in escrow (use Stripe's `transfer_group`)
   - When the client approves the work, release the funds to the freelancer's Connect account minus your platform fee
4. Webhook endpoint: `POST /api/webhooks/stripe` (verify with `STRIPE_WEBHOOK_SECRET`). Update `Contract.status` based on `transfer.paid`, `charge.refunded`, etc.
5. Add env vars: `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_CONNECT_CLIENT_ID`, `PLATFORM_FEE_BPS` (basis points, e.g. 500 = 5%).

Stripe Connect docs: https://stripe.com/docs/connect/express-accounts.

---

## Security checklist before going live

- [ ] **Rotate `JWT_ACCESS_SECRET` and `JWT_REFRESH_SECRET`** to fresh 64-byte random hex (different from each other; different from any dev value committed to git)
- [ ] Lock `CORS_ORIGINS` to your real domains only — no localhost
- [ ] Turn on HTTPS everywhere (Vercel and Railway do this by default for their domains)
- [ ] Pick a different DB password than `unigig:unigig`. Use the random one your managed-Postgres provider generates
- [ ] Set up an error monitor (Sentry) — wire it in `server/src/middleware/error.ts` and the client's root `ErrorComponent`
- [ ] Re-run `npm audit` on prod deps. Known transitive CVEs in `tar` / `@mapbox/node-pre-gyp` (pulled by `bcrypt`'s native build) are **install-time only** and don't affect the running server — consider migrating to `bcryptjs` if your host runs as a strict reproducible build
- [ ] Bump multer to ≥2.x *(done already)*
- [ ] Consider adding `secure: true` and `sameSite: 'lax'` cookies if you switch refresh tokens to httpOnly cookies (more secure than localStorage; harder to integrate with TanStack Start SSR — possible follow-up)
- [ ] Rate limit reset (`AUTH_RATE_LIMIT_MAX=20` per 15 min on auth routes) is conservative; tune as needed
- [ ] **Email verification is required by default** (`EMAIL_VERIFICATION_REQUIRED=true`) — keep it that way; this is what keeps unigig students-only

---

## Quick deploy: Vercel + Railway path (no custom domain yet)

1. **Push to GitHub.**
2. **Postgres + API on Railway**
   - New project → "Provision Postgres"
   - New service → "Deploy from GitHub repo" → point at `server/` directory, root command `npx prisma migrate deploy && node dist/index.js`, build command `npm install && npm run build -w server`
   - Set all server env vars (above)
   - Note the public URL Railway gives you, e.g. `unigig-api.up.railway.app`
3. **Frontend on Vercel**
   - Import the GitHub repo
   - Set "Root directory" to `client/`
   - Framework preset: Vite (Vercel auto-detects TanStack Start when it sees `@tanstack/react-start`)
   - Add env var `VITE_API_URL=https://unigig-api.up.railway.app/api`
   - Deploy
4. Go back to Railway and set `CORS_ORIGINS=https://<vercel-domain>` (plus the production custom domain when you add it).

Total time: ~20 minutes the first time.
