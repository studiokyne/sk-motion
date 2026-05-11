module.exports = {
  branches: ["main"],
  plugins: [
    "@semantic-release/commit-analyzer",
    "@semantic-release/release-notes-generator",
    [
      "@semantic-release/exec",
      {
        prepareCmd: "SK_MOTION_VERSION=<%= nextRelease.version %> pnpm build"
      }
    ],
    [
      "@semantic-release/npm",
      {
        npmPublish: true
      }
    ],
    [
      "@semantic-release/github",
      {
        assets: [
          {
            path: "dist/sk-motion.full.iife.min.js",
            label: "sk-motion.full.iife.min.js"
          }
        ]
      }
    ]
  ]
};