import {
	defineComponent,
	computed,
	type PropType,
	type DefineComponent,
} from 'vue'
import { useInput } from '../composables/use-input'
import { useComponentTheme } from '../theme'
import {
	renderConfirmInput,
	defaultConfirmInputTheme,
	type ConfirmInputRenderTheme,
} from '@wolfie/shared'
import { wNodeToVue } from '../wnode/wnode-to-vue'

//#region Types
export interface ConfirmInputProps {
	/**
	 * When disabled, user input is ignored.
	 *
	 * @default false
	 */
	isDisabled?: boolean

	/**
	 * Default choice.
	 *
	 * @default "confirm"
	 */
	defaultChoice?: 'confirm' | 'cancel'

	/**
	 * Confirm or cancel when user presses enter, depending on the `defaultChoice` value.
	 * Can be useful to disable when an explicit confirmation is required, such as pressing "Y" key.
	 *
	 * @default true
	 */
	submitOnEnter?: boolean

	/**
	 * Callback to trigger on confirmation.
	 */
	onConfirm: () => void

	/**
	 * Callback to trigger on cancellation.
	 */
	onCancel: () => void
}
//#endregion Types

//#region Component
export const ConfirmInput: DefineComponent<ConfirmInputProps> = defineComponent(
	{
		name: 'ConfirmInput',
		props: {
			isDisabled: {
				type: Boolean,
				default: false,
			},
			defaultChoice: {
				type: String as PropType<'confirm' | 'cancel'>,
				default: 'confirm',
			},
			submitOnEnter: {
				type: Boolean,
				default: true,
			},
			onConfirm: {
				type: Function as PropType<() => void>,
				required: true,
			},
			onCancel: {
				type: Function as PropType<() => void>,
				required: true,
			},
		},
		setup(props) {
			const isActive = computed(() => !props.isDisabled)

			useInput(
				(input: string, key: { return?: boolean }) => {
					if (input.toLowerCase() === 'y') {
						props.onConfirm()
					}

					if (input.toLowerCase() === 'n') {
						props.onCancel()
					}

					if (key.return && props.submitOnEnter) {
						if (props.defaultChoice === 'confirm') {
							props.onConfirm()
						} else {
							props.onCancel()
						}
					}
				},
				{ isActive }
			)

			const theme = useComponentTheme<ConfirmInputRenderTheme>('ConfirmInput')
			const { styles } = theme ?? defaultConfirmInputTheme

			return () => {
				return wNodeToVue(
					renderConfirmInput(
						{
							defaultChoice: props.defaultChoice ?? 'confirm',
							isDisabled: props.isDisabled ?? false,
						},
						{ styles }
					)
				)
			}
		},
	}
)
//#endregion Component

export {
	defaultConfirmInputTheme as confirmInputTheme,
	type ConfirmInputRenderTheme as ConfirmInputTheme,
}
export type { ConfirmInputProps as Props, ConfirmInputProps as IProps }
