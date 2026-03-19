<script>
	import { Box, Text } from '@wolfie/svelte'
	import buttonStyles from '../styles/Button.module.css'
	import cardStyles from '../styles/Card.module.css'
	import ScssSection from './ScssSection.svelte'
	import LessSection from './LessSection.svelte'
	import StylusSection from './StylusSection.svelte'
</script>

<Box className="flex-col w-full">
	<!-- Tailwind Section -->
	<Box className="border-double border-yellow p-1 mb-1 flex-col w-full">
		<Text className="text-[cyan]">
			Tailwind: border-double + arbitrary text-[cyan]
		</Text>
	</Box>

	<!-- Preprocessor Sections (each in own component — Svelte allows 1 style block) -->
	<ScssSection />
	<LessSection />
	<StylusSection />

	<!-- Scoped Section -->
	<Box className="scoped-box flex-col mb-1 w-full">
		<Text className="scoped-text">Scoped Flavor</Text>
		<Text className="text-muted">Scoped styles (Svelte default)</Text>
	</Box>

	<!-- CSS Modules Section -->
	<Box className="{cardStyles.card} flex-col mb-1 w-full">
		<Text className={cardStyles.cardTitle}>CSS Modules Flavor</Text>
		<Text className="text-muted">Scoped styles from Card.module.css</Text>
	</Box>

	<!-- Buttons Mix -->
	<Box className="flex-row gap-2 w-full">
		<Box className={buttonStyles.button}>
			<Text className={buttonStyles.text}>Module Btn</Text>
		</Box>
		<Box className="bg-blue-600 p-x-2">
			<Text className="text-white">Tailwind Btn</Text>
		</Box>
	</Box>
</Box>

<style>
.scoped-box {
	border-style: single;
	border-color: blue;
	padding: 1;
}

.scoped-text {
	color: blue;
	font-weight: bold;
}

.text-muted {
	color: gray;
}
</style>
