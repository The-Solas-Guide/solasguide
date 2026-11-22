export const workingInBaliTitle = "Working in Bali · The Solas Guide";
export const workingInBaliDescription =
  "General information for practitioners considering clients, workshops, retreats or other work in Bali. Not immigration, legal or permit advice.";

export const workingInBaliDisclaimer =
  "General information only. This is not personal immigration, legal, tax or professional advice. The Solas Guide does not provide immigration, legal or permit services. Information updated 28 September 2026.";

export const workingInBaliContents = [
  { href: "#rules", label: "Two things to understand first" },
  { href: "#work", label: "What counts as work" },
  { href: "#questions", label: "Six questions, every booking" },
  { href: "#situations", label: "Find your situation" },
  { href: "#routes", label: "Route map" },
  { href: "#changes", label: "When something changes" },
  { href: "#advice", label: "If you need advice" },
] as const;

export const briefingRules = [
  {
    label: "Rule 01",
    title: "Where you do the work matters. Not simply where you get paid.",
    paragraphs: [
      "If you carry out the professional activity in Indonesia, consider whether you have permission to do it here.",
      "It does not automatically change the answer if your client is overseas, you are paid into an overseas account, you are paid in another currency, or the booking was made before you arrived.",
      "A London client paying your UK account for a session you give in Bali is still professional activity in Indonesia.",
    ],
  },
  {
    label: "Rule 02",
    title: "Having a KITAS does not automatically mean you can do every type of work.",
    paragraphs: [
      "Don't only ask whether you have a KITAS. Ask whether your permission covers the work you want to do.",
      "A visa is why you can enter Indonesia. A stay permit is why, and how long, you can stay. Work permission is what professional activity you are permitted to do.",
    ],
  },
] as const;

export const workExamples = [
  "Seeing clients",
  "Teaching",
  "Workshops",
  "Treatments",
  "Consultations",
  "Retreats",
  "Speaking",
  "Content for a business or venue",
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
      "If you organise retreats in Bali, consider two sides: whether your business can legally organise the retreat and engage the people delivering it, and whether each practitioner has permission for the work you are asking them to do.",
      "This matters whether the practitioner already lives in Bali or is flying in for the retreat.",
      "Before booking a practitioner, ask whether you can legally engage them, what permission they need, whether it covers the activity, whether the venue changes anything, and what documents you should check. The practitioner has responsibilities. So does the organiser.",
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
      "The boundary is when the work becomes local: a private client in Bali, a workshop at a Bali studio, or facilitating a Bali retreat. Remote work permission should not be assumed to cover local professional work.",
      "If you want to do both, seek advice from a qualified adviser about the structure you need.",
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
