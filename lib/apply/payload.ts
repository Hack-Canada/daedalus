import { ApplyTrack, DEFAULT_APPLY_VALUES } from "@/config/apply";
import { HackerApplicationsSelectData } from "@/lib/db/schema";
import { THackerApplicationSubmission } from "@/lib/validations/application";

export function schoolName(school: { value: string; customValue?: string }) {
  if (school.value === "Other (please specify)") {
    return school.customValue?.trim() || null;
  }
  return school.value.trim() || null;
}

export function applicationToForm(
  application: HackerApplicationsSelectData | null,
  track: ApplyTrack,
  email: string,
): THackerApplicationSubmission {
  if (!application) {
    return { ...DEFAULT_APPLY_VALUES, applicationType: track, email };
  }

  return {
    applicationType: track,
    firstName: application.firstName || "",
    lastName: application.lastName || "",
    age: application.age?.toString() || "",
    email,
    school: { value: application.school || "", customValue: "" },
    country: application.country || "",
    levelOfStudy: application.levelOfStudy || "",
    hackathonsAttended: application.hackathonsAttended || "",
    personalWebsite: application.personalWebsite || "",
    linkedin: application.linkedin || "",
    github: application.github || "",
    xUrl: application.xUrl || "",
    resumeUrl: application.resumeUrl || "",
    shareResume: Boolean(application.shareResume),
    mlhCheckbox1: Boolean(application.mlhCheckbox1),
    mlhCheckbox2: Boolean(application.mlhCheckbox2),
    mlhCheckbox3: Boolean(application.mlhCheckbox3),
    needsTravelReimbursement: Boolean(application.needsTravelReimbursement),
    travelAmount: application.travelAmount?.toString() || "",
    travelFrom: application.travelFrom || "",
    normalAnswer1: application.shortAnswer1 || "",
    normalAnswer2: application.shortAnswer2 || "",
  };
}

export function toApplicationRow(
  data: THackerApplicationSubmission,
  userId: string,
  email: string,
  isTeam: boolean,
) {
  const travel = data.needsTravelReimbursement;

  return {
    userId,
    applicationType: data.applicationType,
    firstName: data.firstName || null,
    lastName: data.lastName || null,
    age: data.age ? Number(data.age) : null,
    email: email.toLowerCase(),
    github: data.github || null,
    linkedin: data.linkedin || null,
    personalWebsite: data.personalWebsite || null,
    xUrl: data.xUrl || null,
    resumeUrl: data.resumeUrl || null,
    shareResume: data.shareResume,
    school: schoolName(data.school),
    levelOfStudy: data.levelOfStudy || null,
    country: data.country || null,
    hackathonsAttended: data.hackathonsAttended || null,
    shortAnswer1: data.applicationType === "normal" ? data.normalAnswer1 || null : null,
    shortAnswer2: data.applicationType === "normal" ? data.normalAnswer2 || null : null,
    mlhCheckbox1: data.mlhCheckbox1,
    mlhCheckbox2: data.mlhCheckbox2,
    mlhCheckbox3: data.mlhCheckbox3,
    needsTravelReimbursement: travel,
    travelAmount: travel && data.travelAmount ? Number(data.travelAmount) : null,
    travelFrom: travel ? data.travelFrom || null : null,
    isTeam,
  };
}
