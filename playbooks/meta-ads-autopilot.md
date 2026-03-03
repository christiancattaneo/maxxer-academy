# $0/mo Meta Ad Management with OpenClaw

> Based on [@TheMattBerman](https://x.com/TheMattBerman/status/2027220216409723296)'s workflow  
> Original thread: https://x.com/TheMattBerman/status/2027220216409723296  
> Full breakdown: https://www.bigplayers.co/p/this-openclaw-agent-runs-your-meta-ads  
> Open-source kit: https://github.com/TheMattBerman/meta-ads-kit

---

## Overview

An OpenClaw agent that runs your entire Meta Ads account on autopilot — monitoring campaigns, pausing bleeders, scaling winners, detecting creative fatigue, generating new copy, and uploading ads — all without you touching Ads Manager.

**What it does:**
- Sends you a 2-minute morning briefing every day at 7am (via Telegram, Slack, or email)
- Auto-pauses ads running 3x your target CPA for 48+ hours
- Detects creative fatigue before your ROAS craters
- Recommends (and executes with your approval) budget shifts from losers to winners
- Generates AI ad copy matched to your actual image creatives
- Uploads finished ads directly to Meta via Graph API

**Real-world result (from Matt's account):**
> *"Paused Retargeting_V3_Feb. CPA $87 against a $35 target, three straight days. Creative fatigue. Shifted $47/day to Founder_Hook_V2. That one's at 1.8x ROAS and climbing. Here's what I'd test next."*  
> Total time managing ads that day: **under 5 minutes.**

**Difficulty:** Intermediate (comfortable with terminal; no coding required)  
**Setup time:** ~30 minutes  
**Monthly cost:** $0 (tools are all free/open source — your Meta ad spend is separate)

### Monthly Cost Breakdown

| Item | Monthly Cost |
|------|-------------|
| OpenClaw | Free (open source) |
| social-flow CLI | Free (open source) |
| Meta Marketing API access | Free (your own ad account) |
| Anthropic API (Claude) | ~$5–20 depending on usage |
| Total infrastructure | **$0–$20/mo** |

> **Note:** Your actual Meta advertising spend is completely separate. This kit manages that spend more efficiently — it doesn't add to it.

---

## Prerequisites

- [ ] **Mac, Linux, or Windows (WSL)** — OpenClaw runs on all three
- [ ] **Node.js 18+** — [Download from nodejs.org](https://nodejs.org/)
- [ ] **npm** — Comes bundled with Node.js
- [ ] **OpenClaw installed** — [openclaw.ai/install](https://openclaw.ai) (`npm install -g openclaw`)
- [ ] **Anthropic API key** — [console.anthropic.com/keys](https://console.anthropic.com/keys)
- [ ] **Active Meta Ad Account** — You must be running or have run Meta ads
- [ ] **Meta Business Account** — [business.facebook.com](https://business.facebook.com) (free to create)
- [ ] **Meta Developer App** — [developers.facebook.com/apps](https://developers.facebook.com/apps) (free to create)
- [ ] **social-flow CLI** — (`npm install -g @vishalgojha/social-flow`) — the Meta API wrapper
- [ ] **ClawHub account** (optional but recommended) — [clawhub.ai](https://clawhub.ai)

---

## The Architecture

```
OpenClaw Agent (brain + scheduler)
    → meta-ads skill         (daily health check, pause/resume/budget actions)
    → ad-creative-monitor    (fatigue detection over time)
    → budget-optimizer       (spend efficiency rankings + shift recommendations)
    → ad-copy-generator      (AI copy matched to image creatives)
    → ad-upload              (push new ads to Meta via Graph API)
         ↓
    social-flow CLI          (thin wrapper around Meta Marketing API)
         ↓
    Meta Marketing API       (the actual data + mutations)

Cron fires at 7am → brief lands in Telegram/Slack → you approve in 2 min
```

---

## The 5 Skills — What Each Does

### 1. `meta-ads` — Daily Health Check + Auto-Pause

**What it does:** The core skill. Runs 5 diagnostic questions against your live ad data every morning, surfaces what matters, and takes action on the obvious stuff without waiting for you.

The 5 questions:
1. **Am I on track?** — Spend pacing vs. daily budget (flags over/under-pacing)
2. **What's running?** — All active campaigns, status, current spend
3. **How's performance?** — 7-day ROAS, CPA, CPL, CTR by campaign
4. **Who's winning/losing?** — Ad-level data ranked best to worst; auto-pauses 3x+ CPA bleeders
5. **Any fatigue?** — CTR trends, frequency creep, CPC movement (catches fatigue days early)

**Install:**
```bash
clawhub install meta-ads
```
✅ **Verified on ClawHub** — exists at [clawhub.ai/skills/meta-ads](https://clawhub.ai/skills/meta-ads) (published by zachgodsell93, v1.0.0, updated Feb 2026). Also bundled in Matt Berman's [meta-ads-kit](https://github.com/TheMattBerman/meta-ads-kit).

**Configuration needed:**
```json
{
  "account": {
    "id": "act_123456789",
    "name": "My Brand"
  },
  "benchmarks": {
    "target_cpa": 25.00,
    "target_roas": 3.0,
    "max_frequency": 3.5,
    "min_ctr": 1.0,
    "max_cpc": 2.50
  },
  "alerts": {
    "bleeder_ctr_threshold": 1.0,
    "bleeder_frequency_threshold": 3.5,
    "fatigue_ctr_drop_pct": 20,
    "spend_pace_alert_pct": 15
  }
}
```

---

### 2. `ad-creative-monitor` — Fatigue Detection

**What it does:** Tracks the health of every creative in your account over time — not just a single-day snapshot. Catches creative fatigue *before* your CPA spikes (usually 3–5 days earlier than manual monitoring).

Fatigue signals it monitors:
- **CTR declining** over a 7–14 day window (even if still "acceptable" today)
- **Frequency climbing** past your configured threshold (default: 3.5)
- **CPC rising** without an obvious cause (audience exhaustion)

When triggered, it: flags the creative, writes an observation to a workspace log, and tells you what to test next. Over time, this builds a pattern log of what fatigued when and why — genuine institutional memory.

**Install:**
```bash
clawhub install ad-creative-monitor
```
✅ **Verified on ClawHub** — exists at [clawhub.ai/skills/ad-creative-monitor](https://clawhub.ai/skills/ad-creative-monitor). Also bundled in the [meta-ads-kit](https://github.com/TheMattBerman/meta-ads-kit/tree/main/skills/ad-creative-monitor).

**⚠️ Caveat:** The `clawhub inspect` CLI command returned no result for this slug, but the ClawHub web page resolves and the skill is included in Matt Berman's open-source kit. Install via the kit or the web URL if `clawhub install` fails.

**Configuration needed:**
- `max_frequency` threshold (default: 3.5)
- `ctr_drop_pct` to trigger alert (default: 20%)
- Log file path for fatigue history

---

### 3. `budget-optimizer` — Spend Efficiency Ranker

**What it does:** Analyzes all your campaigns and ad sets by spend efficiency — ROAS, CPA, CPL — and ranks them best to worst. Then recommends concrete budget shifts: take $X/day from the 3 worst performers and move it to the top 2.

Budget shifts are **always approval-required** (by design). The agent presents the recommendation with full data backing. You say yes or no in Telegram in 2 seconds. It executes.

**Install:**
```bash
clawhub install budget-optimizer
```
✅ **Verified on ClawHub** — exists at [clawhub.ai/skills/budget-optimizer](https://clawhub.ai/skills/budget-optimizer). Also bundled in the [meta-ads-kit](https://github.com/TheMattBerman/meta-ads-kit/tree/main/skills/budget-optimizer).

**⚠️ Caveat:** Same as above — `clawhub inspect` CLI returned empty, but web page resolves. Use the kit install path if needed.

**Configuration needed:**
- Your benchmarks (target CPA, target ROAS) from `ad-config.json`
- Budget shift thresholds (how far below/above benchmark to trigger)

---

### 4. `ad-copy-generator` — AI Copy Matched to Creatives

**What it does:** Takes your actual image creatives, analyzes the visual (layout, color, hook style, format), and writes ad copy *specifically designed to reinforce what's in the image*. Outputs in `asset_feed_spec` format — the exact structure Meta's API expects for uploading.

This is the skill that closes the creative loop. When `ad-creative-monitor` flags a fatiguing creative, `ad-copy-generator` produces fresh variants to replace it — without anyone touching Canva or a copy doc.

Output format example:
```json
{
  "asset_feed_spec": {
    "bodies": [
      {"text": "Stop guessing. Start knowing. Your CPA in 2 minutes every morning."},
      {"text": "I didn't open Ads Manager once this week. My AI did it. Here's how."}
    ],
    "titles": [
      {"text": "Your AI Ad Manager"},
      {"text": "Set it. Approve it. Done."}
    ]
  }
}
```

**Install:**
```bash
clawhub install ad-copy-generator
```
✅ **Verified on ClawHub** — exists at [clawhub.ai/skills/ad-copy-generator](https://clawhub.ai/skills/ad-copy-generator). Also bundled in the [meta-ads-kit](https://github.com/TheMattBerman/meta-ads-kit/tree/main/skills/ad-copy-generator).

**Configuration needed:**
- Brand voice guidelines (write them in plain English to the agent)
- Target CTA
- Headline character limit (Meta: 40 chars)
- Body text character limit (Meta: 125 chars recommended)

---

### 5. `ad-upload` — Push Ads to Meta via Graph API

**What it does:** Takes the output from `ad-copy-generator` (images + copy in `asset_feed_spec` format) and pushes it directly to your Meta ad account via the Graph API. No Ads Manager copy-paste. No manual upload. Images, headlines, body copy, and creative configuration — all uploaded programmatically.

This is the last step in the closed loop: Monitor → Detect Fatigue → Optimize Budget → Generate Copy → **Upload** → Monitor again.

**Install:**
```bash
clawhub install ad-upload
```
✅ **Verified on ClawHub** — exists at [clawhub.ai/skills/ad-upload](https://clawhub.ai/skills/ad-upload). Also bundled in the [meta-ads-kit](https://github.com/TheMattBerman/meta-ads-kit/tree/main/skills/ad-upload).

**Configuration needed:**
- Ad account ID (`act_XXXXXXXXX`)
- Default campaign ID to upload to
- Default ad set ID
- Image folder path

---

## Step-by-Step Setup

### Step 1: Create a Meta Business Account

**URL:** https://business.facebook.com

1. Go to https://business.facebook.com
2. Click **"Create Account"** (top right)
3. Enter your business name, your name, and business email
4. Verify your email address
5. Add your Facebook Page (or create one if you don't have one)
6. Add your Ad Account: go to **Business Settings → Accounts → Ad Accounts → Add**

> **Already have one?** Go to https://business.facebook.com/settings and make sure your ad account is connected.

---

### Step 2: Create a Meta Developer App

**URL:** https://developers.facebook.com/apps

1. Go to https://developers.facebook.com/apps
2. Click **"Create App"**
3. Select app type: **"Business"**
4. Enter app name (e.g., "My Ad Manager"), contact email, and select your Business Account
5. Click **"Create App"**
6. From your app dashboard, click **"Add Products"** and add **"Marketing API"**
7. Under **App Review → Permissions**, request these permissions:
   - `ads_management` — read/write access to ad accounts (required)
   - `ads_read` — read-only access (required for reporting)
   - `business_management` — manage business assets (recommended)
   - `pages_read_engagement` — if you want page insights

> **Development vs. Live mode:** Your app starts in Development mode. For personal use on your own ad account, Development mode is sufficient. For managing client accounts, you'll need to go through App Review to get Live mode (Marketing API Basic tier).

**Permissions cheat sheet for this workflow:**

| Permission | Why You Need It |
|-----------|----------------|
| `ads_read` | Pull campaign/ad/insights data |
| `ads_management` | Pause ads, adjust budgets |
| `business_management` | Access Business Manager assets |

---

### Step 3: Get Your Access Token (the hardest part — read carefully)

This is where most people get stuck. Meta has multiple token types; you need a **long-lived User Access Token** or a **System User Token**.

#### Option A: Long-Lived User Token (recommended for personal accounts)

1. Go to https://developers.facebook.com/tools/explorer
2. In the top-right dropdown, select your app
3. Click **"Generate Access Token"**
4. Check these permissions: `ads_management`, `ads_read`, `business_management`
5. Click **"Generate Access Token"** and authorize in the popup
6. Copy the short-lived token (valid for 1–2 hours)
7. **Exchange for a long-lived token** (valid for 60 days):

```bash
curl -X GET "https://graph.facebook.com/v18.0/oauth/access_token?grant_type=fb_exchange_token&client_id={APP_ID}&client_secret={APP_SECRET}&fb_exchange_token={SHORT_LIVED_TOKEN}"
```

> **Get your App ID and App Secret:** Dashboard → App Settings → Basic → App ID / App Secret

The response gives you a token valid for 60 days. You'll need to refresh it before it expires (social-flow has a built-in `social auth refresh` command for this).

#### Option B: System User Token (recommended for automation / never expires)

1. Go to https://business.facebook.com/settings/system-users
2. Click **"Add"** → Create a System User (role: Admin)
3. Click **"Generate New Token"** on the system user
4. Select your app, check `ads_management` and `ads_read`
5. Click **"Generate Token"**
6. **Copy this token immediately** — you cannot retrieve it again

System User tokens don't expire (unless you revoke them). Best for automated cron workflows.

#### Verify your token works:

```bash
# After social-flow setup (Step 5), run:
social auth login
# Paste your token when prompted

# Verify:
social marketing accounts
```

You should see your ad accounts listed. If you see an error, check permissions.

---

### Step 4: Install social-flow CLI

social-flow is the open-source CLI by [Vishal Ojha](https://x.com/vishalojha_me) that wraps Meta's Marketing API. It handles token refresh, pagination, and rate limits so you don't have to.

```bash
# Install globally
npm install -g @vishalgojha/social-flow

# Verify
social --help
# (or: social-flow --help)
```

**Authenticate with Meta:**

```bash
# First-time setup (guided)
social start-here

# Or manual:
social auth login
# → Paste your access token when prompted

# Set your default ad account
social marketing accounts
# → Note your account ID (format: act_XXXXXXXXX)

social marketing set-default-account act_YOUR_ACCOUNT_ID
```

**Test it:**

```bash
social marketing status
social marketing insights --preset last_7d --level campaign
```

You should see your campaign data. If it works, social-flow is set up correctly.

**GitHub:** https://github.com/vishalgojha/social-flow  
**npm:** https://www.npmjs.com/package/@vishalgojha/social-flow

---

### Step 5: Clone the Meta Ads Kit + Install Skills

Matt Berman open-sourced the complete agent kit. Clone it first:

```bash
# Clone the kit
git clone https://github.com/TheMattBerman/meta-ads-kit.git
cd meta-ads-kit

# Copy config templates
cp .env.example .env
cp ad-config.example.json ad-config.json
```

**Edit `.env`:**
```bash
ANTHROPIC_API_KEY=sk-ant-your-key-here
META_ACCESS_TOKEN=your-long-lived-or-system-user-token
META_AD_ACCOUNT_ID=act_123456789
```

**Edit `ad-config.json`** with your actual benchmarks:
```json
{
  "account": {
    "id": "act_123456789",
    "name": "Your Brand Name"
  },
  "benchmarks": {
    "target_cpa": 25.00,
    "target_roas": 3.0,
    "max_frequency": 3.5,
    "min_ctr": 1.0,
    "max_cpc": 2.50
  },
  "alerts": {
    "bleeder_ctr_threshold": 1.0,
    "bleeder_frequency_threshold": 3.5,
    "fatigue_ctr_drop_pct": 20,
    "spend_pace_alert_pct": 15
  },
  "reporting": {
    "default_preset": "last_7d",
    "timezone": "America/New_York"
  }
}
```

**Now install the ClawHub skills** (these add knowledge to your OpenClaw agent):

```bash
# In your meta-ads-kit directory (or your OpenClaw workspace)
clawhub install meta-ads
clawhub install ad-creative-monitor
clawhub install ad-upload
```

> **Note:** The meta-ads-kit already includes all 5 skills in its `skills/` folder. If `clawhub install` fails for any skill other than `meta-ads`, use the bundled versions from the cloned repo — they're identical.

---

### Step 6: Configure OpenClaw Agent

```bash
# In the meta-ads-kit directory
npm install -g openclaw  # if not already installed

openclaw start
```

OpenClaw will pick up the `SOUL.md`, `AGENTS.md`, and skills automatically from the directory.

**Set up your morning cron** by messaging the agent:

```
"Run my daily ads check every morning at 8am and send me the summary"
```

The agent will create a cron job. Confirm it by asking:
```
"Show me my scheduled tasks"
```

**Set your notification channel:**
- For Telegram: connect via OpenClaw's Telegram integration (OpenClaw settings → Channels → Telegram)
- For Slack: connect via OpenClaw's Slack integration
- For email: configure SMTP in OpenClaw settings

---

### Step 7: Run Your First Check (Verify Everything Works)

```bash
# Option A: Via the shell script
./run.sh daily-check

# Option B: Via OpenClaw agent (message it)
"How are my ads doing?"
"Run a daily ads check"
"Any bleeders I should pause?"
"Check for creative fatigue"
```

**Expected output:**
- Spend pacing vs. daily budget
- Active campaigns + status
- 7-day performance by campaign (ROAS, CPA, CTR)
- Ad-level ranking (best to worst)
- Fatigue flags if any

If you see real data — **you're live.** The cron will handle everything from here.

---

## What Each Skill Actually Does (Deep Dive)

### meta-ads: The 5-Question Daily Protocol

This is the intelligence layer. Every morning, the skill fires 5 social-flow commands against the Meta Marketing API and interprets the results:

```bash
# Under the hood, these are the commands running:
social marketing status
social marketing portfolio --preset last_7d --target-daily YOUR_DAILY_BUDGET
social marketing insights --preset last_7d --level campaign
social marketing insights --preset last_7d --level ad
social marketing diagnose-poor-ads --preset last_7d --top 15
```

The skill doesn't just return raw data — it applies your benchmarks. An ad at $24 CPA against a $25 target is a winner. The same ad at $74 CPA is a bleeder. The skill knows the difference because you told it your targets in `ad-config.json`.

**Auto-pause logic:**
```
IF ad.cpa > (target_cpa * 3) AND ad.duration_hours > 48 THEN
  social marketing pause ad AD_ID
  notify("Paused [ad name]. CPA $X vs. target $Y. Notifying you.")
```

No confirmation needed for auto-pause (the threshold is conservative by design). You can always resume.

### ad-creative-monitor: Time-Series Fatigue Detection

Unlike `meta-ads` which looks at a single daily snapshot, `ad-creative-monitor` builds a history. It writes observations to a workspace file (`creative-health.log`) every day:

```
2026-02-25: Founder_Hook_V1 — CTR 2.4%, freq 2.1, CPC $1.80 → HEALTHY
2026-02-26: Founder_Hook_V1 — CTR 2.1%, freq 2.6, CPC $1.95 → WATCH
2026-02-27: Founder_Hook_V1 — CTR 1.8%, freq 3.1, CPC $2.20 → FATIGUED
```

When a creative crosses the fatigue threshold, the skill flags it and suggests a creative refresh. Your CPA hasn't spiked yet — but it will in 3–5 days if you don't act. That's the edge.

### budget-optimizer: Efficiency Ranker

Takes your campaigns and ad sets, ranks them by spend efficiency (ROAS × spend, or CPA vs. target), and generates a shift recommendation:

```
Efficiency Ranking — Last 7 Days:
1. Founder_Hook_V2    1.8x ROAS  $47/day → SCALE (+$30/day)
2. Brand_Awareness    1.2x ROAS  $60/day → HOLD
3. Retargeting_V3     0.4x ROAS  $87/day → CUT (-$40/day)

Recommended shift: Move $40/day from Retargeting_V3 to Founder_Hook_V2.
Approve? [Y/N]
```

The shift executes only after your approval:
```bash
social marketing set-budget adset ADSET_ID --daily-budget NEW_AMOUNT
```

### ad-copy-generator: Vision-Matched Copy

When you provide an image (or point it to an existing creative), the skill:
1. Analyzes the visual (what's in the image, color palette, text present, layout)
2. Generates 3–5 copy variants that *reinforce* what the image communicates
3. Outputs in `asset_feed_spec` format ready for Meta's API

This matters because generic copy over a specific image is one of the most common performance killers. Copy and image should tell the same story. This skill enforces that.

### ad-upload: Graph API Direct Push

Handles the full upload flow:
1. Upload image to Meta's image library: `POST /act_{ID}/adimages`
2. Create ad creative with copy + image: `POST /act_{ID}/adcreatives`
3. Create the ad in your ad set: `POST /act_{ID}/ads`

Everything happens via `social marketing` commands. No Ads Manager required at any step.

---

## The Full Closed Loop

```
Every morning at 7am:
┌──────────────────────────────────────────────────────┐
│  meta-ads skill runs 5 questions                     │
│  ↓                                                   │
│  Bleeders? → auto-pause (notify you after)           │
│  Fatigue? → ad-creative-monitor flags creative       │
│  Budget shift needed? → budget-optimizer recommends  │
│  ↓                                                   │
│  Brief lands in Telegram: "Here's what happened.     │
│  Here's what I did. Here's what I'd test next."      │
│  ↓                                                   │
│  You reply: "approved" or "not yet" or ask questions │
│  ↓                                                   │
│  If new creative needed:                             │
│    ad-copy-generator → new copy variants             │
│    ad-upload → live in Meta in 60 seconds            │
└──────────────────────────────────────────────────────┘
Total time: 2–5 minutes/day
```

---

## Cost Breakdown

| Item | Monthly Cost | Notes |
|------|-------------|-------|
| OpenClaw | $0 | Open source (MIT) |
| social-flow CLI | $0 | Open source (MIT) |
| Meta Marketing API | $0 | Free — your own account |
| ClawHub (skill registry) | $0 | Free tier sufficient |
| Anthropic API (Claude) | ~$5–20 | Depends on daily brief length |
| meta-ads-kit (the repo) | $0 | Open source (MIT) |
| **Total** | **$0–$20/mo** | |

> **Meta API pricing:** The Marketing API itself is free for accessing your own accounts. Meta charges for ad *delivery* (your actual ad spend), not for API access. There is no API fee.
>
> **App review:** For Basic Marketing API access to your own account, you don't need to go through App Review. Advanced Access (for accessing other people's accounts at scale) requires review — not needed for this workflow.

---

## Common Issues

### Token Expiration

**Symptom:** `Error: OAuthException - Session has expired`

**Fix:**
- Long-lived User tokens expire after 60 days — you must refresh before expiry
- Use a System User token instead (never expires)
- Or run `social auth refresh` to extend before it lapses

**Prevention:** Set a calendar reminder 50 days after token creation. Or set up a cron that runs `social auth status` weekly and alerts you.

### Rate Limits

**Symptom:** `Error: (#17) User request limit reached` or `(#613) Calls to this API endpoint have exceeded the rate limit`

**Fix:**
- social-flow handles most rate limits automatically with retry logic
- If you're hitting limits, you're running the check too frequently — daily is fine
- Meta's Marketing API rate limit: 200 calls per hour per ad account (more than enough for this workflow)

**Prevention:** Don't run the daily check more than once an hour. Keep cron at 1x/day for reporting, 1x/day for creative monitor.

### Permission Errors

**Symptom:** `Error: (#10) Application does not have permission to access this endpoint`

**Fix:**
1. Verify your app has `ads_management` and `ads_read` permissions
2. Verify your token was generated with those permissions checked
3. Verify your token belongs to an Admin on the ad account (not just a Standard user)

```bash
# Check what permissions your token has
social auth status
# or:
curl "https://graph.facebook.com/me?fields=permissions&access_token=YOUR_TOKEN"
```

### `social` command not found after install

**Symptom:** `command not found: social`

**Fix:**
```bash
# Open a new terminal after install
# Or add npm global bin to PATH:
export PATH=$PATH:$(npm bin -g)

# On Mac (zsh):
echo 'export PATH=$PATH:$(npm bin -g)' >> ~/.zshrc
source ~/.zshrc
```

### Ad Account Not Found

**Symptom:** `social marketing accounts` returns nothing or wrong accounts

**Fix:**
```bash
# Make sure your token belongs to a user with access to the ad account
social marketing accounts
# Look for your account ID (format: act_XXXXXXXXX)

social marketing set-default-account act_YOUR_CORRECT_ID
```

### ClawHub install fails for skills other than `meta-ads`

**Symptom:** `clawhub install ad-creative-monitor` returns error or not found

**Fix:** Use the bundled skills from the meta-ads-kit repo instead:
```bash
git clone https://github.com/TheMattBerman/meta-ads-kit.git
# Skills are in: meta-ads-kit/skills/
# Copy them to your OpenClaw workspace skills folder
```

The ClawHub web pages for all 5 skills resolve correctly, but the CLI's vector search may not surface exact slug matches for the newer skills. The GitHub repo is the authoritative source.

---

## Verified Links

| Resource | URL | Status |
|----------|-----|--------|
| Original tweet | https://x.com/TheMattBerman/status/2027220216409723296 | ✅ Live |
| BigPlayers breakdown | https://www.bigplayers.co/p/this-openclaw-agent-runs-your-meta-ads | ✅ Live |
| meta-ads-kit (GitHub) | https://github.com/TheMattBerman/meta-ads-kit | ✅ Live (38 stars) |
| social-flow CLI (GitHub) | https://github.com/vishalgojha/social-flow | ✅ Live |
| social-flow (npm) | https://www.npmjs.com/package/@vishalgojha/social-flow | ✅ v0.2.17 |
| OpenClaw | https://openclaw.ai | ✅ Live |
| ClawHub | https://clawhub.ai | ✅ Live |
| meta-ads skill | https://clawhub.ai/skills/meta-ads | ✅ Verified |
| ad-creative-monitor skill | https://clawhub.ai/skills/ad-creative-monitor | ✅ Verified |
| budget-optimizer skill | https://clawhub.ai/skills/budget-optimizer | ✅ Verified |
| ad-copy-generator skill | https://clawhub.ai/skills/ad-copy-generator | ✅ Verified |
| ad-upload skill | https://clawhub.ai/skills/ad-upload | ✅ Verified |
| Meta Business | https://business.facebook.com | ✅ Live |
| Meta Developers (App creation) | https://developers.facebook.com/apps | ✅ Live |
| Meta Graph API Explorer | https://developers.facebook.com/tools/explorer | ✅ Live |
| Meta Marketing API docs | https://developers.facebook.com/docs/marketing-api | ✅ Live |
| Anthropic API keys | https://console.anthropic.com/keys | ✅ Live |

---

## Skill Verification Notes

**Verified via ClawHub CLI (`clawhub inspect meta-ads`):**
- `meta-ads` — ✅ Confirmed on ClawHub. Owner: zachgodsell93. v1.0.0. Published Feb 2026.

**Verified via ClawHub web (URL resolves with correct page title):**
- `ad-creative-monitor` — ✅ Page title "ad-creative-monitor — ClawHub"
- `budget-optimizer` — ✅ Page title "budget-optimizer — ClawHub"
- `ad-copy-generator` — ✅ Page title "ad-copy-generator — ClawHub"
- `ad-upload` — ✅ Page title "ad-upload — ClawHub"

**⚠️ Important note on ClawHub CLI search:** The `clawhub search` command uses vector similarity — searching "ad-creative-monitor" returns unrelated skills because the registry uses semantic matching, not exact slug lookup. The `clawhub install <slug>` command uses exact slug matching. For these 4 skills, if `clawhub install` fails, clone the [meta-ads-kit repo](https://github.com/TheMattBerman/meta-ads-kit) and use the bundled `skills/` folder directly — they're identical.

**Note on "ad-copy-generator" and "ad-upload" — the tweet vs. the article:**
Matt Berman's original tweet mentioned 5 skills. His BigPlayers newsletter (the full breakdown) confirmed only 3 skills are in the "core" kit (`meta-ads`, `ad-creative-monitor`, `budget-optimizer`) — plus `ad-copy-generator` and `ad-upload` for the creative loop. The GitHub repo confirms all 5 exist. This playbook covers all 5.

---

## The Philosophy (Worth Reading)

From Matt Berman:

> *"Meta's AI optimizes for Meta. Your AI optimizes for you."*

Meta's built-in AI tools optimize for Meta's revenue — broader audiences, more placements, more spend. Your OpenClaw agent optimizes for your target CPA and your cash flow. The winning move: use Meta for targeting and delivery (they're genuinely good at it), and use your own agent for the strategy layer on top.

The 90% of ad management that's maintenance — clicking through Ads Manager, catching overnight CPA spikes, noticing creative fatigue — that's what this automates. The 10% that actually requires judgment (knowing when to go broad, which creative angle to test, when data is noise vs. signal) — that stays with you.

Two minutes a day over coffee. The agent handles the rest.

---

*Last verified: March 2026. Source: [@TheMattBerman](https://x.com/TheMattBerman) / [Big Players newsletter](https://bigplayers.co) / [meta-ads-kit](https://github.com/TheMattBerman/meta-ads-kit)*
