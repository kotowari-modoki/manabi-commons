// ABOUTME: Compares two OGP renderers against the same published content in fresh Node processes.
// ABOUTME: Alternates execution order and records initialization, first-batch, and warm-batch timings.
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { arch, platform, release } from 'node:os';
import { resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';

const RUNS = 7;
const WARM_BATCHES = 3;

if (process.argv[2] === '--worker') {
  const inputs = JSON.parse(readFileSync(0, 'utf8'));
  const start = performance.now();
  const { renderOgImage } = await import(pathToFileURL(resolve(process.argv[3])).href);
  const importMs = performance.now() - start;
  const batchMs = [];
  let firstImageMs;
  let pngBytes = 0;
  for (let batch = 0; batch <= WARM_BATCHES; batch++) {
    const batchStart = performance.now();
    for (const [index, input] of inputs.entries()) {
      const png = await renderOgImage(input);
      if (batch === 0 && index === 0) firstImageMs = performance.now() - batchStart;
      assert.equal(png.subarray(0, 8).toString('hex'), '89504e470d0a1a0a');
      assert.equal(png.readUInt32BE(16), 1200);
      assert.equal(png.readUInt32BE(20), 630);
      if (batch === 0) pngBytes += png.length;
    }
    batchMs.push(performance.now() - batchStart);
  }
  const rendererRequire = createRequire(pathToFileURL(resolve(process.argv[3])));
  const installed = (name) => {
    try { return rendererRequire(`${name}/package.json`).version; }
    catch { return null; }
  };
  console.log(JSON.stringify({ importMs, firstImageMs, firstBatchMs: batchMs[0],
    initialTotalMs: importMs + batchMs[0], warmBatchMs: batchMs.slice(1), pngBytes,
    installed: { sharp: installed('sharp'), resvg: installed('@resvg/resvg-js') } }));
  process.exit(0);
}

const [baseline, candidate, output] = process.argv.slice(2);
if (!baseline || !candidate || !output) {
  console.error('Usage: node scripts/benchmark-og-images.mjs BASELINE_MODULE CANDIDATE_MODULE OUTPUT_JSON');
  process.exit(1);
}

// Use the YAML parser from the installed Astro version; this script is not part of the site build.
const require = createRequire(import.meta.url);
const astroRequire = createRequire(require.resolve('astro/package.json'));
const { load } = astroRequire('js-yaml');
const inputs = readdirSync('src/content/docs', { recursive: true, encoding: 'utf8' })
  .filter((file) => /\.(md|mdx)$/.test(file)).sort().flatMap((file) => {
    const source = readFileSync(`src/content/docs/${file}`, 'utf8');
    const frontmatter = source.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/);
    assert.ok(frontmatter, `Frontmatter missing: ${file}`);
    const data = load(frontmatter[1]);
    if (data.draft) return [];
    const id = data.slug ?? file.replace(/\\/g, '/').replace(/\.(md|mdx)$/, '')
      .replace(/\/index$/, '').toLowerCase();
    return [{ id, title: data.title, grade: data.learning_context?.grade, subject: data.learning_context?.subject }];
  });

const samples = { baseline: [], candidate: [] };
const modules = { baseline, candidate };
for (let run = 0; run < RUNS; run++) {
  const order = run % 2 === 0 ? ['baseline', 'candidate'] : ['candidate', 'baseline'];
  for (const name of order) {
    const result = spawnSync(process.execPath, [import.meta.filename, '--worker', resolve(modules[name])], {
      input: JSON.stringify(inputs), encoding: 'utf8', maxBuffer: 1024 * 1024,
    });
    if (result.status !== 0) throw new Error(`${name} failed: ${result.stderr || result.error}`);
    const sample = JSON.parse(result.stdout);
    samples[name].push(sample);
    console.log(`${run + 1}/${RUNS} ${name}: init + ${inputs.length} images ${sample.initialTotalMs.toFixed(1)} ms; warm ${sample.warmBatchMs.map((ms) => ms.toFixed(1)).join(', ')} ms`);
  }
}

const stats = (values) => {
  const sorted = [...values].sort((a, b) => a - b);
  return { median: sorted[Math.floor(sorted.length / 2)], min: sorted[0], max: sorted.at(-1) };
};
const summary = Object.fromEntries(Object.entries(samples).map(([name, runs]) => [name, {
  initialTotalMs: stats(runs.map((run) => run.initialTotalMs)),
  firstImageMs: stats(runs.map((run) => run.firstImageMs)),
  firstBatchMs: stats(runs.map((run) => run.firstBatchMs)),
  warmBatchMs: stats(runs.flatMap((run) => run.warmBatchMs)),
  pngBytes: runs[0].pngBytes,
}]));
const report = { measuredAt: new Date().toISOString(), node: process.version, platform: platform(),
  arch: arch(), osRelease: release(),
  installed: { baseline: samples.baseline[0].installed, candidate: samples.candidate[0].installed },
  pages: inputs.length, freshProcessesPerRenderer: RUNS, warmBatchesPerProcess: WARM_BATCHES,
  inputSha256: createHash('sha256').update(JSON.stringify(inputs)).digest('hex'),
  note: 'Sequential rendering; alternating renderer order; filesystem caches are not flushed; PNG file writes excluded.',
  summary, samples };
writeFileSync(output, `${JSON.stringify(report, null, 2)}\n`);
console.log(JSON.stringify(summary, null, 2));
