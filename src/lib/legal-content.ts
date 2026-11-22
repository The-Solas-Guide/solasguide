export const legalUpdated = "15 November 2026";

export const legalEmail = "info@solassolas.com";

export const privacyTitle = "Privacy policy · The Solas Guide";
export const privacyDescription =
  "How The Solas Guide collects, uses, and shares personal information from this website, enquiries, and membership applications.";

export const termsTitle = "Website terms of use · The Solas Guide";
export const termsDescription =
  "The terms for using The Solas Guide website, sending an enquiry, and applying for practitioner membership.";

export const legalPlaceholders = [
  "To be confirmed: registered address.",
  "To be confirmed: governing law and the courts that hear disputes.",
  "To be confirmed: fixed retention periods.",
  "To be confirmed: the contractual safeguards for international transfers.",
] as const;

export type LegalSection = {
  id: string;
  title: string;
  paragraphs: readonly string[];
  items?: readonly string[];
};

export const privacySections: readonly LegalSection[] = [
  {
    id: "who",
    title: "Who we are",
    paragraphs: [
      "This website is operated by PT PMA Lejit Connections Bali, in Indonesia, under the name The Solas Guide. A separate US incorporation in Wyoming is pending. Its name is not yet confirmed.",
      "For personal information collected through this website, PT PMA Lejit Connections Bali decides why and how that information is used.",
      "To be confirmed: registered address. Privacy requests go to info@solassolas.com.",
    ],
  },
  {
    id: "summary",
    title: "The short version",
    paragraphs: [
      "We collect personal information when you send an enquiry, apply for practitioner membership, or contact us. We use it to reply, to review an application, and to run this website.",
      "We do not sell personal information. Paying a membership fee does not buy a ranking, an endorsement, or the words we publish.",
      "Some forms and bookings happen on other companies' websites. Those companies have their own privacy notices.",
    ],
  },
  {
    id: "collect",
    title: "What this website collects",
    paragraphs: [
      "If you ask for help choosing a practitioner, the enquiry form asks who the support is for, what you would like support with, any preferences about the person or approach, when you would like to connect, anything else you choose to tell us, your name, your email address, and an optional WhatsApp number. You can also say whether you prefer email, phone, or WhatsApp. The form asks you to confirm that we may use these details to respond.",
      "A programme enquiry asks for your name, email address, an optional organisation, what you are planning, when you are thinking of, and what you would like a group to take away. You confirm that we may contact you about that enquiry.",
      "The membership application on this website asks about your practice, where you work, your experience and training, optional website links, your name, your email address, and a phone or WhatsApp number if you ask us to use one. You confirm that we may use these details to review the application. The form asks you not to include medical records or other sensitive personal information.",
      "The public “Apply now” button opens a form on Tally (tally.so). That form is not stored by this website. The Letter sign-up and the Solas Table booking form are not collecting details on this website yet.",
      "If you book a call, you leave this website for Cal.com. If you message us on WhatsApp, that conversation is handled by WhatsApp.",
    ],
  },
  {
    id: "why",
    title: "Why we use it",
    paragraphs: [
      "We use enquiry details to understand what you are looking for, reply to you, and, where it is appropriate, suggest practitioners or a programme. We use a membership application to review your practice and decide what, if anything, we can publish.",
      "We also use submissions to keep a record of what was asked and what we decided, to send you a confirmation email, and to let our team know a submission has arrived.",
      "Where UK or EU data-protection law applies, we rely on your consent when you tick the confirmation on a form, on steps toward a membership agreement when you apply, and on our legitimate interest in running, securing, and improving the website. You can withdraw consent at any time. That does not undo use that was already lawful.",
      "Indonesia's Personal Data Protection Law (Law No. 27 of 2022) also applies to personal data we handle from Indonesia. In plain terms, we collect personal data for a clear purpose, we tell you what that purpose is, and we do not use it for something unrelated without a proper reason.",
    ],
  },
  {
    id: "membership",
    title: "Membership and editorial independence",
    paragraphs: [
      "Practitioner membership is USD $350 a year. The application and verification fee is non-refundable. It pays for a profile to be researched, written, and kept up to date, for gatherings and workshops, and for the time it takes to consider introductions.",
      "The fee never buys a ranking, an endorsement, an introduction, or what we write. We publish only claims we can verify or corroborate. Paying does not guarantee that a profile will be published.",
    ],
  },
  {
    id: "letter",
    title: "The Letter",
    paragraphs: [
      "The Solas Letter is an occasional note for practitioners. Edition 01 (September 2026) and Edition 02 (October 2026) have already been sent to members and non-members. The sign-up for future editions is not open on this website yet, so this website is not collecting email addresses for the Letter.",
      "When that sign-up opens, we will use the address only to send future editions, and each Letter will say how to stop them.",
    ],
  },
  {
    id: "sharing",
    title: "Who else handles information",
    paragraphs: [
      "We do not sell personal information. We share it with service providers who process it for us, and with the companies whose pages you open yourself.",
      "Website submissions are stored in Supabase. This website is hosted on Vercel. Confirmation emails to you, and a notification to our team, are sent with MailerSend. A copy of a website enquiry or membership application is also sent to Airtable so the team can follow up, when that connection is configured.",
      "Vercel Web Analytics records page visits and a few events, such as which membership link was clicked. Those events do not include your name, email address, or the answers you typed into a form.",
      "Tally collects whatever you type into a Tally form, including a membership application and the fee. Cal.com collects the details of a booking. WhatsApp collects the content of a WhatsApp chat. Each of those companies explains its own practices on its website.",
    ],
    items: [
      "Supabase, for storing submissions",
      "Vercel, for hosting the website and for web analytics",
      "MailerSend, for email",
      "Airtable, for an operational copy of submissions",
      "Tally, for forms you open on tally.so",
      "Cal.com, for call bookings",
      "WhatsApp, for messages you send us there",
    ],
  },
  {
    id: "cookies",
    title: "Cookies and storage on your device",
    paragraphs: [
      "This website does not set advertising cookies, and it does not use cookies to follow you around other websites.",
      "Vercel Web Analytics is used for page visits and the click events described above. We do not use those events to build an advertising profile.",
      "While you fill in an enquiry, a draft may be stored in your browser's session storage so you can continue. A membership application may keep a short-lived draft in local storage on your device. That draft is there so you can continue, and the saved membership draft does not include your email address.",
      "People who sign in to the private administration area get a session cookie. That does not apply when you are only browsing the public site.",
      "Cal.com, Tally, and WhatsApp may set their own cookies once you are on their sites.",
    ],
  },
  {
    id: "retention",
    title: "How long we keep it",
    paragraphs: [
      "We keep enquiry and application records for as long as we need them to reply, review an application, and keep a record of that decision. We then delete them or remove the details that identify you.",
      "To be confirmed: fixed retention periods. We have not published a fixed timetable yet.",
    ],
  },
  {
    id: "transfers",
    title: "Information processed outside Indonesia",
    paragraphs: [
      "The providers listed above may process personal information outside Indonesia, and outside the UK and the European Economic Area. That can include the country where the provider hosts its service.",
      "To be confirmed: the contractual safeguards for international transfers. Until that confirmation is published, ask us if you want to know which provider is involved in your own submission.",
    ],
  },
  {
    id: "rights",
    title: "Your rights",
    paragraphs: [
      "You can ask us what personal information we hold about you, ask for a correction, or ask us to delete it. You can withdraw consent, and you can object to uses that are not necessary for a contract or a legal duty. Where UK or EU law applies, you can also ask us to restrict processing and, in some cases, to provide information in a portable form.",
      "Indonesia's Personal Data Protection Law gives you comparable rights: to know how your personal data is used, to access it, to correct it, to delete it, and to withdraw consent.",
      "We will not charge you for a reasonable request. We may ask you to confirm that you are the person the information is about. You can also complain to the authority responsible where you live, including the authority responsible under Indonesia's Personal Data Protection Law, or the UK Information Commissioner's Office if UK GDPR applies to you.",
      "Send a privacy request to info@solassolas.com.",
    ],
  },
  {
    id: "children",
    title: "Children and sensitive information",
    paragraphs: [
      "This website is for adults. An enquiry may say that you are looking for support for a child or teenager. Please do not send medical records, identity documents, or other sensitive records through the forms.",
    ],
  },
  {
    id: "changes",
    title: "Changes to this policy",
    paragraphs: [
      "We will update this page when the way we handle personal information changes, including when the Letter sign-up or the Solas Table booking form starts collecting details. The date at the top of the page is the date of the latest version.",
    ],
  },
];

