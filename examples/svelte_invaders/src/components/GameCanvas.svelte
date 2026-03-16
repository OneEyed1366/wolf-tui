<script lang="ts">
	import { Box, Text } from '@wolfie/svelte'
	import {
		ALIEN_SPRITE_FRAMES,
		PLAYER_SPRITE,
		BULLET_SPRITE_UP,
		BULLET_SPRITE_DOWN,
		SHIELD_DAMAGE_SPRITES,
	} from '../constants'
	import type { Alien, Bullet, Shield } from '../composables/useInvaders.svelte'

	//#region Props
	let { aliens, bullets, shields, playerX, frame, boardWidth, boardHeight }: {
		aliens: readonly Alien[]
		bullets: readonly Bullet[]
		shields: readonly Shield[]
		playerX: number
		frame: number
		boardWidth: number
		boardHeight: number
	} = $props()
	//#endregion Props

	//#region Types
	type Cell = {
		char: string
		color: string
	}

	type Segment = {
		text: string
		color: string
		key: string
	}

	type RenderedRow = {
		rowIndex: number
		segments: Segment[]
	}
	//#endregion Types

	//#region Color Constants
	const ALIEN_COLORS = ['text-red', 'text-yellow', 'text-green'] as const
	const PLAYER_COLOR = 'text-cyan'
	const BULLET_PLAYER_COLOR = 'text-white'
	const BULLET_ALIEN_COLOR = 'text-red'
	const SHIELD_COLOR = 'text-green'
	//#endregion Color Constants

	//#region Canvas Creation
	function createCanvas(width: number, height: number): Cell[][] {
		const canvas: Cell[][] = []
		for (let y = 0; y < height; y++) {
			const row: Cell[] = []
			for (let x = 0; x < width; x++) {
				row.push({ char: ' ', color: '' })
			}
			canvas.push(row)
		}
		return canvas
	}
	//#endregion Canvas Creation

	//#region Entity Rendering
	function renderAliens(
		canvas: Cell[][],
		aliensArr: readonly Alien[],
		frameNum: number,
		width: number,
		height: number
	): void {
		const spriteFrame = frameNum % 3
		for (const alien of aliensArr) {
			if (!alien.alive) continue
			if (alien.x < 0 || alien.x >= width || alien.y < 0 || alien.y >= height)
				continue

			const sprites = ALIEN_SPRITE_FRAMES[alien.type]
			const sprite = sprites?.[spriteFrame] ?? 'X'
			const row = canvas[alien.y]
			if (row) {
				const cell = row[alien.x]
				if (cell) {
					cell.char = sprite
					cell.color = ALIEN_COLORS[alien.type] ?? 'text-white'
				}
			}
		}
	}

	function renderPlayer(
		canvas: Cell[][],
		x: number,
		y: number,
		width: number,
		height: number
	): void {
		if (x < 0 || x >= width || y < 0 || y >= height) return
		const row = canvas[y]
		if (row) {
			const cell = row[x]
			if (cell) {
				cell.char = PLAYER_SPRITE
				cell.color = PLAYER_COLOR
			}
		}
	}

	function renderBullets(
		canvas: Cell[][],
		bulletsArr: readonly Bullet[],
		width: number,
		height: number
	): void {
		for (const bullet of bulletsArr) {
			if (bullet.x < 0 || bullet.x >= width || bullet.y < 0 || bullet.y >= height)
				continue
			const row = canvas[bullet.y]
			if (row) {
				const cell = row[bullet.x]
				if (cell) {
					cell.char = bullet.dy < 0 ? BULLET_SPRITE_UP : BULLET_SPRITE_DOWN
					cell.color = bullet.dy < 0 ? BULLET_PLAYER_COLOR : BULLET_ALIEN_COLOR
				}
			}
		}
	}

	function renderShields(
		canvas: Cell[][],
		shieldsArr: readonly Shield[],
		width: number,
		height: number
	): void {
		for (const shield of shieldsArr) {
			for (const cell of shield.cells) {
				if (cell.health <= 0) continue
				if (cell.x < 0 || cell.x >= width || cell.y < 0 || cell.y >= height)
					continue

				const sprite =
					SHIELD_DAMAGE_SPRITES[4 - cell.health] ?? SHIELD_DAMAGE_SPRITES[0]
				const row = canvas[cell.y]
				if (row) {
					const canvasCell = row[cell.x]
					if (canvasCell) {
						canvasCell.char = sprite ?? '#'
						canvasCell.color = SHIELD_COLOR
					}
				}
			}
		}
	}
	//#endregion Entity Rendering

	//#region Row Rendering
	function parseRow(row: Cell[], rowIndex: number): Segment[] {
		const segments: Segment[] = []
		let currentColor = ''
		let currentText = ''
		let segmentIndex = 0

		for (let x = 0; x < row.length; x++) {
			const cell = row[x]
			if (!cell) continue

			if (cell.color !== currentColor) {
				if (currentText) {
					segments.push({
						text: currentText,
						color: currentColor,
						key: `${rowIndex}-${segmentIndex++}`,
					})
				}
				currentColor = cell.color
				currentText = cell.char
			} else {
				currentText += cell.char
			}
		}

		if (currentText) {
			segments.push({
				text: currentText,
				color: currentColor,
				key: `${rowIndex}-${segmentIndex}`,
			})
		}

		return segments
	}
	//#endregion Row Rendering

	//#region Computed
	let renderedRows = $derived.by((): RenderedRow[] => {
		const canvas = createCanvas(boardWidth, boardHeight)

		renderShields(canvas, shields, boardWidth, boardHeight)
		renderAliens(canvas, aliens, frame, boardWidth, boardHeight)
		renderBullets(canvas, bullets, boardWidth, boardHeight)
		renderPlayer(canvas, playerX, boardHeight - 2, boardWidth, boardHeight)

		return canvas.map((row, y) => ({
			rowIndex: y,
			segments: parseRow(row, y),
		}))
	})
	//#endregion Computed
</script>

<Box
	style={{
		flexDirection: 'column',
		width: boardWidth,
		height: boardHeight,
	}}
>
	{#each renderedRows as row (row.rowIndex)}
		<Box>
			{#each row.segments as seg (seg.key)}
				<Text className={seg.color || undefined}>{seg.text}</Text>
			{/each}
		</Box>
	{/each}
</Box>
