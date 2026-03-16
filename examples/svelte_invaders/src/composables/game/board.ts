import type { BoardConfig } from './types'

export function createBoardConfig(
	termWidth: number,
	termHeight: number
): BoardConfig {
	// Use full terminal width, reserve header (1) + footer (4)
	const boardWidth = Math.max(60, termWidth)
	const boardHeight = Math.max(16, termHeight - 5)

	// Scale alien grid based on board size
	const alienCols = Math.max(9, Math.min(18, Math.floor(boardWidth / 7)))
	const alienRows = Math.max(4, Math.min(7, Math.floor(boardHeight / 5)))
	const alienSpacingX = Math.floor((boardWidth - 10) / alienCols)
	const alienSpacingY = 2
	const alienStartY = 2

	// Calculate where aliens end and position shields proportionally
	const alienEndY = alienStartY + alienRows * alienSpacingY
	const playerY = boardHeight - 2
	const middleSpace = playerY - alienEndY

	// Shields positioned at 70% of the way between aliens and player
	const shieldY = alienEndY + Math.floor(middleSpace * 0.7)
	const shieldYOffset = boardHeight - shieldY

	return {
		width: boardWidth,
		height: boardHeight,
		padding: 2,
		alienRows,
		alienCols,
		alienSpacingX,
		alienSpacingY,
		alienStartY,
		shieldCount: Math.max(4, Math.min(8, Math.floor(boardWidth / 18))),
		shieldWidth: 7,
		shieldHeight: 3,
		shieldYOffset,
		playerSpeed: Math.max(3, Math.floor(boardWidth / 25)),
		alienStepX: 2,
		alienStepY: 1,
	}
}
