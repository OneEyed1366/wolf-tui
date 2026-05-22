export interface ICleanupHandle {
	unmount: () => void | Promise<void>
	cleanup?: () => void | Promise<void>
}

const instances = new Set<ICleanupHandle>()

/**
 * Registers a render instance for global cleanup. Adapters call this from
 * their `/testing` `render()` wrappers so users can `cleanup()` everything
 * created during a test in a single `afterEach`.
 */
export function registerInstance(handle: ICleanupHandle): void {
	instances.add(handle)
}

/**
 * Unregisters a render instance. Called when an instance is already
 * unmounted manually so it isn't unmounted again by `cleanup()`.
 */
export function unregisterInstance(handle: ICleanupHandle): void {
	instances.delete(handle)
}

/**
 * Unmounts and cleans up every render instance created via an adapter's
 * `/testing` `render()`. Safe to call when nothing is registered.
 *
 * ```ts
 * import { afterEach } from 'vitest'
 * import { cleanup } from '@wolf-tui/testing-library'
 *
 * afterEach(cleanup)
 * ```
 */
export async function cleanup(): Promise<void> {
	const handles = Array.from(instances)
	instances.clear()
	for (const handle of handles) {
		try {
			await handle.unmount()
		} catch {
			// swallow — best-effort teardown
		}
		try {
			await handle.cleanup?.()
		} catch {
			// swallow
		}
	}
}
