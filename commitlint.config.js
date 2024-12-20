module.exports = {
    extends: ['@commitlint/config-conventional'],
    rules: {
        'type-enum': [2, 'always', ['build', 'chore', 'ci', 'docs', 'feat', 'fix', 'perf', 'refacto', 'revert', 'style', 'test', 'deps', 'conf', 'hack', 'wip', 'tmp', 'lint', 'mock', 'type', 'comment']],
    },
}
