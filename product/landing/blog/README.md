# JOCHero Blog Structure

## Overview

The JOCHero blog provides educational content about Job Order Contracting (JOC), helping contractors understand the JOC process and become more efficient at winning government construction work.

## Directory Structure

```
/blog/
├── index.html                              # Blog index/listing page
├── README.md                               # This file
└── what-is-job-order-contracting/
    └── index.html                          # First blog post
```

## Adding New Blog Posts

### 1. Create Post Directory

```bash
mkdir -p blog/your-post-slug/
```

### 2. Create index.html

Copy the structure from an existing post and update:
- Title and meta description
- Open Graph tags
- Canonical URL
- Article structured data
- Content

### 3. SEO Checklist

For each new post, ensure:

- [ ] **Title Tag**: Under 60 characters, includes primary keyword
- [ ] **Meta Description**: 150-160 characters, compelling summary
- [ ] **Canonical URL**: Points to `https://jochero.com/blog/your-post-slug/`
- [ ] **Open Graph Tags**: og:title, og:description, og:image, og:url
- [ ] **Twitter Cards**: twitter:card, twitter:title, twitter:description, twitter:image
- [ ] **Structured Data**: Article schema with author, datePublished, dateModified
- [ ] **H1 Tag**: One H1 matching the title
- [ ] **Header Hierarchy**: Logical H2, H3 structure
- [ ] **Alt Text**: All images have descriptive alt text
- [ ] **Internal Links**: Link to relevant JOCHero pages and other blog posts
- [ ] **Mobile Responsive**: Test on mobile devices

### 4. Update Blog Index

Add the new post card to `/blog/index.html`:
- Update featured post if appropriate
- Add new card to the grid
- Remove "Coming Soon" placeholder if needed

### 5. Update Homepage

If the post should be featured on the homepage:
- Update the blog preview section in `/index.html`

## Post Categories

Current categories:
- **JOC Fundamentals** - Core concepts and getting started
- **Estimating Tips** - Best practices for JOC estimating
- **Agency Guides** - Specific guidance for different agencies (NYC HHC, DCAS, etc.)
- **Case Studies** - Success stories from contractors
- **Industry News** - Updates on JOC programs and regulations

## Design Guidelines

### Trust Blue Theme

Use the established JOCHero color palette:
- Primary Blue: `#2563EB` (--blue-600)
- Dark Blue: `#1E40AF` (--blue-800)
- Light Blue: `#EFF6FF` (--blue-50)

### Typography

- Body: 1.125rem (18px), line-height 1.8
- H1: clamp(2rem, 5vw, 3rem)
- H2: 1.875rem
- H3: 1.375rem

### Components

- **Callout Boxes**: Use for key definitions, stats, warnings
- **Stat Highlights**: Display important numbers prominently
- **Process Steps**: Numbered vertical timeline
- **Comparison Tables**: For before/after or feature comparisons
- **CTAs**: End each post with relevant call-to-action

## Content Guidelines

### Voice & Tone

- Professional but approachable
- Direct and practical
- Focus on actionable advice
- Avoid jargon without explanation

### Structure

1. **Lead**: Hook the reader with a relatable problem
2. **Definition**: Clear explanation of the topic
3. **Benefits**: Why this matters to contractors
4. **How-To**: Step-by-step guidance
5. **Pitfalls**: Common mistakes to avoid
6. **CTA**: Next steps and JOCHero promotion

### Word Count

- Aim for 1,500-3,000 words for pillar content
- 800-1,500 words for tactical posts
- Include visual breaks (callouts, stats, images) every 300-400 words

## Deployment

The blog is part of the JOCHero static site. Deployment is handled through the same process as the main site.

To deploy changes:
1. Commit your changes
2. Push to the main branch
3. Changes will be deployed automatically

## Future Improvements

- [ ] Add blog post images (featured image, inline images)
- [ ] Implement search functionality
- [ ] Add category filtering
- [ ] Create author pages
- [ ] Add related posts algorithm
- [ ] Implement newsletter signup integration
- [ ] Add social share tracking
- [ ] Create XML sitemap for blog

## Contact

For questions about the blog structure or content strategy, contact the JOCHero team.
