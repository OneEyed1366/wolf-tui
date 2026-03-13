import type { OnInit, OnDestroy } from '@angular/core'
import {
	Component,
	signal,
	NgZone,
	ChangeDetectorRef,
	inject,
} from '@angular/core'
import {
	BoxComponent,
	TextComponent,
	AlertComponent,
	BadgeComponent,
	StatusMessageComponent,
	SpinnerComponent,
	ProgressBarComponent,
} from '@wolfie/angular'

//#region Constants
const PROGRESS_INTERVAL_MS = 100
const PROGRESS_MAX = 100
//#endregion Constants

//#region StatusDemoComponent
@Component({
	selector: 'app-status-demo',
	standalone: true,
	imports: [
		BoxComponent,
		TextComponent,
		AlertComponent,
		BadgeComponent,
		StatusMessageComponent,
		SpinnerComponent,
		ProgressBarComponent,
	],
	template: `
		<w-box class="flex-col gap-1 w-full">
			<!-- Alerts -->
			<w-text class="font-bold text-white">Alerts</w-text>
			<w-alert variant="success" message="Operation completed successfully!" />
			<w-alert
				variant="warning"
				message="Check your settings before proceeding"
			/>
			<w-alert variant="error" message="Something went wrong" />

			<!-- Badges -->
			<w-text class="font-bold text-white mt-1">Badges</w-text>
			<w-box class="flex-row gap-2">
				<w-badge color="green" label="Active" />
				<w-badge color="yellow" label="Pending" />
				<w-badge color="red" label="Failed" />
				<w-badge color="blue" label="Info" />
			</w-box>

			<!-- Status Messages -->
			<w-text class="font-bold text-white mt-1">Status Messages</w-text>
			<w-status-message variant="success" message="Build succeeded" />
			<w-status-message variant="error" message="Tests failed (3 errors)" />

			<w-status-message variant="warning" message="Dependencies outdated" />

			<w-status-message variant="info" message="Compiling..." />

			<!-- Spinner -->
			<w-text class="font-bold text-white mt-1">Spinner</w-text>
			<w-box class="flex-row gap-1">
				<w-spinner />
				<w-text class="text-gray">Loading resources...</w-text>
			</w-box>

			<!-- Progress Bar -->
			<w-text class="font-bold text-white mt-1">Progress Bar</w-text>
			<w-box class="flex-col w-[40]">
				<w-progress-bar [value]="progress()" />
				<w-text class="text-gray">{{ progress() }}% complete</w-text>
			</w-box>
		</w-box>
	`,
})
export class StatusDemoComponent implements OnInit, OnDestroy {
	//#region Injected Dependencies
	private ngZone = inject(NgZone)
	private cdr = inject(ChangeDetectorRef)
	//#endregion Injected Dependencies

	//#region Signals
	readonly progress = signal(0)
	//#endregion Signals

	//#region Intervals
	private progressInterval: ReturnType<typeof setInterval> | null = null
	//#endregion Intervals

	//#region Lifecycle
	ngOnInit(): void {
		// Progress animation - run outside Angular zone to avoid excessive change detection
		this.ngZone.runOutsideAngular(() => {
			this.progressInterval = setInterval(() => {
				this.ngZone.run(() => {
					const newVal =
						this.progress() >= PROGRESS_MAX ? 0 : this.progress() + 1
					this.progress.set(newVal)
					// Force immediate change detection for OnPush component
					this.cdr.detectChanges()
				})
			}, PROGRESS_INTERVAL_MS)
		})
	}

	ngOnDestroy(): void {
		if (this.progressInterval) {
			clearInterval(this.progressInterval)
			this.progressInterval = null
		}
	}
	//#endregion Lifecycle
}
//#endregion StatusDemoComponent
