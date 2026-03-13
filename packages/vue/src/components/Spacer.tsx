import { defineComponent } from 'vue'
import { renderSpacer } from '@wolfie/shared'
import { wNodeToVue } from '../wnode/wnode-to-vue'

/**
 * A flexible space that expands along the major axis of its containing layout.
 *
 * It's useful as a shortcut for filling all the available space between elements.
 */
export const Spacer = defineComponent({
	name: 'Spacer',
	setup() {
		return () => {
			return wNodeToVue(renderSpacer())
		}
	},
})
