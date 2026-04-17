import { useState } from 'react'
import { Box, Text, useInput, BigText } from '@wolf-tui/react'

//#region Fonts
const FONTS = [
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
] as const

type FontName = (typeof FONTS)[number]

// Key map: 1-9 → indices 0-8, 0 → 9, - → 10, = → 11
const KEY_TO_INDEX: Record<string, number> = {
	'1': 0,
	'2': 1,
	'3': 2,
	'4': 3,
	'5': 4,
	'6': 5,
	'7': 6,
	'8': 7,
	'9': 8,
	'0': 9,
	'-': 10,
	'=': 11,
}
//#endregion Fonts

//#region ColorMode
type ColorMode = 'default' | 'solo' | 'gradient'

const COLOR_MODE_ORDER: ColorMode[] = ['default', 'solo', 'gradient']

function nextColorMode(mode: ColorMode): ColorMode {
	const i = COLOR_MODE_ORDER.indexOf(mode)
	return COLOR_MODE_ORDER[(i + 1) % COLOR_MODE_ORDER.length]!
}

function colorLabel(mode: ColorMode): string {
	if (mode === 'solo') return "solo (['cyan'])"
	if (mode === 'gradient') return "gradient (['red','blue'])"
	return 'default'
}
//#endregion ColorMode

//#region Component
export function BigTextDemo({ onBack }: { onBack: () => void }) {
	const [font, setFont] = useState<FontName>('block')
	const [mode, setMode] = useState<ColorMode>('default')

	useInput((input, key) => {
		if (key.escape) {
			onBack()
			return
		}
		if (input === 'c' || input === 'C') {
			setMode((m) => nextColorMode(m))
			return
		}
		const idx = KEY_TO_INDEX[input]
		if (idx !== undefined) {
			setFont(FONTS[idx]!)
		}
	})

	return (
		<Box style={{ flexDirection: 'column', padding: 1, width: 80 }}>
			<Text style={{ fontWeight: 'bold', color: 'cyan' }}>
				BigText Demo — 1-9/0/-/= switch font, C cycle color mode, Esc back
			</Text>
			<Text style={{ dimColor: true }}>
				Font: {font} | Color mode: {colorLabel(mode)}
			</Text>
			<Box style={{ marginTop: 1 }}>
				{mode === 'gradient' ? (
					<BigText
						text="WOLF"
						font={font}
						align="center"
						space={false}
						gradient={['red', 'blue']}
					/>
				) : mode === 'solo' ? (
					<BigText
						text="WOLF"
						font={font}
						align="center"
						space={false}
						colors={['cyan']}
					/>
				) : (
					<BigText text="WOLF" font={font} align="center" space={false} />
				)}
			</Box>
		</Box>
	)
}
//#endregion Component
