# Prevsol Digital — Operations Runbook

Everything needed to take this platform from a repository to a live, paid,
operating business. Follow it top to bottom the first time.

**Estimated running cost: about $7–8/month**, plus Paynow's per-transaction
commission. No per-client fees, no licence, nothing that scales with growth.

---

## 0. Why this stack

We evaluated buying WHMCS and the open-source alternatives before building.
The short version:

| Option | Cost | Verdict |
|--------|------|---------|
| WHMCS | $34.95–54.95/mo + theme | Starter tier discontinued Jan 2025. Owned licences no longer sold. **Inactive clients still count** toward your tier limit. |
| Blesta | $350 owned, unlimited clients | The one worth buying *if* you ever stop wanting to own this. Keep as a hedge. |
| FOSSBilling | Free | **Rejected.** 2026 CVEs include an unauthenticated RCE and a payment bypass letting anyone mark an invoice paid. Not acceptable for money. |
| BoxBilling | Free | **Dead.** Last release 2022, unpatched RCE with public exploit. |
| This build | ~$7/mo | The portal already existed; the work was connecting a database. |

Two constraints drove the hosting decision, and both are hard:

1. **Paynow IP-whitelists merchant servers.** Serverless platforms have no
   static IP, so Vercel, Netlify and Cloudflare Workers **cannot take payments
   at all**. A VPS is not a preference here — it is a requirement.
2. **Vercel's free tier prohibits commercial use.** A client billing portal
   breaches it on day one. The real comparison was Pro at $20/mo/seat.

Johannesburg is also ~15–30 ms from Harare against ~180 ms to Europe.

---

## 1. Accounts to open

Do these first; several have approval delays.

