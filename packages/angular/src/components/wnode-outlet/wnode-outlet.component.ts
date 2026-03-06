import type { OnChanges, OnDestroy, SimpleChanges } from '@angular/core'
import {
	Component,
	Input,
	Renderer2,
	ElementRef,
	ChangeDetectionStrategy,
	inject,
} from '@angular/core'
import type { DOMElement } from '@wolfie/core'
import type { WNode } from '@wolfie/shared'

//#region WNodeOutletComponent
/**
 * Renders a WNode descriptor tree into the wolfie DOM using Angular's Renderer2.
 *
 * Each time [node] changes, the previous subtree is removed and a fresh one is
 * built. Styles are set directly on the DOMElement before appendChild so that
 * initLayoutTreeRecursively picks them up in a single pass (avoids a second
 * applyLayoutStyle call after attachment).
 *
 * Usage:
 *   <w-wnode-outlet [node]="wnode()" />
 *
 * The host element (w-wnode-outlet) becomes a transparent wolfie-box container
 * (internal_isHostElement = true) because the Angular renderer maps any unknown
 * selector to wolfie-box + isHostElement. Its children are the actual layout nodes.
 */
@Component({
	selector: 'w-wnode-outlet',
	standalone: true,
	template: '',
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WNodeOutletComponent implements OnChanges, OnDestroy {
	//#region Inputs
	@Input() node!: WNode
	//#endregion Inputs

	//#region Private State
	// WHY: use inject() instead of constructor params — wolfie Angular uses JIT mode
	// where constructor parameter DI requires @Inject() decorators for non-trivial types.
	private renderer = inject(Renderer2)
	private hostEl: DOMElement = inject(ElementRef).nativeElement as DOMElement
	private renderedChildren: DOMElement[] = []
	//#endregion Private State

	//#region Lifecycle
	ngOnChanges(changes: SimpleChanges): void {
		if (changes['node']) {
			this.clear()
			this.renderNode(this.hostEl, this.node)
		}
	}

	ngOnDestroy(): void {
		this.clear()
	}
	//#endregion Lifecycle

	//#region Private Methods
	private clear(): void {
		for (const child of this.renderedChildren) {
			this.renderer.removeChild(this.hostEl, child)
		}
		this.renderedChildren = []
	}

	private renderNode(parent: DOMElement, node: WNode): void {
		const el = this.renderer.createElement(node.type) as DOMElement

		// WHY: Set style BEFORE appendChild so initLayoutTreeRecursively applies
		// it when creating the layout node — avoids a second applyLayoutStyle call.
		if (node.props.style && Object.keys(node.props.style).length > 0) {
			Object.assign(el.style, node.props.style)
		}

		this.renderer.appendChild(parent, el)

		// Track only top-level children for cleanup (removeChild is recursive in wolfie)
		if (parent === this.hostEl) {
			this.renderedChildren.push(el)
		}

		for (const child of node.children) {
			if (typeof child === 'string') {
				const textNode = this.renderer.createText(child)
				this.renderer.appendChild(el, textNode)
			} else {
				this.renderNode(el, child)
			}
		}
	}
	//#endregion Private Methods
}
//#endregion WNodeOutletComponent
