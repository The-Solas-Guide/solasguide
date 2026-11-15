/**
 * Public practitioner membership copy and outbound links.
 * Replace the two form URL constants when the Tally forms exist.
 * A same-page hash keeps each button on /membership until then.
 */
export const SOLAS_TABLE_WAITLIST_FORM_URL = "#table-waitlist-form";
export const SOLAS_LETTER_SIGNUP_FORM_URL = "#letter-signup-form";

export const bookCallHref = "https://cal.com/solassolas/30min-private-conversation";
export const applyHref = "https://tally.so/r/XxQvJz";
export const practiseWhatsAppHref =
  "https://wa.me/447793050098?text=Hi%20Jitesh%2C%20I%27d%20like%20to%20talk%20about%20practising%20in%20Bali.";
export const workshopReserveHref = "https://tally.so/r/bZqJ5o";

export const membershipTitle = "Practitioner membership · The Solas Guide, Bali";
export const membershipDescription =
  "A membership for experienced wellness practitioners in Bali. A verified editorial profile, consideration for introductions where there's a fit, help practising in Bali, and access to Solas Tables. Introductions aren't guaranteed. USD 350 a year.";

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
  {
    figure: "22",
    detail: "seats at the next Solas Table, 3 December",
  },
  {
    figure: "For now",
    detail: "members join Solas Tables free, and non-members can attend for IDR 350k",
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
    copy: "Members get access to Solas Tables. For now, members join free and non-members can attend for IDR 350k. Tables will become members-only, and members may pay to attend.",
  },
  {
    title: "Build the business behind it",
    copy: "Pricing. Positioning. Finding clients. Partnerships. Profitability. Regulation. Workshops and knowledge shares on the practical things that help us build stronger practices.",
  },
] as const;

export const membershipFeeLine =
  "Your membership pays for your profile to be researched, written and kept up to date, for gatherings and workshops, and for the time it takes to consider introductions. It never buys a ranking, an endorsement, an introduction or what we write. We keep full editorial independence and only publish what we can verify.";

export const nextTable = {
  when: "Thursday 3 December",
  time: "From 6pm",
  venue: "Venue to be confirmed",
  seats: "22 seats",
  members: "Members free",
  nonMembers: "Non-members IDR 350k",
  paymentNote: "Not a member? We'll send a payment link once your seat is confirmed.",
} as const;

export const testimonials = [
  {
    quote: "I've had the same offers for international communities online, but it's never felt right. This one does.",
    attribution: "Melanie Midegs, Founding Practitioner",
  },
  {
    quote: "Made warm connections. I enjoy my talks with Jit.",
    attribution: "Rajiv Arapurakal, Founding Practitioner",
  },
  {
    quote: "Beautiful connection with great people.",
    attribution: "Dirk Hamelijnck, Founding Practitioner",
  },
] as const;

export const membershipSteps = [
  ["01", "Call with Jitesh", "Start with a conversation about your work."],
  ["02", "Application and payment", "Apply and pay USD 350 a year. The application and verification fee is non-refundable."],
  ["03", "Verify claims", "We check the training, credentials and evidence you share."],
  ["04", "Publish verified claims only", "We publish your profile with the claims we can verify."],
] as const;

export const membershipFaqs = [
  {
    question: "What's included for USD 350 a year?",
    answer:
      "A verified editorial profile, consideration for introductions where the fit makes sense, access to Solas Tables, workshops, the Letter, and help working out how to practise in Bali. Introductions aren't guaranteed. For now, members join Solas Tables free and non-members can attend for IDR 350k. Tables will become members-only, and members may pay to attend. About USD 29 a month.",
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
      "If you're working out how to practise in Bali, book a call with Jitesh and we'll help you find the right way forward. The briefing on this page is general information, not personal advice.",
  },
  {
    question: "Are events only for members?",
    answer:
      "No. For now, members join Solas Tables free and non-members can attend for IDR 350k. Tables will become members-only, and members may pay to attend. The 3 December table is free for members, and non-members pay IDR 350k. We send a payment link once a non-member's seat is confirmed. The Business Sustainability Blueprint is free for members and non-members. The Working in Bali briefing is open to read.",
  },
  {
    question: "Is the Bali briefing legal advice?",
    answer:
      "No. It is general information only, not personal immigration, legal, tax or professional advice. For your own situation, speak with a qualified immigration adviser.",
  },
] as const;

export const briefingRules = [
  {
    label: "Rule 01",
    title: "Where you do the work matters. Not simply where you get paid.",
    copy: "A London client paying your UK account for a session you give in Bali is still professional activity in Indonesia.",
  },
  {
    label: "Rule 02",
    title: "Having a KITAS does not automatically mean you can do every type of work.",
    copy: "Don't only ask whether you have a KITAS. Ask whether your permission covers the work you want to do.",
  },
] as const;

