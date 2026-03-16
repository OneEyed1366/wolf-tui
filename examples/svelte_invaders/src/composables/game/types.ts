//#region Board Config
export type BoardConfig = {
	width: number
	height: number
	padding: number
	alienRows: number
	alienCols: number
	alienSpacingX: number
	alienSpacingY: number
	alienStartY: number
	shieldCount: number
	shieldWidth: number
	shieldHeight: number
	shieldYOffset: number
	playerSpeed: number
	alienStepX: number
	alienStepY: number
}
//#endregion Board Config

//#region Game Entities
export type Alien = {
	id: string
	x: number
	y: number
	type: 0 | 1 | 2
	alive: boolean
}

export type Bullet = {
	id: string
	x: number
	y: number
	dy: -1 | 1
}

export type ShieldCell = {
	x: number
	y: number
	health: number
}

export type Shield = {
	x: number
	y: number
	cells: ShieldCell[]
}

export type Kill = {
	id: string
	alien: Alien
	timestamp: number
	points: number
}
//#endregion Game Entities

//#region Game State
export type Screen =
	| 'menu'
	| 'game'
	| 'gameover'
	| 'highscores'
	| 'settings'
	| 'help'

export type Difficulty = 'easy' | 'normal' | 'hard'

export type Settings = {
	sound: boolean
	difficulty: Difficulty
	showFps: boolean
	shieldBars: boolean
	killLog: boolean
	alienAnim: boolean
	screenShake: boolean
	particles: boolean
	debug: boolean
	highContrast: boolean
	largeText: boolean
}

export type State = {
	screen: Screen
	board: BoardConfig
	player: { x: number }
	aliens: Alien[]
	bullets: Bullet[]
	shields: Shield[]
	kills: Kill[]
	alienDir: 1 | -1
	alienMoveTimer: number
	alienMoveInterval: number
	score: number
	lives: number
	wave: number
	paused: boolean
	settings: Settings
	lastShootTime: number
	waveTransition: boolean
	gameStartTime: number
	frame: number
}
//#endregion Game State
