/**
 * Ignored Build Step de Vercel.
 * Exit 0 → omitir build. Exit 1 → continuar build.
 *
 * Solo despliega pushes a master (production) y develop (preview).
 */
const branch = process.env.VERCEL_GIT_COMMIT_REF ?? '';
const deployBranches = new Set(['master', 'develop']);

if (deployBranches.has(branch)) {
  console.log(`[vercel-should-build] branch=${branch} → build`);
  process.exit(1);
}

console.log(`[vercel-should-build] branch=${branch} → skip`);
process.exit(0);