export const termsSections: readonly LegalSection[] = [
  {
    id: "use",
    title: "Using this website",
    paragraphs: [
      "These terms apply to your use of The Solas Guide website, operated by PT PMA Lejit Connections Bali in Indonesia. A separate US incorporation in Wyoming is pending. Its name is not yet confirmed. By using the site, sending an enquiry, or applying for membership, you agree to these terms.",
      "To be confirmed: registered address.",
      "The site introduces wellness practitioners and collects enquiries. It does not book a practitioner for you, take payment for a session, or guarantee that a particular person is suitable.",
    ],
  },
  {
    id: "enquiries",
    title: "Enquiries",
    paragraphs: [
      "An enquiry is a request for a person at The Solas Guide to read what you have sent and reply. It is not a booking, a contract for treatment, or a promise that we will introduce you to a particular practitioner.",
      "We may decide that we cannot help, or that we need more information. Suggestions are considered by a person. They are not an automated match and they are not a guarantee.",
    ],
  },
  {
    id: "membership",
    title: "Practitioner membership",
    paragraphs: [
      "Practitioner membership is USD $350 a year. The application and verification fee is non-refundable. The public application and the fee are taken on Tally, not by a card form on this website. We do not store card numbers here.",
      "Paying does not guarantee that a profile will be published. We publish only claims we can verify or corroborate. The fee never buys a ranking, an endorsement, an introduction, or the words we write. We keep editorial independence.",
      "Travel advisors, retreat organisers, and organisations sometimes ask us for practitioners, speakers, and panellists. Members are considered for those introductions where the fit makes sense. Introductions are not guaranteed.",
      "The website also has a membership application form that stores what you submit so we can review it. That form does not take the fee.",
    ],
  },
  {
    id: "events",
    title: "The Solas Table and other events",
    paragraphs: [
      "The next Solas Table is Thursday 10 December 2026 at 6pm, with 22 seats, in support of Sari Hati School for Special Needs Children. All proceeds go to the school. The venue is still to be confirmed. The booking form takes payment and is not open on this website yet. The price is not shown here.",
      "Solas Tables are an intimate gathering every 6–8 weeks. Sometimes non-members are invited. At other times members contribute towards the cost too. Membership does not promise free attendance at every table.",
      "Nikki Heyder’s Business Sustainability Blueprint on Monday 23 November is an example of a practitioner session in Bali. A short write-up will be added after the event. This website is not taking bookings for it.",
    ],
  },
  {
    id: "letter",
    title: "The Letter",
    paragraphs: [
      "The Solas Letter is an occasional note. It is not a weekly newsletter. Two editions have already gone out. The sign-up for future editions is not open on this website yet. Each future Letter will say how to stop receiving them.",
    ],
  },
  {
    id: "information",
    title: "Information on the site",
    paragraphs: [
      "Practitioner profiles are editorial. They are not an advertisement a practitioner can buy, and they are not medical advice.",
      "The Working in Bali page is general information for practitioners. It is not immigration, legal, tax, or permit advice, and The Solas Guide does not provide those services. For your own situation, speak with a qualified adviser.",
    ],
  },
  {
    id: "others",
    title: "Other websites",
    paragraphs: [
      "Links to Cal.com, Tally, and WhatsApp take you off this website. What you do there is between you and that service. We are not responsible for their content, availability, or privacy practices.",
    ],
  },
  {
    id: "conduct",
    title: "Acceptable use",
    paragraphs: [
      "Do not misuse the site or the forms. Do not send unlawful, misleading, or abusive material, and do not try to break, scrape, or overload the site. Do not send medical records or other people's private information without a proper reason.",
    ],
  },
  {
    id: "ip",
    title: "Our words and pictures",
    paragraphs: [
      "The text, design, and photographs on this website belong to The Solas Guide or to the people who supplied them. You may read them and share a link. You may not copy the site, or present our editorial profiles as your own advertising, without permission.",
    ],
  },
  {
    id: "liability",
    title: "Limits",
    paragraphs: [
      "We maintain the site with care, but we do not promise that it will always be available or free of errors. To the extent the law allows, we are not liable for loss that arises only because you relied on general information on the site, or because a third-party service such as Cal.com, Tally, or WhatsApp was unavailable.",
      "Nothing in these terms limits liability that the law does not allow us to limit.",
    ],
  },
  {
    id: "law",
    title: "Governing law",
    paragraphs: [
      "The Solas Guide operates from Bali, Indonesia. To be confirmed: governing law and the courts that hear disputes. We will update this section when that choice is confirmed. These terms do not take away rights you have under the law that applies to you, including Indonesia's Personal Data Protection Law and, where they apply, UK GDPR and EU GDPR.",
    ],
  },
  {
    id: "changes",
    title: "Changes",
    paragraphs: [
      "We may update these terms. The date at the top of the page is the date of the latest version. If you keep using the site after an update, the new terms apply to that later use.",
      "Questions about these terms can be sent to info@solassolas.com.",
    ],
  },
];
