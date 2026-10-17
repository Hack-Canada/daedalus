export type SharedProfile = {
  name: string;
  school: string;
  country: string;
  levelOfStudy: string;
  hackathonsAttended: string;
  linkedin: string;
  github: string;
  xUrl: string;
  personalWebsite: string;
};

export type ApplicantShare = {
  ready: boolean;
  profile: SharedProfile;
};

export type PublicTeamCard = {
  id: string;
  name: string;
  lookingFor: string;
  memberCount: number;
  spotsLeft: number;
  memberFirstNames: string[];
  mine: boolean;
  requestStatus: "pending" | null;
  requestId: string | null;
  cooldownUntil: string | null;
};

export type InvitePreview = {
  name: string;
  lookingFor: string;
  memberCount: number;
  spotsLeft: number;
  memberFirstNames: string[];
  mine: boolean;
  requestStatus: "pending" | null;
  requestId: string | null;
  cooldownUntil: string | null;
};

export type MyRequestView = {
  id: string;
  teamName: string;
  status: "pending" | "declined";
  createdAt: string;
};

export type RequestCardView = {
  id: string;
  message: string;
  via: "public" | "link";
  createdAt: string;
  profile: SharedProfile;
};

export type TeamMemberView = {
  membershipId: string;
  marsRevision: number;
  firstName: string;
  marsAnswer: string;
  isOwner: boolean;
  isMe: boolean;
  userId?: string;
};

export type MyTeamView = {
  id: string;
  essayRevision: number;
  name: string;
  isPublic: boolean;
  lookingFor: string;
  answersLocked: boolean;
  essay: string;
  essayUpdatedAt: string | null;
  essayUpdatedByName: string | null;
  invitePath: string;
  isOwner: boolean;
  members: TeamMemberView[];
  requests: RequestCardView[];
  pendingCount: number;
};
