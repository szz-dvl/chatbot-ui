import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  output: "export",
  env: {
    BOT_API: "",
    AUDIO_ENABLED: "false"
  }
};

export default nextConfig;
