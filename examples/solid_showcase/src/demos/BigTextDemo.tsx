import { createSignal, Match, Switch } from 'solid-js'
import { Box, Text, useInput, BigText, type BigTextFont } from '@wolf-tui/solid'

//#region Data
const FONTS: readonly BigTextFont[] = [
	'block',
	'slick',
	'tiny',
	'grid',
	'pallet',
	'shade',
	'simple',
	'simpleBlock',
	'3d',
	'simple3d',
	'chrome',
	'huge',
]

// Digit keys mapped 1..9, then 0, -, = for the remaining 3 fonts (12 total).
const FONT_KEYS = [
	'1',
	'2',
	'3',
	'4',
	'5',
	'6',
	'7',
	'8',
	'9',
	'0',
	'-',
	'=',
] as const

type ColorMode = 'solo' | 'gradient' | 'default'
const COLOR_MODES: readonly ColorMode[] = ['solo', 'gradient', 'default']
//#endregion Data

//#region Component
export function BigTextDemo(props: { onBack: () => void }) {
	const [fontIndex, setFontIndex] = createSignal(0)
	const [colorModeIndex, setColorModeIndex] = createSignal(0)

	const currentFont = () => FONTS[fontIndex()]!
	const currentColorMode = () => COLOR_MODES[colorModeIndex()]!

	useInput((input, key) => {
		if (key.escape) {
			props.onBack()
			return
		}
		if (input === 'c' || input === 'C') {
			setColorModeIndex((i) => (i + 1) % COLOR_MODES.length)
			return
		}
		const idx = FONT_KEYS.indexOf(input as (typeof FONT_KEYS)[number])
		if (idx !== -1 && idx < FONTS.length) {
			setFontIndex(idx)
		}
	})

	return (
		<Box style={{ flexDirection: 'column', padding: 1 }}>
			<Text style={{ fontWeight: 'bold', color: 'cyan' }}>BigText Demo</Text>
			<Text style={{ dimColor: true }}>
				BigText Demo — 1-9/0/-/= switch font, C cycle color mode, Esc back
			</Text>
			<Text style={{ marginTop: 1 }}>
				Font: <Text style={{ color: 'yellow' }}>{currentFont()}</Text>
			</Text>
			<Text>
				Color mode:{' '}
				<Text style={{ color: 'magenta' }}>{currentColorMode()}</Text>
			</Text>
			<Box style={{ marginTop: 1 }}>
				<Switch>
					<Match when={currentColorMode() === 'solo'}>
						<BigText
							text="WOLF"
							font={currentFont()}
							colors={['cyan']}
							space={false}
							align="center"
						/>
					</Match>
					<Match when={currentColorMode() === 'gradient'}>
						<BigText
							text="WOLF"
							font={currentFont()}
							gradient={['red', 'blue']}
							space={false}
							align="center"
						/>
					</Match>
					<Match when={currentColorMode() === 'default'}>
						<BigText
							text="WOLF"
							font={currentFont()}
							space={false}
							align="center"
						/>
					</Match>
				</Switch>
			</Box>
		</Box>
	)
}
//#endregion Component
