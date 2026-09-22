# Deploy in 30 minutes

The condensed version of [`OPERATIONS.md`](OPERATIONS.md). Follow it in order.
Anything marked **⚠️** will cost you money or downtime if skipped.

---

## Before you start — buy these

| What | Where | Cost |
|------|-------|------|
| VPS, Ubuntu 24.04, **Johannesburg** | vultr.com or hetzner.com | $6/mo |
| Domain (you may already own it) | — | ~$15/yr |
| Paynow merchant account | paynow.co.zw | Free to open |
| Brevo account | brevo.com | Free — 300 emails/day |

**⚠️ Check your card works on Vultr before going further.** Zimbabwe is not
sanctioned, but some vendors still over-block. You generally need a USD FCA
account with a Visa Gold or Business card.

---

## 1 · Point the domain (5 min, do this first)

DNS takes time to spread, so start it now.

1. Add your domain to Cloudflare (free plan).
2. Change the nameservers at your registrar to the two Cloudflare gives you.
3. Add an **A record**: `@` → your server's IP, proxy **off** (grey cloud).
4. Add an **A record**: `www` → the same IP, proxy off.

> Leave the proxy off until TLS is issued, or Caddy cannot complete the
> certificate challenge. Turn it on afterwards if you want.

---

## 2 · Prepare the server (10 min)

SSH in as root, then:

```bash
# Create a working user and lock down SSH.
adduser prevsol && usermod -aG sudo prevsol
rsync --archive --chown=prevsol:prevsol ~/.ssh /home/prevsol
sed -i 's/^#*PasswordAuthentication.*/PasswordAuthentication no/' /etc/ssh/sshd_config
sed -i 's/^#*PermitRootLogin.*/PermitRootLogin no/' /etc/ssh/sshd_config
systemctl reload ssh

# Firewall and automatic security patches.
ufw allow OpenSSH && ufw allow 80 && ufw allow 443 && ufw --force enable
apt update && apt install -y unattended-upgrades fail2ban
systemctl enable --now fail2ban

# Runtime.
curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
apt install -y nodejs postgresql caddy git

# Database.
DBPASS=$(openssl rand -base64 24)
sudo -u postgres psql -c "CREATE USER prevsol WITH PASSWORD '$DBPASS';"
sudo -u postgres psql -c "CREATE DATABASE prevsol OWNER prevsol;"
echo "SAVE THIS DATABASE PASSWORD: $DBPASS"
```

**⚠️ Copy that password now** — you need it in the next step.

---

## 3 · Deploy the app (10 min)

```bash
su - prevsol
git clone <your-repo-url> app && cd app/web
cp .env.example .env
nano .env
```

Fill in at least these:

```bash
DATABASE_URL="postgresql://prevsol:THE_PASSWORD_FROM_STEP_2@localhost:5432/prevsol"
NEXT_PUBLIC_SITE_URL="https://prevsoldigital.com"
AUTH_SECRET="<paste from: openssl rand -hex 32>"
CRON_SECRET="<paste from: openssl rand -hex 32>"

SMTP_HOST="smtp-relay.brevo.com"
SMTP_PORT="587"
SMTP_USER="<Brevo SMTP login>"
SMTP_PASSWORD="<Brevo SMTP key>"
EMAIL_FROM="Prevsol Digital <noreply@prevsoldigital.com>"
EMAIL_TO="sales@prevsoldigital.com"

PAYNOW_INTEGRATION_ID="<from paynow.co.zw>"
PAYNOW_INTEGRATION_KEY="<from paynow.co.zw>"

SEED_ADMIN_EMAIL="admin@prevsoldigital.com"
SEED_ADMIN_PASSWORD="<pick something long — 16+ characters>"
```

Then build and start:

```bash
npm ci
npm run db:migrate
npm run db:seed
npm run build
```

Install the service and web server:

```bash
sudo cp deploy/prevsol.service /etc/systemd/system/
sudo systemctl daemon-reload && sudo systemctl enable --now prevsol

sudo cp deploy/Caddyfile /etc/caddy/Caddyfile
sudo nano /etc/caddy/Caddyfile     # put your real domain at the top
sudo systemctl reload caddy
```

Visit `https://yourdomain.com`. It should be live with a valid certificate.

**⚠️ Now blank `SEED_ADMIN_PASSWORD` in `.env`** — it has done its job.

---

## 4 · Automate billing and backups (3 min)

```bash
crontab -e
```

```cron
0 2 * * * curl -fsS -H "Authorization: Bearer YOUR_CRON_SECRET" https://yourdomain.com/api/cron/billing >> /home/prevsol/cron.log 2>&1
0 3 * * * /home/prevsol/app/web/deploy/backup.sh >> /home/prevsol/backup.log 2>&1
```

```bash
chmod +x /home/prevsol/app/web/deploy/backup.sh
/home/prevsol/app/web/deploy/backup.sh     # run once to confirm it works
ls -la /home/prevsol/backups               # you should see a .sql.gz
```

**⚠️ Get backups off the box.** A backup on the server does not survive losing
the server. Configure `rclone` to any object store, or enable your provider's
snapshots (~$1.20/mo on Vultr).

---

## 5 · Email deliverability (5 min)

In Brevo, add and verify your sending domain. It gives you DNS records — add
all of them in Cloudflare:

- **SPF** (`TXT` on `@`)
- **DKIM** (`TXT`, usually on `mail._domainkey`)
- **DMARC** (`TXT` on `_dmarc`) — start with
  `v=DMARC1; p=none; rua=mailto:you@yourdomain.com`

Then send a test to [mail-tester.com](https://mail-tester.com). **⚠️ Fix
anything scoring below 8/10** — invoice email landing in spam is worse than no
email.

---

## 6 · Paynow (5 min)

1. Sign in at paynow.co.zw → Integrations → create one.
2. Copy the **Integration ID** and **Key** into `.env`, then
   `sudo systemctl restart prevsol`.
3. Set the Result URL to `https://yourdomain.com/api/paynow/callback`.
4. **⚠️ Give Paynow your server's IP address for whitelisting.** They filter by
   IP; payments fail silently without this. This is also why the app cannot run
   on Vercel or Netlify.
5. **⚠️ Ask them directly how USD and ZWG Integration IDs work.** Their public
   docs still say "ZWL", which no longer exists.

Then place a small real order, pay it, confirm the invoice flips to **Paid**,
and refund it.

---

## Done. Now what?

Sign in at `https://yourdomain.com/login` with your admin address. You land in
the client portal; go to `/admin` for the staff area.

Day to day:

| Task | Where |
|------|-------|
| New enquiries and quotes | `/admin/enquiries` |
| Confirm a bank/cash payment | `/admin/orders` → Mark paid |
| Register a `.co.zw` domain | `/admin/domains` → the pending queue |
| Activate a service after setup | `/admin/services` |
| Answer a ticket | `/admin/tickets` |

Deploying an update later:

```bash
cd /home/prevsol/app && git pull
cd web && npm ci && npm run db:migrate && npm run build
sudo systemctl restart prevsol
```

If something breaks: `sudo journalctl -u prevsol -n 100 --no-pager`
