import { vi } from 'vitest'

// Prevent CI detection from disabling rendering and resize handlers in tests.
// wolfie_react.tsx guards several code paths with `isInCi` — resize listener
// registration and stdout.write calls inside onRender — which causes test
// failures when running under GitHub Actions where `CI=true` is set.
vi.mock('is-in-ci', () => ({ default: false }))
