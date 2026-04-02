import { describe, it, expect, afterEach } from 'vitest'
import { detectPackageManager, checkNodeVersion } from '../src/utils'

describe('detectPackageManager', () => {
	const originalEnv = { ...process.env }

	afterEach(() => {
		process.env = { ...originalEnv }
	})

	it('detects pnpm from user agent', () => {
		process.env['npm_config_user_agent'] = 'pnpm/9.0.0 node/v20.0.0'
		expect(detectPackageManager()).toBe('pnpm')
	})

	it('detects yarn from user agent', () => {
		process.env['npm_config_user_agent'] = 'yarn/4.0.0 node/v20.0.0'
		expect(detectPackageManager()).toBe('yarn')
	})

	it('detects bun from user agent', () => {
		process.env['npm_config_user_agent'] = 'bun/1.0.0 node/v20.0.0'
		expect(detectPackageManager()).toBe('bun')
	})

	it('defaults to npm when no user agent', () => {
		delete process.env['npm_config_user_agent']
		expect(detectPackageManager()).toBe('npm')
	})
})

describe('checkNodeVersion', () => {
	it('returns null for Node >= 20', () => {
		expect(checkNodeVersion('v20.0.0')).toBeNull()
		expect(checkNodeVersion('v22.1.0')).toBeNull()
	})

	it('returns error message for Node < 20', () => {
		const msg = checkNodeVersion('v18.19.0')
		expect(msg).toContain('Node.js >= 20')
	})
})
