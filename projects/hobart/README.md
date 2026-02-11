# Hobart 🦞 - WhatsApp Job Search Assistant

A personalized job search assistant that sends daily curated job listings via WhatsApp.

## Features

- **Conversational Onboarding**: Casual interview to gather preferences
- **Daily Job Digest**: Configurable morning job alerts
- **Resume Upload**: Accept PDF/Word via WhatsApp, parse and store
- **Smart Matching**: Relevance scoring based on keywords, salary, location
- **User Controls**: Adjust listings count, format, pause/resume

## Setup

### 1. Create WhatsApp Channel in OpenClaw

Add to your `openclaw.yaml`:

```yaml
channels:
  - type: whatsapp
    name: hobart
    # WhatsApp Business API config
```

### 2. Create Dedicated Session

```yaml
sessions:
  hobart:
    channel: whatsapp
    systemPrompt: |
      You are Hobart, a friendly job search assistant.
      Follow the instructions in HOBART.md for all interactions.
    workingDir: /path/to/hobart
    files:
      - HOBART.md
      - scripts/
      - memory/
```

### 3. Set Up Daily Cron

```yaml
cron:
  - name: hobart-daily-digest
    schedule:
      kind: cron
      expr: "0 8 * * *"  # 8am daily
      tz: America/New_York
    sessionTarget: isolated
    payload:
      kind: agentTurn
      message: |
        Run the daily job digest for all active Hobart users.
        
        1. Load all users from memory/users/
        2. For each user with digest.paused = false:
           - Build search query from their preferences
           - Run web_search with the query
           - Parse and score results
           - Send formatted digest via WhatsApp
        3. Log results to memory/digest-log.md
```

## User Preferences

Stored in `memory/users/{phone}.json`:

```json
{
  "name": "Test User",
  "phone": "1234567890",
  "onboarded": true,
  "keywords": ["product manager", "pm"],
  "industries": ["biotech", "healthcare"],
  "salaryMin": 120000,
  "salaryMax": 180000,
  "location": "New York, NY",
  "remotePreference": "hybrid",
  "resume": {
    "lastUpdated": "2024-02-10",
    "filePath": "memory/resumes/1234567890.pdf"
  },
  "digest": {
    "frequency": "daily",
    "time": "08:00",
    "format": "summary",
    "maxListings": 5,
    "paused": false
  }
}
```

## User Commands

| Command | Description |
|---------|-------------|
| "Update my resume" | Upload new resume |
| "Change keywords to X" | Update job search keywords |
| "Change salary to $X-$Y" | Update salary range |
| "Show more listings" | Increase daily limit |
| "Detailed mode" | Switch to detailed format |
| "Summary mode" | Switch to summary format |
| "Pause" | Pause daily digests |
| "Resume" | Resume daily digests |
| "Search for X now" | Immediate job search |
| "My profile" | Show current settings |

## Anti-Bot Strategy

We use **Brave Search API** (via `web_search` tool) instead of direct scraping:
- No CAPTCHA issues
- No rate limiting concerns
- Consistent results
- Legal and TOS-compliant

Search is scoped to job sites:
- LinkedIn Jobs
- Indeed
- Glassdoor
- BuiltIn
- Wellfound

## Directory Structure

```
hobart/
├── HOBART.md           # Agent personality & instructions
├── README.md           # This file
├── memory/
│   ├── users/          # User profiles (JSON)
│   ├── resumes/        # Uploaded resumes
│   └── digest-log.md   # Digest send history
├── scripts/
│   ├── user-state.js   # User management
│   └── job-search.js   # Search & formatting
└── templates/
    └── digest.md       # Message templates
```

## Testing

To test as a user:

1. Message the Hobart WhatsApp number
2. Complete onboarding flow
3. Wait for morning digest OR say "Search now"
4. Adjust preferences as needed

## Troubleshooting

**No results?**
- Broaden keywords (use common job titles)
- Check location spelling
- Try "any" for industries

**Too many irrelevant results?**
- Add more specific keywords
- Narrow industries
- Specify exact location

**Resume not parsing?**
- Ensure PDF is text-based (not scanned image)
- Try re-uploading
- Check file isn't password-protected
