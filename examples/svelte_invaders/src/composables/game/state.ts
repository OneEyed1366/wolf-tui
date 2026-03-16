import {
	INITIAL_LIVES,
	INITIAL_ALIEN_MOVE_INTERVAL,
	POINTS_ALIEN_TOP,
	POINTS_ALIEN_MID,
	POINTS_ALIEN_BOT,
} from '../../constants'
import type { BoardConfig, Difficulty, State } from './types'

export function getAlienPoints(type: 0 | 1 | 2): number {
	switch (type) {
		case 0:
			return POINTS_ALIEN_TOP
		case 1:
			return POINTS_ALIEN_MID
		default:
			return POINTS_ALIEN_BOT
	}
}

export function getDifficultyModifier(difficulty: Difficulty): number {
	switch (difficulty) {
		case 'easy':
			return 1.5
		case 'hard':
			return 0.7
		default:
			return 1
	}
}

export function createInitialState(board: BoardConfig): State {
	return {
		screen: 'menu',
		board,
		player: { x: Math.floor(board.width / 2) },
		aliens: [],
		bullets: [],
		shields: [],
		kills: [],
		alienDir: 1,
		alienMoveTimer: 0,
		alienMoveInterval: INITIAL_ALIEN_MOVE_INTERVAL,
		score: 0,
		lives: INITIAL_LIVES,
		wave: 1,
		paused: false,
		settings: {
			sound: true,
			difficulty: 'normal',
			showFps: false,
			shieldBars: true,
			killLog: true,
			alienAnim: true,
			screenShake: false,
			particles: false,
			debug: false,
			highContrast: false,
			largeText: false,
		},
		lastShootTime: 0,
		waveTransition: false,
		gameStartTime: Date.now(),
		frame: 0,
	}
}
