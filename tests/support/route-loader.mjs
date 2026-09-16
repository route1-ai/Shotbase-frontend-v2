// Module-resolution hooks so Node can import the real Next.js route handler:
//  - map the '@/...' path alias (from tsconfig) to files on disk
//  - swap '@clerk/nextjs/server' for a lightweight test stub
// Everything else (zod, @supabase/supabase-js, lib/safe-url, lib/validation)
// resolves normally, so the code under test is the real code.
import { pathToFileURL, fileURLToPath } from 'node:url'
import path from 'node:path'
import fs from 'node:fs'

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..')
const clerkStub = pathToFileURL(path.join(repoRoot, 'tests', 'support', 'clerk-server.stub.mjs')).href

export async function resolve(specifier, context, next) {
  if (specifier === '@clerk/nextjs/server') {
    return { url: clerkStub, shortCircuit: true }
  }
  if (specifier.startsWith('@/')) {
    let target = path.join(repoRoot, specifier.slice(2))
    if (!path.extname(target)) {
      if (fs.existsSync(target + '.ts')) target += '.ts'
      else if (fs.existsSync(target + '.tsx')) target += '.tsx'
    }
    return { url: pathToFileURL(target).href, shortCircuit: true }
  }
  return next(specifier, context)
}
