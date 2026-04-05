import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding HireFlow database...");

  // 1. Demo agency
  const agency = await prisma.agency.create({
    data: {
      name: "Apex Talent Solutions",
      domain: "apextalent.com",
      plan: "GROWTH",
    },
  });
  console.log(`Created agency: ${agency.name}`);

  // 2. Admin user
  const passwordHash = await bcrypt.hash("demo123", 10);
  const admin = await prisma.user.create({
    data: {
      agencyId: agency.id,
      email: "demo@hireflow.ai",
      passwordHash,
      name: "Sarah Chen",
      role: "ADMIN",
    },
  });

  const bdRep = await prisma.user.create({
    data: {
      agencyId: agency.id,
      email: "mike@hireflow.ai",
      passwordHash,
      name: "Mike Torres",
      role: "BD_REP",
    },
  });
  console.log(`Created users: ${admin.name}, ${bdRep.name}`);

  // 3. Signal sources
  const indeedSource = await prisma.signalSource.create({
    data: {
      agencyId: agency.id,
      name: "Indeed Job Board",
      type: "JOB_BOARD",
      config: { url: "https://indeed.com", refreshIntervalHours: 6 },
      active: true,
    },
  });

  const linkedinSource = await prisma.signalSource.create({
    data: {
      agencyId: agency.id,
      name: "LinkedIn Jobs",
      type: "LINKEDIN",
      config: { url: "https://linkedin.com/jobs", refreshIntervalHours: 12 },
      active: true,
    },
  });

  const fundingSource = await prisma.signalSource.create({
    data: {
      agencyId: agency.id,
      name: "Crunchbase Funding",
      type: "FUNDING_API",
      config: { apiEndpoint: "https://api.crunchbase.com/v4" },
      active: true,
    },
  });

  const newsSource = await prisma.signalSource.create({
    data: {
      agencyId: agency.id,
      name: "TechCrunch News",
      type: "NEWS_FEED",
      config: { feedUrl: "https://techcrunch.com/feed" },
      active: true,
    },
  });

  const scraperSource = await prisma.signalSource.create({
    data: {
      agencyId: agency.id,
      name: "Glassdoor Scraper",
      type: "CUSTOM_SCRAPER",
      config: { targetUrl: "https://glassdoor.com" },
      active: false,
    },
  });
  console.log("Created 5 signal sources");

  // 4. Ten sample prospects
  const prospects = await Promise.all([
    prisma.prospect.create({
      data: {
        agencyId: agency.id,
        name: "Stripe",
        domain: "stripe.com",
        industry: "Fintech",
        size: "LARGE_201_1000",
        location: "San Francisco, CA",
        website: "https://stripe.com",
        score: 92,
        status: "NEW",
        contactName: "David Park",
        contactEmail: "d.park@stripe.com",
        contactTitle: "VP of Engineering",
      },
    }),
    prisma.prospect.create({
      data: {
        agencyId: agency.id,
        name: "Notion",
        domain: "notion.so",
        industry: "Productivity SaaS",
        size: "MID_51_200",
        location: "San Francisco, CA",
        website: "https://notion.so",
        score: 85,
        status: "CONTACTED",
        contactName: "Lisa Wang",
        contactEmail: "l.wang@notion.so",
        contactTitle: "Head of Talent",
      },
    }),
    prisma.prospect.create({
      data: {
        agencyId: agency.id,
        name: "Datadog",
        domain: "datadog.com",
        industry: "DevOps / Monitoring",
        size: "ENTERPRISE_1001_PLUS",
        location: "New York, NY",
        website: "https://datadog.com",
        score: 78,
        status: "QUALIFIED",
        contactName: "James Miller",
        contactEmail: "j.miller@datadog.com",
        contactTitle: "Director of Recruiting",
      },
    }),
    prisma.prospect.create({
      data: {
        agencyId: agency.id,
        name: "Vercel",
        domain: "vercel.com",
        industry: "Developer Tools",
        size: "MID_51_200",
        location: "San Francisco, CA",
        website: "https://vercel.com",
        score: 88,
        status: "ENGAGED",
        contactName: "Emily Zhang",
        contactEmail: "e.zhang@vercel.com",
        contactTitle: "VP People",
      },
    }),
    prisma.prospect.create({
      data: {
        agencyId: agency.id,
        name: "Figma",
        domain: "figma.com",
        industry: "Design Tools",
        size: "LARGE_201_1000",
        location: "San Francisco, CA",
        website: "https://figma.com",
        score: 71,
        status: "NEW",
        contactName: "Rachel Green",
        contactEmail: "r.green@figma.com",
        contactTitle: "Head of Engineering",
      },
    }),
    prisma.prospect.create({
      data: {
        agencyId: agency.id,
        name: "Scale AI",
        domain: "scale.com",
        industry: "AI / ML Infrastructure",
        size: "LARGE_201_1000",
        location: "San Francisco, CA",
        website: "https://scale.com",
        score: 95,
        status: "NEW",
        contactName: "Kevin Liu",
        contactEmail: "k.liu@scale.com",
        contactTitle: "CTO",
      },
    }),
    prisma.prospect.create({
      data: {
        agencyId: agency.id,
        name: "Plaid",
        domain: "plaid.com",
        industry: "Fintech",
        size: "LARGE_201_1000",
        location: "San Francisco, CA",
        website: "https://plaid.com",
        score: 65,
        status: "CONTACTED",
        contactName: "Maria Santos",
        contactEmail: "m.santos@plaid.com",
        contactTitle: "Director of Eng",
      },
    }),
    prisma.prospect.create({
      data: {
        agencyId: agency.id,
        name: "Anduril",
        domain: "anduril.com",
        industry: "Defense Tech",
        size: "LARGE_201_1000",
        location: "Costa Mesa, CA",
        website: "https://anduril.com",
        score: 82,
        status: "NEW",
        contactName: "Tom Richards",
        contactEmail: "t.richards@anduril.com",
        contactTitle: "VP Talent Acquisition",
      },
    }),
    prisma.prospect.create({
      data: {
        agencyId: agency.id,
        name: "Ramp",
        domain: "ramp.com",
        industry: "Fintech",
        size: "MID_51_200",
        location: "New York, NY",
        website: "https://ramp.com",
        score: 74,
        status: "CONVERTED",
        contactName: "Alex Kim",
        contactEmail: "a.kim@ramp.com",
        contactTitle: "Head of People",
      },
    }),
    prisma.prospect.create({
      data: {
        agencyId: agency.id,
        name: "Rippling",
        domain: "rippling.com",
        industry: "HR Tech",
        size: "LARGE_201_1000",
        location: "San Francisco, CA",
        website: "https://rippling.com",
        score: 58,
        status: "LOST",
        contactName: "Nina Patel",
        contactEmail: "n.patel@rippling.com",
        contactTitle: "Director of Recruiting",
      },
    }),
  ]);
  console.log(`Created ${prospects.length} prospects`);

  // 5. Signals (5 across different sources)
  await prisma.signal.createMany({
    data: [
      {
        agencyId: agency.id,
        prospectId: prospects[0].id, // Stripe
        sourceId: indeedSource.id,
        type: "JOB_POSTING",
        title: "Stripe posted 12 engineering roles in the last 7 days",
        detail: "Roles include: Sr. Backend Engineer, Staff ML Engineer, Engineering Manager",
        strength: 0.9,
      },
      {
        agencyId: agency.id,
        prospectId: prospects[5].id, // Scale AI
        sourceId: fundingSource.id,
        type: "FUNDING_ROUND",
        title: "Scale AI raised $1B Series F",
        detail: "Accel-led round at $14B valuation, hiring 200+ roles",
        strength: 0.95,
      },
      {
        agencyId: agency.id,
        prospectId: prospects[3].id, // Vercel
        sourceId: linkedinSource.id,
        type: "EXPANSION",
        title: "Vercel opening London office",
        detail: "LinkedIn posts indicate 30+ new hires for EU expansion",
        strength: 0.8,
      },
      {
        agencyId: agency.id,
        prospectId: prospects[7].id, // Anduril
        sourceId: newsSource.id,
        type: "CONTRACT_WIN",
        title: "Anduril wins $1.5B DoD contract",
        detail: "Major defense contract will require significant hiring ramp",
        strength: 0.85,
      },
      {
        agencyId: agency.id,
        prospectId: prospects[2].id, // Datadog
        sourceId: indeedSource.id,
        type: "LEADERSHIP_HIRE",
        title: "Datadog hired new VP of Engineering",
        detail: "New VP typically triggers org restructuring and backfill hiring",
        strength: 0.7,
      },
    ],
  });
  console.log("Created 5 signals");

  // 6. Three deals in different pipeline stages
  await prisma.deal.createMany({
    data: [
      {
        agencyId: agency.id,
        prospectId: prospects[3].id, // Vercel
        ownerId: bdRep.id,
        stage: "PROPOSAL_SENT",
        title: "Vercel EU Expansion Staffing",
        value: 180000,
        probability: 0.6,
        nextAction: "Follow up on proposal review",
        notes: "They want 15 engineers placed in London office",
      },
      {
        agencyId: agency.id,
        prospectId: prospects[8].id, // Ramp
        ownerId: admin.id,
        stage: "WON",
        title: "Ramp Engineering Team Expansion",
        value: 240000,
        probability: 1.0,
        notes: "Placed 8 engineers over 3 months. Ongoing relationship.",
        wonAt: new Date("2026-03-15"),
      },
      {
        agencyId: agency.id,
        prospectId: prospects[1].id, // Notion
        ownerId: bdRep.id,
        stage: "MEETING_SCHEDULED",
        title: "Notion Design Team Staffing",
        value: 95000,
        probability: 0.35,
        nextAction: "Demo call on April 10",
        notes: "Interested in 3-4 senior product designers",
      },
    ],
  });
  console.log("Created 3 deals");

  // 7. One email sequence with 3 steps
  const sequence = await prisma.sequence.create({
    data: {
      agencyId: agency.id,
      name: "Cold Outbound - High Intent",
      status: "ACTIVE",
      steps: [
        {
          order: 1,
          subject: "Noticed {{company}} is scaling — can we help?",
          body: "Hi {{contactName}},\n\nI noticed {{company}} recently posted {{signalCount}} roles. We specialize in placing senior tech talent and have helped similar companies fill roles 40% faster.\n\nWould a quick 15-min call this week make sense?",
          delayDays: 0,
        },
        {
          order: 2,
          subject: "Re: Scaling {{company}}'s team",
          body: "Hi {{contactName}},\n\nJust following up — I wanted to share a case study of how we helped a similar {{industry}} company fill 12 senior engineering roles in under 6 weeks.\n\nHappy to walk through it if helpful.",
          delayDays: 3,
        },
        {
          order: 3,
          subject: "One more thought for {{company}}",
          body: "Hi {{contactName}},\n\nI know you're busy, so I'll keep this brief. We're currently working with several {{industry}} companies and have pre-vetted candidates who might be a fit for {{company}}.\n\nIf timing isn't right now, no worries — I'd love to stay connected for when it is.",
          delayDays: 5,
        },
      ],
    },
  });

  // Enroll a prospect in the sequence
  await prisma.enrollment.create({
    data: {
      sequenceId: sequence.id,
      prospectId: prospects[0].id, // Stripe
      enrolledById: bdRep.id,
      currentStep: 1,
      status: "ACTIVE",
      lastSentAt: new Date("2026-04-03"),
      nextSendAt: new Date("2026-04-06"),
    },
  });
  console.log("Created 1 sequence with 3 steps, 1 enrollment");

  console.log("\nSeed complete.");
}

main()
  .catch((e) => {
    console.error("Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
