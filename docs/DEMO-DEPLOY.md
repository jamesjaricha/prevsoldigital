# Publishing the demo to GitHub and Vercel

Everything is committed and tested. Two logins are needed that only you can
do, then the deploy takes about ten minutes.

---

## Why the demo is separate from production

This deployment is a **showcase**, not the live business. That is a deliberate
choice, for two reasons found during research:

1. **Vercel's free tier prohibits commercial use.** Their terms restrict Hobby
   to "personal or non-commercial use". A demo that takes no money stays
   within that; a real billing portal would not.
2. **Paynow IP-whitelists merchant servers.** Serverless platforms have no
   static IP, so payments **cannot work on Vercel at all**, at any price tier.

So the demo runs on Vercel with payments disabled, and real trading goes on
the Vultr VPS per [`DEPLOY-QUICKSTART.md`](DEPLOY-QUICKSTART.md).

---

## Step 1 · Log in to both tools

Run these two in a terminal. Both open a browser.

```bash
gh auth login
```

Choose: **GitHub.com** → **HTTPS** → **Yes** (authenticate Git) →
**Login with a web browser**. Copy the one-time code and paste it in the
browser.

```bash
vercel login
```

Pick your email or GitHub, and confirm in the browser.

> If `gh` is not found, close and reopen your terminal — it was just installed
> and the PATH needs refreshing.

---

## Step 2 · Create the database (3 min)

Go to [neon.tech](https://neon.tech), sign up free, and create a project.

- **Name:** `prevsol-demo`
- **Region:** pick the closest available — `AWS eu-central-1` (Frankfurt) is
  usually the best of the options for Zimbabwe.

Copy the **pooled** connection string. It looks like:

```
postgresql://user:password@ep-xxx-pooler.eu-central-1.aws.neon.tech/neondb?sslmode=require
```

Keep that tab open; you need this string twice.

---

## Step 3 · Push to GitHub

From the `web` directory:

```bash
gh repo create prevsol-digital --private --source=. --remote=origin --push
```

That creates a **private** repository and pushes all five commits. Confirm:

```bash
gh repo view --web
```

---

## Step 4 · Deploy to Vercel

```bash
vercel link --yes
```

Then add the environment variables. Replace the connection string with yours:

```bash
vercel env add DATABASE_URL production
# paste your Neon pooled connection string

vercel env add NEXT_PUBLIC_DEMO_MODE production
# type: true

vercel env add CRON_SECRET production
# paste the output of: openssl rand -hex 32

vercel env add NEXT_PUBLIC_SITE_URL production
# type your Vercel URL once you know it — see the note below
```

Deploy:

```bash
vercel --prod
```

Vercel prints the URL. Set `NEXT_PUBLIC_SITE_URL` to that value and redeploy
once so links in the app are correct:

```bash
vercel env rm NEXT_PUBLIC_SITE_URL production --yes
vercel env add NEXT_PUBLIC_SITE_URL production
# paste https://your-project.vercel.app
vercel --prod
```

---

## Step 5 · Set up the demo data (2 min)

The database is empty until you migrate and seed it. Run this locally,
pointed at Neon:

```bash
# From the web directory. Use YOUR Neon string.
DATABASE_URL="postgresql://...neon.tech/neondb?sslmode=require" \
  npx prisma migrate deploy

DATABASE_URL="postgresql://...neon.tech/neondb?sslmode=require" \
  npx tsx prisma/seed.ts

DATABASE_URL="postgresql://...neon.tech/neondb?sslmode=require" \
  DEMO_MODE=true npx tsx prisma/seed-demo.ts
```

On Windows PowerShell, set them first instead:

```powershell
$env:DATABASE_URL="postgresql://...neon.tech/neondb?sslmode=require"
$env:DEMO_MODE="true"
npx prisma migrate deploy
npx tsx prisma/seed.ts
npx tsx prisma/seed-demo.ts
```

The last command prints the demo logins when it finishes.

---

## Step 6 · Check it

Open your Vercel URL. You should see:

- An amber **Demonstration site** banner across the top
- The full site, with all ten services and the shop
- `/demo` listing both sets of sign-in details

Sign in and confirm:

| Account | Email | Password |
|---------|-------|----------|
| Client | `demo@prevsoldigital.com` | `DemoClient2026` |
| Staff | `staff@prevsoldigital.com` | `DemoStaff2026` |

The client account has services, an overdue invoice, an expiring domain and
open tickets. The staff account opens `/admin` with real enquiries and a
pending `.co.zw` domain in the queue.

---

## What is safe on the demo

- **No payment is ever attempted**, whichever method a visitor picks. Checkout
  records the order and raises an invoice, then says plainly that nothing was
  charged.
- **No email is sent.** SMTP is unset, so messages are logged instead. Forms
  still save normally.
- **`/demo` 404s in production**, so the sample accounts are never advertised
  against real client data.
- The repository is **private**, and `.env` is gitignored — no secret is in it.

---

## Afterwards

**Change the demo passwords** if you are sharing the link widely. Edit the two
constants at the top of `prisma/seed-demo.ts` and on `src/app/demo/page.tsx`,
then re-run the demo seed.

**Deploying an update:**

```bash
git push          # Vercel rebuilds automatically
```

**Refreshing the sample data** — the seed is idempotent, so it is safe to
re-run any time the demo gets messy:

```powershell
$env:DATABASE_URL="your-neon-string"; $env:DEMO_MODE="true"
npx tsx prisma/seed-demo.ts
```

**When you go live**, follow [`DEPLOY-QUICKSTART.md`](DEPLOY-QUICKSTART.md)
for the Vultr VPS. Leave `NEXT_PUBLIC_DEMO_MODE` unset there — setting it on
production would silently stop you taking money.

---

## Deployment notes from the first live deploy

Two things bit us, recorded so they do not bite again.

### `vercel deploy` returns BLOCKED on redeploys

The **first** deploy to a new project succeeds. Subsequent CLI uploads come
back `readyState: BLOCKED` with no build logs and no error message.

The workaround is to redeploy through the REST API from an existing good
build, which is what the dashboard's Redeploy button does:

```bash
# Get a token from the CLI's auth file.
TOKEN=$(node -e "const r=require('fs').readFileSync('C:/Users/<you>/AppData/Roaming/xdg.data/com.vercel.cli/auth.json','utf8');console.log((r.match(/\"token\"\s*:\s*\"([^\"]+)\"/)||[])[1])")

curl -X POST -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '{"name":"prevsol-digital-demo","deploymentId":"<a READY deployment id>","target":"production"}' \
  "https://api.vercel.com/v13/deployments?teamId=<team id>&forceNew=1"
```

Clicking **Redeploy** in the Vercel dashboard does the same thing and is
easier. Either way, environment-variable changes are picked up, which matters
because `NEXT_PUBLIC_*` values are baked in at build time.

### Do not pin a region in `vercel.json`

`"regions": ["cpt1"]` is a paid-plan feature. On Hobby it does not error — the
build is simply never scheduled. The file deliberately has no `regions` key.

### Deployment protection is on by default

New projects enable SSO protection, so the URL returns a 302 to a Vercel
login. For a public demo, turn it off:

```bash
vercel project protection disable prevsol-digital-demo --sso --scope <team>
```

### Watch the auto-created Git link

`vercel link` may attach an unrelated GitHub repository if one is detected.
That happened here and had to be removed before deploys behaved. Check
**Settings → Git** in the dashboard if deployments start failing oddly.
