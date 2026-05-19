/**
 * Next.js configuration
 *
 * Explicitly sets Turbopack root to avoid workspace detection issues.
 */
const path = require("path");

/** @type {import('next').NextConfig} */
const nextConfig = {
  turbopack: {
    root: path.resolve(__dirname),
  },
};

module.exports = nextConfig;
