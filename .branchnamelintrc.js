module.exports = {
  pattern: ":type/:description",
  params: {
    type: [
      "chore",
      "docs",
      "feat",
      "fix",
      "perf",
      "refacto",
      "revert",
      "style"
    ],
    description: ["[a-z0-9-]+"],
    issue: ["ril-[0-9]+"]
  },
  prohibited: [
    'ci',
    'wip',
    'main',
    'test',
    'build',
    'master',
    'release',
  ],
}
