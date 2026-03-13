//#region Types
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

//#endregion Types
