// @vitest-environment jsdom
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";

import type { MyTeamView } from "@/lib/apply/team-types";
import { TeamAnswers } from "@/components/teams/TeamAnswers";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh() {}, push() {} }),
}));
vi.mock("sonner", () => ({ toast: { success() {}, error() {} } }));
const team: MyTeamView = {
  id: "t1",
  name: "Team",
  isPublic: false,
  lookingFor: "",
  answersLocked: false,
  essay: "Original essay",
  essayRevision: 0,
  essayUpdatedAt: null,
  essayUpdatedByName: null,
  invitePath: "/invite",
  isOwner: false,
  requests: [],
  pendingCount: 0,
  members: [
    {
      firstName: "One",
      marsAnswer: "Original Mars",
      marsRevision: 0,
      membershipId: "m1",
      isOwner: false,
      isMe: true,
    },
  ],
};
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

it("advances each saved revision while retaining edits to the other answer", async () => {
  const requests: Record<string, unknown>[] = [];
  vi.stubGlobal(
    "fetch",
    vi.fn(async (_url: string, init: RequestInit) => {
      const body = JSON.parse(init.body as string);
      requests.push(body);
      return {
        json: async () => ({
          success: true,
          message: "Saved",
          revision: body.revision + 1,
        }),
      };
    }),
  );
  const changed = vi.fn();
  render(<TeamAnswers team={team} open onUnsavedChange={changed} />);
  const [mars, essay] = screen.getAllByRole("textbox");
  fireEvent.change(mars, { target: { value: "Mars one" } });
  fireEvent.change(essay, { target: { value: "Essay unsaved" } });
  fireEvent.click(screen.getAllByRole("button", { name: "Save" })[0]);
  await waitFor(() =>
    expect(screen.getByRole("button", { name: "Saved" })).toBeTruthy(),
  );
  expect((essay as HTMLTextAreaElement).value).toBe("Essay unsaved");
  fireEvent.change(mars, { target: { value: "Mars two" } });
  fireEvent.click(screen.getAllByRole("button", { name: "Save" })[0]);
  await waitFor(() => expect(requests).toHaveLength(2));
  expect(requests[0].revision).toBe(0);
  expect(requests[1].revision).toBe(1);
  expect(changed).toHaveBeenLastCalledWith(true);
});

it("keeps local essay when a teammate's newer answer arrives and sends its old revision", async () => {
  const requests: Record<string, unknown>[] = [];
  vi.stubGlobal(
    "fetch",
    vi.fn(async (_url: string, init: RequestInit) => {
      requests.push(JSON.parse(init.body as string));
      return {
        json: async () => ({
          success: false,
          message: "A teammate saved a newer answer. Copy before reloading.",
        }),
      };
    }),
  );
  const { rerender } = render(<TeamAnswers team={team} open />);
  fireEvent.change(screen.getAllByRole("textbox")[1], {
    target: { value: "My local essay" },
  });
  rerender(
    <TeamAnswers
      team={{ ...team, essay: "Teammate's essay", essayRevision: 1 }}
      open
    />,
  );
  expect((screen.getAllByRole("textbox")[1] as HTMLTextAreaElement).value).toBe(
    "My local essay",
  );
  fireEvent.click(screen.getByRole("button", { name: "Save" }));
  await waitFor(() => expect(requests).toHaveLength(1));
  expect(requests[0].revision).toBe(0);
  expect((screen.getAllByRole("textbox")[1] as HTMLTextAreaElement).value).toBe(
    "My local essay",
  );
});
