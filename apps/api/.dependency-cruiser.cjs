/**
 * Reglas de la arquitectura hexagonal verificadas sobre los imports reales de `src/`.
 * Se incluyen los imports `import type` (tsPreCompilationDeps) para que una
 * dependencia solo de tipos también cuente como acoplamiento.
 *
 * @type {import('dependency-cruiser').IConfiguration}
 */
module.exports = {
  forbidden: [
    {
      name: 'domain-is-pure',
      comment:
        'domain/ es TypeScript puro: solo puede importar de domain/ (ni node_modules, ni módulos core de Node, ni otras capas).',
      severity: 'error',
      from: { path: '^src/domain/' },
      to: { pathNot: '^src/domain/' },
    },
    {
      name: 'application-depends-only-on-domain',
      comment:
        'application/ (casos de uso + puertos) solo puede importar de domain/ y de application/.',
      severity: 'error',
      from: { path: '^src/application/' },
      to: { pathNot: '^src/(domain|application)/' },
    },
    {
      name: 'core-does-not-know-infrastructure',
      comment: 'domain/ y application/ nunca dependen de adaptadores de infrastructure/.',
      severity: 'error',
      from: { path: '^src/(domain|application)/' },
      to: { path: '^src/infrastructure/' },
    },
    {
      name: 'composition-root-is-not-imported',
      comment: 'main.ts es la raíz de composición: nadie lo importa.',
      severity: 'error',
      from: {},
      to: { path: '^src/main\\.ts$' },
    },
    {
      name: 'zod-only-in-http-and-config',
      comment:
        'Zod se usa únicamente para validar bordes: infrastructure/http y infrastructure/config.',
      severity: 'error',
      from: { path: '^src/', pathNot: '^src/infrastructure/(http|config)/' },
      to: { path: 'node_modules/zod/' },
    },
    {
      name: 'no-circular',
      severity: 'error',
      from: {},
      to: { circular: true },
    },
    {
      name: 'not-to-unresolvable',
      severity: 'error',
      from: {},
      to: { couldNotResolve: true },
    },
    {
      name: 'not-to-dev-dep',
      comment: 'El código de producción no puede depender de devDependencies.',
      severity: 'error',
      from: { path: '^src/' },
      to: { dependencyTypes: ['npm-dev'], dependencyTypesNot: ['type-only'] },
    },
    {
      name: 'no-orphans',
      severity: 'warn',
      from: {
        orphan: true,
        pathNot: [
          '\\.d\\.ts$',
          '^src/main\\.ts$',
          '^src/infrastructure/persistence/postgres/migrate\\.ts$',
        ],
      },
      to: {},
    },
  ],
  options: {
    doNotFollow: { path: 'node_modules' },
    tsPreCompilationDeps: true,
    tsConfig: { fileName: 'tsconfig.json' },
    enhancedResolveOptions: {
      exportsFields: ['exports'],
      conditionNames: ['import', 'require', 'node', 'default', 'types'],
      extensions: ['.ts', '.js', '.json'],
      mainFields: ['module', 'main', 'types', 'typings'],
    },
    reporterOptions: {
      mermaid: { minify: false },
      text: { highlightFocused: true },
    },
  },
};
