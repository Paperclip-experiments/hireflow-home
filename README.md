# HireFlow Website

HireFlow is an AI-powered client acquisition and pipeline management platform for SMB staffing agencies (5-50 recruiters). This repository contains the marketing website: landing page, blog, and a local development server.

## Project Structure

```
paper-clip/
  index.html                    # Landing page (main website)
  serve.js                      # Node.js static file server for local development
  package.json                  # Project metadata and scripts
  README.md                     # This file
  blog/
    index.html                  # Blog listing page
    why-your-ats-is-not-a-bd-tool.html
                                # Blog post: Why your ATS is not a BD tool
    staffing-agency-client-acquisition-blueprint-2026.html
                                # Blog post: Client acquisition blueprint for 2026
```

## Quick Start

### Prerequisites

- Node.js 18+ (any recent version works)

### Run Locally

```bash
cd /Users/utkarsh/IdeaProjects/paper-clip
node serve.js
```

The website will be available at **http://localhost:8080/**.

Or with npm:

```bash
npm start
```

### Pages

| Page | Local URL | Description |
|------|-----------|-------------|
| Landing page | http://localhost:8080/ | Full marketing site with hero, features, pricing, FAQ, testimonials |
| Blog index | http://localhost:8080/blog/ | Blog listing with article previews |
| Blog post 1 | http://localhost:8080/blog/why-your-ats-is-not-a-bd-tool.html | Why ATS tools fail at business development |
| Blog post 2 | http://localhost:8080/blog/staffing-agency-client-acquisition-blueprint-2026.html | Comprehensive client acquisition guide for 2026 |

## Landing Page Sections

The `index.html` landing page contains 10 sections:

1. **Navigation** -- Fixed top bar with links to Features, Pricing, FAQ, Blog, and CTA button
2. **Hero** -- Headline ("Stop chasing clients. Start closing them."), subheadline, email capture, social proof stats
3. **Problem** -- Addresses the pain point: ATS tools are not built for business development
4. **Features** -- 4-card grid: AI Prospecting, Outbound Automation, Pipeline Dashboard, Client Portal
5. **How It Works** -- 3-step process: Connect sources, AI finds opportunities, close deals
6. **Social Proof** -- Testimonial cards with agency owner quotes and key metrics
7. **Pricing** -- 3 tiers: Starter ($79/seat/mo), Growth ($149/seat/mo), Agency ($249/seat/mo)
8. **Integrations** -- Logo grid: Bullhorn, JobAdder, Gmail, Outlook, LinkedIn, Slack, HubSpot, Zapier
9. **FAQ** -- 6 expandable questions with interactive toggle (JavaScript)
10. **CTA + Footer** -- Final call-to-action and company footer with navigation links

## SEO and Structured Data

The website includes:

- **Meta tags**: title, description, keywords, canonical URL, Open Graph (Facebook), Twitter Card
- **Schema.org structured data**:
  - `Organization` -- company identity
  - `SoftwareApplication` -- product with pricing offers
  - `FAQPage` -- FAQ section for rich snippets in search results
- **Semantic HTML**: proper heading hierarchy (h1-h3), section elements, nav, footer
- **Canonical URL**: set to `https://hireflow.ai` (update when domain is live)

## Blog Posts

### Post 1: "Why Your ATS Is Not a BD Tool"
- **Target keyword**: staffing agency business development
- **Length**: ~8 minute read
- **Content**: Explains why applicant tracking systems fail at client acquisition, covers the gap between candidate management and business development, introduces signal-based prospecting

### Post 2: "The Staffing Agency Client Acquisition Blueprint for 2026"
- **Target keyword**: staffing agency client acquisition
- **Length**: ~10 minute read
- **Content**: Comprehensive guide covering 5 pillars: signal-based prospecting, multi-channel outreach, pipeline management, client portals, and data-driven optimization. Includes data tables and statistics.

Both posts include:
- `Article` schema markup for search engines
- Responsive styling consistent with the main site
- Internal links back to the landing page
- Author attribution and publication dates

## Development Server (`serve.js`)

A zero-dependency Node.js static file server:

- Serves files from the project root directory
- Handles MIME types for HTML, CSS, JS, JSON, images, SVG, and ICO
- Resolves directory URLs to `index.html` (e.g., `/blog/` serves `/blog/index.html`)
- Path traversal protection (rejects requests outside root)
- Listens on `0.0.0.0:8080` (accessible from any network interface)
- No dependencies -- uses only Node.js built-in modules (`http`, `fs`, `path`)

### Configuration

To change the port, edit `serve.js` line 6:

```javascript
const port = 8080;  // Change to any available port
```

## Deployment

This is a static website -- no build step required. Deploy the contents of this directory to any static hosting provider:

### Vercel
```bash
npx vercel --prod
```

### Netlify
```bash
npx netlify deploy --prod --dir .
```

### Cloudflare Pages
Upload via the Cloudflare dashboard or use Wrangler:
```bash
npx wrangler pages deploy .
```

### GitHub Pages
Push to a GitHub repo and enable Pages in Settings > Pages, selecting the root directory.

### Any Static Host
Upload all files maintaining the directory structure. Ensure the host serves `index.html` for directory paths.

## Technology

- **Pure HTML/CSS/JS** -- no frameworks, no build tools, no dependencies
- **Google Fonts** -- Inter (400, 500, 600, 700, 800 weights)
- **Responsive design** -- mobile-first, works on all screen sizes
- **Self-contained** -- each HTML file includes its own CSS in `<style>` tags

## Product Context

HireFlow targets SMB staffing agencies (5-50 recruiters) with:

- **AI Prospecting**: Detects companies with hiring intent signals (job postings, funding rounds, headcount changes) and surfaces them as leads
- **Outbound Automation**: Multi-step email sequences for BD outreach with personalization
- **Pipeline Dashboard**: Kanban-style deal tracker with revenue forecasting
- **Client Portal**: White-labeled portal for clients to submit roles and track candidate status

### Pricing Tiers

| Tier | Price | Audience | Key Limits |
|------|-------|----------|------------|
| Starter | $79/seat/mo | Solo BD reps | 500 prospects/mo, 3 sequences |
| Growth | $149/seat/mo | Small teams | 2,000 prospects/mo, unlimited sequences, CRM sync |
| Agency | $249/seat/mo | Full agencies | Unlimited prospects, client portal, API access, dedicated CSM |

## Company

- **Company**: Nexus (operating as HireFlow)
- **Founded**: 2026
- **Domain**: hireflow.ai (planned)
