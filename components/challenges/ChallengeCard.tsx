// components/challenge-card.tsx

import { QRCodeSVG } from "qrcode.react";

import { QR_LOGO_SRC } from "@/config/qr-code";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChallengeStatus,
  ChallengeWithStatus,
} from "@/app/(dashboard)/challenges/page";

function StatusBadge({ status }: { status?: ChallengeStatus }) {
  if (status === "completed") {
    return (
      <Badge className="border-emerald-500/30 bg-emerald-500/15 text-emerald-400">
        Completed
      </Badge>
    );
  }
  if (status === "in_progress") {
    return (
      <Badge className="border-amber-500/30 bg-amber-500/15 text-amber-400">
        In Progress
      </Badge>
    );
  }

  if (status === "deadline_passed") {
    return (
      <Badge className="border-red-500/30 bg-red-500/15 text-red-400">
        Deadline Passed
      </Badge>
    );
  }

  if (status === "not_yet_available") {
    return (
      <Badge className="border-orange-500/30 bg-orange-500/15 text-orange-400">
        Not Yet Available
      </Badge>
    );
  }

  return (
    <Badge className="border-white/10 bg-white/8 text-textSecondary">
      Not Started
    </Badge>
  );
}

export function ChallengeCard({
  challenge,
  user,
  onStartChallenge,
}: {
  challenge: ChallengeWithStatus;
  user: User;
  onStartChallenge: (challenge: ChallengeWithStatus) => void;
}) {
  return (
    <Card className="flex h-full flex-col border-primary/15 bg-backgroundMuted transition-colors hover:border-primary/30">
      <CardHeader className="space-y-1">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-base text-textPrimary">
            {challenge.name}
          </CardTitle>
          <StatusBadge status={challenge.status} />
        </div>
        <CardDescription className="text-textMuted">
          {challenge.category} • {challenge.points} pts • {challenge.difficulty}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-3">
        <p className="text-sm text-textSecondary">{challenge.shortDescription}</p>

        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="instructions" className="border-primary/10">
            <AccordionTrigger className="text-sm text-textPrimary hover:text-primary">
              Full instructions
            </AccordionTrigger>
            <AccordionContent className="text-sm text-textSecondary">
              {challenge.instructions}
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="hints" className="border-primary/10">
            <AccordionTrigger className="text-sm text-textPrimary hover:text-primary">
              Hints
            </AccordionTrigger>
            <AccordionContent className="space-y-1 text-sm text-textSecondary">
              <ul className="list-inside list-disc space-y-1">
                {challenge.hints.map((hint) => (
                  <li key={hint}>{hint}</li>
                ))}
              </ul>
            </AccordionContent>
          </AccordionItem>

          {challenge.qrCode && (
            <AccordionItem value="qr" className="border-primary/10">
              <AccordionTrigger className="text-sm text-textPrimary hover:text-primary">
                QR code
              </AccordionTrigger>
              <AccordionContent className="flex flex-col items-center gap-2 py-2">
                <div className="rounded-lg bg-white p-3">
                  <QRCodeSVG
                    value={JSON.stringify({
                      userId: user.id,
                      challengeId: challenge.id,
                    })}
                    size={200}
                    level="H"
                    imageSettings={{
                      src: QR_LOGO_SRC,
                      height: 50,
                      width: 50,
                      excavate: true,
                    }}
                  />
                </div>
                <p className="text-xs text-textMuted">
                  Scan this code on-site to confirm your visit.
                </p>
              </AccordionContent>
            </AccordionItem>
          )}

          <AccordionItem value="submission" className="border-primary/10">
            <AccordionTrigger className="text-sm text-textPrimary hover:text-primary">
              Submission instructions
            </AccordionTrigger>
            <AccordionContent className="text-sm text-textSecondary">
              {challenge.submissionInstructions}
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        {challenge.status === "not_started" && (
          <Button
            className="mt-2 w-full border-primary/30 text-primary hover:bg-primary/10"
            variant="outline"
            onClick={() => onStartChallenge(challenge)}
          >
            Start
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
