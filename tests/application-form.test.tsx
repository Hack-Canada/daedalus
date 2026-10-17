// @vitest-environment jsdom
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";

import { DEFAULT_APPLY_VALUES } from "@/config/apply";
import type { MyTeamView } from "@/lib/apply/team-types";
import { ApplyForm } from "@/components/apply/ApplyForm";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh() {}, push() {} }),
}));
vi.mock("next/link", () => ({
  default: ({ children }: { children: React.ReactNode }) => (
    <span>{children}</span>
  ),
}));
vi.mock("sonner", () => ({ toast: { success() {}, error() {} } }));
vi.mock("@/components/apply/BasicQuestions", () => ({
  BasicQuestions: () => null,
}));
vi.mock("@/components/apply/SocialsMlhTravel", () => ({
  SocialsMlhTravel: () => null,
}));
vi.mock("@/components/apply/NormalQuestions", () => ({
  NormalQuestions: () => null,
}));
vi.mock("@/components/teams/TeamStep", () => ({
  TeamStep: ({
    onUnsavedChange,
  }: {
    onUnsavedChange: (value: boolean) => void;
  }) => (
    <>
      <button type="button" onClick={() => onUnsavedChange(true)}>
        Edit team answer
      </button>
      <button type="button" onClick={() => onUnsavedChange(false)}>
        Team save completed
      </button>
    </>
  ),
}));

const values = {
  ...DEFAULT_APPLY_VALUES,
  firstName: "One",
  lastName: "Applicant",
  age: "20",
  country: "Canada",
  levelOfStudy: "Undergraduate",
  school: { value: "Waterloo", customValue: "" },
  mlhCheckbox1: true,
  mlhCheckbox2: true,
  email: "one@example.test",
};
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

it("prevents overlapping save and submit even for programmatic form submission", async () => {
  let complete!: (value: unknown) => void;
  const fetch = vi.fn(
    () =>
      new Promise((resolve) => {
        complete = resolve;
      }),
  );
  vi.stubGlobal("fetch", fetch);
  render(
    <ApplyForm
      track="quick"
      initialRevision={0}
      defaultValues={values}
      userEmail={values.email}
      canSave
      canSubmit
      team={null}
      requests={[]}
      teamOpen
    />,
  );
  fireEvent.click(screen.getByRole("button", { name: "Save draft" }));
  fireEvent.submit(document.getElementById("apply-form")!);
  expect(fetch).toHaveBeenCalledTimes(1);
  expect(
    (
      screen.getByRole("button", {
        name: "Submit application",
      }) as HTMLButtonElement
    ).disabled,
  ).toBe(true);
  complete({
    json: async () => ({
      success: true,
      message: "Saved",
      data: { revision: 1 },
    }),
  });
  await waitFor(() =>
    expect(
      (screen.getByRole("button", { name: "Save draft" }) as HTMLButtonElement)
        .disabled,
    ).toBe(false),
  );
});

it("blocks team submission until team answer saves complete", async () => {
  vi.stubGlobal("scrollTo", vi.fn());
  const requests: string[] = [];
  vi.stubGlobal(
    "fetch",
    vi.fn(async (url: string) => {
      requests.push(url);
      return {
        json: async () => ({
          success: true,
          message: "Saved",
          data: { revision: 1 },
        }),
      };
    }),
  );
  const team = {
    members: [{ isMe: true }, { isMe: false }],
  } as unknown as MyTeamView;
  render(
    <ApplyForm
      track="team"
      initialRevision={0}
      defaultValues={{ ...values, applicationType: "team" }}
      userEmail={values.email}
      canSave
      canSubmit
      team={team}
      requests={[]}
      teamOpen
    />,
  );
  fireEvent.click(screen.getByRole("button", { name: "Next" }));
  await screen.findByRole("button", { name: "Edit team answer" });
  fireEvent.click(screen.getByRole("button", { name: "Edit team answer" }));
  const submit = screen.getByRole("button", {
    name: "Submit team application",
  }) as HTMLButtonElement;
  expect(submit.disabled).toBe(true);
  const back = screen.getByRole("button", {
    name: "Back",
  }) as HTMLButtonElement;
  expect(back.disabled).toBe(true);
  fireEvent.click(back);
  expect(
    screen.getByRole("button", { name: "Team save completed" }),
  ).toBeTruthy();
  fireEvent.submit(document.getElementById("apply-form")!);
  expect(requests).toEqual(["/api/application/save"]);
  fireEvent.click(screen.getByRole("button", { name: "Team save completed" }));
  fireEvent.submit(document.getElementById("apply-form")!);
  await waitFor(() =>
    expect(requests).toEqual([
      "/api/application/save",
      "/api/application/submit",
    ]),
  );
});
