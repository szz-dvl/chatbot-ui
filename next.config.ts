import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  output: "export",
  env: {
    BOT_API: "http://meneame.bot",
    AUDIO_ENABLED: "false"
  }
};

export default nextConfig;
