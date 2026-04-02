import React, { useState } from 'react'
import { Box, Text, useInput, useApp } from '@wolf-tui/react'

export default function App() {
	const [count, setCount] = useState(0)
	const { exit } = useApp()

	useInput((input, key) => {
		if (key.upArrow) setCount((c) => c + 1)
		if (key.downArrow) setCount((c) => c - 1)
		if (input === 'q') exit()
	})

	const color = count > 0 ? 'green' : count < 0 ? 'red' : 'white'

	return (
		<Box
			style={{
				flexDirection: 'column',
				borderStyle: 'round',
				borderColor: 'cyan',
				paddingLeft: 2,
				paddingRight: 2,
				paddingTop: 1,
				paddingBottom: 1,
				gap: 1,
				width: 40,
			}}
		>
			<Box style={{ justifyContent: 'center' }}>
				<Text style={{ fontWeight: 'bold', color: 'cyan' }}>wolf-tui</Text>
			</Box>

			<Box
				style={{
					justifyContent: 'center',
					borderStyle: 'single',
					borderColor: color,
					paddingLeft: 2,
					paddingRight: 2,
				}}
			>
				<Text style={{ fontWeight: 'bold', color }}>{count}</Text>
			</Box>

			<Box style={{ justifyContent: 'space-around' }}>
				<Text style={{ color: 'green' }}>↑ up</Text>
				<Text style={{ color: 'red' }}>↓ down</Text>
				<Text style={{ color: 'gray' }}>q quit</Text>
			</Box>
		</Box>
	)
}
