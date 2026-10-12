import type { Metadata } from "next";
import Link from "next/link";
import { getCurrentUser } from "@/auth";

import { MAX_TEAM_SIZE } from "@/config/apply";
import {
  cardHeadline,
  cardQuery,
  parseCardOptions,
} from "@/lib/apply/team-card";
import { loadTeamPage } from "@/lib/apply/team-page";
import {
  getApplicantShare,
  getInvitePreview,
  getTeamCard,
} from "@/lib/db/queries/team";
import { Button } from "@/components/ui/button";
import { JoinRequestButton } from "@/components/teams/JoinRequestButton";
import { SpotsMeter } from "@/components/teams/SpotsMeter";
import { TeamPage } from "@/components/teams/TeamPage";

type Props = {
  params: Promise<{ token: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata({
  params,
  searchParams,
}: Props): Promise<Metadata> {
  const { token } = await params;
  const card = await getTeamCard(token);
  if (!card) return { title: "Join a team" };
  const options = parseCardOptions(await searchParams);
  const image = `/api/teams/card?token=${encodeURIComponent(token)}&${cardQuery({ ...options, size: "wide" })}`;
  const title = `Join ${card.name} at Hack Canada`;
  const description = `${cardHeadline(options.cta, card.spotsLeft)}. ${card.memberCount} of ${MAX_TEAM_SIZE} members so far. Ask to join on the Hack Canada portal.`;
  return {
    title,
    description,
    robots: { index: false },
    openGraph: {
      title,
      description,
      images: [{ url: image, width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
  };
}

function LookingFor({ text }: { text: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
      <p className="text-xs font-medium tracking-[0.14em] text-white/45 uppercase">
        What they are looking for
      </p>
      <p className="mt-2 whitespace-pre-line text-white/85">{text}</p>
    </div>
  );
}

export default async function JoinTeamPage({ params, searchParams }: Props) {
  const { token } = await params;
  const path = `/apply/teams/join/${token}`;
  const user = await getCurrentUser();

  if (!user?.id) {
    const card = await getTeamCard(token);
    if (!card) {
      return (
        <TeamPage
          eyebrow="Team invite"
          title="Team link not found"
          lede="This link is invalid or was reset. Ask the owner for a new one."
        />
      );
    }
    const { looking } = parseCardOptions(await searchParams);
    return (
      <TeamPage
        eyebrow="Team invite · Hack Canada"
        title={card.name}
        meta={<SpotsMeter memberCount={card.memberCount} />}
      >
        <div className="max-w-xl space-y-6">
          {looking && card.lookingFor && <LookingFor text={card.lookingFor} />}
          <p className="text-white/65">
            Sign in to ask to join. The owner sees the details you agree to
            share, then accepts or declines.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button asChild className="min-h-11">
              <Link href={`/sign-in?callbackUrl=${encodeURIComponent(path)}`}>
                Sign in to ask to join
              </Link>
            </Button>
            <Button asChild variant="outline" className="min-h-11">
              <Link href="/sign-up">Create an account</Link>
            </Button>
          </div>
        </div>
      </TeamPage>
    );
  }

  const { userId, open, backHref } = await loadTeamPage(path);
  const [team, share] = await Promise.all([
    getInvitePreview(token, userId),
    getApplicantShare(userId),
  ]);

  if (!team) {
    return (
      <TeamPage
        eyebrow="Team invite"
        title="Team link not found"
        lede="This link is invalid or was reset. Ask the owner for a new one, or browse public teams."
        backHref={backHref}
      >
        <Button asChild variant="outline" className="min-h-11">
          <Link href="/apply/teams/browse">Browse public teams</Link>
        </Button>
      </TeamPage>
    );
  }

  return (
    <TeamPage
      eyebrow="Team invite"
      title={team.name}
      meta={<SpotsMeter memberCount={team.memberCount} />}
      backHref={backHref}
    >
      <div className="max-w-xl space-y-6">
        <LookingFor
          text={
            team.lookingFor ||
            "They have not written what they are looking for yet."
          }
        />
        <div>
          <p className="text-sm text-white/45">On the team</p>
          <ul className="mt-2 flex flex-wrap gap-2" aria-label="Members">
            {team.memberFirstNames.map((name, index) => (
              <li
                key={`${name}-${index}`}
                className="rounded-full bg-white/10 px-3 py-1 text-sm text-white"
              >
                {name}
              </li>
            ))}
          </ul>
        </div>
        <JoinRequestButton
          teamName={team.name}
          share={share}
          open={open}
          token={token}
          requestStatus={team.requestStatus}
          requestId={team.requestId}
          cooldownUntil={team.cooldownUntil}
          full={team.spotsLeft <= 0}
          mine={team.mine}
        />
      </div>
    </TeamPage>
  );
}
