# Vercel Storage Optimization Specification

## Goal

Reduce future ZYRON Vercel deployment storage and build-context size without changing site behavior, image quality, SEO copy, database schema, customer data, environment variables, domains, or retained deployments.

## Evidence baseline

- Linked project: `listenmachinery-gifs-projects/wangzhan` (`prj_GmiWz8KfDW6rirpx6cQhHGjMEIsg`).
- Production branch: `main`; production runtime: Node.js 24.x; framework: Next.js 15.5.
- Current local Build Output API artifact: 331,732,785 bytes.
- Static output: 329,307,478 bytes; `public/`: 324,096,743 bytes.
- One MP4: 84,953,366 bytes; PNG: 136,438,426 bytes; JPEG: 95,139,130 bytes; WebP: 7,531,940 bytes.
- 13 exact-content duplicate groups reclaim 8,388,319 bytes per deployment.
- Tracked developer-only `.codex`, `docs`, and `tests` content totals about 22 MB.
- Largest observed traced route is the media administration route at about 27.8 MB uncompressed locally; Vercel reports the merged production function at 12.72 MB, below the platform limit.
- 35 Ready deployments are visible: 14 production and 21 non-production. Current retention is 30 days for all states.
- No Vercel Blob stores exist. Production and Preview each use separate Amazon S3 and Neon resources.
- Vercel CLI billing usage is unavailable for the team, so exact Deployment Storage and Functions Storage usage must not be inferred.

## Safe changes

1. Add a repeatable, read-only deployment-size audit command.
2. Consolidate only byte-identical static assets and update repository references to one canonical file.
3. Add permanent redirects for every removed duplicate URL so existing CMS/database/external references continue to resolve.
4. Exclude developer-only sources and public source-note Markdown files from Vercel's build context.
5. Do not recompress images, transcode video, move media to paid storage, change product copy, or alter database/schema configuration.
6. Do not delete deployments or change retention policy automatically.

## Acceptance criteria

- No exact duplicate image groups remain in `public/`.
- Every removed URL permanently redirects to a byte-identical canonical asset.
- Production build and TypeScript checks pass.
- A local Vercel production build succeeds, exact public static payload is smaller by at least 8 MB, and total output is smaller than the prior recorded artifact.
- Preview deployment succeeds before any production release decision.

