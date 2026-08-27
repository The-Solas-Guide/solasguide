# The Solas Guide MVP delivery scope

**Status:** Active technical delivery reference

## Outcome

Deliver the first production release of The Solas Guide as a focused public website that explains the service, captures buyer demand, and builds the practitioner pipeline.

The service uses human judgement and the trusted Solas network to review buyer context, recommend an appropriate direction, and make curated introductions. The application supports this manual concierge process; it does not automate it.

## Included

- Public website introduction and editorial positioning.
- Find a Match page and guided buyer enquiry form.
- Become a Practitioner page and expression-of-interest form.
- Privacy and website terms pages using client-approved content.
- Supabase storage for buyer and practitioner submissions.
- Supabase practitioner directory schema with controlled taxonomy and a draft, published, and archived lifecycle.
- Support for one approved portrait per practitioner. Public images require approval before upload or publication.
- Import of 20 supplied practitioner profiles as drafts. All 20 remain drafts without approved images.
- Dynamic public practitioner directory, search, filters, and profile pages that read published records only.
- On-screen confirmation, one customer confirmation email, and one internal notification for each submission journey.
- MailerSend transactional email integration.
- Vercel Web Analytics page views and agreed custom events.
- Responsive implementation and critical-path quality assurance.
- Vercel preview and production deployment configuration.

## Excluded

- Customer or practitioner accounts, admin portal, or admin authentication.
- Find a Match generated results, automated matching, verification, or practitioner approval.
- Booking, payments, subscriptions, billing, or ticketing.
- WhatsApp or internal customer-to-practitioner messaging.
- Venue or event directories.
- Airtable as a runtime source, write target, public-application read dependency, or reverse-sync destination.

## Technical decisions

- Build the public application with Next.js, React, TypeScript, and Tailwind CSS.
- Use Supabase as the application data store and source of truth.
- Develop against local Supabase Docker and manage schema changes through committed migrations.
- Use MailerSend for transactional email unless the provider decision is explicitly revisited.
- Use Vercel for preview and production deployments.
- Keep Airtable outside the application runtime. Any temporary handoff is manual or exported.
- Keep the application simple and MVP-focused. Record non-critical edge cases instead of expanding scope automatically.

## Acceptance summary

- Included pages and journeys are responsive and usable in current desktop Chrome and Safari and at approximately 390px width.
- Both forms validate input, persist the expected structured submission, and show clear success and error states.
- Confirmations and internal notifications are verified through the configured provider evidence.
- Required analytics events are verified through Vercel Web Analytics when it is enabled for the project.
- Production configuration contains no committed credentials or private customer data.
- The production release and client-owned provider access are verified before handover.

## Change control

Prototype concepts and internal reference material do not expand this scope. New pages, capabilities, integrations, data requirements, or workflows require an explicit scope decision before implementation.
