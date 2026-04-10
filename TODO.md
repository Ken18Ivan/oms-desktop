# OMS Code Fixes TODO

## Status: [IN PROGRESS] 4/6

- [x] 4. Run `npx tsc --noEmit` to verify main/renderer compilation (diagnosed errors)

- [x] 1. Create/Update tsconfig for main process (node16 resolution)
- [x] 2. Fix main/main.ts ESM imports (node:fs, node:path)
- [x] 3. Fix main/helpers/create-window.ts electron-store v11 API
- [ ] 4. Run `npx tsc --noEmit` to verify main/renderer compilation
- [ ] 5. Check renderer/pages/index.tsx for any remaining issues if needed
- [ ] 6. Test build: `npm run build` and attempt_completion

Updated after each step.