export const briefingQuestions = [
  "What will I do?",
  "Where will I do it?",
  "Who is hiring or engaging me?",
  "How will I be paid or benefit?",
  "What permission do I have?",
  "Does it cover this activity?",
] as const;

export const briefingSituations = [
  {
    title: "I want to see my own clients",
    paragraphs: [
      "You live in Bali and people book you directly for private sessions, treatments, coaching or other professional services.",
      "Start with what you are doing, where you are doing it, who is paying or engaging you, what permission you have, and whether it covers this activity and location.",
      "One option may be to work through an Indonesian business that can legally employ you and sponsor the appropriate E23 work permission. Another may be to set up your own PT PMA, a foreign-owned Indonesian company, with the appropriate permissions for both the business and the work you personally do.",
      "Owning or managing the company is not the same as personally delivering the service. The company must be registered for the type of business it is doing, and you also need permission for the work you personally perform.",
    ],
  },
  {
    title: "I have been invited to facilitate",
    paragraphs: [
      "A retreat, hotel, studio, venue or organiser asks you to deliver a workshop, treatment, talk, class or retreat session. An invitation does not automatically mean you are covered.",
      "Ask what exactly you are being asked to do, who is engaging you, whether they can legally engage you for this activity, what permission you need, and whether it covers this location.",
      "For example, an E23 sponsored by one wellness centre should not be assumed to cover a workshop at a different hotel. “They invited me” does not automatically mean “I am permitted to do it.”",
    ],
  },
  {
    title: "I organise retreats",
    paragraphs: [
      "If you organise retreats in Bali, there are two sides to consider: whether your business can legally organise the retreat and engage the people delivering it, and whether each practitioner has permission for the work you are asking them to do.",
      "This matters whether the practitioner already lives in Bali or is flying in for the retreat.",
      "Before booking a practitioner, ask whether you can legally engage them, what permission they need, whether it covers what you are asking them to do, whether the venue or location changes anything, and what documents you should check. The practitioner has responsibilities. So does the organiser.",
    ],
  },
  {
    title: "I organise and facilitate my own retreat",
    paragraphs: [
      "You may be wearing two different hats: organiser, when you create, sell and manage the retreat, and practitioner, when you personally teach, coach, treat or facilitate guests.",
      "These are not necessarily the same activity. Permission to organise a retreat does not automatically give you permission to personally deliver every session within it. Check both.",
    ],
  },
  {
    title: "I live in Bali but work online",
    paragraphs: [
      "Your clients or employer are overseas and your work is carried out online. The E33G remote worker route is designed for qualifying foreign remote work, subject to its requirements.",
      "The important boundary is when the work becomes local: a private client in Bali, a workshop at a Bali studio, or facilitating a Bali retreat. Remote work permission should not be assumed to cover local professional work.",
      "If you want to do both, seek advice about the structure you need.",
    ],
  },
  {
    title: "I am visiting Bali to facilitate",
    paragraphs: [
      "You live overseas and have been invited to Bali to teach, speak, demonstrate, facilitate, perform or join a retreat programme.",
      "The route depends on what you will actually do, who is inviting you, whether and how you are compensated, and the nature of the engagement.",
      "Don't begin with which visa to get. Begin with exactly what you have been invited to do, and which permission covers it. Short-term categories and their conditions can change. Check the current requirements before accepting the engagement or travelling.",
    ],
  },
] as const;

export const briefingRoutes = [
  {
    aim: "Work for an Indonesian wellness business or venue",
    route: "E23 work route, where applicable.",
  },
  {
    aim: "Run your own Indonesian business",
    route: "PT PMA / E28A structure, plus the appropriate permission for work you personally deliver.",
  },
  {
    aim: "Live in Bali and work remotely for overseas clients or employers",
    route: "E33G remote worker route, subject to its conditions.",
  },
  {
    aim: "Visit Bali for a specific short-term activity",
    route: "An activity-specific short-term route.",
  },
  {
    aim: "Work independently across different clients, venues and activities",
    route: "Individual advice on the appropriate structure. There is no simple freelancer visa.",
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
          "Since this edition went out, the November workshop has been set. The Business Sustainability Blueprint, with Nikki Heyder, is in the learning section on this page.",
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
          "Since this edition went out, the briefing it described has been written up on this page, as a practical reference to return to when you are considering work here.",
        ],
      },
    ],
  },
];

export function isPlaceholderFormUrl(href: string) {
  return href.startsWith("#");
}
