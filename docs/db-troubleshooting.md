# Database troubleshooting (Supabase + Prisma)

Runbook for the error that stops the dev server:

```
PrismaClientInitializationError
Can't reach database server at `aws-0-us-east-1.pooler.supabase.com:6543`
```

Usually the Supabase project was asleep, not broken. Work down the ladder and
stop at the first step that fails — the step that fails names the cause.

## 1. Does the name resolve?

```powershell
nslookup aws-0-us-east-1.pooler.supabase.com
```

No answer → DNS or VPN problem on this machine. Nothing to do with Supabase.

## 2. Is the port open?

```powershell
Test-NetConnection -ComputerName aws-0-us-east-1.pooler.supabase.com -Port 6543
```

`TcpTestSucceeded : False` → firewall, captive wifi, or corporate network
blocking 6543. Try a phone hotspot to confirm.

Note: `db.<project-ref>.supabase.co` (the old "direct connection" host) is
IPv6-only now and will fail this test on most home networks. That is expected —
use the pooler host for both URLs instead.

## 3. Can Prisma actually query?

Run from the repo root. Creates no files:

```powershell
node --env-file=.env --input-type=module -e "import {PrismaClient} from '@prisma/client'; const p=new PrismaClient(); try{console.log('OK',await p.$queryRawUnsafe('select 1 as ok'))}catch(e){console.log('FAIL',e.message)}; process.exit(0)"
```

- `OK` but the app still errors → the dev server is holding **stale env**.
  `next dev` reads `.env` once at boot. Stop it and run `npm run dev` again.
- `FAIL` → go to step 4.

## 4. Is the project paused?

Open the project in the Supabase dashboard. Free projects pause after about a
week of no traffic; opening the dashboard resumes them. Wait for the status to
go green, then re-run step 3.

`connect_timeout=15` in `DATABASE_URL` exists so a project that is merely
*waking* (not paused) answers slowly instead of throwing. Raise it if wakes get
slower; do not drop it.

## Error → cause

| Error | Cause | Fix |
|---|---|---|
| `Can't reach database server at ...:6543` | project paused/waking, or network | ladder above |
| `Tenant or user not found` | username or host wrong — the `aws-0` / `aws-1` prefix and region must match what the dashboard shows | copy the URL from Supabase → Connect |
| `prepared statement "s0" does not exist` (Postgres 26000) | `pgbouncer=true` missing on the 6543 URL | append it; [lib/prisma.ts](../lib/prisma.ts) warns about this at boot |
| `column ... does not exist` right after a green `prisma db push` | `DATABASE_URL` and `DIRECT_URL` point at **different projects** | make the project ref identical in both; the `[prisma]` console.error at boot names both refs |
| `password authentication failed` | password rotated in the dashboard | reset it, update both URLs |

## Which port when

| Port | Mode | Used by |
|---|---|---|
| 6543 | transaction (Supavisor) | app runtime — `DATABASE_URL` |
| 5432 | session | `prisma db push` / `migrate` / `studio` — `DIRECT_URL` |

Transaction mode multiplexes many clients onto few Postgres connections, so it
cannot hold prepared statements or advisory locks — that is why migrations need
the session port.

## Windows gotchas

- Stop `next dev` before `prisma generate`. The running server locks the query
  engine DLL and generate fails with EPERM.
- This project uses `prisma db push`, not `migrate` — the schema lives on a
  live Supabase database with no migration history.