| Service | Purpose | Cost | Notes |
|---------|---------|------|-------|
| [Vultr](https://vultr.com) or [Hetzner](https://hetzner.com) | Server | $6/mo | **Choose Johannesburg.** |
| [Paynow](https://paynow.co.zw) | Payments | Free to join | EcoCash 2.5%, cards 3.5% + $0.50. You need Integration ID + Key. |
| [Brevo](https://brevo.com) or [ZeptoMail](https://zoho.com/zeptomail) | Email | Free / ~$2.50 per 10k | Brevo free = 300/day. Resend free is only 100/mo — too small for invoice runs. |
| [Cloudflare](https://cloudflare.com) | DNS + SSL | Free | DNS only. Do not put card data behind the free tier — their terms forbid it. |
| [PostHog](https://posthog.com) | Analytics + errors | Free | 1M events + 100k errors. Sentry's free tier is only 5k errors and 1 seat. |

**Verify your payment method works before committing.** Zimbabwe is not
sanctioned — the OFAC programme ended in March 2024 — but some vendors still
over-block. You will generally need a USD FCA account with a Visa Gold or
Business card. PayPal in Zimbabwe is send-only.

---

## 2. Server setup

On a fresh Ubuntu 24.04 box in Johannesburg:

```bash
# --- as root, first login -------------------------------------------------
adduser prevsol && usermod -aG sudo prevsol
rsync --archive --chown=prevsol:prevsol ~/.ssh /home/prevsol

# Lock down SSH: disable password login, then reload.
sed -i 's/^#*PasswordAuthentication.*/PasswordAuthentication no/' /etc/ssh/sshd_config
sed -i 's/^#*PermitRootLogin.*/PermitRootLogin no/' /etc/ssh/sshd_config
systemctl reload ssh

ufw allow OpenSSH && ufw allow 80 && ufw allow 443 && ufw --force enable

# Unattended security updates.
apt update && apt install -y unattended-upgrades fail2ban
dpkg-reconfigure -plow unattended-upgrades
systemctl enable --now fail2ban
```

```bash
# --- as prevsol -----------------------------------------------------------
# Node 22 LTS
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt install -y nodejs postgresql postgresql-contrib caddy git

# Database
sudo -u postgres psql <<'SQL'
CREATE USER prevsol WITH PASSWORD 'CHANGE-THIS-TO-SOMETHING-LONG';
CREATE DATABASE prevsol OWNER prevsol;
SQL
```

> Generate the database password with
> `openssl rand -base64 24` — do not invent one by hand.

---

## 3. Deploy the app

```bash
cd /home/prevsol
git clone <your-repo-url> app && cd app/web

cp .env.example .env
nano .env          # fill in every value — see section 4

npm ci
npx prisma migrate deploy     # creates the tables
npm run db:seed               # loads the catalogue + your admin login
npm run build
```

Run it under systemd so it restarts on boot and on crash:

```bash
sudo tee /etc/systemd/system/prevsol.service > /dev/null <<'UNIT'
[Unit]
Description=Prevsol Digital
After=network.target postgresql.service

[Service]
Type=simple
User=prevsol
WorkingDirectory=/home/prevsol/app/web
EnvironmentFile=/home/prevsol/app/web/.env
ExecStart=/usr/bin/npm start
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
UNIT

sudo systemctl daemon-reload && sudo systemctl enable --now prevsol
sudo systemctl status prevsol
```

Caddy terminates TLS and gets certificates automatically:

```bash
sudo tee /etc/caddy/Caddyfile > /dev/null <<'CADDY'
prevsoldigital.com, www.prevsoldigital.com {
    reverse_proxy localhost:3000
    encode gzip zstd
    header {
        Strict-Transport-Security "max-age=31536000; includeSubDomains"
        X-Content-Type-Options "nosniff"
        X-Frame-Options "SAMEORIGIN"
        Referrer-Policy "strict-origin-when-cross-origin"
    }
}
CADDY

sudo systemctl reload caddy
```

Point your DNS A record at the server IP. Caddy issues the certificate within
about a minute of the record resolving.

---

## 4. Environment variables

Copy `.env.example` to `.env` and fill it in. The essentials:

```bash
DATABASE_URL="postgresql://prevsol:PASSWORD@localhost:5432/prevsol"
NEXT_PUBLIC_SITE_URL="https://prevsoldigital.com"
AUTH_SECRET="<node -e \"console.log(require('crypto').randomBytes(32).toString('hex'))\">"
CRON_SECRET="<another random 32-byte hex string>"

SMTP_HOST="smtp-relay.brevo.com"
SMTP_PORT="587"
SMTP_USER="<from your provider>"
SMTP_PASSWORD="<from your provider>"
EMAIL_FROM="Prevsol Digital <noreply@prevsoldigital.com>"
EMAIL_TO="sales@prevsoldigital.com"

PAYNOW_INTEGRATION_ID="<from paynow.co.zw>"
PAYNOW_INTEGRATION_KEY="<from paynow.co.zw>"

SEED_ADMIN_EMAIL="admin@prevsoldigital.com"
SEED_ADMIN_PASSWORD="<at least 12 characters>"
```

`.env` is gitignored. **Never commit it.** After seeding, blank out
`SEED_ADMIN_PASSWORD`.

If SMTP is left unset the site still runs — forms save to the database and the
would-be email is logged instead. Nothing is lost, but nobody is notified, so
set it before launch.

---

## 5. Email deliverability

Invoice email that lands in spam is worse than no email. Add all three DNS
records your provider gives you:

- **SPF** — `TXT @` authorising your provider to send as your domain.
- **DKIM** — the `TXT` record signing your outgoing mail.
- **DMARC** — start at `v=DMARC1; p=none; rua=mailto:you@prevsoldigital.com`,
  watch the reports for a fortnight, then tighten to `p=quarantine`.

Send a test to [mail-tester.com](https://mail-tester.com) and fix anything
below 8/10 before launch.

---

## 6. Paynow

1. Sign in at paynow.co.zw → Integrations → create one for your site.
2. Copy the **Integration ID** and **Integration Key** into `.env`.
3. Set the Result URL to `https://prevsoldigital.com/api/paynow/callback`.
4. **Give them your server's static IP for whitelisting.** Payments will fail
   without this.

The implementation verifies Paynow's hash on every callback *and*
independently polls their API before marking anything paid — a forged callback
cannot mark an invoice settled.

**Before going live**, confirm with Paynow directly how their USD and ZWG
Integration IDs work. Their documentation still refers to "ZWL", which was
replaced by ZWG. This is unresolved and affects what currency you can collect.

---

## 7. Scheduled jobs

The nightly job marks invoices overdue, suspends services 7 days past due,
raises renewal invoices 14 days ahead, and warns about expiring domains.

```bash
crontab -e
```

```cron
# Nightly billing, 02:00 CAT
0 2 * * * curl -fsS -H "Authorization: Bearer YOUR_CRON_SECRET" https://prevsoldigital.com/api/cron/billing >> /home/prevsol/cron.log 2>&1
```

The endpoint rejects anything without the correct `CRON_SECRET`, so it cannot
be triggered from outside.

---

## 8. Backups

**Financial records. Test the restore, not just the backup.**

```bash
mkdir -p /home/prevsol/backups

cat > /home/prevsol/backup.sh <<'SH'
#!/bin/bash
set -euo pipefail
STAMP=$(date +%Y%m%d-%H%M)
pg_dump -U prevsol prevsol | gzip > "/home/prevsol/backups/prevsol-$STAMP.sql.gz"
# Keep 30 days locally.
find /home/prevsol/backups -name '*.sql.gz' -mtime +30 -delete
SH

chmod +x /home/prevsol/backup.sh
```

```cron
# Nightly database backup, 03:00
0 3 * * * /home/prevsol/backup.sh
```

**Get them off the box.** A backup on the same server does not survive losing
the server. Use `rclone` to a cheap object store, or Vultr's own backups at
about $1.20/mo:

```bash
sudo apt install -y rclone
rclone config          # configure a remote once
# then add to backup.sh:
#   rclone copy /home/prevsol/backups remote:prevsol-backups
```

Restore drill — do this once now, so you know it works:

```bash
gunzip -c backups/prevsol-YYYYMMDD-HHMM.sql.gz | psql -U prevsol prevsol_restore_test
```

---

## 9. Domains: what is and is not automated

**`.co.zw` cannot be automated.** ZISPA runs the registry by **email** —
registrars send a template to `admin@zispa.org.zw` and it is processed
manually, usually within a working day. There is no API, no EPP, no RDAP, and
no WHOIS on port 43. Any tool claiming otherwise is an email robot.

The site handles this honestly: a `.co.zw` order creates a **request**, emails
your team an action alert, and shows the client a 1–3 working day SLA. The
domain shows as `PENDING` until you mark it active.

Costs, for your margins:

- ZISPA charges **$35/domain/yr to non-member registrars**; members pay less.
- Local retail sits at **$3–8/yr**, so join ZISPA or partner with a member.
- International proxies charge **$142–350/yr** — never route clients through
  them.
- Register in the **client's** name to keep the resident rate. Some registrars
  charge non-residents $49.99 against $9.99 for residents.

For international TLDs, when you are ready: **NameSilo** or **Porkbun** have
$0 entry and free REST APIs. Avoid Namecheap's API for reselling — it gives no
wholesale discount. Note Verisign raises wholesale `.com` to **$10.97 on
1 November 2026**; price against that, not $10.26.

---

## 10. Go-live checklist

**Legal and content**

- [ ] Have a practitioner review `src/content/legal.ts` before publishing.
- [ ] Confirm you may display the eight client names on the About and Data
      Protection pages.
- [ ] Verify every price in `src/content/` against your current rate card.
- [ ] Replace the generated product artwork with real photography.

**Technical**

- [ ] `NEXT_PUBLIC_SITE_URL` set to the real domain.
- [ ] `AUTH_SECRET` and `CRON_SECRET` are long random values, not placeholders.
- [ ] SPF, DKIM and DMARC published; mail-tester score 8+.
- [ ] Paynow Integration ID/Key set, Result URL configured, **server IP
      whitelisted**.
- [ ] Test payment end to end with a small real amount, then refund it.
- [ ] Backups running *and* a restore tested.
- [ ] Cron job firing (check `cron.log` the morning after).
- [ ] `SEED_ADMIN_PASSWORD` blanked from `.env` after seeding.

**Compliance — you sell this, so you must model it**

- [ ] Register as a Data Controller with POTRAZ. The deadline passed on
      12 March 2025; if you are not licensed, you are overdue.
- [ ] Complete your own ROPA before 1 September 2026.
- [ ] Confirm your appointed DPO is recorded.

---

## 11. Day-to-day

| Task | Where |
|------|-------|
| See new enquiries and quotes | `Enquiry` table, and your sales inbox |
| Answer a ticket | Portal → the client's ticket thread |
| Mark a `.co.zw` domain live | `Domain` table → set `status` to `ACTIVE` |
| Activate a service after payment | `Service` table → `status` to `ACTIVE` |
| Check the app is healthy | `sudo systemctl status prevsol` |
| Read logs | `sudo journalctl -u prevsol -f` |

Deploying an update:

```bash
cd /home/prevsol/app && git pull
cd web && npm ci && npx prisma migrate deploy && npm run build
sudo systemctl restart prevsol
```

---

## 12. Known gaps

Honest list of what is not built yet, in the order worth doing:

1. **No admin UI.** Staff work directly in the database or via `npx prisma
   studio`. This is the first thing to build next.
2. **Two-factor authentication** — the schema has `totpSecret` ready, but the
   enrolment flow is not built.
3. **Invoice PDFs** — the invoice page prints cleanly via the browser; there is
   no generated PDF file.
4. **Automated provisioning** — orders create service records, but nothing
   creates a real cPanel account. That step is manual.
5. **Client document uploads** — the Documents page is a placeholder.

None of these block taking money or serving clients. They are the next sprint.
