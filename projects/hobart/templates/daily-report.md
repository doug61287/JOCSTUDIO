# Daily Job Digest Template

## Header
```
{greeting}, {name}! 👋

Here are today's top {count} matches:
```

## Job Listing (Summary)
```
{emoji} **{title}** @ {company}
   📍 {location} | {remote_status} | 💰 {salary}
   🔗 [Apply on {source}]({url})
```

## Job Listing (Detailed)
```
━━━━━━━━━━━━━━━━━━━━━━

**{number}. {title}**
🏢 {company}
📍 {location} | {remote_status} | 💰 {salary}

**About this role:**
{snippet}

🔗 [Apply on {source}]({url})
```

## Footer
```
---
💡 **Tip:** {random_tip}

Reply "details #" for full description
Reply "more" for additional listings
Reply "pause" to stop daily digests
```

## Empty State
```
No new matches today, but I'm keeping an eye out! 👀

💡 **Tip:** Try broadening your search keywords or location.
```

## Variables
- `{greeting}` - Time-based (Good morning/afternoon/evening)
- `{name}` - User's first name
- `{count}` - Number of listings
- `{emoji}` - Number emoji (1️⃣, 2️⃣, etc.)
- `{title}` - Job title
- `{company}` - Company name
- `{location}` - City, State
- `{remote_status}` - 🏠 Remote / 🔄 Hybrid / (empty if on-site)
- `{salary}` - Salary range
- `{source}` - LinkedIn/Indeed/Glassdoor/etc.
- `{url}` - Direct apply link
- `{snippet}` - Job description excerpt
- `{random_tip}` - Random tip from tip pool
