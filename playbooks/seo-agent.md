# Autonomous SEO Agent
> Based on [@EXM7777](https://x.com/EXM7777/status/2025631181702893616) and [@michaelaubry](https://x.com/michaelaubry/status/2019911082601771315)'s workflows

---

## Overview

| | |
|-|-|
| **What** | An OpenClaw agent that autonomously handles programmatic SEO, keyword tracking, site architecture, and backlink outreach — 24/7, without you lifting a finger |
| **Results** | Keyword-optimized pages at scale, automated backlink pitch campaigns, continuous GSC monitoring, weekly performance reports to Telegram |
| **Who** | Affiliate marketers, SaaS companies, agencies, content site builders |
| **Difficulty** | Intermediate–Advanced |
| **Setup time** | 3–5 hours |
| **Monthly cost** | ~$20–50 (without Ahrefs) · ~$130–170 (with Ahrefs Lite plan subscription) |

### What This Agent Does

```
[Google Search Console] ──► keyword gaps ──► [Content Agent] ──► publish to CMS
        │                                                              │
        │                                                              ▼
[Ahrefs/DataForSEO] ──► backlink targets ──► [Outreach Bot] ──► email via himalaya
        │                                                              │
        └──────────────────── weekly Telegram report ◄────────────────┘
```

@EXM7777's original insight:
> "how to build an autonomous SEO agent inside OpenClaw: first... give it everything about your business > your site analytics > current keyword positions > what you're selling > where you want to be in 6 months — don't skip this part, context is the entire game — then you build 3 skills"

@michaelaubry's addition:
> "Built a discord bot that uses openclaw, it scans ahrefs for backlink opps, it finds emails of owners, and pitches them a link swap offer"

---

## Prerequisites

- [ ] OpenClaw installed and running (`openclaw --version`)
- [ ] Telegram connected to your OpenClaw agent (for commands + reports)
- [ ] Anthropic API key configured in OpenClaw (Claude Sonnet or Opus)
- [ ] Google Search Console account with your domain verified
- [ ] A domain/website with a CMS that has an API (WordPress, Ghost, Webflow, Strapi, etc.)
- [ ] Ahrefs account **OR** a free alternative (see [Alternatives to Ahrefs](#alternatives-to-ahrefs))
- [ ] A dedicated email address for outreach (Gmail or SMTP — don't use your primary)
- [ ] Node.js 18+ installed (for skill installation via `npx`)

---

## Three SEO Skills

Based on @EXM7777's framework, you build **three modular skills** that work together:

### Skill 1: Programmatic SEO (Pages at Scale)

**What it does:** Pulls keyword data from Google Search Console, finds content gaps by analyzing competitor SERP results, generates data-driven content briefs, writes full articles, and publishes to your CMS automatically. Runs on a weekly/daily schedule via cron.

**Core loop:**
```
GSC API → ranking data → find "striking distance" keywords (pos 10-20)
     → scrape top-10 SERP competitors → extract heading structures
     → identify content gaps → write brief → write article → publish draft
```

**Tools needed:** GSC API, web browsing (octolens skill), your CMS API

**Cron:** Weekly keyword research (Monday 9am) + Daily article generation

---

### Skill 2: Site Architecture Manager

**What it does:** Manages your internal linking graph, generates/updates your sitemap, monitors crawl errors, audits schema markup, and keeps your site architecture healthy. Runs as a background maintenance agent.

**Core loop:**
```
Crawl site → map internal links → identify orphan pages
     → suggest internal link additions → update sitemap → submit to GSC
     → audit schema markup → generate JSON-LD fixes
```

**Tools needed:** GSC API (Sitemaps + URL Inspection), schema-markup skill, fs-architect skill

**Cron:** Site crawl + architecture check (weekly, Sundays)

---

### Skill 3: Backlink Outreach Bot

**What it does:** Scans Ahrefs (or DataForSEO) for backlink opportunities, identifies domains that link to your competitors but not you, finds contact emails for site owners, sends personalized pitches, and follows up at day 3 and day 7. Based directly on @michaelaubry's Discord bot.

**Core loop:**
```
Ahrefs API → competitors' backlink profiles → find prospects
     → filter by DA/DR threshold → find owner emails (Hunter.io or scraping)
     → craft personalized pitch (not a template) → send via himalaya
     → log in tracking file → follow up automatically
```

**Tools needed:** Ahrefs API (Enterprise) OR DataForSEO Backlinks API ($50 min), himalaya (email skill), Hunter.io API (optional, for email finding)

**Cron:** Outreach (Mon/Wed/Fri, 10am) + Follow-ups (daily check)

---

## Step-by-Step Setup

### Step 1: Install OpenClaw Skills

Open your terminal and install the required skills:

```bash
# Core SEO analysis skill
npx clawdhub@latest install programmatic-seo

# Web browsing for SERP scraping
npx clawdhub@latest install octolens

# File system operations
npx clawdhub@latest install fs-architect

# Schema markup auditor
npx clawdhub@latest install schema-markup

# Email client for outreach
openclaw skill install himalaya

# Verify installs
openclaw skill list
```

> **Note:** The `himalaya` skill is pre-installed with OpenClaw. The others come via `clawdhub`.

---

### Step 2: Set Up Google Search Console API (OAuth)

GSC is **free** and gives you real click/impression/position data for every keyword your site ranks for. This is your ground truth.

#### 2a. Create a Google Cloud Project

1. Go to [console.cloud.google.com](https://console.cloud.google.com)
2. Click **New Project** → name it something like `openclaw-seo`
3. Click **Enable APIs and Services**
4. Search for **"Google Search Console API"** → Enable it

#### 2b. Create OAuth 2.0 Credentials

1. In the left sidebar: **APIs & Services → Credentials**
2. Click **+ Create Credentials → OAuth client ID**
3. Application type: **Desktop app** (easier for local agent)
4. Name: `openclaw-seo-agent`
5. Click **Create** → Download the JSON file
6. Save it to: `~/.openclaw/workspace/gsc-credentials.json`

#### 2c. Configure OAuth Consent Screen

1. Go to **APIs & Services → OAuth consent screen**
2. User type: **External** (unless you have Google Workspace)
3. App name: `OpenClaw SEO Agent`
4. Scopes to add: `https://www.googleapis.com/auth/webmasters.readonly`
5. Add your email as a test user

#### 2d. Get Your Refresh Token

Run this one-time auth flow (Node.js):

```bash
# Install Google auth library
npm install -g googleapis

# Run this script to get your refresh token
node -e "
const {google} = require('googleapis');
const fs = require('fs');
const creds = JSON.parse(fs.readFileSync('~/.openclaw/workspace/gsc-credentials.json'));
const oauth2Client = new google.auth.OAuth2(
  creds.installed.client_id,
  creds.installed.client_secret,
  'urn:ietf:params:oauth:2.0:oob'
);
const url = oauth2Client.generateAuthUrl({
  access_type: 'offline',
  scope: ['https://www.googleapis.com/auth/webmasters.readonly']
});
console.log('Visit this URL and paste the code back:');
console.log(url);
"
```

Visit the URL → authorize → copy the code → run:

```bash
node -e "
const {google} = require('googleapis');
const fs = require('fs');
const creds = JSON.parse(fs.readFileSync('~/.openclaw/workspace/gsc-credentials.json'));
const oauth2Client = new google.auth.OAuth2(
  creds.installed.client_id,
  creds.installed.client_secret,
  'urn:ietf:params:oauth:2.0:oob'
);
oauth2Client.getToken('PASTE_YOUR_CODE_HERE', (err, token) => {
  console.log('REFRESH TOKEN:', token.refresh_token);
  fs.writeFileSync('~/.openclaw/workspace/gsc-token.json', JSON.stringify(token));
});
"
```

Save the refresh token somewhere safe. Set it in OpenClaw:

```bash
openclaw config set GSC_CLIENT_ID "your-client-id"
openclaw config set GSC_CLIENT_SECRET "your-client-secret"
openclaw config set GSC_REFRESH_TOKEN "your-refresh-token"
openclaw config set GSC_SITE_URL "https://yourdomain.com/"
```

#### 2e. What You Can Pull from GSC API

| Endpoint | Data |
|----------|------|
| `searchAnalytics/query` | Clicks, impressions, CTR, position per keyword/page |
| `sitemaps/list` | All submitted sitemaps + status |
| `sitemaps/submit` | Submit new/updated sitemap |
| `urlInspection/index` | Index status, crawl errors, canonical |
| `sites/list` | All verified properties |

**Example: Pull top keywords (curl)**
```bash
curl -X POST \
  "https://www.googleapis.com/webmasters/v3/sites/https%3A%2F%2Fyourdomain.com%2F/searchAnalytics/query" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "startDate": "2026-01-01",
    "endDate": "2026-03-01",
    "dimensions": ["query"],
    "rowLimit": 100,
    "dimensionFilterGroups": [{
      "filters": [{
        "dimension": "position",
        "operator": "lessThan",
        "expression": "21"
      }]
    }]
  }'
```

---

### Step 3: Set Up Ahrefs API (OR Alternative — see below)

> ⚠️ **Important pricing note:** Ahrefs API v3 requires **Enterprise plan only** — $1,499/month (annual). The old Lite plan ($99/mo) does **not** include API access. API v2 was discontinued November 2025. **Most people should skip Ahrefs and use DataForSEO instead** (see [Alternatives](#alternatives-to-ahrefs)).

#### If you have Ahrefs Enterprise:

1. Log in to [app.ahrefs.com](https://app.ahrefs.com)
2. Go to **Account Settings → API**
3. Enable API access
4. Generate your API token
5. Set it in OpenClaw:

```bash
openclaw config set AHREFS_API_TOKEN "your-token-here"
```

**Available Ahrefs API v3 Endpoints:**

| Module | What You Can Pull |
|--------|------------------|
| Site Explorer | Backlinks, referring domains, organic keywords, domain rating |
| Keywords Explorer | Search volume, keyword difficulty, SERP features, CPC |
| SERP Overview | Top 10 results for any keyword with metrics |
| Rank Tracker | Position history for tracked keywords |
| Site Audit | Technical issues, broken links, crawl data |
| Brand Radar | Brand mentions across the web |

**Example: Get backlinks for a competitor**
```bash
curl -H "Authorization: Bearer $AHREFS_API_TOKEN" \
  "https://api.ahrefs.com/v3/site-explorer/backlinks?select=url_from,url_to,domain_rating_source,anchor&target=competitor.com&mode=domain&limit=100"
```

**Unit costs:** Most endpoints cost 50+ API units per request. Budget carefully.

#### Using DataForSEO instead (recommended for most):

```bash
openclaw config set DATAFORSEO_LOGIN "your@email.com"
openclaw config set DATAFORSEO_PASSWORD "your-api-password"
```

**DataForSEO Backlinks API example:**
```bash
curl -X POST "https://api.dataforseo.com/v3/backlinks/backlinks/live" \
  -H "Authorization: Basic $(echo -n 'login:pass' | base64)" \
  -H "Content-Type: application/json" \
  -d '[{
    "target": "competitor.com",
    "mode": "as_is",
    "filters": ["dofollow","=",true],
    "order_by": ["rank,desc"],
    "limit": 100
  }]'
```

---

### Step 4: Configure Himalaya for Outreach Email

The himalaya skill handles all outreach emails. Use a **dedicated email** — not your main inbox.

```bash
# Configure himalaya with your outreach email
# Edit ~/.config/himalaya/config.toml

[accounts.outreach]
email = "outreach@yourdomain.com"
display-name = "Your Name"
default = true

[accounts.outreach.imap]
host = "imap.gmail.com"
port = 993
ssl = true
login = "outreach@yourdomain.com"
passwd-cmd = "echo your-app-password"

[accounts.outreach.smtp]
host = "smtp.gmail.com"
port = 465
ssl = true
login = "outreach@yourdomain.com"
passwd-cmd = "echo your-app-password"
```

> **Gmail users:** Use an App Password (not your main password). Go to myaccount.google.com → Security → App Passwords.

Test it:
```bash
himalaya list --account outreach
himalaya send --account outreach <<EOF
From: outreach@yourdomain.com
To: test@example.com
Subject: Test

Hello
EOF
```

---

### Step 5: Prime Your Agent's Context (Don't Skip This)

This is @EXM7777's most important point: **context is the entire game.** Before your agent does anything, give it a complete picture of your business and goals.

Create `/Users/you/Projects/your-site/SEO_CONTEXT.md`:

```markdown
# SEO Context — [Your Site Name]

## Business Overview
- What we sell: [product/service]
- Target customer: [description]
- Main competitors: [competitor1.com, competitor2.com, competitor3.com]
- Domain: yourdomain.com (DR: X, Age: X years)
- CMS: [WordPress/Ghost/Webflow/etc]

## Current State
- Total indexed pages: X
- Keywords on page 1: X
- Monthly organic clicks: X
- Top 3 performing pages: [URLs]

## 6-Month Goals
- Target monthly organic clicks: X
- Target keywords on page 1: X
- Priority topic clusters: [list them]
- Target DR: X

## Content Strategy
- Avg article length: 1,500–2,500 words
- Tone: [professional/casual/technical]
- Internal linking hub: [main pillar pages]
- Publish cadence: X articles/week

## Backlink Strategy
- Min DR for outreach targets: 30
- Preferred link types: guest posts, resource pages, link swaps
- Topics to pitch: [list]
- Avoid: [competitor direct links, PBNs, etc]
```

Then tell your agent via Telegram:
> "Read /Projects/your-site/SEO_CONTEXT.md — this is your complete brief. All SEO decisions should be made with this context in mind."

---

### Step 6: Set Up the Three Skills via Telegram

#### Skill 1: Programmatic SEO

Message your OpenClaw agent:

```
Set up a programmatic SEO workflow with these rules:

1. Every Monday at 9am: Pull my top 100 keywords from GSC where position is between 10-20 ("striking distance"). Save to ~/seo/keyword-queue.md

2. Every day at 11am: Pick the top-priority keyword from the queue. Scrape the top 10 Google results for it. Extract all H2 headings. Cross-reference with "People Also Ask" questions. Identify 3 content gaps competitors missed.

3. Generate a content brief and full 2000-word article covering those gaps. Include: meta title, meta description, slug, 3 internal link suggestions.

4. Save as draft to ~/seo/articles/[slug].md

5. Publish to WordPress via REST API as draft status (I'll review before publish).

WordPress credentials: URL=[your-wp-url], username=[user], app-password=[pass]
GSC site: https://yourdomain.com/
```

#### Skill 2: Site Architecture Manager

```
Set up a site architecture maintenance workflow:

Every Sunday at 2am:
1. Crawl all pages on yourdomain.com (use web_fetch in sequence)
2. Map internal links — find pages with fewer than 3 inbound internal links (orphans)
3. For each orphan, suggest 2 existing pages that should link to it
4. Generate sitemap.xml and submit to GSC
5. Run schema audit on the 5 most recently published pages — check for missing FAQ, Article, or HowTo schema
6. Send me a report via Telegram with: orphan pages found, sitemap status, schema issues

Save all findings to ~/seo/architecture-report.md
```

#### Skill 3: Backlink Outreach Bot

```
Set up a backlink outreach workflow using DataForSEO (not Ahrefs — too expensive):

Every Monday, Wednesday, Friday at 10am:
1. Pull backlink profiles for competitor1.com and competitor2.com via DataForSEO API
2. Find domains that link to them but NOT to yourdomain.com
3. Filter: DR > 30, dofollow only, not in our existing outreach log
4. For each prospect:
   - Find the contact/about page
   - Extract email (look for mailto: links or contact forms)
   - Note the specific article that links to our competitor
5. Write a personalized pitch email (not a template):
   - Reference their specific article
   - Mention what's unique about their site
   - Offer genuine value (guest post, resource addition, link swap)
6. Send via himalaya from outreach@yourdomain.com
7. Log to ~/seo/outreach-log.md with: domain, email, date, status=sent

Every day at 9am: Check for replies to outreach emails. Log responses. For no-reply after 3 days: send follow-up. For no-reply after 7 days: mark closed.

Max 15 new outreach emails per day. Quality > volume.
```

---

### Step 7: Set Up Cron Jobs

Tell your agent to schedule everything:

```
Set up these cron jobs for the SEO agent:

# Keyword research (Monday 9am)
0 9 * * 1 [keyword research workflow]

# Article generation (Daily 11am)  
0 11 * * * [article generation workflow]

# Backlink outreach (Mon/Wed/Fri 10am)
0 10 * * 1,3,5 [outreach workflow]

# Follow-up check (Daily 9am)
0 9 * * * [follow-up check]

# Site architecture audit (Sunday 2am)
0 2 * * 0 [architecture audit]

# Weekly SEO report to Telegram (Friday 5pm)
0 17 * * 5 [compile and send weekly report]
```

---

### Step 8: Weekly Telegram Report

Your agent should send you a weekly report every Friday:

```
📊 SEO Report — Week [N]

New articles published: X
Total indexed pages: X
Keywords on page 1: X (+/- from last week)
Keywords on page 2: X
Organic clicks: X (+X% WoW)

New backlinks acquired: X
Outreach emails sent: X
Response rate: X%

Top mover: "[keyword]"
→ Position X → Position Y (+Z)

Action needed: [anything requiring human review]

Full report: ~/seo/weekly-report-[date].md
```

---

## Cost Breakdown

### Without Ahrefs (Recommended starting point)

| Item | Monthly Cost | Notes |
|------|-------------|-------|
| OpenClaw | Free | Self-hosted, open source |
| Anthropic API (Claude Sonnet) | ~$20–50/mo | ~2-4 articles/week + daily tasks |
| DataForSEO Backlinks API | ~$20–50/mo | Pay-as-you-go, $50 min top-up never expires |
| Google Search Console | Free | — |
| VPS (if not running on Mac mini) | ~$6/mo | DigitalOcean Droplet |
| Hunter.io (email finding) | $0–49/mo | Free tier: 25 searches/mo |
| **Total** | **~$46–155/mo** | Scales with usage |

### With Ahrefs Enterprise

| Item | Monthly Cost | Notes |
|------|-------------|-------|
| Ahrefs Enterprise | $1,499/mo | Annual commitment only — ouch |
| Anthropic API | ~$20–50/mo | |
| Google Search Console | Free | |
| **Total** | **~$1,520–1,550/mo** | Only makes sense at agency scale |

### With Ahrefs Lite (no API access — manual data only)

| Item | Monthly Cost | Notes |
|------|-------------|-------|
| Ahrefs Lite | $99/mo | UI access only, no API v3 |
| DataForSEO | ~$20–50/mo | For backlinks API in the agent |
| Anthropic API | ~$20–50/mo | |
| **Total** | **~$139–199/mo** | Use Ahrefs for strategy, DataForSEO for agent |

> ⚠️ **Important:** Ahrefs Lite ($99/mo) gives you the Ahrefs web UI but **no API access**. API requires Enterprise ($1,499/mo). For most people, use DataForSEO for programmatic backlink data and Ahrefs Lite for manual research.

---

## Alternatives to Ahrefs

Ranked by cost/value for programmatic use (agent automation):

| Tool | Monthly Cost | API Access | Best For | Notes |
|------|-------------|-----------|---------|-------|
| **DataForSEO** | $50 min (PAYG) | ✅ Yes | Everything | Best for agents. 15+ APIs. Pay per request. Backlinks, SERP, keywords. Highly recommended. |
| **Moz API** | Free–$5+/mo | ✅ Yes | Link analysis | Free tier (50 rows/mo). Domain Authority. Great entry point. |
| **SE Ranking** | $119/mo annual | ✅ Yes | Full SEO stack | 5.4B keywords, 2.2B domains. Good mid-tier option. |
| **Majestic** | $49.99/mo | ✅ Yes ($399.99/mo API plan) | Backlinks only | Historical data since 2006. Trust Flow metric. |
| **SpyFu** | $58/mo annual | ✅ Yes (Pro plan) | Competitor research | 19 years of SERP history. Strong on PPC data. |
| **Semrush** | $499/mo Business | ✅ Yes (add-on units) | Comprehensive | Most expensive alternative. Units don't roll over. |
| **Ahrefs Lite** | $99/mo | ❌ No API | Manual research | Great UI. No programmatic access at this tier. |
| **Google Search Console** | Free | ✅ Yes | Your own site data | Best source for your own keyword/click data |

### Free Options

- **Google Search Console** — Free, your own site's data, perfect for keyword monitoring
- **Moz Free API** — 50 rows/month, good for testing
- **DataForSEO trial** — $50 top-up that never expires (pay per request)
- **Common Crawl** — Free raw crawl data (complex to use)
- **Screaming Frog** — Free up to 500 URLs for site crawling

### The Recommended Stack (Budget-Conscious)

```
Programmatic agent:  DataForSEO ($20-50/mo PAYG)
Manual research:     Google Search Console (free) + Ahrefs Lite UI ($99/mo)
Your own site data:  GSC API (free)
Email outreach:      himalaya skill (free)
Content generation:  Anthropic API (~$20-30/mo)
─────────────────────────────────────────────
Total: ~$139–180/mo  (vs. $1,500+/mo with Ahrefs Enterprise)
```

---

## Common Issues

### "My agent keeps looping / API bill exploded"

**Always set API budget caps.** In your Anthropic console, set a monthly spend limit. One user reported a $200 bill from a single weekend loop.

```bash
# Set a max monthly Anthropic budget in their console:
# console.anthropic.com → Settings → Usage Limits → Set monthly limit
```

Also cap DataForSEO spend in their dashboard.

### "GSC API returns 403 / permission denied"

- Make sure your OAuth consent screen has your site's email as a test user
- Verify the site is actually verified in GSC under the same Google account
- The scope needed is: `https://www.googleapis.com/auth/webmasters.readonly`
- Refresh tokens expire if unused for 6 months — re-auth if needed

### "Outreach emails going to spam"

- Use a dedicated sending domain, not your main domain
- Warm up the email address for 2–3 weeks before bulk sending
- Max 15 emails/day to start (agent should be configured with this limit)
- Add SPF, DKIM, DMARC records to your sending domain
- Personalize each email — no copy-paste templates

### "Articles are generic / not ranking"

- Give the agent your `SEO_CONTEXT.md` before anything else (Step 5)
- Use the Topology Constraints technique: tell it "Do not use bullet points. Map content logic as a flowchart first."
- Always have the agent analyze top-10 competitors first before writing
- Set word count targets based on competitor average, not arbitrary numbers
- Review drafts before publishing — switch to auto-publish only when you trust quality

### "Ahrefs API v2 stopped working"

Correct — API v2 was fully discontinued November 1, 2025. You must use API v3 (Enterprise only) or migrate to DataForSEO.

### "DataForSEO results seem off"

- Use the `live` endpoints for real-time data (slightly more expensive than standard queue)
- For backlinks, the Backlinks API requires a $100/month minimum top-up to use
- Results are cached for 30 days — factor this in when pulling fresh data

### "himalaya not sending emails"

```bash
# Test the connection
himalaya send --debug

# Common fix for Gmail: enable "Less secure app access" OR use App Passwords
# App Passwords: myaccount.google.com → Security → App Passwords
```

### "Site architecture audit takes too long"

- Limit initial crawl depth to 3 levels
- Add a crawl delay (1-2 seconds between requests) to avoid triggering your own bot protection
- For large sites (1000+ pages), run the audit monthly instead of weekly

---

## Links

### Original Sources
- [@EXM7777 tweet thread](https://x.com/EXM7777/status/2025631181702893616) — "how to build an autonomous SEO agent inside OpenClaw"
- [@michaelaubry tweet](https://x.com/michaelaubry/status/2019911082601771315) — "Built a discord bot that uses openclaw, it scans ahrefs for backlink opps"

### Julian Goldie SEO (@JulianGoldieSEO)
- [Free stack: Qwen 3.5 + OpenClaw + Ollama](https://x.com/JulianGoldieSEO/status/2025275817648103593) — run everything locally for $0
- [OpenClaw multi-agent update](https://x.com/JulianGoldieSEO/status/2027316606368612773) — spin up multiple agents that talk to each other

### OpenClaw Documentation
- [OpenClaw SEO Guide (openclawmarketing.com)](https://openclawmarketing.com/openclaw-seo) — complete automation guide with install commands
- [Autonomous SEO with OpenClaw (lobsterlair.xyz)](https://lobsterlair.xyz/blog/autonomous-seo-openclaw) — full 6-phase system breakdown
- [OpenClaw Discord Channel docs](https://docs.openclaw.ai/channels/discord)

### Skills & Tools
- [programmatic-seo skill](https://playbooks.com/skills/openclaw/skills/seo-audit) — install via `npx clawdhub@latest install programmatic-seo`
- [Ahrefs MCP skill](https://agentskill.sh/@openclaw/ahrefs-connection) — `@ahrefs/mcp` for Claude Code/MCP users
- [claude-seo (GitHub)](https://github.com/AgriciDaniel/claude-seo) — universal SEO skill integrating Ahrefs MCP, Semrush MCP, DataForSEO

### APIs
- [Google Search Console API Reference](https://developers.google.com/webmaster-tools/v1/api_reference_index)
- [GSC OAuth Setup Guide](https://developers.google.com/identity/protocols/oauth2)
- [searchAnalytics/query endpoint](https://developers.google.com/webmaster-tools/v1/searchanalytics/query)
- [Ahrefs API v3 Docs](https://docs.ahrefs.com/docs/api/reference/introduction) — Enterprise only
- [DataForSEO API](https://dataforseo.com/) — pay-as-you-go, $50 min
- [Moz API](https://moz.com/products/api) — free tier available
- [SE Ranking API](https://seranking.com/) — $119/mo annual

### Cost Research
- [Ahrefs API Alternatives Compared (seobotai.com)](https://seobotai.com/blog/ahrefs-api-alternatives/) — detailed pricing breakdown of all alternatives
- [DataForSEO vs Ahrefs vs Semrush Backlinks](https://dataforseo.com/blog/backlink-api-comparison-dataforseo-ahrefs-semrush)

---

## Quick-Start TL;DR

```bash
# 1. Install skills
npx clawdhub@latest install programmatic-seo octolens fs-architect schema-markup

# 2. Set your API keys
openclaw config set GSC_CLIENT_ID "..."
openclaw config set GSC_CLIENT_SECRET "..."
openclaw config set GSC_REFRESH_TOKEN "..."
openclaw config set GSC_SITE_URL "https://yourdomain.com/"
openclaw config set DATAFORSEO_LOGIN "..."
openclaw config set DATAFORSEO_PASSWORD "..."

# 3. Prime the agent context
# Write SEO_CONTEXT.md (see Step 5)

# 4. Message your agent on Telegram
# "Read SEO_CONTEXT.md, then set up the 3 SEO workflows (programmatic pages, architecture, outreach)"

# 5. Verify crons are scheduled
openclaw cron list

# 6. Wait for Friday — first Telegram report incoming 📊
```

---

*Last updated: March 2026 | Based on @EXM7777 and @michaelaubry workflows | Maxxer Academy*
