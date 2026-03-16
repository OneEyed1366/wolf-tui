import { ALIEN_TYPE_TOP, ALIEN_TYPE_MID } from '../../constants'
import type { Alien, BoardConfig, Shield, ShieldCell } from './types'

export function createAliens(board: BoardConfig): Alien[] {
	const aliens: Alien[] = []
	const offsetX = Math.floor(
		(board.width - board.alienCols * board.alienSpacingX) / 2
	)

	for (let row = 0; row < board.alienRows; row++) {
		for (let col = 0; col < board.alienCols; col++) {
			const type =
				row === 0 ? ALIEN_TYPE_TOP : row < 3 ? ALIEN_TYPE_MID : (2 as 0 | 1 | 2)
			aliens.push({
				id: `alien-${row}-${col}`,
				x: offsetX + col * board.alienSpacingX,
				y: board.alienStartY + row * board.alienSpacingY,
				type,
				alive: true,
			})
		}
	}

	return aliens
}

export function createShields(board: BoardConfig): Shield[] {
	const shields: Shield[] = []
	const shieldSpacing = Math.floor(board.width / (board.shieldCount + 1))
	const shieldY = board.height - board.shieldYOffset

	for (let i = 0; i < board.shieldCount; i++) {
		const shieldX = shieldSpacing * (i + 1) - Math.floor(board.shieldWidth / 2)
		const cells: ShieldCell[] = []

		for (let dy = 0; dy < board.shieldHeight; dy++) {
			for (let dx = 0; dx < board.shieldWidth; dx++) {
				if (dy === 0 && (dx === 0 || dx === board.shieldWidth - 1)) continue
				if (
					dy === board.shieldHeight - 1 &&
					dx > 0 &&
					dx < board.shieldWidth - 1
				)
					continue

				cells.push({
					x: shieldX + dx,
					y: shieldY + dy,
					health: 4,
				})
			}
		}

		shields.push({ x: shieldX, y: shieldY, cells })
	}

	return shields
}
