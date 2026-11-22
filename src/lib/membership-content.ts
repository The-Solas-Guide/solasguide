/**
 * Public practitioner membership copy and outbound links.
 * The Letter sign-up stays a same-page hash until its Tally form exists.
 */
export const SOLAS_TABLE_BOOKING_FORM_URL = "https://tally.so/r/1W9rXp";
export const SOLAS_LETTER_SIGNUP_FORM_URL = "#letter-signup-form";

export const bookCallHref = "https://cal.com/solasguide/solas-discovery-call";
export const applyHref = "https://tally.so/r/XxQvJz";
export const practiseWhatsAppHref =
  "https://wa.me/447793050098?text=Hi%20Jitesh%2C%20I%27d%20like%20to%20talk%20about%20practising%20in%20Bali.";
export const workshopReserveHref = "https://tally.so/r/bZqJ5o";

export const membershipTitle = "Practitioner membership · The Solas Guide, Bali";
export const membershipDescription =
  "A membership for experienced wellness practitioners in Bali. A verified editorial profile, consideration for introductions where there's a fit, help practising in Bali, and access to Solas Tables. Introductions aren't guaranteed. USD $350 a year.";

export const membershipNavLinks = [
  { label: "Why Solas", href: "/#why-solas" },
  { label: "Recognition", href: "/#recognition" },
  { label: "The Guide", href: "/practitioners" },
  { label: "Programmes", href: "/programmes" },
] as const;

export const proofStats = [
  {
    figure: "59",
    detail: "practitioners have joined a Solas Table or signed up for our Bali briefing call",
  },
  {
    figure: "3",
    detail: "practitioner events since June",
  },
] as const;

export const membershipBenefits = [
  {
    title: "Be represented properly",
    copy: "Your Solas profile is independently written to give people a clearer sense of your experience, approach and the work you actually do. We check the claims behind it and publish only what we can verify.",
  },
  {
    title: "Be put forward for work",
    copy: "Travel advisors, retreat organisers and organisations already come to Solas looking for practitioners, speakers and panellists. Members are considered for these introductions where the fit makes sense. Introductions aren't guaranteed.",
  },
  {
    title: "Access to Solas Tables",
    copy: "Members get access to Solas Tables, an intimate gathering every 6–8 weeks. Sometimes non-members are invited; at other times members contribute towards the cost too.",
  },
  {
    title: "Build the business behind it",
    copy: "Pricing. Positioning. Finding clients. Partnerships. Profitability. Regulation. Workshops and knowledge shares on the practical things that help us build stronger practices.",
  },
] as const;

export const membershipFeeLine =
  "Your membership pays for your profile to be researched, written and kept up to date, for gatherings and workshops, and for the time it takes to consider introductions. It never buys a ranking, an endorsement, an introduction or what we write. We keep full editorial independence and only publish what we can verify.";

export const nextTable = {
  when: "Thursday 10 December 2026",
  time: "6pm",
  venue: "Venue to be confirmed",
  support: "In support of Sari Hati School for Special Needs Children",
  proceeds: "All proceeds go to the school.",
} as const;

export type LearningSession = {
  id: string;
  label: "This week" | "Previous";
  date?: string;
  title: string;
  host?: string;
  summary?: string;
  followUp?: string;
  image?: { src: string; alt: string };
  href?: string;
  disclaimer?: string;
};

/** Member learning sessions, newest or upcoming first. Add the next session to this list. */
export const learningSessions: readonly LearningSession[] = [
  {
    id: "business-sustainability-blueprint",
    label: "This week",
    date: "Monday 23 November 2026",
    title: "Business Sustainability Blueprint",
    host: "Nikki Heyder",
    summary:
      "For practitioners building a practice that can last. Nikki Heyder on what a sustainable wellness business actually needs.",
    followUp: "A short note will follow the session.",
    image: {
      src: "/images/membership/nikki-heyder.webp",
      alt: "Nikki Heyder",
    },
  },
  {
    id: "practising-in-bali",
    label: "Previous",
    title: "Practising in Bali: visas, permits and what practitioners need to know about working in Bali",
    href: "/working-in-bali",
    disclaimer: "General information, not legal advice. Solas does not provide immigration, legal or permit services.",
  },
];

export const learningOffer = "Want to practise or host in Bali? Talk to us.";

export const nikkiFacts = ["Mon 23 Nov", "7–8pm WITA", "Online", "Free"] as const;

export const nikkiShortBio =
  "Nikki Heyder is a psychotherapist and wellness business strategist. She has spent more than 14 years building, running, and advising wellness businesses.";

export const nikkiMore =
  "She has worked in clinical rehabilitation and outpatient care, built a private practice, owned health food restaurants, run retreats internationally, sold products, and published a book. Today she advises founders, from newly qualified practitioners to health food cafés, wellness hotels, and established supplement brands. This session starts with your definition of success, then a four-part look at what needs attention next.";

