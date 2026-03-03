# Getting Started — Your First OpenClaw Business Agent

> **The complete beginner's guide.** Follow these 8 steps and you'll have a personal AI agent running in 30 minutes — one you can message from Telegram, WhatsApp, or Discord, anywhere in the world.

---

## What is OpenClaw?

OpenClaw is a **free, open-source personal AI assistant** that runs on your own computer and connects to the chat apps you already use — Telegram, WhatsApp, Discord, and more. Instead of paying $20/month for a capped AI subscription, you run your own self-hosted "gateway" that gives you an AI available 24/7 from your phone, with full control over your data, costs, and capabilities.

Think of it as: *your own private AI employee that lives in your messages and never sleeps.*

---

## What You Need

| Requirement | Notes |
|-------------|-------|
| A Mac (M-series or Intel) | Or a Linux machine / VPS |
| Node.js 22 or newer | The installer handles this automatically |
| An AI API key | Anthropic or OpenRouter (details below) |
| A Telegram account | Free — recommended for easiest setup |
| 30 minutes | Seriously, that's all |

**Hardware tip:** A Mac Mini M4 ($599) is ideal — it runs 24/7 cheaply, stays quiet, and handles any model you throw at it. But your existing Mac laptop works fine to start.

---

## Step 1: Install OpenClaw

Open **Terminal** (search "Terminal" in Spotlight with `⌘ Space`) and paste this single command:

**macOS / Linux:**
```bash
curl -fsSL https://openclaw.ai/install.sh | bash
```

**Windows (PowerShell — run as Administrator):**
```powershell
iwr -useb https://openclaw.ai/install.ps1 | iex
```

> **What this does:** Downloads the OpenClaw CLI, installs it globally via npm, checks for Node.js (installs it if missing), and launches the setup wizard.

**Expected output:**
```
✓ Detected macOS arm64
✓ Node 22.x found
✓ Installing openclaw@latest...
✓ OpenClaw installed successfully
→ Launching onboarding wizard...
```

If you see `openclaw: command not found` after install, close and reopen Terminal, then try again.

**Alternative install via npm** (if you already have Node 22+):
```bash
npm install -g openclaw@latest
openclaw onboard --install-daemon
```

---

## Step 2: Create Your Anthropic API Key

OpenClaw needs an AI "brain." Anthropic's Claude is the recommended starting point.

