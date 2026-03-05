# Maxxer Academy — Update Log

---

## 2026-03-03 — Auto-Update (cron: maxxer-academy-x-scanner)

**Search window:** Last 4 days (Feb 27 – Mar 3, 2026)
**Search terms:** openclaw agent revenue business automation shipped built workflow
**Sources checked:** X/Twitter (via web search), Reddit, Medium, StackOne blog, Register

### Posts Found & Assessed

| # | Source | Author | Topic | Quality | Action |
|---|--------|--------|-------|---------|--------|
| 1 | Reddit r/AgencyGrowthHacks | Anonymous holding co founder | Claude Code content engine + ad spend dashboard, $5K/mo replaced | ✅ High | Added |
| 2 | StackOne blog / X | @stackone (Guillaume Lebedel) | Rebuilt 42-page marketing site in 2 weeks with Claude Code, non-engineers ship independently | ✅ High | Added |
| 3 | Medium @rentierdigital | Anonymous | Full OpenClaw rebuild on Kimi K2.5 for $15/mo after Anthropic ToS change | ✅ High | Added |
| 4 | The Register / X | Gavriel Cohen (NanoClaw) | NanoClaw container architecture, $5B fintech interested | ⚠️ Medium — more infra/security angle than founder revenue story | Skipped |
| 5 | simonwillison / Karpathy | @karpathy | "Claws" as orchestration layer, NanoClaw praise | ⚠️ Editorial/meta — no actionable workflow | Skipped |

### Cards Added to index.html

#### 1. Content & Video section (new Tier 2 card)
- **Title:** Agency Holding Co — 5-Format Content Engine + $5K/mo Ad Dashboard
- **Author:** r/AgencyGrowthHacks (anonymous)
- **Result badge:** Built in one afternoon
- **Key takeaway:** Non-coder runs 4 agencies; Claude Code drafts 5 content formats simultaneously, schedules via APIs (Typefully/WordPress/ActiveCampaign), built Hyros ad dashboard replacing $5K/mo agency spend
- **Tools:** Claude Code, Typefully, ActiveCampaign, Hyros, WordPress
- **Link:** reddit.com/r/AgencyGrowthHacks/comments/1rh0gs8

#### 2. Setup & Infrastructure section (new Tier 3 card)
- **Title:** Rebuilt Marketing Site in 2 Weeks — Non-Engineers Ship Independently
- **Author:** @stackone (Guillaume Lebedel) — March 2, 2026
- **Result badge:** 42 pages · 50 PRs
- **Key takeaway:** Dropped Webflow, 2 founders + PMM used Claude Code to build 86K lines, 903 connector pages, 42 templates, 5 CI/CD workflows on Cloudflare Pages in 2 weeks
- **Tools:** Claude Code, Cloudflare Pages, Astro 5, GitHub Actions
- **Link:** stackone.com/blog/rebuilding-marketing-site-claude-code-cloudflare/

#### 3. Setup & Infrastructure section (new Tier 3 card)
- **Title:** Cut OpenClaw API Cost from $200/mo to $15 — Full Rebuild
- **Author:** @rentierdigital (Medium)
- **Result badge:** $185/mo saved
- **Key takeaway:** After Anthropic banned Max OAuth tokens in OpenClaw, rebuilt on 2x $5 VPS + Kimi K2.5 + MiniMax M2.5. Same automations, model-agnostic, cost-resilient
- **Tools:** OpenClaw, Kimi K2.5, VPS (Hostinger), himalaya
- **Link:** medium.com/@rentierdigital/...

### Stats Updated
- Hero playbook count: 20 → 23

### Deployment
- Git commit: `5c166c9`
- Pushed to: github.com/christiancattaneo/maxxer-academy
- Deploy URL: https://maxxer-academy-5an7td4h0-christiancattaneos-projects.vercel.app
- Deployed to: https://maxxer.academy (Vercel prod)
- Deploy URL: https://maxxer-academy-971we12y3-christiancattaneos-projects.vercel.app

