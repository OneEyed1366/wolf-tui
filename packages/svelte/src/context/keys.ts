// WHY: Symbols are unique — no collision risk between packages
export const STDIN_KEY = Symbol('wolfie:stdin')
export const STDOUT_KEY = Symbol('wolfie:stdout')
export const STDERR_KEY = Symbol('wolfie:stderr')
export const APP_KEY = Symbol('wolfie:app')
export const FOCUS_KEY = Symbol('wolfie:focus')
export const ACCESSIBILITY_KEY = Symbol('wolfie:accessibility')
export const THEME_KEY = Symbol('wolfie:theme')
// WHY: BACKGROUND_KEY flows down the tree so Text knows the parent
// box's background color for ANSI generation
export const BACKGROUND_KEY = Symbol('wolfie:background')
