import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "co.givetime.app",
  appName: "GiveTime",
  webDir: "out",
  server: {
    // In development, load from the local dev server instead of bundled files.
    // Comment this out (or remove it) before building for production/App Store.
    // url: "http://YOUR_LOCAL_IP:3000",
    // cleartext: true,
  },
};

export default config;