---

## 2026-03-05 — Auto-Update (cron: maxxer-academy-x-scanner)

**Search window:** Last 4 days (Mar 1 – Mar 5, 2026)
**Search terms:** openclaw agent revenue business automation shipped built workflow
**Sources checked:** X/Twitter (via web search), Medium, Reddit, Hacker News, AWS News Blog

### Posts Found & Assessed

| # | Source | Author | Topic | Quality | Action |
|---|--------|--------|-------|---------|--------|
| 1 | Medium | Florian Darroman (@profitfounder) | 13 named OpenClaw agents running a podcast — 20hrs/week → 30 min, $200/mo cost | ✅ High | Added |
| 2 | Hacker News / ClawHost | @clawhost | 24/7 blogging agent with full SSH + git + Nano Banana 2 + Vercel deploy | ✅ High | Added |
| 3 | AWS News Blog | AWS | OpenClaw officially ships on Amazon Lightsail with one-click Bedrock deploy (Mar 4) | ✅ High | Added |
| 4 | Reddit r/SideProject | LikeClaw founders | B2B AI platform ships consumer version in 7 days after OpenClaw goes viral | ⚠️ Medium — product launch story, not actionable workflow | Skipped |
| 5 | Odaily / ecosystem data | Ecosystem report | 129 OpenClaw startups generating $283K cumulative/month | ⚠️ Aggregate stats — not a specific founder workflow | Skipped |

### Cards Added to index.html

#### 1. Content & Video section (new Tier 2 card)
- **Title:** 13-Agent Podcast COO — 20hrs/week → 30 Minutes
- **Author:** Florian Darroman (@profitfounder) — March 4, 2026
- **Result badge:** 20hrs → 30 min/week
- **Key takeaway:** Solo podcast founder runs a 13-agent team on a $600 Mac Mini. Marc (COO) orchestrates war rooms; Dan posts to X 3×/day; Claude picks transcript highlights at 2AM; Adrien auto-edits clips via Whisper; Mona Lisa handles sponsorships; Billy runs Skool community. ~$200-250/mo total cost.
- **Tools:** OpenClaw, openai-whisper, Typefully, Skool, YouTube API
- **Link:** florian-darroman.medium.com/...

#### 2. Setup & Infrastructure section (new Tier 3 card)
- **Title:** 24/7 Blogging Agent — Writes, Images, Git, Deploys, Notifies
- **Author:** @clawhost (Hacker News) — March 2, 2026
- **Result badge:** Fully autonomous
- **Key takeaway:** Agent with full VPS SSH access writes articles, generates images via Nano Banana 2, handles git branch/merge/deploy, triggers Vercel rebuild, notifies on Telegram. Runs on ClawHost for ~$10/mo. "What makes this work is giving the agent a real environment to operate in."
- **Tools:** OpenClaw, ClawHost VPS, Nano Banana 2, Vercel MCP
- **Link:** news.ycombinator.com/item?id=47214461

#### 3. Setup & Infrastructure section (new Tier 3 card)
- **Title:** OpenClaw Now Official on AWS Lightsail — One-Click Deploy
- **Author:** AWS News Blog — March 4, 2026
- **Result badge:** GA · Bedrock built-in
- **Key takeaway:** OpenClaw now ships as an official AWS Lightsail blueprint (4GB plan recommended, ~$20/mo). Pre-configured with Amazon Bedrock as default model provider. Best cloud-hosted option that avoids the VPS security/config headache.
- **Tools:** OpenClaw, Amazon Lightsail, Amazon Bedrock, AWS Marketplace
- **Link:** aws.amazon.com/blogs/aws/introducing-openclaw-on-amazon-lightsail...

### Deployment
- Git commit: 0471792
- Pushed to: github.com/christiancattaneo/maxxer-academy
- Deploy URL: https://maxxer-academy-5an7td4h0-christiancattaneos-projects.vercel.app
- Deployed to: https://maxxer.academy (Vercel prod)
