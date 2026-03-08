import { type JSX, createMemo, splitProps } from 'solid-js'
import { useInput } from '../composables/use-input'
import {
	renderConfirmInput,
	defaultConfirmInputTheme,
	type ConfirmInputRenderTheme,
} from '@wolfie/shared'
import { useComponentTheme } from '../theme'
import { wNodeToSolid } from '../wnode/wnode-to-solid'

//#region Types
export interface IConfirmInputProps {
	isDisabled?: boolean
	defaultChoice?: 'confirm' | 'cancel'
	submitOnEnter?: boolean
	onConfirm: () => void
	onCancel: () => void
}
//#endregion Types

//#region Component
export function ConfirmInput(props: IConfirmInputProps): JSX.Element {
	const [local] = splitProps(props, [
		'isDisabled',
		'defaultChoice',
		'submitOnEnter',
		'onConfirm',
		'onCancel',
	])

	const isActive = createMemo(() => !local.isDisabled)

	useInput(
		(input, key) => {
			if (input.toLowerCase() === 'y') {
				local.onConfirm()
			}
			if (input.toLowerCase() === 'n') {
				local.onCancel()
			}
			if (key.return && (local.submitOnEnter ?? true)) {
				if ((local.defaultChoice ?? 'confirm') === 'confirm') {
					local.onConfirm()
				} else {
					local.onCancel()
				}
			}
		},
		{ isActive }
	)

	const theme = useComponentTheme<ConfirmInputRenderTheme>('ConfirmInput')
	const { styles } = theme ?? defaultConfirmInputTheme

	const wnode = createMemo(() =>
		renderConfirmInput(
			{
				defaultChoice: local.defaultChoice ?? 'confirm',
				isDisabled: local.isDisabled ?? false,
			},
			{ styles }
		)
	)

	return (() => wNodeToSolid(wnode())) as unknown as JSX.Element
}
//#endregion Component