export const testimonials = [
  {
    quote: "I've had the same offers for communities, but it's never felt right. This one does.",
    attribution: "Melanie Midegs, Founding Practitioner",
    initials: "MM",
  },
  {
    quote: "Made warm connections. I enjoy my talks with Jit.",
    attribution: "Rajiv Arapurakal, Founding Practitioner",
    initials: "RA",
  },
  {
    quote: "Beautiful connection with great people.",
    attribution: "Dirk Hamelijnck, Founding Practitioner",
    initials: "DH",
  },
] as const;

export const membershipSteps = [
  ["01", "Call with Jitesh", "Start with a conversation about your work."],
  ["02", "Application and payment", "Apply and pay USD $350 a year. The application and verification fee is non-refundable."],
  ["03", "Verify claims", "We check the training, credentials and evidence you share."],
  ["04", "Publish verified claims only", "We publish your profile with the claims we can verify."],
] as const;

export const membershipFaqs = [
  {
    question: "What's included for USD $350 a year?",
    answer:
      "A verified editorial profile, consideration for introductions where the fit makes sense, access to Solas Tables, workshops, the Letter, and help working out how to practise in Bali. Introductions aren't guaranteed. Solas Tables are an intimate gathering every 6–8 weeks. About USD 29 a month.",
  },
  {
    question: "Is the fee refundable?",
    answer:
      "No. The application and verification fee is non-refundable. It pays for your profile to be researched, written and kept up to date, for gatherings and workshops, and for the time it takes to consider introductions. It never buys a ranking, an endorsement, an introduction or what we write.",
  },
  {
    question: "Does paying guarantee a profile?",
    answer: "No. We only publish what we can verify or corroborate, and the application fee is non-refundable.",
  },
  {
    question: "What do you verify?",
    answer:
      "We check the training, credentials and evidence you share. We publish only the claims we can verify or corroborate.",
  },
  {
    question: "Can you help me practise in Bali?",
    answer:
      "The Working in Bali briefing is general information for practitioners, not personal advice. Solas does not provide immigration, legal or permit services. A call with Jitesh is about membership and your practice.",
  },
  {
    question: "Are events only for members?",
    answer:
      "No. Solas Tables are an intimate gathering every 6–8 weeks. Sometimes non-members are invited; at other times members contribute towards the cost too. The next table is Thursday 10 December 2026 at 6pm, in support of Sari Hati School for Special Needs Children. All proceeds go to the school. The venue is still to be confirmed. The Working in Bali briefing is open to read.",
  },
  {
    question: "Is the Bali briefing legal advice?",
    answer:
      "No. The Working in Bali briefing is general information only, not personal immigration, legal, tax or professional advice. Solas does not provide those services. For your own situation, speak with a qualified immigration adviser.",
  },
] as const;

export const workshopEndsAt = "2026-11-23T20:00:00+08:00";
export const workshopSchedule =
  "Monday 23 November 2026 · 7–8pm Bali time (WITA) · Live, online · 60 minutes · Free, members and non-members";

export function isBusinessWorkshopUpcoming(now = new Date()) {
  return now.getTime() < new Date(workshopEndsAt).getTime();
}

export const workshopTakeaways = [
  ["Clarity", "Understand which parts of your business need attention."],
  ["Perspective", "Recognise what is working, what is getting in the way, and why."],
  ["Direction", "Decide where your time and energy could make the greatest difference."],
  ["A next step", "Leave with one practical action to take."],
] as const;

export type LetterBlock = {
  heading?: string;
  paragraphs: readonly string[];
};

