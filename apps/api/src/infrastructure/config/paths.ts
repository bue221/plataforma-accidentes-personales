import { fileURLToPath } from 'node:url';

// Resolves to the same folder from src/ (tsx) and from dist/ (build) because tsc
// mirrors the source tree under dist/.
export const repositoryRoot = fileURLToPath(new URL('../../../../../', import.meta.url));

export const apiRoot = fileURLToPath(new URL('../../../', import.meta.url));
