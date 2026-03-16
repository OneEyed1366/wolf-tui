'use strict'

// Post-build: no-op placeholder.
// Previously patched embedded svelte internals, but svelte is now
// externalized as a peer dependency. Consumers must use
// --conditions=browser to resolve svelte to the client build.

console.log('[postbuild] Svelte externalized — no patches needed')