export const letters: readonly {
  id: string;
  summary: string;
  sent: string;
  blocks: readonly LetterBlock[];
}[] = [
  {
    id: "edition-02",
    summary: "Past edition · Edition 02 · October 2026 · The business of being a practitioner",
    sent: "Sent to members and non-members.",
    blocks: [
      {
        paragraphs: [
          "Being good at your work is one thing. Making a living from it is another.",
          "I recently attended a talk by Taha Anis called 10 Hard-Earned Lessons Every Services Founder Ultimately Learns. Taha has spent more than 16 years building businesses across different industries. He's now Founding Partner at The Boring Syndicate, which invests in services businesses.",
          "It wasn't a talk about wellness, but quite a lot felt relevant to practitioners. Being good at what you do and being good at running a practice are two different things. Here are five things that stood out.",
        ],
      },
      {
        heading: "You can't be everything to everyone",
        paragraphs: [
          "It's tempting to offer more treatments, more services and try to appeal to more people. Being known for something specific can be much more valuable.",
          "Who do you really want to work with? What problems do you understand particularly well? You don't necessarily need another modality. You might just need to be clearer about the work you're already good at.",
        ],
      },
      {
        heading: "Trust matters more than ever",
        paragraphs: [
          "Taha talked about how AI is making many services easier to access and harder to differentiate. Judgement, accountability and relationships remain valuable.",
          "This is particularly relevant in wellness, where people trust practitioners with their health, wellbeing and sometimes very personal parts of their lives. Qualifications, experience, professional boundaries and being honest about what you can and can't help with all matter.",
          "Trust isn't just about attracting clients. It's what makes them comfortable returning or recommending you.",
        ],
      },
      {
        heading: "Know your numbers",
        paragraphs: [
          "Do you know what it actually costs to deliver a session? Not just room hire and materials, but preparation, travel, administration and your own time. And after all that, how much are you earning?",
          "If you don't account for paying yourself, your margins aren't telling you the full story. If someone can't afford your price, consider reducing the scope rather than immediately offering a discount.",
          "Something worth trying: look at your last five paid sessions. Add up the income, subtract your costs and include the time spent preparing, communicating and following up. Is what you're earning what you thought it was?",
        ],
      },
      {
        heading: "Stop rebuilding everything from scratch",
        paragraphs: [
          "Personalisation matters. But does every part of your work need to be different for every client? Your enquiry process, client preparation, follow-up, programme structures and pricing could all be more consistent.",
          "A repeatable way of doing these things doesn't mean giving everyone the same experience. It might free up more time for the work that really needs you.",
        ],
      },
      {
        heading: "What kind of practice do you actually want?",
        paragraphs: [
          "Taha asked founders whether they're building a lifestyle business or something they eventually want to sell. For most practitioners, selling the business may not be the goal. The underlying question is still worth asking.",
          "Are you building a practice that supports the life you want, or one that takes over your life? Do you want to work independently, build a team, run retreats, teach other practitioners, or create programmes that don't require you to deliver every session? There's no right answer. Knowing what you're building towards changes the decisions you make today.",
        ],
      },
      {
        heading: "One thing I'd add",
        paragraphs: [
          "We spend years studying, practising and developing our skills. Pricing, marketing, finances and running a business are often things we figure out along the way. Being excellent at your work doesn't automatically mean a full calendar or a sustainable income.",
          "That's something I'd like us to talk about more within The Solas Guide. Not necessarily how to build bigger businesses. Just how to build better practices that work for us and the people we serve.",
        ],
      },
      {
        heading: "Around the Solas Table",
        paragraphs: [
          "We recently brought together 13 wellness practitioners for another Solas Table lunch. It was good to spend time together away from our individual practices, get to know each other's work and talk honestly about what we're all building in Bali.",
          "Nikki Heyder is hosting The Business Sustainability Blueprint on Monday 23 November, a session for practitioners on building a sustainable practice.",
        ],
      },
    ],
  },
  {
    id: "edition-01",
    summary: "Past edition · Edition 01 · September 2026 · The bar is rising",
    sent: "Sent to members and non-members.",
    blocks: [
      {
        paragraphs: [
          "Technology dates. Human needs don't.",
          "Last week I went to hear Kathryn Moore talk about where the wellness industry is heading. Kathryn is a global wellness strategist who has spent more than 20 years working across wellness, spas and hospitality. She now works with hotels, developers and investors on new wellness concepts around the world.",
          "My main takeaway was that things are moving quickly. She described the global wellness economy growing from $6.8tn to $9.8tn between 2024 and 2029, and Indonesia as already the 20th-largest wellness economy, at around $56bn. The numbers weren't the part I found most interesting.",
        ],
      },
      {
        heading: "People are looking for outcomes, not just treatments",
        paragraphs: [
          "Wellness is moving from occasional to everyday, reactive to preventive, and generic to more personalised. Someone might not be looking for breathwork, bodywork or sound healing. They might just want to sleep better, recover, feel less stressed, age well, perform better or reconnect.",
          "A useful question for us as practitioners: can we clearly explain what our work helps someone with, rather than only what we do? It can also mean more opportunities to work as part of programmes, retreats and teams, rather than only one-to-one.",
        ],
      },
      {
        heading: "“A cold plunge isn't a concept.”",
        paragraphs: [
          "One of my favourite lines from Kathryn. Her sequence was simple: consumer, need, outcome, experience, then technology. The kit comes last. Or, as she put it: “Technology dates. Human needs don't.”",
          "Keeping up doesn't mean jumping onto whatever is new. Prevention, community, connection, nature and wellbeing as part of everyday life already exist in Bali. The question isn't always what's new. It's what's useful, and whether it is appropriate for Bali.",
        ],
      },
      {
        heading: "And Bali?",
        paragraphs: [
          "Bali already has something that's very difficult to recreate elsewhere: nature, culture, traditions of care, hospitality, community and some brilliant practitioners. What people want from wellness is changing.",
          "Which changes make sense here? What new skills will they require? Can regulation keep up? And how do we move forward without losing the things that make Bali, Bali?",
          "Kathryn put it another way: “How does Bali grow without becoming a wellness theme park?” And she finished with: “The opportunity isn't to create more wellness. It's to create better wellness businesses.” I agree. So what does better look like here?",
          "Since this edition went out, those notes have been published separately as general information. They are not legal advice, and Solas does not provide immigration or permit services.",
        ],
      },
    ],
  },
];

export function isPlaceholderFormUrl(href: string) {
  return href.startsWith("#");
}
