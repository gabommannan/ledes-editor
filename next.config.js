/** @type {import('next').NextConfig} */
const nextConfig = {
  /**
   * Enable static exports for production builds (GitHub Pages).
   * Disabled for local development to support dev server features.
   *
   * @see https://nextjs.org/docs/app/building-your-application/deploying/static-exports
   */
  ...(process.env.NODE_ENV === "production" && {
    output: "export",
    trailingSlash: true,
    distDir: "out",
  }),

  /**
   * Set base path for GitHub Pages deployment only.
   * This should match your GitHub repository name.
   *
   * @see https://nextjs.org/docs/app/api-reference/next-config-js/basePath
   */
  ...(process.env.NODE_ENV === "production" && {
    basePath: "/ledes-editor",
    assetPrefix: "/ledes-editor",
  }),

  /**
   * Disable server-based image optimization for static exports.
   * Always disabled since it's needed for both dev and production.
   *
   * @see https://nextjs.org/docs/app/api-reference/components/image#unoptimized
   */
  images: {
    unoptimized: true,
  },
};

module.exports = nextConfig;
