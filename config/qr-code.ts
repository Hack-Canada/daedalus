interface ScannerConfig {
  fps: number;
  qrbox: {
    width: number;
    height: number;
  };
  allowReset: boolean;
  aspectRatio: number;
  showTorchButtonIfSupported: boolean;
  showZoomSliderIfSupported: boolean;
  defaultZoomValueIfSupported: number;
}

export const EVENTS = [
  "hackathon-check-in",
  "friday-dinner",
  "saturday-breakfast",
  "saturday-lunch",
  "saturday-dinner",
  "sunday-breakfast",
  "sunday-lunch",
  "snack-1",
  "snack-2",
  "snack-3",
  "snack-4",
  "snack-5",
  "extra-1",
  "extra-2",
  "challenge",
  "shop-redeem",
] as const;

export type Event = (typeof EVENTS)[number];

export const SCANNER_CONFIG: ScannerConfig = {
  fps: 10,
  allowReset: true,
  qrbox: {
    width: 250,
    height: 250,
  },
  aspectRatio: 1.0,
  showTorchButtonIfSupported: false,
  showZoomSliderIfSupported: false,
  defaultZoomValueIfSupported: 2,
};

// Raw <img>/canvas loads skip next/image, so ask its optimizer for a 128px copy (the source PNG is ~1 MB).
export const QR_LOGO_SRC = "/_next/image?url=%2Flogo-circle.png&w=128&q=75";

export const CONTAINER_STYLES = {
  success: "rgba(76, 175, 80, 0.2)",
  error: "rgba(244, 67, 54, 0.2)",
} as const;
