import { PublicContact } from "@/lib/apply/team-types";

import { ShareValue } from "./ShareValue";

const LINKS: {
  key: "linkedin" | "github" | "personalWebsite";
  label: string;
}[] = [
  { key: "linkedin", label: "LinkedIn" },
  { key: "github", label: "GitHub" },
  { key: "personalWebsite", label: "Portfolio" },
];

export function MemberContacts({ members }: { members: PublicContact[] }) {
  return (
    <section aria-labelledby="members-contact-title">
      <h2 id="members-contact-title" className="text-sm text-white/45">
        On the team
      </h2>
      <p className="mt-1 text-sm text-white/55">
        This team is public, so you can message them from the links below.
      </p>
      <ul className="mt-3 space-y-2">
        {members.map((member, index) => {
          const links = LINKS.filter((field) => member[field.key]);
          return (
            <li
              key={`${member.firstName}-${index}`}
              className="rounded-2xl bg-white/[0.04] px-4 py-3"
            >
              <p className="text-white">
                {member.firstName}
                {member.isOwner && (
                  <span className="text-white/45"> · Team lead</span>
                )}
              </p>
              {links.length === 0 ? (
                <p className="mt-1 text-sm text-white/40">
                  No contact links yet.
                </p>
              ) : (
                <ul className="mt-2 space-y-1 text-sm">
                  {links.map((field) => (
                    <li key={field.key}>
                      <span className="text-white/45">{field.label}</span>{" "}
                      <ShareValue value={member[field.key]} />
                    </li>
                  ))}
                </ul>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
