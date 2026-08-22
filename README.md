# Parahyangan Finance Club Website

A modern website for **PFC** (Parahyangan Finance Club) with a
public site (events, publications, team, gallery, contact) and a password-protected
**admin dashboard** for managing all content.

Built with **Next.js (App Router) + TypeScript + Tailwind CSS + Prisma + PostgreSQL**.

## Features

- 🏠 **Public site**  home, events, publications/articles, about + team, gallery, contact
- 🔐 **Admin dashboard** (`/admin`)  create/edit/delete events, publications, team members, and gallery photos
- 👥 **Single shared admin login**  multiple committee members can be logged in at the same time
- ✉️ **Contact form**  sends messages to your inbox via [Resend](https://resend.com) (falls back to server logs when not configured)
- 🖼️ **Image handling**  upload via Vercel Blob, or simply paste an image URL
- 📝 **Markdown** support for event and publication content

## Tech stack

| Area        | Choice                                    |
| ----------- | ----------------------------------------- |
| Framework   | Next.js 15 (App Router), React 19         |
| Language    | TypeScript                                |
| Styling     | Tailwind CSS                              |
| Database    | PostgreSQL via Prisma ORM                 |
| Auth        | Signed JWT session cookie (`jose`) + bcrypt |
| Email       | Resend                                    |
| Uploads     | Vercel Blob (optional)                    |

## Getting started (local development)

### 1. Install dependencies

```bash
npm install
```

### 2. Set up a PostgreSQL database

Use any Postgres  a free [Neon](https://neon.tech) or [Supabase](https://supabase.com)
database works great. Copy its connection string.

### 3. Configure environment variables

```bash
cp .env.example .env
```

Then edit `.env`:

- `DATABASE_URL`  your Postgres connection string
- `AUTH_SECRET`  a long random string (`openssl rand -base64 32`)
- `ADMIN_USERNAME`  the admin login username
- `ADMIN_PASSWORD_HASH`  generate it (see below)
 - `RESEND_API_KEY`, `CONTACT_EMAIL_TO`, `CONTACT_EMAIL_FROM`  for contact, verification, and password-reset email (optional locally)

Generate the admin password hash:

```bash
npm run hash-password -- "YourSecretPassword"
```

Copy the printed `ADMIN_PASSWORD_HASH="..."` line into `.env`.
(The value is base64-encoded so it has no `$` characters that `.env` would corrupt.)

### 4. Create the schema and seed sample data

```bash
npm run db:push     # create tables


# gausah dipake!
npm run db:seed     # add sample events, publications, team, gallery
```

### 5. Run it

```bash
npm run dev
```

- Public site: http://localhost:3000
- Admin: http://localhost:3000/admin (log in with your username + password)

## Deploying to Vercel

1. Push this repo to GitHub.
2. Import it into [Vercel](https://vercel.com).
3. Add all the environment variables from your `.env` in the Vercel project settings.
   - On Vercel you can paste the raw `ADMIN_PASSWORD_HASH` value from the script as-is.
4. Add a **Postgres** database (Neon/Supabase) and set `DATABASE_URL`.
5. Run the migration once against production:
   ```bash
   npx prisma db push        # or: npx prisma migrate deploy
   npm run db:seed           # optional: seed starter content
   ```
6. (Optional) Enable image uploads by adding a **Vercel Blob** store and its
   `BLOB_READ_WRITE_TOKEN`. Without it, admins paste image URLs instead.
7. (Optional) Add a [Resend](https://resend.com) API key + verified sender so the
   contact form delivers email.

## Managing content

Log in at `/admin` and use the sidebar to manage:

- **Events**  title, date/time, location, Markdown description, cover image, published toggle
- **Publications**  title, excerpt, Markdown body, author, publish date, cover image
- **Team**  name, role, bio, photo, display order, social links
- **Gallery**  photos with titles/captions and display order

## Environment variables reference

| Variable                | Required | Purpose                                        |
| ----------------------- | -------- | ---------------------------------------------- |
| `DATABASE_URL`          | ✅       | PostgreSQL connection string                   |
| `AUTH_SECRET`           | ✅       | Signs the admin session cookie                 |
| `ADMIN_USERNAME`        | ✅       | Admin login username                           |
| `ADMIN_PASSWORD_HASH`   | ✅       | Base64-encoded bcrypt hash of the password     |
| `RESEND_API_KEY`        | ➖       | Enables contact-form email delivery            |
| `CONTACT_EMAIL_TO`      | ➖       | Where contact messages are sent                |
| `CONTACT_EMAIL_FROM`    | ➖       | Verified sender address                        |
| `BLOB_READ_WRITE_TOKEN` | ➖       | Enables direct image uploads (Vercel Blob)     |
| `NEXT_PUBLIC_SITE_URL`  | ➖       | Public base URL (metadata)                     |

## Useful scripts

| Command                 | Description                          |
| ----------------------- | ------------------------------------ |
| `npm run dev`           | Start the dev server                 |
| `npm run build`         | Production build                     |
| `npm run typecheck`     | TypeScript check                     |
| `npm run db:push`       | Sync schema to the database          |
| `npm run db:seed`       | Seed sample content                  |
| `npm run db:studio`     | Open Prisma Studio (DB GUI)          |
| `npm run hash-password` | Generate an admin password hash      |

---

> Placeholder branding is in `lib/site.ts` (name, socials, email)  update it and
> drop in the real Parahyangan Finance Club logo when ready.
