# Small Electric Shear Section Removal Plan

1. Extend the shared content type with a typed optional hidden-section list.
2. Add a failing regression contract for the exact fourteen requested modules.
3. Guard the corresponding shared page sections with the page-level visibility helper.
4. Configure the small electric shear page to hide those modules only.
5. Run focused checks, lint, build, and local browser verification.
6. Commit, fast-forward merge to `main`, push, and verify the production page.
