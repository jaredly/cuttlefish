import tailwind from 'bun-plugin-tailwind';
import { build } from 'bun';

build({
    entrypoints: ['index.html'],
    // If not explicitly set in 'outputFile', defaults to 'outdir/' if defined, otherwise 'dist/'.
    outdir: 'build/',
    plugins: [tailwind],
}).catch((e) => console.error(e));
