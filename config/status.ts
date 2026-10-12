import {
  Frown,
  Hourglass,
  Laugh,
  Loader,
  NotebookPen,
  Smile,
} from "lucide-react";

interface ActionConfig {
  href: string;
  label: string;
  variant?:
    | "default"
    | "primary"
    | "secondary"
    | "ghost"
    | "destructive"
    | "outline";
}

interface StatusConfig {
  heading: string;
  description: string;
  primaryAction?: ActionConfig;
  secondaryAction?: ActionConfig;
}

interface AcceptedStatusConfig {
  heading?: never;
  description?: never;
  primaryAction?: never;
  secondaryAction?: never;
  hacker: {
    heading: string;
    description: string;
    primaryAction: ActionConfig;
  };
  default: {
    heading: string;
    description: string;
    primaryAction: ActionConfig;
    secondaryAction: ActionConfig;
  };
}

export const statusStyles = {
  not_applied: "bg-backgroundMuted text-textMuted",
  pending: "bg-primaryLight/10 text-secondaryDark border-primary/50",
  accepted: "bg-backgroundMuted shadow-success/10",
  rejected: "bg-error/5 text-error border-error/50 shadow-error/10",
  waitlisted: "bg-warning/5 text-warning border-warning/50 shadow-warning/10",
  coming_soon: "bg-backgroundMuted text-textMuted border-primary/50",
  cancelled: "bg-error/5 text-error border-error/50 shadow-error/10",
};

export const statusIcons = {
  not_applied: NotebookPen,
  pending: Smile,
  accepted: Laugh,
  rejected: Frown,
  waitlisted: Hourglass,
  coming_soon: Loader,
  cancelled: Frown,
} as const;

export const statusLabels = {
  not_applied: "Not Applied",
  pending: "Applied",
  accepted: "Accepted",
  rejected: "Rejected",
  waitlisted: "Waitlisted",
  coming_soon: "Coming Soon",
  cancelled: "Cancelled RSVP",
} as const;

export const statusConfig: Record<
  Exclude<ApplicationStatus | "coming_soon", "accepted">,
  StatusConfig
> & { accepted: AcceptedStatusConfig } = {
  coming_soon: {
    heading: "Something Awesome is Brewing! ✨",
    description:
      "We're cooking up something special! Applications will open soon — get ready to embark on an incredible hackathon adventure!",
    primaryAction: {
      href: "/applications",
      label: "Explore Applications",
      variant: "primary",
    },
  },
  not_applied: {
    heading: "Your Adventure Awaits!",
    description:
      "Ready to build something amazing? Join 500+ hackers for an unforgettable weekend of innovation, learning, and fun.",
    primaryAction: {
      href: "/applications",
      label: "Let's Go!",
      variant: "primary",
    },
  },
  pending: {
    heading: "You're in the Running!",
    description:
      "Awesome work submitting your application! Our team is reviewing it with care. Hang tight — exciting news is on its way to your inbox soon!",
    primaryAction: {
      href: "/apply",
      label: "View My Application",
      variant: "primary",
    },
    secondaryAction: {
      href: "/applications",
      label: "Explore More",
      variant: "outline",
    },
  },
  accepted: {
    hacker: {
      heading: "You Made It! 🎉",
      description:
        "HUGE congrats — you're officially a Hack Canada hacker! Mark your calendar for March 6th and get ready for the best weekend ever. We can't wait to see what you'll build!",
      primaryAction: {
        href: "/apply",
        label: "View My Application",
        variant: "primary",
      },
    },
    default: {
      heading: "Welcome to Hack Canada! 🍁",
      description:
        "We're thrilled to have you join us! Please RSVP within 5 days to lock in your spot. This is going to be legendary!",
      primaryAction: {
        href: "/rsvp",
        label: "Secure My Spot!",
        variant: "primary",
      },
      secondaryAction: {
        href: "/apply",
        label: "View Application",
        variant: "outline",
      },
    },
  },
  rejected: {
    heading: "Not This Time 💙",
    description:
      "We received so many incredible applications this year! While we couldn't accept everyone, your passion for building is what matters most. Keep creating, keep learning — we'd love to see you apply again!",
    primaryAction: {
      href: "/apply",
      label: "View Application",
      variant: "destructive",
    },
    secondaryAction: {
      href: "/applications",
      label: "Explore More",
      variant: "outline",
    },
  },
  waitlisted: {
    heading: "You're on Deck! ⏳",
    description:
      "You're on our waitlist! This means you're just one step away from joining the fun. We'll reach out the moment a spot opens up — fingers crossed!",
    primaryAction: {
      href: "/apply",
      label: "View Application",
      variant: "secondary",
    },
    secondaryAction: {
      href: "/applications",
      label: "Explore More",
      variant: "outline",
    },
  },
  cancelled: {
    heading: "We'll Miss You! 😿",
    description:
      "You've cancelled your RSVP, but we'd love to have you back! If you've changed your mind, you can restore your RSVP below.",
    primaryAction: {
      href: "/apply",
      label: "View Application",
      variant: "destructive",
    },
    secondaryAction: {
      href: "/applications",
      label: "Explore More",
      variant: "outline",
    },
  },
};
