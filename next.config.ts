import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // `next dev` only serves its client scripts to localhost by default, so opening the
  // app from another device via the LAN address left it without JS (수정/삭제 buttons
  // did nothing). Allow this machine's LAN addresses. Has no effect on production builds.
  allowedDevOrigins: ["172.15.*.*"],
};

export default nextConfig;
