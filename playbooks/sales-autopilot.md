# 6 Agents Selling Websites on Autopilot

> Based on [@everestchris6's workflow](https://x.com/everestchris6/status/2025291876052738163) — verified, expanded, and made beginner-friendly for Maxxer Academy

---

## Overview

This playbook walks you through building a fully automated website sales machine using six OpenClaw AI agents working in sequence — every single day, without you lifting a finger. The system **finds local businesses that don't have a website**, **builds a custom demo site for them automatically**, **sends personalized outreach with a live preview and payment link**, and **handles objections and closes the sale**. When payment lands, a final agent delivers the site and follows up for testimonials.

Most local businesses — restaurants, plumbers, barbershops, boutiques — still don't have a professional web presence. This system finds them, pitches them, and collects payment on autopilot. Based on community reports, operators running this system are generating **$3,000–$8,000/month** from recurring website hosting fees and one-time build payments, typically within the first 30–60 days of setup.

- **Difficulty:** Intermediate
- **Setup time:** 3–5 hours (first time)
- **Monthly cost:** ~$80–120/mo (breakdown below)
- **Revenue potential:** $3K–$8K/month at scale

---

## Prerequisites

Before you start, you'll need all of the following:

- [ ] **Mac running macOS** (Intel or Apple Silicon) — or Linux/WSL2 on Windows
- [ ] **OpenClaw installed** → [docs.openclaw.ai](https://docs.openclaw.ai) | [openclaw.ai/install.sh](https://openclaw.ai)
- [ ] **Anthropic API key** → [console.anthropic.com](https://console.anthropic.com) (~$20–50/mo estimated for this workflow)
- [ ] **Google Cloud account + Places API key** → [console.cloud.google.com](https://console.cloud.google.com) ($200 free credit/mo — usually covers this workflow)
- [ ] **Vercel account (free Hobby plan)** → [vercel.com](https://vercel.com) (free for this use case)
- [ ] **Stripe account** → [stripe.com](https://stripe.com) (free to create; 2.9% + $0.30 per transaction)
- [ ] **GitHub account** → [github.com](https://github.com) (free — used by Vercel for deployments)
- [ ] **Email account for outreach** — a dedicated Gmail or similar (free)
- [ ] **Node.js 22+** — installed automatically by OpenClaw if missing
- [ ] **Terminal comfort** — you need to be able to type commands. No coding required.

> ⚠️ **Security note:** ClawHub is a public marketplace with thousands of community skills. As of early 2026, Hacker News and The Hacker News have both reported malicious skills uploaded to ClawHub. **Only install skills from trusted publishers with verified names.** This guide lists only the official/verified skill names — double-check the publisher before installing anything.

---

## The 6 Agents — What Each Does

### Agent 1: Scout 🔍
**Purpose:** Finds and scores local businesses that don't have a website

**How it works:**
The Scout agent wakes up daily (via a cron job you'll set up). It queries the **Google Places API** for local businesses in your target city and niche — think "restaurants in Austin TX" or "plumbers in Chicago IL." For each business it finds, it checks whether they have a website URL in the Places data. Businesses with no website (or a weak/broken site) get added to a leads list with their name, phone number, address, category, and a lead score based on factors like review count, rating, and business size.

**Tools needed:**
- `google-maps-b2b-extractor` skill (exists on ClawHub ✅)
  ```bash
  npx clawhub@latest install google-maps-b2b-extractor
  ```
- `web-scraper-as-a-service` skill for validating existing websites (exists on ClawHub ✅)
  ```bash
  npx clawhub@latest install web-scraper-as-a-service
  ```

**What to put in your SOUL.md for this agent:**
```
You are a lead generation specialist. Every morning at 8am, search for [NICHE] businesses in [CITY, STATE] using the Google Places API. 

For each business found:
1. Check if they have a working website URL in their Places data
2. Visit that URL if it exists and assess quality (broken, outdated, or missing = good lead)
3. Score them 1-10 (10 = perfect lead: no website, high reviews, local business)
4. Add qualifying leads (score 7+) to leads.json in your workspace

Output format per lead:
{
  "name": "Business Name",
  "phone": "+1...",
  "address": "...",
  "category": "restaurant",
  "google_rating": 4.5,
  "review_count": 120,
  "website": null,
  "score": 9,
  "status": "new"
}
```

**Example prompt to give the agent:**
> "Scout new leads for today. Search for barbershops and hair salons in Denver CO. Find all businesses with no website or a broken website. Score each lead and add qualifying ones to leads.json. Target 20 new leads per day."

---

### Agent 2: Builder 🏗️
**Purpose:** Automatically builds a custom demo website for each qualified lead

**How it works:**
The Builder reads the leads.json file that Scout created. For each new lead with status "new", it generates a complete, professional HTML/CSS website tailored to that business — using the business name, category, location, and any details from Google Places (photos, hours, phone). It then deploys that site to **Vercel** with a unique subdomain (e.g., `mike-barbershop-denver.vercel.app`). The lead's status is updated to "site_built" and the preview URL is stored.

**Tools needed:**
- `vercel-deploy` skill (exists on ClawHub ✅)
  ```bash
  npx clawhub@latest install vercel-deploy
  ```
- Built-in `write` and `exec` tools (already in OpenClaw)

**What to put in your SOUL.md for this agent:**
```
You are a web developer. Read leads.json and find all leads with status "new".

For each new lead:
1. Generate a complete, mobile-first HTML website for their business
   - Use their business name, category, location, phone number
   - Include sections: Hero, About, Services, Contact, Google Map embed
   - Make it look professional — use a color scheme appropriate for their industry
   - Add a "Get in touch" button with their phone number
2. Save the HTML to ./sites/{business-slug}/index.html
3. Deploy to Vercel using the vercel CLI
4. Update leads.json: set status to "site_built", add preview_url

Use clean, modern HTML5 + embedded CSS. No frameworks needed. The site must look great on mobile.
```

**Example prompt to give the agent:**
> "Build demo websites for all leads with status 'new' in leads.json. Create professional, industry-appropriate designs. Deploy each to Vercel and record the preview URLs."

---

### Agent 3: Pitcher ✉️
**Purpose:** Sends personalized outreach emails to each business with their demo site link and a payment link

**How it works:**
The Pitcher reads leads with status "site_built" and crafts a personalized cold email for each one. The email includes: a compliment about their business, a note that you built them a free demo website, the actual preview URL so they can see it live, a simple Stripe payment link to claim it for $X/month, and a clear call to action. The email is sent via your configured email account (Himalaya or Gmail).

**Tools needed:**
- `himalaya` skill (exists on ClawHub ✅) — for sending email via SMTP
  ```bash
  npx clawhub@latest install himalaya
  ```
- Alternative: `email-send` skill (also exists on ClawHub ✅)
  ```bash
  npx clawhub@latest install email-send
  ```

**What to put in your SOUL.md for this agent:**
```
You are a sales copywriter and outreach specialist. Read leads.json and find all leads with status "site_built".

For each lead:
1. Write a short, personal cold email (under 150 words)
   - Start with their first name or business name
   - Mention something specific about their business (category, location)
   - Tell them you built a free website demo for them
   - Include their preview_url as a live link
   - Include the Stripe payment link: [STRIPE_PAYMENT_LINK]
   - Keep it warm, human, not salesy
2. Send the email to their contact email (look it up from Google Places data if not already in leads.json)
3. Update leads.json: set status to "outreach_sent", record sent_at timestamp

Subject line formula: "I made [Business Name] a free website — take a look"
```

**Example prompt to give the agent:**
> "Send outreach emails for all leads with status 'site_built'. Personalize each email. Use the preview URL from leads.json. Send via the outreach email account configured in Himalaya."

---

### Agent 4: Closer 💬
**Purpose:** Monitors replies, handles objections, and closes the sale

**How it works:**
The Closer is the most intelligent agent. It monitors the outreach inbox for replies. When someone replies — whether they're interested, skeptical, or have questions — the Closer reads the context (which business, what demo they saw) and crafts a tailored response. It handles common objections like "I already have a website" (offer to upgrade it), "how much does it cost?" (send payment link again), or "I'm not sure I need this" (show mobile-first stats for their industry). When someone pays, Stripe sends a webhook and the lead status updates automatically.

**Tools needed:**
- `himalaya` skill for reading replies (already installed ✅)
- `postiz` skill for scheduling follow-up posts if using social media (exists on ClawHub ✅)
  ```bash
  npx clawhub@latest install postiz
  ```

**What to put in your SOUL.md for this agent:**
```
You are a sales closer. Your job is to convert warm leads into paying customers.

Every 2 hours, check the outreach inbox for replies to our website pitches.

For each reply:
1. Find the matching lead in leads.json
2. Read their business details and the demo site we sent them
3. Craft a personalized, helpful response that:
   - Answers their specific question or concern
   - Reincludes the Stripe payment link if they're interested
   - Is warm and human, not pushy
   - Offers a 7-day free trial if they're on the fence

Common objections and responses:
- "I already have a website" → "Great! We can upgrade or optimize what you have."
- "How much?" → "Just $[PRICE]/month. Here's the payment link: [LINK]"
- "I need to think about it" → "No rush! Your demo will stay live for 7 days."

Update leads.json status to "replied", "negotiating", or "closed" as appropriate.
```

**Example prompt to give the agent:**
> "Check the outreach inbox for replies. For each reply, match it to a lead in leads.json and send a personalized, helpful response. Close any warm leads by resending the payment link."

---

### Agent 5: Deliverer 🚀
**Purpose:** When payment is received, delivers the live site, transfers ownership, and onboards the client

**How it works:**
The Deliverer watches for Stripe payment webhooks (or you configure a daily check). When payment is confirmed, it: (1) migrates the demo site from the temp subdomain to a proper custom domain or a branded URL, (2) sends a welcome email with login credentials and next steps, (3) schedules a quick check-in, and (4) adds the client to a simple CRM in a spreadsheet or Airtable (optional). The lead status updates to "delivered".

**Tools needed:**
- `vercel-deploy` skill (already installed ✅)
- `email-send` or `himalaya` skill (already installed ✅)
- `stripe` skill for webhook monitoring (exists on ClawHub ✅)
  ```bash
  npx clawhub@latest install stripe
  ```

**What to put in your SOUL.md for this agent:**
```
You are an onboarding specialist. Check for new Stripe payments every morning.

For each confirmed payment:
1. Find the matching lead in leads.json (match by email or business name)
2. Update the Vercel deployment with a custom domain if they provided one, or move to a branded subdomain: [businessslug].youragency.com
3. Send a welcome email:
   - Thank them for their purchase
   - Include their live site URL
   - Include instructions for requesting changes (reply to this email)
   - Mention their monthly renewal date
4. Update leads.json: status = "delivered", add delivered_at, site_url, payment_amount

Keep the welcome email warm and professional.
```

**Example prompt to give the agent:**
> "Check for any new Stripe payments since yesterday. For each payment, onboard the client: update their site URL, send a welcome email, and update leads.json."

---

### Agent 6: Nurture 🌱
**Purpose:** Keeps the relationship warm, requests testimonials, and generates upsell opportunities

**How it works:**
The Nurture agent handles the long-term relationship. 30 days after delivery, it sends a check-in email. 60 days after, it asks for a Google review or testimonial. It monitors site uptime (basic ping check). It also identifies upsell opportunities — clients who mention wanting more features, e-commerce, booking systems, etc. — and drafts a custom proposal. This agent keeps retention high and grows revenue per client.

**Tools needed:**
- `himalaya` or `email-send` skill (already installed ✅)
- `postiz` skill for posting client testimonials on social (optional, ✅ exists)
- `x-twitter` skill for outreach/posting (exists on ClawHub ✅)
  ```bash
  npx clawhub@latest install x-twitter
  ```

**What to put in your SOUL.md for this agent:**
```
You are a client success manager. Your job is to keep clients happy and grow accounts.

Every day at 9am, review delivered clients in leads.json:

1. 30-day check-in: Send a warm check-in email to clients who were delivered 30 days ago
   - "How is the site performing for you? Any changes needed?"

2. 60-day testimonial request: Ask clients delivered 60 days ago for a Google review
   - "Would you be willing to leave us a quick review? Here's the link: [LINK]"

3. Monitor site uptime: Do a quick ping check on each client's site URL
   - If a site is down, alert immediately and attempt to redeploy

4. Upsell opportunities: If a client has replied mentioning wanting features (booking, shop, etc.),
   draft a custom proposal and add to upsell_pipeline.json

Update leads.json with last_checkin_at, testimonial_requested_at, etc.
```

**Example prompt to give the agent:**
> "Run your daily nurture routine. Send 30-day check-ins to appropriate clients, request testimonials from 60-day clients, and check all site URLs are live."

---

## Step-by-Step Setup

### Step 1: Install OpenClaw

Open Terminal and run the one-line installer:

```bash
curl -fsSL https://openclaw.ai/install.sh | bash
```

This installs OpenClaw globally and launches the onboarding wizard. Follow the prompts — it will:
- Install Node.js 22+ if you don't have it
- Set up your workspace at `~/.openclaw/workspace`
- Ask for your Anthropic API key
- Start the gateway daemon

After installation, verify it's working:

```bash
openclaw doctor         # checks for config issues
openclaw status         # shows gateway status
openclaw dashboard      # opens browser UI at localhost:3333
```

> **Troubleshooting:** If `openclaw` is not found after install, add it to your PATH:
> ```bash
> export PATH="$(npm prefix -g)/bin:$PATH"
> ```
> Add that line to `~/.zshrc` (Mac) or `~/.bashrc` (Linux) to make it permanent.

---

### Step 2: Set Up Your Project Workspace

Create a dedicated workspace for this sales system:

```bash
# Create your workspace directory
mkdir -p ~/sites-on-autopilot
cd ~/sites-on-autopilot

# Create the leads tracking file
cat > leads.json << 'EOF'
[]
EOF

# Create a sites directory
mkdir -p sites

# Create a logs directory  
mkdir -p logs
```

---

### Step 3: Install Required Skills

All of these skills have been verified to exist on ClawHub as of March 2026:

```bash
# Lead generation — finds businesses on Google Maps
npx clawhub@latest install google-maps-b2b-extractor

# Web scraping — validates existing websites  
npx clawhub@latest install web-scraper-as-a-service

# Vercel deployment — deploys sites automatically
npx clawhub@latest install vercel-deploy

# Email — sends outreach and reads replies
npx clawhub@latest install himalaya

# Stripe — monitors payments
npx clawhub@latest install stripe

# Social scheduling (optional, for Nurture agent)
npx clawhub@latest install postiz

# Twitter/X (optional, for social proof)
npx clawhub@latest install x-twitter
```

> **Skills that DON'T exist on ClawHub (as of March 2026):**
> - `google-places` — use `google-maps-b2b-extractor` instead ✅
> - `stripe-webhooks` — use `stripe` (the native Stripe skill) instead ✅
> - `website-builder` — the Builder agent uses OpenClaw's native file write + exec tools instead (no skill needed)

---

### Step 4: Configure API Keys

You need four API keys. Here's exactly where to get each one:

#### Anthropic API Key (powers all agents)
1. Go to [console.anthropic.com](https://console.anthropic.com)
2. Create account → API Keys → Create Key
3. Copy the key (starts with `sk-ant-`)
4. Add to OpenClaw:
```bash
openclaw config set anthropic.apiKey "sk-ant-YOUR_KEY_HERE"
```

#### Google Places API Key (Scout agent)
1. Go to [console.cloud.google.com](https://console.cloud.google.com)
2. Create a new project → Enable "Places API (New)"
3. Go to APIs & Services → Credentials → Create Credentials → API Key
4. Copy the key
5. Add to your workspace's `.env` file:
```bash
echo 'GOOGLE_PLACES_API_KEY=YOUR_KEY_HERE' >> ~/sites-on-autopilot/.env
```
> Google gives you **$200 free credit per month** — more than enough for this workflow at low volume.

#### Vercel Token (Builder + Deliverer agents)
1. Go to [vercel.com/account/tokens](https://vercel.com/account/tokens)
2. Create a new token → Copy it
3. Install Vercel CLI and log in:
```bash
npm install -g vercel
vercel login
```

#### Stripe Payment Link + Webhook (Deliverer agent)
1. Go to [stripe.com](https://stripe.com) → Create account
2. Dashboard → Payment Links → Create Link
3. Set the price (e.g., $49/month recurring)
4. Copy the payment link — paste it into your Pitcher agent's SOUL.md
5. For webhooks: Dashboard → Developers → Webhooks → Add endpoint
   - URL: your OpenClaw webhook URL (from `openclaw webhook status`)
   - Events: `payment_intent.succeeded`, `checkout.session.completed`

#### Email (Pitcher + Closer agents)
Configure Himalaya with your outreach email:
```bash
# Install himalaya CLI
npx clawhub@latest install himalaya

# Follow the interactive setup
himalaya account add
```
For Gmail: enable App Passwords in Google Security settings → use your App Password as the SMTP password.

---

### Step 5: Write Your SOUL.md

The SOUL.md file is your agent's personality and standing instructions. Create one for this sales system:

```bash
cat > ~/.openclaw/workspace/SOUL.md << 'SOUL'
# SOUL.md — Sales Autopilot Agent

You are a professional website sales agent. You run 6 tasks on a schedule to find local businesses without websites, build them demo sites, pitch them, close sales, and nurture client relationships.

## Your mission
Sell affordable professional websites to local businesses in [YOUR TARGET CITY] — starting with [YOUR TARGET NICHE, e.g., restaurants, barbershops, plumbers].

## Your pricing
- Basic website: $49/month (recurring)
- One-time setup fee: $199 (optional)
- Your Stripe payment link: [PASTE YOUR STRIPE LINK HERE]

## Your target niche
City: [YOUR CITY, e.g., Austin TX]
Niche: [YOUR NICHE, e.g., restaurants]
Daily lead target: 20 new leads

## Your tone
Warm, helpful, human. Never spammy. You're offering something genuinely valuable — most local businesses desperately need a website and don't know where to start.

## Your workspace
- Leads database: ~/sites-on-autopilot/leads.json
- Built sites: ~/sites-on-autopilot/sites/
- Logs: ~/sites-on-autopilot/logs/

## Your schedule
- 8:00 AM: Scout runs (find new leads)
- 9:00 AM: Builder runs (build demo sites for new leads)
- 10:00 AM: Pitcher runs (send outreach emails)
- Every 2 hours: Closer checks inbox for replies
- 6:00 PM: Deliverer checks for new payments
- 9:00 AM daily: Nurture runs for existing clients

## Important rules
- Never send more than 20 cold emails per day (avoids spam filters)
- Always personalize each email — no copy-paste blasts
- Always update leads.json after each action
- If a site deploy fails, log the error and skip to the next lead
SOUL
```

> 🔧 **Customize the placeholders:** Replace `[YOUR TARGET CITY]`, `[YOUR TARGET NICHE]`, and `[PASTE YOUR STRIPE LINK HERE]` with your actual values before proceeding.

---

### Step 6: Set Up Agent Workflows (Cron + Heartbeat)

This is where the magic happens. You'll set up automated cron jobs that run each agent on a schedule.

#### Configure the heartbeat (Closer agent — checks email every 2 hours)

Edit `~/.openclaw/openclaw.json` to add heartbeat settings:

```json5
{
  agents: {
    defaults: {
      heartbeat: {
        every: "2h",
        target: "last",
        activeHours: { start: "07:00", end: "22:00" }
      }
    }
  }
}
```

Create the HEARTBEAT.md checklist:
```bash
cat > ~/.openclaw/workspace/HEARTBEAT.md << 'HB'
# Heartbeat checklist

- Check the outreach email inbox for any replies to website pitches
- For each new reply, find the matching lead in ~/sites-on-autopilot/leads.json and send a personalized response
- Check if any leads have been marked "negotiating" and need a follow-up (2+ days since last reply)
- Check Stripe for any new payments in the last 2 hours
HB
```

#### Schedule the 6 agents with cron jobs

```bash
# Agent 1: Scout — runs at 8am daily
openclaw cron add \
  --name "Scout: Find New Leads" \
  --cron "0 8 * * *" \
  --session isolated \
  --message "Run the Scout routine: search Google Places API for [NICHE] businesses in [CITY, STATE] with no website. Target 20 new qualifying leads. Add them to ~/sites-on-autopilot/leads.json with status 'new'." \
  --announce

# Agent 2: Builder — runs at 9am daily (after Scout)
openclaw cron add \
  --name "Builder: Create Demo Sites" \
  --cron "0 9 * * *" \
  --session isolated \
  --message "Run the Builder routine: read ~/sites-on-autopilot/leads.json and build a demo website for each lead with status 'new'. Deploy each to Vercel. Update leads.json with preview_url and status 'site_built'." \
  --announce

# Agent 3: Pitcher — runs at 10am daily
openclaw cron add \
  --name "Pitcher: Send Outreach" \
  --cron "0 10 * * *" \
  --session isolated \
  --message "Run the Pitcher routine: read ~/sites-on-autopilot/leads.json and send personalized outreach emails to each lead with status 'site_built'. Include their preview URL and the Stripe payment link. Update status to 'outreach_sent'." \
  --announce

# Agent 5: Deliverer — runs at 6pm daily
openclaw cron add \
  --name "Deliverer: Process Payments" \
  --cron "0 18 * * *" \
  --session isolated \
  --message "Run the Deliverer routine: check Stripe for new payments since yesterday. For each payment, find the matching lead, send a welcome email, update their Vercel deployment, and set status to 'delivered' in leads.json." \
  --announce

# Agent 6: Nurture — runs at 9am daily
openclaw cron add \
  --name "Nurture: Client Relations" \
  --cron "5 9 * * *" \
  --session isolated \
  --message "Run the Nurture routine: check leads.json for clients needing 30-day check-ins or 60-day testimonial requests. Send appropriate emails. Check all delivered sites are online. Log any issues." \
  --announce
```

> Note: Agent 4 (Closer) runs via the heartbeat every 2 hours — not as a separate cron job — since it needs to respond quickly to replies.

#### Verify your cron jobs are set up:

```bash
openclaw cron list
```

You should see all 5 cron jobs listed.

---

### Step 7: Test & Launch

Before going live, test each component individually:

#### Test 1: Scout agent manually
```bash
openclaw run "Run the Scout routine: search for 3 test barbershops in Austin TX. Don't save to leads.json yet — just show me the results."
```
Expected output: A list of 3 businesses with scores and details.

#### Test 2: Builder agent manually
Add one test lead to leads.json:
```bash
cat > ~/sites-on-autopilot/leads.json << 'EOF'
[
  {
    "name": "Mike's Test Barbershop",
    "phone": "+15551234567",
    "address": "123 Main St, Austin TX",
    "category": "barbershop",
    "google_rating": 4.8,
    "review_count": 45,
    "website": null,
    "score": 9,
    "status": "new"
  }
]
EOF
```
Then run:
```bash
openclaw run "Run the Builder routine on ~/sites-on-autopilot/leads.json. Build a test site for the one lead with status 'new'. Deploy to Vercel. Report the preview URL."
```

#### Test 3: Email (Pitcher + Closer)
```bash
# Send yourself a test email
openclaw run "Send a test email to [YOUR EMAIL] with subject 'Test from OpenClaw' and body 'This is a test of the Pitcher agent.'"
```

#### Test 4: Full dry run
Once each component works, run a full dry run with 3 leads:
```bash
openclaw run "Run the full Scout → Builder → Pitcher sequence with 3 leads in Austin TX barbershops. Build the sites, generate the emails, but DON'T send the emails yet — show me previews of each email first."
```

#### Test 5: Verify cron jobs fire
```bash
# Force the Scout job to run now (for testing)
openclaw cron run "Scout: Find New Leads"

# Check the logs
openclaw logs --tail 50
```

#### Go live
Once everything is tested:
1. Confirm your Stripe payment link is live
2. Confirm your email account is configured in Himalaya
3. Confirm your SOUL.md has your real city, niche, and Stripe link
4. Start the gateway in background mode:
```bash
openclaw gateway start
```

Monitor the first few days manually before fully trusting it to run autonomously.

---

## Cost Breakdown

| Item | Monthly Cost | Notes |
|------|-------------|-------|
| Anthropic API (Claude Sonnet) | ~$20–50 | $3/M input, $15/M output tokens. Depends on volume |
| Google Places API | $0–10 | $200 free credit/mo; ~$0.004/request |
| Vercel (Hobby plan) | $0 | Free for hobby/non-commercial. Pro is $20/mo if needed |
| Stripe | 2.9% + $0.30/tx | No monthly fee. Pure per-transaction |
| Postiz (Standard) | $29 | Optional — only if using social media scheduling |
| Domain (optional) | $1–12 | If you want branded client URLs |
| **Total (minimal)** | **~$20–50/mo** | |
| **Total (with Postiz)** | **~$50–80/mo** | |

**Revenue vs Cost Example:**
- 10 clients at $49/mo = $490/month recurring
- Minus costs: ~$50/mo
- **Net: ~$440/month** from 10 clients

At 50 clients: ~$2,450/month net. At 100 clients: ~$4,850/month net.

---

## Common Issues & Fixes

### "Scout isn't finding businesses"
- **Check:** Is your Google Places API key active and the Places API enabled?
- **Fix:** Go to [console.cloud.google.com](https://console.cloud.google.com) → your project → APIs → Make sure "Places API (New)" is enabled
- **Check:** Is your API key in the environment? `cat ~/sites-on-autopilot/.env`

### "Builder fails to deploy to Vercel"
- **Check:** Are you logged in to Vercel? Run `vercel whoami`
- **Fix:** Run `vercel login` and authenticate
- **Check:** Is the `vercel` CLI installed globally? Run `vercel --version`
- **Fix:** `npm install -g vercel`

### "Emails going to spam"
- **Fix:** Use a dedicated outreach Gmail with a warmed-up domain (send manual emails for 2 weeks before bulk outreach)
- **Fix:** Keep email volume under 20/day when starting
- **Fix:** Never use the word "free" in subject lines (triggers spam filters)
- **Alternative:** Consider [lemlist.com](https://lemlist.com) or [instantly.ai](https://instantly.ai) for email warming

### "Closer isn't reading replies correctly"
- **Check:** Is Himalaya configured to read from the correct inbox?
- **Fix:** Run `himalaya envelope list` to verify you can read emails manually
- **Check:** Is your email polling the right folder (Inbox vs All Mail)?

### "Stripe payments aren't being detected"
- **Check:** Is the Stripe webhook configured? Go to Stripe Dashboard → Developers → Webhooks
- **Fix:** Run `openclaw webhook status` to get your webhook URL, then add it in Stripe
- **Alternative:** Have the Deliverer agent do a daily Stripe API poll instead of relying on webhooks

### "Leads.json keeps growing but nothing is converting"
- **Fix:** Review your email copy. The most common issue is generic, salesy copy. Make emails hyper-specific to the business.
- **Fix:** Try a lower price point ($29/mo) for the first few clients to build testimonials
- **Fix:** Add a stronger CTA — offer a 7-day free trial

### "OpenClaw isn't waking up for cron jobs"
- **Check:** Is the gateway running? `openclaw status`
- **Fix:** `openclaw gateway restart`
- **Check:** Are cron jobs scheduled? `openclaw cron list`

### "npx clawhub@latest install fails"
- **Fix:** Make sure you have Node.js 22+: `node --version`
- **Fix:** Try with sudo if on Linux: `sudo npx clawhub@latest install [skill-name]`
- **Security check:** Only install skills from the verified names in this guide

---

## Links — Verified Working (March 2026)

### Core Tools
- **OpenClaw docs:** https://docs.openclaw.ai
- **OpenClaw install:** https://openclaw.ai/install.sh (Mac/Linux)
- **OpenClaw multi-agent guide:** https://docs.openclaw.ai/concepts/multi-agent
- **OpenClaw cron guide:** https://docs.openclaw.ai/automation/cron-jobs
- **OpenClaw heartbeat guide:** https://docs.openclaw.ai/gateway/heartbeat
- **ClawHub skill registry:** https://clawhub.ai/skills

### ClawHub Skills (verified ✅)
- `google-maps-b2b-extractor`: https://clawhub.ai/skills?q=google-maps-b2b-extractor
- `web-scraper-as-a-service`: https://clawhub.ai/skills?q=web-scraper-as-a-service
- `vercel-deploy`: https://clawhub.ai/skills?q=vercel-deploy
- `himalaya`: https://clawhub.ai/skills?q=himalaya
- `stripe`: https://clawhub.ai/skills?q=stripe
- `postiz`: https://clawhub.ai/skills?q=postiz
- `x-twitter`: https://clawhub.ai/skills?q=x-twitter

### Payment & Hosting
- **Stripe:** https://stripe.com (2.9% + $0.30/tx, no monthly fee)
- **Stripe payment links:** https://stripe.com/docs/payment-links
- **Vercel pricing:** https://vercel.com/pricing (Hobby plan: free)
- **Vercel deploy docs:** https://vercel.com/docs/deployments/overview

### APIs
- **Anthropic Console:** https://console.anthropic.com
- **Anthropic API pricing:** https://platform.claude.com/docs/en/about-claude/pricing
  - Claude Sonnet 4.6: $3/M input, $15/M output
  - Claude Haiku: $1/M input, $5/M output (cheaper for high-volume tasks)
- **Google Maps Platform:** https://mapsplatform.google.com
- **Google Places API pricing:** https://developers.google.com/maps/documentation/places/web-service/usage-and-billing
- **Google Cloud Console:** https://console.cloud.google.com

### Social Scheduling
- **Postiz:** https://postiz.com (open-source social scheduler)
- **Postiz pricing:** https://postiz.com/pricing ($29/mo Standard, can self-host free)

### Source Tweets
- **Original thread (Agent breakdown):** https://x.com/everestchris6/status/2025291876052738163
- **Second tweet (System overview):** https://x.com/everestchris6/status/2025995047729254701

---

## Next Steps & Scaling

Once you have this running and making money, here's how to scale:

1. **Expand niches:** Start new Scout agents for different niches (plumbers, dentists, gyms)
2. **Expand cities:** Target multiple cities simultaneously
3. **Add social proof:** Use Postiz to auto-post client testimonials on X/Twitter — drives inbound leads
4. **Raise prices:** Once you have 10+ happy clients, raise to $79–99/month for new clients
5. **Hire a VA:** Once you're at $3K/month, hire a virtual assistant to handle edge cases the Closer misses
6. **White-label:** Offer the same system to marketing agencies under their brand

---

*Playbook written for Maxxer Academy. Last verified: March 2026.*
*Source: @everestchris6 on X. All tool links and prices verified at time of writing.*
