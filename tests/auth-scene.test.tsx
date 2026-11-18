// @vitest-environment jsdom
import { cleanup, render } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";

import { AuthScene } from "@/components/auth/AuthScene";

vi.mock("next/navigation", () => ({ usePathname: () => "/sign-up" }));
vi.mock("@/components/apply/ApplyPicker", () => ({ Cloud: () => null }));
vi.mock("next/image", () => ({
  default: ({ src, priority }: { src: string; priority?: boolean }) => (
    // The test inspects whether an image would be mounted, without downloading it.
    <span
      data-testid="scene-image"
      data-src={src}
      data-priority={String(Boolean(priority))}
    />
  ),
}));
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});
const viewport = (matches: boolean) =>
  vi.stubGlobal("matchMedia", () => ({
    matches,
    addListener() {},
    removeListener() {},
    addEventListener() {},
    removeEventListener() {},
  }));

it("does not mount decorative image elements on mobile", () => {
  viewport(false);
  const { container } = render(<AuthScene />);
  expect(container.firstChild).toBeNull();
});

it("uses the WebP without an eager preload on desktop", () => {
  viewport(true);
  const { getByTestId } = render(<AuthScene />);
  const image = getByTestId("scene-image");
  expect(image.getAttribute("data-src")).toContain("sign-up-beach-hc27.webp");
  expect(image.getAttribute("data-priority")).toBe("false");
});
