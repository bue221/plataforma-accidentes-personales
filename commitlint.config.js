/** Conventional Commits in English, e.g. `feat(accidents): add accident registration endpoint`. */
export default {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'scope-case': [2, 'always', 'kebab-case'],
    'header-max-length': [2, 'always', 100],
  },
};
