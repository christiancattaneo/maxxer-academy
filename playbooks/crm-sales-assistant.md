# CRM Sales Assistant — Automated Deal Tracking & Outreach
> Based on workflows by [@dashboardlim](https://x.com/dashboardlim/status/2024863642575896613) and [@ericosiu](https://x.com/ericosiu/status/2019542209780215899)

---

## Overview

| | |
|---|---|
| **What** | An OpenClaw agent connected to your CRM that analyzes your entire pipeline, identifies stale deals, builds prioritized follow-up lists, and executes personalized outreach sequences — all from a single conversation |
| **Results** | 169 open deals analyzed and broken down by pipeline stage in seconds; enterprise meetings booked with multi-trillion dollar companies |
| **Difficulty** | Intermediate |
| **Setup time** | 2–3 hours |
| **Monthly cost** | $0 (HubSpot Free + local AI model) or ~$20–50/month (HubSpot Starter + API usage) |

### The Two Workflows This Combines

**@dashboardlim's Sales Pipeline Assistant:**
> "we just turned openclaw into a full sales assistant connected it to HubSpot CRM and asked 'how many deals do i need to chase?' it came back with 169 open deals broken down by pipeline and stage in seconds"
>
> Dashboard Lim Sales Pipeline: 39 deals → 15 in "follow-up in 3 months" → 12 in "follow-up required" → 3 in discovery call → 3 no-shows
>
> Then asked it to build an automated follow-up system.

**@ericosiu's Daily Deal Finder:**
> "This @openclaw agent looked through my connections, came up with an angle, and booked a meeting with a multi-trillion dollar company. It's called the Daily Deal Finder. OpenClaw goes through our CRM, sales transcripts and based on our goals, figures out the right people to talk to and what the angle is."

---

## Prerequisites

- [ ] **OpenClaw installed** — [getopenclaw.ai](https://www.getopenclaw.ai) (macOS or Linux)
- [ ] **HubSpot account (free tier works!)** — [app.hubspot.com/signup](https://app.hubspot.com/signup) — No credit card needed
- [ ] **HubSpot Private App token** — covered in Step 2 below
- [ ] **`himalaya` email skill** — for sending follow-up emails → [clawhub.ai/lamelas/himalaya](https://clawhub.ai/lamelas/himalaya)
- [ ] **Super Admin or App Marketplace Access** in your HubSpot account

---

## What the Agent Does

### Deal Analysis

The agent connects directly to the HubSpot CRM API and can answer questions like:

- *"How many deals do I need to chase?"*
- *"Show me all deals with no activity in 30+ days"*
- *"What's my total pipeline value by stage?"*
- *"Which deals are closing this month?"*

Under the hood, it calls HubSpot's `/crm/v3/objects/deals` API, filters by `dealstage`, `hs_lastmodifieddate`, and `amount`, then formats results into a prioritized action list.

**What it pulls per deal:**
- Deal name, stage, pipeline
- Associated contact and company
- Deal value and projected close date
- Last activity date (to flag stale deals)
- Owner (for team handoffs)

### Automated Follow-Up Sequences

Once stale deals are identified, the agent drafts and (optionally) sends a personalized sequence:

| Day | Channel | Action |
|-----|---------|--------|
| Day 1 | Email | Personal recap of last conversation + soft CTA |
| Day 2 | LinkedIn | Connection request + short context note |
| Day 3 | SMS | Permission-based short check-in (if you have their number) |
| Day 4 | Phone | Call script + voicemail drop text prepared |

Email sending uses the `himalaya` skill via IMAP/SMTP. The agent composes the email, you approve it, and `himalaya` sends it — logged back to HubSpot automatically.

### Daily Deal Finder (Eric Siu's Approach)

A daily cron job that runs through your entire CRM + any sales transcripts you have on disk:

1. **Scans** all contacts and companies in your CRM
2. **Cross-references** your stated goals (ICP, revenue targets, partnership needs)
3. **Identifies** 3–5 high-priority targets you haven't touched in a while
4. **Crafts** a personalized angle for each (based on their role, company news, last interaction)
5. **Drafts** outreach — or books a meeting via your calendar link
6. **Notifies** you on Telegram/WhatsApp with the day's hit list

---

## Step-by-Step Setup

### Step 1: Set Up HubSpot Free Account

**URL:** [https://app.hubspot.com/signup](https://app.hubspot.com/signup)

1. Go to `app.hubspot.com/signup`
2. Sign up with your work email (Google SSO works)
3. Select **"Marketing, Sales, or Service"** as your use case
4. Choose **"1 person"** or your team size
5. Select **Free plan** (no credit card required)
6. Skip the onboarding wizard or complete it — your choice

**What the Free Plan includes (relevant to this setup):**
- [ok] Unlimited contacts
- [ok] Up to 1,000,000 contacts stored
- [ok] Deal pipeline (1 pipeline, unlimited deals)
- [ok] Contact & company records
- [ok] Activity logging (calls, emails, notes)
- [ok] API access via Private Apps
- [!] No email sequences (requires Sales Hub Starter — $20/seat/month)
- [!] No custom reporting (Professional — $90/seat/month)

**Enable what you need:**
- Go to **Settings → Objects → Deals** and make sure your pipeline is set up
- Go to **Settings → Properties** to see what data fields you have

---

### Step 2: Create a HubSpot Private App

> [!] **Important:** Legacy API keys are fully deprecated as of 2024. Private App tokens are the only supported authentication method. Never commit your token to git.

**Step-by-step:**

1. In HubSpot, click the **Settings gear** (top-right)
2. In the left sidebar, go to **Integrations → Private Apps**
3. Click **"Create a private app"**
4. Give it a name: `OpenClaw Integration`
5. Add a description: `OpenClaw AI assistant — deal tracking and outreach`
6. Click the **Scopes** tab and enable:

**Essential scopes (free tier):**
```
crm.objects.contacts.read
crm.objects.contacts.write
crm.objects.companies.read
crm.objects.companies.write
crm.objects.deals.read
crm.objects.deals.write
crm.objects.owners.read
```

**For full features (add if you have the relevant Hub):**
```
sales-email-read          # Read sent emails
crm.objects.notes.read    # Read activity notes
crm.objects.notes.write   # Log notes programmatically
automation                # Trigger workflows (requires Marketing/Sales Hub)
tickets                   # Service Hub tickets
```

7. Click **"Create app"**
8. HubSpot shows your access token **once** — copy it immediately!
   - Format: `pat-na1-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`
   - Store it in a password manager or your `.env` file
   - If you lose it, you can generate a new one (old one is invalidated)

**Rate limits to know:**
- Free/Starter: 100 API calls per 10 seconds
- Professional: 150 calls per 10 seconds
- Enterprise: 200 calls per 10 seconds
- Normal conversational use will never hit these limits

---

### Step 3: Install Required Skills

**Install `himalaya` for email sending:**

```bash
clawhub install himalaya
```

ClawHub page: [https://clawhub.ai/lamelas/himalaya](https://clawhub.ai/lamelas/himalaya)

After installing, configure himalaya with your email account. The skill supports IMAP/SMTP, so it works with Gmail, Outlook, Fastmail, ProtonMail (bridge), and any standard email provider.

**Configure himalaya for Gmail (example):**

```toml
# ~/.config/himalaya/config.toml
[accounts.work]
email = "you@yourcompany.com"
display-name = "Your Name"
backend.type = "imap"
backend.host = "imap.gmail.com"
backend.port = 993
backend.encryption = "tls"
backend.login = "you@yourcompany.com"
backend.passwd.cmd = "security find-internet-password -s imap.gmail.com -w"
sender.type = "smtp"
sender.host = "smtp.gmail.com"
sender.port = 587
sender.encryption = "start-tls"
sender.login = "you@yourcompany.com"
sender.passwd.cmd = "security find-internet-password -s smtp.gmail.com -w"
```

> Note: For Gmail, you'll need to create an App Password (if 2FA is on) at [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)

**Check for a HighLevel skill (if you use HighLevel instead of HubSpot):**

```bash
clawhub search crm
clawhub search highlevel
clawhub search hubspot
```

A community HighLevel skill exists for CRM automation. If none appear, the HubSpot integration is handled natively via OpenClaw's config (see Step 4).

---

### Step 4: Configure OpenClaw for CRM Access

Add your HubSpot credentials to your OpenClaw config file:

**Config location:** `~/.config/openclaw/config.yaml`

```yaml
hubspot:
  accessToken: "pat-na1-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"

  # Optional: restrict which objects the assistant can access
  enabledObjects:
    - contacts
    - companies
    - deals
    - tasks
    - notes

  # Optional: default pipeline for deal creation
  defaults:
    pipelineId: "default"
    ownerId: "YOUR_OWNER_ID"   # Find in HubSpot: Settings → Users & Teams

  # Optional: Enterprise custom objects (requires HubSpot Enterprise)
  customObjects:
    - name: "projects"
      displayName: "Projects"
```

**Restart the gateway:**
```bash
openclaw gateway restart
```

**Test your connection:**
```
Ask your assistant: "How many contacts are in my HubSpot?"
Or: "What deals do I have in my pipeline right now?"
```

---

### Step 5: Write Your Deal Criteria (SOUL.md / Context Template)

Tell your agent what a good deal looks like by adding CRM context to your `SOUL.md` or a dedicated `CRM_CONTEXT.md` file that you reference in your SOUL:

**Create `~/CRM_CONTEXT.md`:**

```markdown
# CRM Context — Deal Criteria

## My Ideal Customer Profile (ICP)
- Company size: 50–500 employees
- Industry: SaaS, tech, or professional services
- Geography: US or EU
- Decision maker: VP Sales, CRO, Founder
- Budget signal: funded startup or $10M+ ARR

## Deal Quality Signals
- High priority: Deal value > $10k, last activity < 14 days
- Medium priority: Deal value $5k–$10k, last activity 14–30 days
- Stale: No activity in 30+ days — flag for follow-up

## My Goals This Quarter
- Close 5 enterprise deals (>$50k each)
- Reactivate 20 stale deals from Q4
- Book 15 new discovery calls with Series A+ startups

## Pipeline Stages (in order)
1. New Lead
2. Discovery Call Scheduled
3. Demo Completed
4. Proposal Sent
5. Negotiation
6. Closed Won / Closed Lost

## Follow-Up Rules
- Deals in "Proposal Sent" for >7 days → trigger follow-up sequence
- Deals in "Discovery Call Scheduled" with no show → re-book within 48 hours
- Deals marked "Follow-up in 3 months" → review monthly

## Sales Transcripts Location
~/Documents/sales-calls/   ← Gong exports, Otter.ai transcripts, etc.
```

**Reference this in your SOUL.md:**
```markdown
## CRM Context
Read ~/CRM_CONTEXT.md for deal criteria, ICP, and pipeline stage definitions.
Always use this when analyzing deals or crafting outreach.
```

---

### Step 6: Set Up Daily Deal Finder Cron

This is Eric Siu's "Daily Deal Finder" — a scheduled agent run every morning that scans your CRM and hands you a prioritized hit list.

**Option A: Daily cron job (isolated session, precise timing)**

```bash
openclaw cron add \
  --name "Daily Deal Finder" \
  --cron "0 8 * * 1-5" \
  --tz "America/New_York" \
  --session isolated \
  --message "You are my sales assistant. Read ~/CRM_CONTEXT.md for my ICP and goals.

Today's task:
1. Pull all open deals from HubSpot CRM
2. Identify the top 5 deals to focus on today based on: deal value, last activity date, and stage
3. For stale deals (no activity 30+ days), draft a follow-up email via himalaya
4. Scan ~/Documents/sales-calls/ for any recent transcripts — extract follow-up commitments I made
5. Identify 3 contacts in my CRM who match my ICP but haven't been contacted in 60+ days
6. For each, craft a personalized outreach angle based on their company/role
7. Send me a summary with today's hit list and draft outreach

Format your response as:
* TOP DEALS TO CHASE TODAY
 STALE DEALS NEEDING FOLLOW-UP
* NEW OUTREACH TARGETS
 COMMITMENTS FROM RECENT CALLS" \
  --model opus \
  --thinking high \
  --announce \
  --channel telegram
```

**Option B: Heartbeat integration (add to HEARTBEAT.md)**

If you prefer lighter-weight daily checks integrated into your heartbeat cycle, add to `~/HEARTBEAT.md`:

```markdown
# Heartbeat Checklist

## CRM Check (run on weekday mornings 8–10am only)
- Check HubSpot for any deals with no activity in 30+ days
- Flag any deals in "Proposal Sent" for more than 7 days
- If critical deals found, notify immediately
```

Then configure your heartbeat:
```json5
// In openclaw config
{
  agents: {
    defaults: {
      heartbeat: {
        every: "30m",
        target: "telegram",
        activeHours: { start: "08:00", end: "22:00" }
      }
    }
  }
}
```

**Option C: Manual trigger (on-demand)**

No cron needed — just ask your agent anytime:
```
"Run the daily deal finder"
"Show me my stale deals"
"Which deals should I chase today?"
"Draft a follow-up for the Acme deal"
```

---

## Sample Prompts to Get Started

Once set up, try these immediately:

```
"How many deals do I have open right now? Break them down by pipeline stage."

"Which deals haven't had any activity in the last 30 days? List them with deal value."

"Brief me on the top 5 deals by value that are closing this quarter."

"Draft a follow-up email to [Contact Name] at [Company] — we last spoke about [topic]."

"Look up Sarah Johnson at TechCorp — what's the deal status and last activity?"

"Which contacts in my CRM match my ICP but haven't been approached yet?"

"Log a call with Mike Chen at Acme — we discussed the enterprise renewal, he needs board approval by end of March."

"Update the Zenith deal to 'Proposal Sent' and add a note about their security requirements."
```

---

## CRM Alternatives

HubSpot isn't the only option. OpenClaw's conversational interface can connect to any CRM with a REST API.

### Pipedrive
- **Free trial:** 14 days, then from $14/user/month
- **API docs:** [developers.pipedrive.com/docs/api/v1](https://developers.pipedrive.com/docs/api/v1)
- **Auth:** Personal API token or OAuth 2.0
- **Get token:** Settings → Personal Preferences → API
- **OpenClaw config key:** `pipedrive.apiToken`
- **Best for:** Sales-focused teams who find HubSpot overwhelming

### Salesforce
- **Pricing:** From $25/user/month (Starter Suite)
- **API docs:** [developer.salesforce.com/docs/apis](https://developer.salesforce.com/docs/apis)
- **Auth:** Connected App with OAuth 2.0
- **Complexity:** Higher — requires Connected App setup and understanding of SOQL
- **Best for:** Enterprise teams already on Salesforce

### HighLevel (GoHighLevel)
- **Pricing:** From $97/month (agency plan)
- **API docs:** [highlevel.stoplight.io/docs](https://highlevel.stoplight.io/docs/integrations/0443d7d1a4bd0-overview)
- **Auth:** API key from Settings → Integrations
- **ClawHub skill:** Search `clawhub search highlevel`
- **Best for:** Marketing agencies managing multiple clients' CRMs

### Notion as a Lightweight CRM
- **Pricing:** Free tier available, Plus from $10/user/month
- **API docs:** [developers.notion.com](https://developers.notion.com)
- **Auth:** Integration token from notion.so/my-integrations
- **Best for:** Solo founders or tiny teams who already live in Notion
- **Limitation:** No native pipeline views — you build them in Notion databases

---

## Cost Breakdown

| Component | Cost | Notes |
|-----------|------|-------|
| OpenClaw | Free | Open source, self-hosted |
| HubSpot Free CRM | $0/month | Unlimited contacts, 1 pipeline |
| HubSpot Starter | $20/seat/month | Adds email sequences, more pipelines |
| HubSpot Professional | $90/seat/month | Advanced reporting, workflows |
| himalaya skill | Free | Open source email client |
| AI model (local Ollama) | $0/month | Run locally, no API costs |
| AI model (Claude API) | ~$5–30/month | Depends on usage volume |
| **Total (free setup)** | **$0/month** | HubSpot Free + local model |
| **Total (recommended)** | **~$20–50/month** | HubSpot Starter + Claude API |

---

## Common Issues

### "I can't find Private Apps in my HubSpot settings"
- Make sure you have **Super Admin** permissions (or your admin grants you App Marketplace Access)
- Go to: Settings → Users & Teams → your user → scroll to "Permissions" → enable "App Marketplace Access"
- Private Apps are available on **all HubSpot tiers including Free**

### "My API token is not working"
- Double-check you copied the full token (starts with `pat-na1-`)
- Verify the scopes include `crm.objects.deals.read` at minimum
- Try regenerating the token in HubSpot → Settings → Integrations → Private Apps → your app → "Rotate token"
- Run `openclaw gateway restart` after updating the token in config

### "The agent can see contacts but not deals"
- Your Private App is missing the `crm.objects.deals.read` scope
- Edit your Private App in HubSpot → add the missing scope → rotate the token → update config

### "himalaya isn't sending emails"
- Test himalaya independently: `himalaya send -t "you@email.com" -s "Test" <<< "Hello"`
- For Gmail: ensure you've created an App Password (Google 2FA must be on)
- For Outlook: enable SMTP AUTH in your Microsoft 365 admin settings

### "The Daily Deal Finder cron isn't running"
- Check cron list: `openclaw cron list`
- Check logs: `openclaw cron logs "Daily Deal Finder"`
- Verify gateway is running: `openclaw gateway status`

### "The agent is hitting API rate limits"
- Free/Starter HubSpot: 100 calls per 10 seconds — normal use won't hit this
- If running large batch analyses (1000+ deals), add delays between requests
- Upgrade to HubSpot Professional for higher limits if needed

### "I don't have sales transcripts to analyze"
- Use Otter.ai (free tier available) to record and transcribe your sales calls
- Gong, Chorus, or Fireflies.ai for team-wide transcript management
- Even rough notes in Markdown files work — the agent can parse unstructured text

---

## Links (Verified)

| Resource | URL |
|----------|-----|
| HubSpot Free Signup | https://app.hubspot.com/signup |
| HubSpot Private Apps Docs | https://developers.hubspot.com/docs/api/private-apps |
| HubSpot CRM Deals API | https://developers.hubspot.com/docs/api/crm/deals |
| HubSpot API Scopes Reference | https://developers.hubspot.com/docs/api/oauth/scopes |
| ClawHub (skill registry) | https://clawhub.ai |
| himalaya skill on ClawHub | https://clawhub.ai/lamelas/himalaya |
| OpenClaw HubSpot Integration Guide | https://www.getopenclaw.ai/integrations/hubspot |
| OpenClaw Cron vs Heartbeat Docs | https://docs.openclaw.ai/automation/cron-vs-heartbeat |
| Pipedrive API Docs | https://developers.pipedrive.com/docs/api/v1 |
| Salesforce Developer Docs | https://developer.salesforce.com/docs/apis |
| HighLevel API Docs | https://highlevel.stoplight.io/docs/integrations/0443d7d1a4bd0-overview |
| Notion API Docs | https://developers.notion.com |
| @dashboardlim original tweet | https://x.com/dashboardlim/status/2024863642575896613 |
| @ericosiu original tweet | https://x.com/ericosiu/status/2019542209780215899 |

---

## Quick Reference Card

```
# Test your setup
"How many contacts are in my HubSpot?"

# Daily deal finder (manual)
"Run the daily deal finder — show me today's hit list"

# Pipeline analysis
"Show me all deals with no activity in 30+ days, sorted by value"

# Outreach drafting
"Draft a follow-up for the [Company] deal — last touch was [date] about [topic]"

# Activity logging
"Log a call with [Name] at [Company] — discussed [topic], next step is [action]"

# Deal updates
"Move the [Company] deal to Proposal Sent and note they need [requirement]"
```

---

*Last updated: March 2026 | Based on @dashboardlim and @ericosiu's OpenClaw workflows*
