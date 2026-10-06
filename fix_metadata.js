const fs = require('fs');
let code = fs.readFileSync('src/app/layout.tsx', 'utf8');

code = code.replace(
  `export const metadata: Metadata = {
  title: "SafeCore AI | Command Center",
  description: "Unified digital safety and threat intelligence platform.",
  manifest: "/manifest.json",
  themeColor: "#070B14",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "SafeCore"
  },
  viewport: "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0"
};`,
  `import { Viewport } from "next";

export const metadata: Metadata = {
  title: "SafeCore AI | Command Center",
  description: "Unified digital safety and threat intelligence platform.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "SafeCore"
  }
};

export const viewport: Viewport = {
  themeColor: "#070B14",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};`
);

fs.writeFileSync('src/app/layout.tsx', code);
