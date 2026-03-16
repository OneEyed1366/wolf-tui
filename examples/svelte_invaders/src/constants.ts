//#region Grid Dimensions
export const BOARD_WIDTH = 100
export const BOARD_HEIGHT = 30
export const BOARD_PADDING = 2
//#endregion Grid Dimensions

//#region Alien Grid
export const ALIEN_ROWS = 5
export const ALIEN_COLS = 11
export const ALIEN_SPACING_X = 6
export const ALIEN_SPACING_Y = 2
export const ALIEN_START_Y = 3
//#endregion Alien Grid

//#region Sprites
export const ALIEN_SPRITES = ['M', 'W', 'X'] as const
export const ALIEN_SPRITE_FRAMES = [
	['V', 'A', '^'],
	['W', 'M', 'N'],
	['X', 'K', 'Y'],
] as const
export const PLAYER_SPRITE = '^'
export const BULLET_SPRITE_UP = '|'
export const BULLET_SPRITE_DOWN = ':'
export const SHIELD_SPRITE = '#'
export const SHIELD_DAMAGE_SPRITES = ['#', '=', '-', '.'] as const
//#endregion Sprites

//#region Game Speed (ms)
export const TICK_INTERVAL = 100 // 10 FPS - reduces terminal flicker
export const INITIAL_ALIEN_MOVE_INTERVAL = 800
export const MIN_ALIEN_MOVE_INTERVAL = 100
export const PLAYER_SHOOT_COOLDOWN = 200
export const ALIEN_SHOOT_INTERVAL = 1500
//#endregion Game Speed (ms)

//#region Movement
export const PLAYER_SPEED = 3
export const BULLET_SPEED = 1
export const ALIEN_STEP_X = 2
export const ALIEN_STEP_Y = 1
//#endregion Movement

//#region Scoring
export const POINTS_ALIEN_TOP = 30
export const POINTS_ALIEN_MID = 20
export const POINTS_ALIEN_BOT = 10
export const POINTS_PER_WAVE = 100
//#endregion Scoring

//#region Lives
export const INITIAL_LIVES = 3
//#endregion Lives

//#region Shields
export const SHIELD_COUNT = 5
export const SHIELD_WIDTH = 7
export const SHIELD_HEIGHT = 3
export const SHIELD_Y_OFFSET = 6
//#endregion Shields

//#region Alien Types
export const ALIEN_TYPE_TOP = 0
export const ALIEN_TYPE_MID = 1
export const ALIEN_TYPE_BOT = 2
//#endregion Alien Types
