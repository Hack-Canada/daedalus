import { SharedProfile } from "@/lib/apply/team-types";

export const SHARE_FIELDS: { key: keyof SharedProfile; label: string }[] = [
  { key: "name", label: "Name" },
  { key: "school", label: "School" },
  { key: "country", label: "Country" },
  { key: "levelOfStudy", label: "Level of study" },
  { key: "hackathonsAttended", label: "Hackathons attended" },
  { key: "linkedin", label: "LinkedIn" },
  { key: "github", label: "GitHub" },
  { key: "xUrl", label: "X" },
  { key: "personalWebsite", label: "Portfolio or other links" },
];

export function ShareValue({ value }: { value: string }) {
  if (!value) return <span className="text-white/40">Not provided</span>;
  if (/^https?:\/\//i.test(value)) {
    return (
      <a
        href={value}
        target="_blank"
        rel="noreferrer"
        className="break-all underline"
      >
        {value}
      </a>
    );
  }
  return <span className="break-all">{value}</span>;
}
