import {
	renderConfirmInput,
	defaultConfirmInputTheme,
	type ConfirmInputRenderTheme,
} from '@wolfie/shared'
import { useInput } from '../../hooks/use-input'
import { useComponentTheme } from '../../theme/theme'
import { wNodeToReact } from '../../wnode/wnode-to-react'

//#region Component
export type IConfirmInputProps = {
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

export function ConfirmInput({
	isDisabled = false,
	defaultChoice = 'confirm',
	submitOnEnter = true,
	onConfirm,
	onCancel,
}: IConfirmInputProps) {
	useInput(
		(input: string, key: { return?: boolean }) => {
			if (input.toLowerCase() === 'y') {
				onConfirm()
			}

			if (input.toLowerCase() === 'n') {
				onCancel()
			}

			if (key.return && submitOnEnter) {
				if (defaultChoice === 'confirm') {
					onConfirm()
				} else {
					onCancel()
				}
			}
		},
		{ isActive: !isDisabled }
	)

	const theme = useComponentTheme<ConfirmInputRenderTheme>('ConfirmInput')
	const { styles } = theme ?? defaultConfirmInputTheme

	return wNodeToReact(
		renderConfirmInput({ defaultChoice, isDisabled }, { styles })
	)
}
//#endregion Component