1. Go to **[https://platform.claude.com](https://platform.claude.com)**
2. Sign up or log in (Google account works)
3. Click **"API Keys"** in the left sidebar
4. Click **"Create Key"** — give it a name like "openclaw-agent"
5. **Copy the key immediately** — you won't see it again
6. Go to **"Plans & Billing"** → set a monthly spend limit ($20–50 is safe to start)

**API pricing (as of March 2026):**

| Model | Input | Output | Best For |
|-------|-------|--------|----------|
| Claude Haiku 4.5 | $1/MTok | $5/MTok | Simple tasks, routing, quick replies |
| Claude Sonnet 4.6 | $3/MTok | $15/MTok | **Best daily driver** — balanced quality/cost |
| Claude Opus 4.6 | $5/MTok | $25/MTok | Complex reasoning, deep research |

**What does this cost in practice?**
- Light use (~100 messages/day): ~$5–15/month
- Medium use (~500 messages/day): ~$20–40/month
- Heavy use (agent workflows): ~$50–100/month

> **⚠️ Always set a spending cap.** Go to Billing → Usage Limits and set a hard limit of $50/month until you understand your usage patterns.

---

### Cheaper Alternative: OpenRouter

[OpenRouter](https://openrouter.ai) is a **model aggregator** — one API key gives you access to 300+ models from Anthropic, OpenAI, Google, Mistral, and more. It's the smart move for cost optimization.

**Why OpenRouter beats going direct:**
- Access cheaper models for simple tasks (DeepSeek V3.2: $0.25/$0.38 per MTok — that's 20× cheaper than Sonnet)
- Automatic fallback if one provider goes down
- Pay-as-you-go, no monthly minimums
- Same API format as Anthropic

**OpenRouter setup:**
1. Go to **[https://openrouter.ai](https://openrouter.ai)** and sign up
2. Go to **Keys** → **Create Key**
3. Add $10–20 in credits to start
4. Use model IDs like `anthropic/claude-sonnet-4-6` or `deepseek/deepseek-v3` in OpenClaw config

**Cost comparison (same Sonnet model):**
| Provider | Input | Output |
|----------|-------|--------|
| Anthropic direct | $3/MTok | $15/MTok |
| OpenRouter | ~$3.20/MTok | ~$15.60/MTok |

For Anthropic models, prices are similar. The savings come from using *cheaper models* for simpler tasks.

**Recommendation:** Start with Anthropic direct (simpler), switch to OpenRouter once you understand your usage.

---

## Step 3: Configure OpenClaw (Onboarding Wizard)

The installer should have already launched the wizard. If not, run:

```bash
openclaw onboard --install-daemon
```

The wizard will ask you:

1. **Model/Auth** — choose "Anthropic" and paste your API key when prompted
2. **Default model** — choose `claude-sonnet-4-6` (good balance of cost/quality)
3. **Workspace** — press Enter to accept the default (`~/.openclaw/workspace`)
4. **Gateway** — press Enter for port 18789 (default)
5. **Channels** — choose Telegram (we'll set this up in Step 4)
6. **Install as daemon** — say YES so it starts automatically when your Mac boots

To set your API key via config after setup:
```bash
openclaw config set agents.defaults.model.primary "anthropic/claude-sonnet-4-6"
```

Or to use OpenRouter instead of Anthropic:
```bash
openclaw config set agents.defaults.model.primary "openrouter/anthropic/claude-sonnet-4-6"
```

**Check the gateway is running:**
```bash
openclaw gateway status
```

**Open the web control panel (no channel needed):**
```bash
openclaw dashboard
```
This opens `http://127.0.0.1:18789/` in your browser — you can already chat with your agent here.

---

## Step 4: Connect to Telegram ⭐ Recommended

Telegram is the easiest and most powerful channel. Once connected, you can message your agent from your phone from anywhere in the world.

### 4a. Create a Telegram Bot

1. Open Telegram on your phone or desktop
2. Search for **@BotFather** (must be verified with a blue checkmark)
3. Send: `/newbot`
4. When asked for a name, type something like: `My AI Agent`
5. When asked for a username, type something like: `myagent_yourname_bot` (must end in `bot`)
6. BotFather will give you a token like: `1234567890:ABCdefGHIjklMNOpqrSTUvwxYZ`
7. **Copy that token**

### 4b. Add Token to OpenClaw Config

Edit your config file:
```bash
nano ~/.openclaw/openclaw.json
```

Add or update the Telegram section:
```json5
{
  channels: {
    telegram: {
      enabled: true,
      botToken: "1234567890:ABCdefGHIjklMNOpqrSTUvwxYZ",
      dmPolicy: "pairing"
    }
  }
}
```

Or use the CLI shortcut:
```bash
openclaw config set channels.telegram.enabled true
openclaw config set channels.telegram.botToken "YOUR_BOT_TOKEN_HERE"
openclaw config set channels.telegram.dmPolicy "pairing"
```

### 4c. Restart Gateway and Approve Your First Message

```bash
openclaw gateway status
# If not running:
openclaw gateway start
```

Now open Telegram, find your bot by its username (`@yourbot_name`), and send it `/start`.

In your terminal, you'll see a pairing request. Approve it:
```bash
openclaw pairing list telegram
openclaw pairing approve telegram <CODE>
```

The pairing code expires after 1 hour, so do this promptly.

> **After pairing:** Your bot will only respond to approved users. This is a security feature — nobody can hijack your agent by guessing your bot name.

---

## Step 5: Install Your First Skills

Skills are **add-on capabilities** for your agent — like apps for a smartphone. They're installed from ClawHub, the free skill registry.

**Install the ClawHub CLI:**
```bash
npm i -g clawhub
```

**Search for skills:**
```bash
clawhub search "web search"
clawhub search "email"
clawhub search "weather"
```

**Install your first essential skills:**
```bash
# Check the weather from anywhere
clawhub install weather

# Summarize articles, PDFs, YouTube videos
clawhub install summarize

# Manage GitHub repos and issues
clawhub install github

# Get the latest news and web info
clawhub install xurl
```

**List what you've installed:**
```bash
clawhub list
```

**Update all installed skills:**
```bash
clawhub update --all
```

> **How skills work:** After installing, restart your agent session (or just send `/reset` to your bot). Skills inject instructions into your agent's context, teaching it new behaviors and workflows.

**Read a skill before installing it:**
```bash
cat ~/.openclaw/workspace/skills/weather/SKILL.md
```
Always know what you're installing.

---

## Step 6: Talk to Your Agent

Send your bot a message on Telegram. Try these to get started:

```
What can you do?
```
```
What's the weather in Chicago?
```
```
Summarize this article: [paste a URL]
```
```
Help me write a cold email to a restaurant owner offering my AI services
```
```
Search the web for "openclaw business use cases"
```
```
What's my agent's current configuration?
```

**Power user commands (send these to your bot):**
- `/status` — see gateway health
- `/model` — switch between AI models
- `/reset` — start a fresh conversation
- `/help` — see all available commands

---

## Step 7: Set Up Safety ⚠️ Important!

**Do this before you give your agent access to anything sensitive.**

Based on best practices from the OpenClaw community:

### 7a. Use a Dedicated Account for Agent Access

- Create a **new Google account** (e.g., `yourname.agent@gmail.com`) for anything your agent can access
- Give it access to a **secondary calendar**, not your main one
- Use a **forwarding rule** from your main email to the agent email if you want email processing
- **Never** give your agent your main Apple ID or primary bank login

### 7b. Set API Spending Limits (CRITICAL)

On Anthropic:
1. Go to [platform.claude.com](https://platform.claude.com) → Billing → Usage Limits
2. Set a **hard monthly cap** (start with $50)
3. Set up **email alerts** at 50% and 80% of your budget

On OpenRouter:
1. Go to openrouter.ai → Settings → Limits
2. Set a monthly credit limit
3. Enable email notifications

### 7c. Use Haiku for Cheap Tasks

Don't run every request through Sonnet or Opus. Configure routing:
```bash
openclaw config set agents.defaults.model.primary "anthropic/claude-haiku-4-5"
```

Then switch to Sonnet only when needed by telling your agent:
```
/model sonnet
```

This can cut your costs by **5–10×** for simple tasks.

### 7d. Restrict Gateway Access

Your gateway config should have:
```json5
{
  channels: {
    telegram: {
      dmPolicy: "pairing",       // Only approved users can talk to your agent
      allowFrom: ["YOUR_ID"]     // Add your Telegram numeric user ID here
    }
  }
}
```

To find your Telegram user ID:
```bash
openclaw logs --follow
```
Then send a message to your bot and look for `from.id` in the logs.

### 7e. Safety Checklist

- [ ] API spending limit set (Anthropic/OpenRouter)
- [ ] Telegram pairing mode enabled (not "open")
- [ ] Agent using a dedicated email account (not your main)
- [ ] No access to real financial accounts in first 30 days
- [ ] Agent workspace backed up (copy `~/.openclaw/workspace`)
- [ ] Run `openclaw doctor` weekly to catch config issues

---

## Step 8: Your First Business Workflow

Here's the proven framework for turning your agent into revenue:

### The Framework (Based on Community Best Practices)

**1. Pick ONE boring workflow in ONE industry**

Don't try to build everything. Pick something small and painful:
- A dentist's office manually booking appointments via email
- A real estate agent copy-pasting listings into social media
- A law firm manually billing time from handwritten notes
- A plumber answering the same 10 questions by phone all day

**2. Map the workflow tip-to-tail**

Write out every step the human currently does. Be specific:
```
1. Customer emails with question
2. Staff reads email (5 min)
3. Staff looks up answer in FAQ doc (3 min)
4. Staff writes reply (5 min)
5. Staff sends email (1 min)
= 14 minutes per inquiry × 20 per day = 4.5 hours/day
```

**3. Build or find the skill for it**

```bash
clawhub search "email reply"
clawhub search "customer service"
```

Or describe what you want to your agent:
```
I want to build a skill that auto-drafts email replies for a plumbing company using 
their FAQ document. How would I structure this?
```

**4. Test for a full week with real data**

Don't skip this. Run the workflow manually with your agent assisting, measure:
- Time saved per task
- Error rate
- Customer satisfaction (if visible)

**5. Offer it to 3 businesses for free**

Post on Upwork, local Facebook groups, or cold email:
> "I'm testing an AI tool that handles [specific task] for [industry]. I'm offering it free for one month to 3 businesses in exchange for feedback. Takes 2 hours to set up. Interested?"

**6. Once proven, charge**

Once you have:
- Documented time savings (e.g., "saves 4.5 hours/day")
- Happy beta users
- Repeatable setup process

Price it at **$500–1,500/month** depending on value delivered. A business saving $5,000/month in labor will happily pay $1,000/month for the solution.

---

## Essential Skills to Install

These are the most useful skills for beginners — all verified to exist in the ClawHub registry:

```bash
# Weather forecasts and current conditions
clawhub install weather

# Summarize URLs, PDFs, YouTube videos, and long documents
clawhub install summarize

# GitHub repo management, issues, PRs — great for tech clients
clawhub install github

# Web browsing and URL content extraction
clawhub install xurl

# Email management via IMAP/SMTP
clawhub install himalaya

# iMessage sending/reading (macOS only)
clawhub install imsg

# Generate images via OpenAI
clawhub install openai-image-gen

# Speech-to-text transcription via Whisper API
clawhub install openai-whisper-api

# Make and receive phone calls
clawhub install voice-call
```

**Power user skills:**

```bash
# Spawn coding agents (Codex, Claude Code) for dev work
clawhub install coding-agent

# GitHub Issues → automated PR workflow
clawhub install gh-issues

# Security hardening and health checks
clawhub install healthcheck

# Create and publish your own skills
clawhub install skill-creator
```

**After installing, restart your session:**
```
/reset
```
Then ask your agent:
```
What skills do you have installed?
```

---

## How Much Does This Cost?

| Item | Cost | Notes |
|------|------|-------|
| OpenClaw | **Free** | Open source, MIT license |
| ClawHub Skills | **Free** | All public skills are free |
| Anthropic API | **$5–50/mo** | Light = $5–15, Heavy = $50+ |
| OpenRouter | **Pay-as-you-go** | Only pay for what you use |
| Telegram | **Free** | Bot API has no usage fees |
| Brave Search API | **Free tier** | 2,000 searches/month free |
| Mac Mini M4 (if buying) | **$599 one-time** | Optional — works on any Mac |
| VPS Alternative | **$6–12/mo** | DigitalOcean, Hetzner, etc. |

**Realistic budget to get started:** $20–40/month all-in (API costs only if you already have a Mac).

**Cost optimization tips:**
- Use `claude-haiku-4-5` for simple tasks (5× cheaper than Sonnet)
- Set up model fallbacks in config — Haiku for routing, Sonnet for complex work
- `web_fetch` is free; `web_search` needs a Brave API key for more than basic usage
- Review your spending weekly for the first month at platform.claude.com

---

## Common Mistakes (Don't Do These)

### ❌ Mistake 1: Giving your agent access to your real email
Your main email contains passwords, bank statements, and 2FA codes. Create a new Gmail account specifically for agent access. If your agent ever gets prompted to forward something, you don't want it touching your real inbox.

### ❌ Mistake 2: Not setting API spending limits
Without limits, a runaway agent loop or accidentally public bot can rack up hundreds in API costs overnight. Set a $50 hard cap before anything else.

### ❌ Mistake 3: Using Opus for everything
Claude Opus 4.6 is brilliant but expensive. For simple tasks like "what's the weather?" or "draft a quick reply," use Haiku — it's 25× cheaper and nearly as good for routine work.

### ❌ Mistake 4: Installing skills without reading them
Every skill modifies how your agent behaves. Run `cat ~/.openclaw/workspace/skills/SKILLNAME/SKILL.md` before installing anything. A malicious skill (rare but possible) could instruct your agent to exfiltrate data.

### ❌ Mistake 5: Using `dmPolicy: "open"` on your Telegram bot
If your bot is set to "open," anyone who finds your bot can use your AI (and your API credits). Always use `"pairing"` or `"allowlist"`.

### ❌ Mistake 6: Trying to build everything at once
Pick one workflow. Build it well. Prove the value. Then expand. The agents who win are the ones who solve one problem perfectly, not ten problems halfway.

---

## Troubleshooting

**"openclaw: command not found"**
```bash
# Check if npm global bin is in your PATH
npm prefix -g
# Add to ~/.zshrc:
export PATH="$(npm prefix -g)/bin:$PATH"
source ~/.zshrc
```

**Bot not responding in Telegram**
```bash
openclaw gateway status      # is it running?
openclaw logs --follow       # watch live logs
openclaw channels status     # check Telegram connection
```

**Config validation error at startup**
```bash
openclaw doctor              # diagnose issues
openclaw doctor --fix        # auto-fix common problems
```

**High API costs**
```bash
# Switch to Haiku for daily use
openclaw config set agents.defaults.model.primary "anthropic/claude-haiku-4-5"
```

---

## Next Steps

Once you have your agent running, level up with these playbooks:

- **Sales Playbook** → How to sell OpenClaw services on Upwork and to local businesses *(coming soon)*
- **TikTok Content Playbook** → Auto-generate and schedule TikTok content with your agent *(coming soon)*
- **Meta Ads Playbook** → Research, write, and monitor Facebook/Instagram ad campaigns with AI *(coming soon)*
- **Customer Service Playbook** → Build a 24/7 email responder for any business *(coming soon)*
- **Real Estate Playbook** → Automate listing syndication, lead follow-up, and market reports *(coming soon)*

---

## Verified Links

| Resource | URL | Status |
|----------|-----|--------|
| OpenClaw Official Site | https://openclaw.ai | ✅ Live |
| OpenClaw Documentation | https://docs.openclaw.ai | ✅ Live |
| Getting Started Guide | https://docs.openclaw.ai/start/getting-started | ✅ Live |
| Install Guide | https://docs.openclaw.ai/install | ✅ Live |
| Telegram Channel Setup | https://docs.openclaw.ai/channels/telegram | ✅ Live |
| ClawHub Skill Registry | https://clawhub.ai | ✅ Live |
| ClawHub Docs (OpenClaw) | https://docs.openclaw.ai/tools/clawhub | ✅ Live |
| Anthropic Developer Platform | https://platform.claude.com | ✅ Live |
| Anthropic API Pricing | https://www.anthropic.com/pricing | ✅ Live |
| OpenRouter | https://openrouter.ai | ✅ Live |
| OpenClaw GitHub | https://github.com/openclaw/openclaw | ✅ Live |
| ClawHub GitHub | https://github.com/openclaw/clawhub | ✅ Live |
| FreeCodeCamp Tutorial | https://www.freecodecamp.org/news/openclaw-full-tutorial-for-beginners/ | ✅ Live |
| DigitalOcean Deploy Guide | https://www.digitalocean.com/community/tutorials/how-to-run-openclaw | ✅ Live |

---

## Quick Reference Card

Save this — you'll use it constantly:

```bash
# Start/stop/check gateway
openclaw gateway start
openclaw gateway stop
openclaw gateway status

# Open browser control panel
openclaw dashboard

# View live logs (great for debugging)
openclaw logs --follow

# Fix config problems
openclaw doctor
openclaw doctor --fix

# Skills
clawhub search "something"
clawhub install skill-name
clawhub update --all
clawhub list

# Config shortcuts
openclaw config get agents.defaults.model.primary
openclaw config set channels.telegram.enabled true

# Pairing
openclaw pairing list telegram
openclaw pairing approve telegram <CODE>
```

---

*Last updated: March 2026 | Based on OpenClaw docs at docs.openclaw.ai*

*This guide is part of the [Maxxer Academy](/) series. Share it, but don't sell it.*
