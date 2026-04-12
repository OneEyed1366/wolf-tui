import {
	Component,
	ChangeDetectionStrategy,
	Output,
	EventEmitter,
} from '@angular/core'
import {
	BoxComponent,
	TextComponent,
	TreeViewComponent,
	injectInput,
} from '@wolf-tui/angular'
import type { ITreeNode } from '@wolf-tui/shared'

//#region Data
const treeData: ITreeNode[] = [
	{
		id: 'src',
		label: 'src',
		children: [
			{
				id: 'src/components',
				label: 'components',
				children: [
					{ id: 'src/components/Timer.tsx', label: 'Timer.tsx' },
					{ id: 'src/components/TreeView.tsx', label: 'TreeView.tsx' },
					{ id: 'src/components/Combobox.tsx', label: 'Combobox.tsx' },
				],
			},
			{
				id: 'src/utils',
				label: 'utils',
				children: [
					{ id: 'src/utils/fuzzy-match.ts', label: 'fuzzy-match.ts' },
					{ id: 'src/utils/time-format.ts', label: 'time-format.ts' },
				],
			},
			{ id: 'src/index.ts', label: 'index.ts' },
		],
	},
	{
		id: 'package.json',
		label: 'package.json',
	},
	{
		id: 'tsconfig.json',
		label: 'tsconfig.json',
	},
]

const defaultExpanded = new Set(['src'])
//#endregion Data

//#region TreeViewDemoComponent
@Component({
	selector: 'app-tree-view-demo',
	standalone: true,
	imports: [BoxComponent, TextComponent, TreeViewComponent],
	changeDetection: ChangeDetectionStrategy.OnPush,
	template: `
		<w-box [style]="{ flexDirection: 'column', padding: 1 }">
			<w-text [style]="{ fontWeight: 'bold', color: 'cyan' }"
				>TreeView Demo</w-text
			>
			<w-text [style]="{ dimColor: true }">
				Up/Down=navigate Right=expand Left=collapse Space=toggle Enter=select
				Esc=back
			</w-text>
			<w-box [style]="{ marginTop: 1 }">
				<w-tree-view
					[data]="treeData"
					selectionMode="multiple"
					[defaultExpanded]="defaultExpanded"
				/>
			</w-box>
		</w-box>
	`,
})
export class TreeViewDemoComponent {
	@Output() back = new EventEmitter<void>()

	readonly treeData = treeData
	readonly defaultExpanded = defaultExpanded

	constructor() {
		injectInput((_input, key) => {
			if (key.escape) this.back.emit()
		})
	}
}
//#endregion TreeViewDemoComponent
