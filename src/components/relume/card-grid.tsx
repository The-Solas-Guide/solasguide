import { Button } from "@/components/ui/button";
import { DribbbleLogo, LinkedinLogo, XLogo } from "relume-icons";

type ButtonProps = React.ComponentProps<typeof Button>;

type ImageProps = {
  src: string;
  alt?: string;
};

type Footer = {
  heading: string;
  description: string;
  button: ButtonProps;
};

type SocialLink = {
  href: string;
  icon: React.ReactNode;
};

type TeamMember = {
  image: ImageProps;
  name: string;
  jobTitle: string;
  description: string;
  socialLinks: SocialLink[];
};

type Props = {
  tagline: string;
  heading: string;
  description: string;
  teamMembers: TeamMember[];
  footer: Footer;
};

export type Team7Props = React.ComponentPropsWithoutRef<"section"> & Partial<Props>;

export const Team7 = (props: Team7Props) => {
  const { tagline, heading, description, teamMembers, footer } = {
    ...Team7Defaults,
    ...props,
  };
  return (
    <section className="px-[5%] py-16 md:py-24 lg:py-28">
      <div className="container">
        <div className="mb-12 max-w-lg md:mb-18 lg:mb-20">
          <p className="mb-3 font-semibold md:mb-4">{tagline}</p>
          <h2 className="mb-5 text-h2 font-display md:mb-6">{heading}</h2>
          <p className="text-medium text-muted-foreground">{description}</p>
        </div>
        <div className="grid grid-cols-1 gap-x-8 gap-y-12 md:grid-cols-2 md:gap-y-16 lg:grid-cols-3 lg:gap-x-12">
          {teamMembers.map((member, index) => (
            <TeamMember key={index} member={member} />
          ))}
        </div>
        <div className="mt-14 w-full max-w-md md:mt-20 lg:mt-24">
          <h4 className="mb-3 text-h4 font-display md:mb-4">{footer.heading}</h4>
          <p className="text-medium text-muted-foreground">{footer.description}</p>
          <div className="mt-6 md:mt-8">
            <Button {...footer.button} />
          </div>
        </div>
      </div>
    </section>
  );
};

const TeamMember = ({ member }: { member: TeamMember }) => {
  return (
    <div className="flex flex-col items-start">
      <div className="mb-5 size-20 min-h-20 min-w-20 overflow-hidden rounded-full md:mb-6">
        <img src={member.image.src} alt={member.image.alt} className="size-full object-cover" />
      </div>
      <div className="mb-3 md:mb-4">
        <p className="text-large font-semibold">{member.name}</p>
        <p className="text-medium text-muted-foreground">{member.jobTitle}</p>
      </div>
      <p className="text-muted-foreground">{member.description}</p>
      <div className="mt-5 flex gap-3.5 md:mt-6">
        {member.socialLinks.map((link, index) => (
          <a key={index} href={link.href}>
            {link.icon}
          </a>
        ))}
      </div>
    </div>
  );
};

const placeholder = (n: number): ImageProps => ({
  src: "https://d22po4pjz3o32e.cloudfront.net/placeholder-image.svg",
  alt: `Relume placeholder image ${n}`,
});

const socialLinks: SocialLink[] = [
  { href: "#", icon: <LinkedinLogo className="size-6 text-foreground" /> },
  { href: "#", icon: <XLogo className="size-6 p-0.5 text-foreground" /> },
  { href: "#", icon: <DribbbleLogo className="size-6 text-foreground" /> },
];

const member = (n: number): TeamMember => ({
  image: placeholder(n),
  name: "Full name",
  jobTitle: "Job title",
  description:
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique.",
  socialLinks,
});

export const Team7Defaults: Props = {
  tagline: "Tagline",
  heading: "Our team",
  description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
  teamMembers: [member(1), member(2), member(3), member(4), member(5), member(6)],
  footer: {
    heading: "We're hiring!",
    description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
    button: { variant: "outline", children: "Open positions" },
  },
};
