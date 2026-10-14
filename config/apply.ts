export const APPLY_TRACKS = ["quick", "normal", "team"] as const;

export type ApplyTrack = (typeof APPLY_TRACKS)[number];

export type ApplySection = "basic" | "socials" | "normal" | "team";

export const MAX_TEAM_SIZE = 4;
export const MIN_TEAM_APPLY = 2;
export const MAX_PENDING_REQUESTS = 5;
export const REQUEST_COOLDOWN_MS = 24 * 60 * 60 * 1000;
export const LOOKING_FOR_LIMIT = 280;
export const REQUEST_NOTE_LIMIT = 280;
export const NORMAL_WORD_LIMIT = 100;
export const MARS_WORD_LIMIT = 100;
export const ESSAY_WORD_LIMIT = 200;
export const TRAVEL_REIMBURSEMENT_MAX = 200;

export const TRACK_SECTIONS: Record<ApplyTrack, readonly ApplySection[]> = {
  quick: ["basic", "socials"],
  normal: ["basic", "socials", "normal"],
  team: ["basic", "socials", "team"],
};

export function isApplyTrack(value: string): value is ApplyTrack {
  return (APPLY_TRACKS as readonly string[]).includes(value);
}

export const TRACKS: {
  id: ApplyTrack;
  title: string;
  description: string;
}[] = [
  {
    id: "quick",
    title: "Quick Apps",
    description:
      "A quick, simple application focused on your technical work. The fastest way to apply, but also the most competitive.",
  },
  {
    id: "normal",
    title: "Normal Apps",
    description:
      "Tell us about your projects, your passion, and how you think. Two short answers take a little more time, but give you a better chance of getting in.",
  },
  {
    id: "team",
    title: "Team Apps",
    description:
      "Apply together. Everyone answers a few questions individually, then you work together on one shared answer. Show us a cohesive team that works well together for the best chance of getting in.",
  },
];

export const NORMAL_PROMPTS = {
  normalAnswer1:
    "You get a free plane ticket to anywhere, but you have to leave in one hour. Where are you going and what are you packing?",
  normalAnswer2:
    "Walk us through one of the coolest projects you've built. Talk about whatever you want, but highlight the journey, the key decision you had to make, and how you went about building it. Please provide links to your project if possible.",
} as const;

export const TEAM_PROMPTS = {
  mars: "Your team is sent to Mars but each teammate can only bring one thing. What do each of you bring and why?",
  essay:
    "Tell us about your team and what brought you together. How do you know each other, and why did you decide to participate as a team? We'd love to hear about each member's strengths, areas for growth, and how you complement one another.",
} as const;

export const DEFAULT_APPLY_VALUES = {
  applicationType: "quick" as ApplyTrack,
  firstName: "",
  lastName: "",
  age: "",
  email: "",
  school: { value: "", customValue: "" },
  country: "",
  levelOfStudy: "",
  hackathonsAttended: "",
  personalWebsite: "",
  linkedin: "",
  github: "",
  xUrl: "",
  resumeUrl: "",
  shareResume: false,
  mlhCheckbox1: false,
  mlhCheckbox2: false,
  mlhCheckbox3: false,
  needsTravelReimbursement: false,
  travelAmount: "",
  travelFrom: "",
  normalAnswer1: "",
  normalAnswer2: "",
};
