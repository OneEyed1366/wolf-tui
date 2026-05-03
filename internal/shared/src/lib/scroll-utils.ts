export type IScrollMetrics = {
	contentHeight: number
	viewportHeight: number
}

export const getBottomOffset = ({
	contentHeight,
	viewportHeight,
}: IScrollMetrics): number => {
	return Math.max(0, contentHeight - viewportHeight)
}

export const clampScrollOffset = (
	offset: number,
	metrics: IScrollMetrics
): number => {
	const bottom = getBottomOffset(metrics)
	if (offset < 0) return 0
	if (offset > bottom) return bottom
	return offset
}
