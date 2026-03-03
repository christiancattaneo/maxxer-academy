# TikTok Growth Engine — 8M Views in One Week
> Based on @oliverhenry's "Larry" agent · [Original thread →](https://x.com/oliverhenry/status/2023776478446436696) · [Reddit guide →](https://www.reddit.com/r/micro_saas/comments/1r4r66y/how_an_openclaw_agent_larry_got_millions_of/)

---

## Overview

| | |
|---|---|
| **What** | Autonomous TikTok photo-slideshow creation, posting, and revenue tracking |
| **Results** | 8M+ total views in one week; 500K+ views in first 5 days; top post: 234K views |
| **Who** | Oliver Henry (indie dev, [@oliverhenry](https://x.com/oliverhenry)) + his agent, Larry |
| **Difficulty** | Intermediate |
| **Setup time** | 2–4 hours |
| **Monthly cost** | ~$29–39/mo (Postiz) + ~$15–30/mo in OpenAI API calls at 2 posts/day |

**The one-line pitch:** Larry generates 6-slide photorealistic TikTok carousels, uploads them to your TikTok drafts via Postiz, sends you the caption, and you add music + hit publish. Total daily time investment: ~2 minutes.

---

## Prerequisites

- [ ] A Mac (or any Linux machine / VPS / Raspberry Pi with 2GB+ RAM)
- [ ] [OpenClaw](https://openclaw.ai) installed and configured
- [ ] [OpenAI API key](https://platform.openai.com) — for GPT-image-1.5 image generation (~$0.04–$0.17 per image; **~$0.50 per full 6-slide post** at medium quality; ~$0.25 with Batch API)
- [ ] TikTok account (personal or business)
- [ ] [Postiz](https://affiliate.postiz.com/ollie-warren) account with API access — **Standard plan starts at $29/mo** (API included on all paid plans)
- [ ] [RevenueCat](https://www.revenuecat.com) account *(optional — only if you have a mobile app with in-app purchases to track)*

---

## How It Works

TikTok photo carousels are the highest-performing format in 2026. TikTok's own data shows slideshows get **2.9× more comments**, **1.9× more likes**, and **2.6× more shares** vs. video. The algorithm actively promotes them.

Larry's daily loop:

1. **Research** — Larry reads your skill files (your niche, app, past performance data) and browses TikTok trends via the Bird skill
2. **Write hooks** — Brainstorms 10–15 hook options; you approve the best ones
3. **Generate images** — Creates 6 photorealistic slides via GPT-image-1.5 API using a locked-architecture prompt (same room/scene across all slides, only the style changes)
4. **Overlay text** — Adds the hook as a text overlay on slide 1 using Python/PIL scripts
5. **Post as draft** — Uploads to TikTok via the Postiz API with `privacy_level: "SELF_ONLY"` (lands in your drafts)
6. **Send caption** — Messages you the caption text (music must be added manually — it's the only non-automatable step)
7. **You publish** — Open TikTok, pick a trending sound, paste caption, hit Post (~60 seconds)
8. **Track & learn** — Larry logs view counts, updates his memory files, and improves every session

---

## Step-by-Step Setup

### Step 1: Install OpenClaw

If you haven't already:

```bash
# macOS
brew install openclaw

# Or follow the full guide:
# https://openclaw.ai/docs/getting-started
```

Set up your agent with an identity (SOUL.md), memory folder, and at minimum an Anthropic (Claude) or OpenAI API key for the agent's brain.

**Minimum hardware:**
- RAM: 2 GB (4 GB recommended)
- Storage: 20 GB SSD
- CPU: 1–2 vCPU (not the bottleneck)

---

### Step 2: Install the Larry Skill

Larry's skill is published on ClawHub — the official OpenClaw skills registry.

```bash
# Install the ClawHub CLI (one-time)
npm i -g clawhub

# Install Larry's skill
clawhub install oliverhenry/larry
```

> **Skill page:** [clawhub.ai/oliverhenry/larry](https://clawhub.ai/oliverhenry/larry)

After installing, restart your OpenClaw session so it picks up the new skill. The skill includes:

- Larry's TikTok workflow instructions (500+ lines)
- Image generation prompt templates
- Text overlay specs (font size, positioning, line length)
- Caption and hashtag formulas
- A performance log template for Larry to fill in over time

The skill will walk your agent through an **onboarding session** where it reads your app description, sets up config, and asks for your API keys.

> **Optional companion skills mentioned by Oliver:**
> - `clawhub install jeiting/revenuecat` — RevenueCat analytics (made by RevenueCat's CEO; gives Larry access to your MRR, subscribers, churn)
> - `clawhub install steipete/bird` — X/Twitter browsing (for trend research)

---

### Step 3: Set Up Postiz (TikTok Posting API)

Postiz is the social scheduling tool Larry uses to upload slideshows to TikTok as drafts. **API access is included on all paid plans.**

**3a. Create a Postiz account**

Go to [postiz.com](https://postiz.com) and sign up. The **Standard plan ($29/mo)** is sufficient for most indie developers (5 channels, 400 posts/month, API included).

> Oliver's affiliate link (supports the project): [affiliate.postiz.com/ollie-warren](https://affiliate.postiz.com/ollie-warren)

**3b. Connect TikTok to Postiz**

This requires a TikTok Developer account. The full official docs: [docs.postiz.com/providers/tiktok](https://docs.postiz.com/providers/tiktok)

Steps:
1. Go to [developers.tiktok.com/apps](https://developers.tiktok.com/apps) and create a new app
   - App Name: anything (e.g., `MyPostiz`)
   - Redirect URI: `https://your-postiz-domain.com/integrations/social/tiktok`
2. Add **"Login Kit"** and **"Content Posting API"** to your app
   - For Content Posting API, enable **"Direct Post"**
3. Add these OAuth scopes:
   - `user.info.basic`
   - `video.create`
   - `video.publish`
   - `video.upload`
   - `user.info.profile`
4. Copy your **Client ID** (16 chars) and **Client Secret** (32 chars)
5. Set environment variables in Postiz:
   ```env
   TIKTOK_CLIENT_ID=your_client_id_here
   TIKTOK_CLIENT_SECRET=your_client_secret_here
   ```
6. Restart Postiz, then go to the web interface → **Add Channel** → **TikTok** → Authorize

> **Important:** TikTok fetches media via `pull_from_url` — your media files must be publicly reachable over HTTPS. Use a reverse proxy (Caddy) or cloud storage (Cloudflare R2) for your uploads folder.

**3c. Get your Postiz API key**

In your Postiz dashboard → Settings → API → Generate a new API key. You'll paste this into Larry's config during onboarding.

---

### Step 4: Configure OpenAI Image Generation

Larry uses **GPT-image-1.5** (OpenAI's latest image model) for photorealistic results.

**4a. Get an OpenAI API key**

1. Go to [platform.openai.com](https://platform.openai.com)
2. Create an account or sign in
3. Navigate to **API keys** → **Create new secret key**
4. Add a payment method and set a usage limit (recommended: $50/month cap to start)

**4b. Cost breakdown for images**

| Quality | Cost per image | Cost per 6-slide post | With Batch API (50% off) |
|---------|----------------|----------------------|--------------------------|
| Low | ~$0.01 | ~$0.06 | ~$0.03 |
| Medium | ~$0.04 | ~$0.24 | ~$0.12 |
| High | ~$0.17 | ~$1.02 | ~$0.51 |

> Oliver uses **medium quality** and reports **~$0.50 per post** (6 images). With the [Batch API](https://platform.openai.com/docs/guides/batch), this drops to ~$0.25 — a 50% saving for overnight generation.

**4c. Model note**

Larry uses `gpt-image-1.5` (the model name in the API). If you use a different model:
- `gpt-image-1` — previous version, no cached output tokens
- `gpt-image-1-mini` — cheaper ($2/M input tokens vs $5/M), lower quality

For room makeovers, lifestyle content, or anything where "this looks like a real iPhone photo" matters — stick with **gpt-image-1.5**.

---

### Step 5: Configure OpenClaw

When you run your first Larry session, the skill will guide your agent through setup. But here's what to prepare:

**5a. SOUL.md — give your agent identity**

Create or update your SOUL.md with context about your app:

```markdown
# SOUL.md

## Who I am
[Agent name]. I run on [machine name] and help [your name] grow [app name].

## My primary job
Create TikTok photo slideshows that demonstrate [app name]'s core value proposition.
Post 1–2 per day. Track what works. Get better every week.

## The apps I promote
- [App name]: [one-sentence description]
- Target audience: [who downloads it]
- Core transformation: [before → after]

## My style
[Describe the tone: casual, professional, aspirational, etc.]
```

**5b. Cron/heartbeat config**

Larry can run on a schedule. Set up cron jobs for peak posting times (you'll learn yours after 1–2 weeks of data):

```bash
# Example: generate a post at 8am and 6pm daily
0 8 * * *  openclaw run "Generate today's morning TikTok post"
0 18 * * * openclaw run "Generate today's evening TikTok post"
```

Or use OpenClaw's heartbeat system to have Larry wake up on a schedule and check in.

**5c. Set your config**

During Larry's onboarding, he'll ask for:
- Your OpenAI API key (for image generation)
- Your Postiz API key (for posting)
- Your app name and description
- Your TikTok channel ID in Postiz

These get written to a local config file on your machine — they never leave it.

---

### Step 6: Test Your First Post (Dry Run)

Before going live, do a test run:

```bash
# Start an OpenClaw session and prompt Larry:
"Larry, generate a test slideshow for [your app]. Don't post it yet — just show me the images and proposed caption."
```

Check:
- [ ] Images are **portrait orientation** (1024×1536) — not landscape
- [ ] All 6 slides look like the **same room/scene** with only the style changing
- [ ] Hook text on slide 1 is **readable** (font size ≥6.5%, not hidden behind TikTok's UI chrome)
- [ ] Caption is under 2,200 characters
- [ ] Max 5 hashtags
- [ ] Caption follows the "other person + conflict + show them AI" formula (see Content Strategy below)

Once you're happy:

```bash
"Okay Larry, post this to TikTok as a draft."
```

Open TikTok → Profile → Drafts → find the post → add a trending sound → paste the caption → Publish.

---

## Content Strategy Tips

These are the hard-won lessons from Oliver and Larry's first week:

### The Formula That Works

> **[Another person] + [conflict or doubt] → showed them AI → they changed their mind**

Every hook that follows this formula cleared 50K views minimum. Most cleared 100K+.

**Real examples that went viral:**
- "My landlord said I can't change anything so I showed her what AI thinks it could look like" → **234,000 views**
- "I showed my mum what AI thinks our living room could be" → **167,000 views**
- "My landlord wouldn't let me decorate until I showed her these" → **147,000 views**

**What flopped (don't do this):**
- "Why does my flat look like a student loan" → 905 views
- "See your room in 12+ styles before you commit" → 879 views
- "The difference between $500 and $5000 taste" → 2,671 views

The difference: the winners are about **someone else's reaction**. The losers are about your features. Nobody cares about your features. They care about the human story.

### Hook Writing Framework

Before writing a hook, ask:
1. Who is the **other person** in this story?
2. What's the **conflict or doubt** they had?
3. What did you **show them**?
4. What happened as a result?

If you can't answer all four — the hook probably won't work.

### Slideshow Format Rules

- **6 slides** — TikTok's sweet spot (not 5, not 7)
- **Portrait only** — 1024×1536px. Landscape (1536×1024) = black bars = death
- **Hook text on slide 1** — Bold, high contrast, positioned in the lower 60% of the frame (above TikTok's caption bar)
- **Story-style caption** — relates to the hook, mentions the app naturally at the end
- **5 hashtags max** — TikTok's current effective limit
- **Consistent architecture** — Lock the room/scene description in your prompt. Only the style changes between slides

### Prompt Engineering for Consistent Slides

The #1 mistake is using vague prompts. You need obsessive specificity:

```
iPhone photo of a small UK rental kitchen. Narrow galley style, roughly 2.5m x 4m.
Shot from the doorway at the near end, looking straight down the length.
Countertops along the right wall with base cabinets and wall cabinets above.
Small window on the far wall, centered, single pane, white UPVC frame, ~80cm wide.
Left wall bare except for a small fridge-freezer near the far end.
Vinyl flooring. White ceiling, fluorescent strip light.
Natural phone camera quality, realistic lighting. Portrait orientation.
[STYLE: Beautiful modern country style. Sage green shaker cabinets with brass cup handles.
Solid oak butcher block countertop. White metro tile splashback in herringbone.]
```

**Everything before [STYLE] is locked and identical across all 6 slides.**
Only the [STYLE] section changes.

### Music (The One Manual Step)

You **cannot** add music via the API. This is intentional — adding a trending sound manually gives you the biggest organic boost. Browse TikTok's trending sounds in your niche before publishing. Takes 30–60 seconds.

### Signs of Life in "Before" Images

Don't make before-state rooms look derelict. Add:
- A flat screen TV
- Mugs or remote controls
- Everyday items on counters

"Signs of life" make the before state relatable. Empty rooms look like show homes and nobody connects with them.

---

## Cost Breakdown

| Item | Cost | Notes |
|------|------|-------|
| OpenClaw | Free | Open source |
| Postiz Standard | $29/mo | API included, 5 channels, 400 posts/mo |
| OpenAI images (2 posts/day, medium quality) | ~$15–18/mo | $0.25–0.50/post × 30 days |
| OpenAI images with Batch API | ~$8–10/mo | 50% saving for overnight generation |
| RevenueCat | Free | Free tier up to $2,500/mo tracked revenue |
| **Total (conservative)** | **~$44–47/mo** | Without Batch API |
| **Total (optimized)** | **~$37–39/mo** | With Batch API |

> Oliver reports ~$0.50/post at medium quality, ~$0.25/post with Batch API. At 2 posts/day that's $15–30/month in API costs.

---

## Common Issues

**Images look different on every slide (rooms change between slides)**
→ Your prompt isn't specific enough. Lock every architectural detail: window count and position, door location, camera angle, furniture size, ceiling height, floor type. Copy-paste the exact same room description into every slide prompt.

**Black bars on TikTok**
→ Images are landscape orientation (1536×1024). Must be portrait (1024×1536). Update your skill file with the correct dimensions.

**Text is unreadable on mobile**
→ Font size is too small (must be ≥6.5%). Check that text isn't positioned in TikTok's status bar zone (top ~8% of screen) or caption zone (bottom ~15%).

**Text looks squashed/compressed**
→ Lines are too long for the max canvas width. Set a max character-per-line limit in your text overlay script.

**Posts not appearing in TikTok drafts**
→ Postiz media URL isn't publicly reachable over HTTPS. TikTok fetches via `pull_from_url` — your uploads folder must be accessible from the internet. Set up Cloudflare R2 or a reverse proxy.

**Larry generates bad hooks on the first few sessions**
→ This is normal. Update the skill file after every session with what worked and what didn't. The system compounds — Larry gets measurably better with each logged failure and success.

**Batch API posts aren't ready in time**
→ Batch API has a 24-hour window. Schedule overnight generation (e.g., generate at 11pm for the next day's 8am and 6pm posts).

**RevenueCat skill not showing MRR changes**
→ Make sure you've granted the API key the correct permissions in your RevenueCat dashboard. The skill was built by RevenueCat's CEO (@jeiting) so it's the most authoritative integration available.

---

## Links

| Resource | URL | Status |
|----------|-----|--------|
| Original tweet by @oliverhenry | [x.com/oliverhenry/status/2023776478446436696](https://x.com/oliverhenry/status/2023776478446436696) | ✅ Live |
| Reddit full guide (r/micro_saas) | [reddit.com/r/micro_saas/comments/1r4r66y](https://www.reddit.com/r/micro_saas/comments/1r4r66y/how_an_openclaw_agent_larry_got_millions_of/) | ✅ Live |
| Larry skill on ClawHub | [clawhub.ai/oliverhenry/larry](https://clawhub.ai/oliverhenry/larry) | ✅ Live |
| RevenueCat skill on ClawHub | [clawhub.ai/jeiting/revenuecat](https://clawhub.ai/jeiting/revenuecat) | ✅ Live |
| OpenClaw homepage | [openclaw.ai](https://openclaw.ai) | ✅ Live |
| ClawHub skills registry | [clawhub.ai](https://clawhub.ai) | ✅ Live |
| ClawHub CLI docs | [docs.openclaw.ai/tools/clawhub](https://docs.openclaw.ai/tools/clawhub) | ✅ Live |
| Postiz (Oliver's affiliate link) | [affiliate.postiz.com/ollie-warren](https://affiliate.postiz.com/ollie-warren) | ✅ Live |
| Postiz pricing | [postiz.com/pricing](https://postiz.com/pricing) | ✅ Live |
| Postiz TikTok docs | [docs.postiz.com/providers/tiktok](https://docs.postiz.com/providers/tiktok) | ✅ Live |
| OpenAI API pricing | [openai.com/api/pricing](https://openai.com/api/pricing/) | ✅ Live |
| OpenAI platform (get API key) | [platform.openai.com](https://platform.openai.com) | ✅ Live |
| OpenAI Batch API docs | [platform.openai.com/docs/guides/batch](https://platform.openai.com/docs/guides/batch) | ✅ Live |
| RevenueCat pricing | [revenuecat.com/pricing](https://www.revenuecat.com/pricing/) | ✅ Live |
| Larry X account | [x.com/@LarryClawerence](https://x.com/@LarryClawerence) | ✅ Live |
| YouTube short (Larry demo) | [youtube.com/shorts/ZJZlQcTFNas](https://www.youtube.com/shorts/ZJZlQcTFNas) | ✅ Live |
| TikTok Developer Portal | [developers.tiktok.com/apps](https://developers.tiktok.com/apps) | ✅ Live |

---

## Quick-Start Checklist

```
[ ] OpenClaw installed and agent configured with SOUL.md
[ ] npm i -g clawhub
[ ] clawhub install oliverhenry/larry
[ ] OpenAI API key added to config, billing set up
[ ] Postiz account created (Standard $29/mo minimum)
[ ] TikTok Developer app created with Login Kit + Content Posting API
[ ] Postiz connected to TikTok (TIKTOK_CLIENT_ID + SECRET in env vars)
[ ] Postiz API key generated and given to Larry during onboarding
[ ] First dry run completed (images checked for portrait orientation + readable text)
[ ] First draft posted, sound added, published
[ ] Cron job or heartbeat set for daily post schedule
[ ] After first week: log top performers in Larry's memory file
```

---

*Playbook based on Oliver Henry's original guide, published February 2026. Larry co-wrote the original article. Prices verified March 2026.*
