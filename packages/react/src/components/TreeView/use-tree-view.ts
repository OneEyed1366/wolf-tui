import { useCallback } from 'react'
import { useInput } from '../../hooks/use-input'
import type { ITreeNode } from '@wolf-tui/shared'
import type { ITreeViewState } from './use-tree-view-state'

//#region Types
export type IUseTreeViewProps<T = Record<string, unknown>> = {
	/**
	 * When disabled, user input is ignored.
	 *
	 * @default false
	 */
	isDisabled?: boolean

	/**
	 * Async child loader for lazy-loading tree nodes.
	 */
	loadChildren?: (node: ITreeNode<T>) => Promise<ITreeNode<T>[]>

	/**
	 * Tree view state from useTreeViewState.
	 */
	state: ITreeViewState<T>
}
//#endregion Types

//#region Hook
export function useTreeView<T = Record<string, unknown>>({
	isDisabled = false,
	loadChildren,
	state,
}: IUseTreeViewProps<T>): void {
	const handleLoadAndExpand = useCallback(
		(nodeId: string, node: ITreeNode<T>) => {
			if (!loadChildren) return

			state.setLoading(nodeId, true)
			loadChildren(node)
				.then((children) => {
					state.setChildren(nodeId, children)
					state.setLoading(nodeId, false)
					state.expandNode(nodeId)
				})
				.catch(() => {
					state.setLoading(nodeId, false)
				})
		},
		[loadChildren, state]
	)

	useInput(
		(_input, key) => {
			if (key.downArrow) {
				state.focusNext()
			}

			if (key.upArrow) {
				state.focusPrevious()
			}

			if (key.rightArrow) {
				// If node is expandable but not yet expanded
				const focusedNode = state.flatNodes.find(
					(n) => n.node.id === state.focusedId
				)

				if (focusedNode) {
					const isExpanded = state.expandedIds.has(focusedNode.node.id)

					if (isExpanded) {
						// Already expanded -- move to first child
						state.focusFirstChild()
					} else if (
						focusedNode.hasChildren &&
						focusedNode.node.isParent === true &&
						(!focusedNode.node.children ||
							focusedNode.node.children.length === 0)
					) {
						// Lazy-load children
						handleLoadAndExpand(focusedNode.node.id, focusedNode.node)
					} else {
						state.expand()
					}
				}
			}

			if (key.leftArrow) {
				const focusedNode = state.flatNodes.find(
					(n) => n.node.id === state.focusedId
				)

				if (focusedNode && state.expandedIds.has(focusedNode.node.id)) {
					state.collapse()
				} else {
					state.focusParent()
				}
			}

			if (key.return) {
				state.select()
			}

			if (_input === ' ') {
				state.toggleExpand()
			}

			if (key.home) {
				state.focusFirst()
			}

			if (key.end) {
				state.focusLast()
			}
		},
		{ isActive: !isDisabled }
	)
}
//#endregion Hook
