// Static export lets GitHub Pages serve the site without a Node.js server.
const isGitHubPages = process.env.GITHUB_PAGES === "true";

// GitHub Actions provides OWNER/REPOSITORY in this environment variable.
const repositoryName = process.env.GITHUB_REPOSITORY?.split("/")[1];

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  trailingSlash: true,
  images: { unoptimized: true },
  // A project page lives at /REPOSITORY/ rather than at the domain root.
  ...(isGitHubPages && repositoryName ? { basePath: `/${repositoryName}` } : {}),
};

export default nextConfig;
