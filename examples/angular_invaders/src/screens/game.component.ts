import {
	Component,
	ChangeDetectionStrategy,
	inject,
	signal,
	effect,
} from '@angular/core'
import {
	BoxComponent,
	TextComponent,
	AlertComponent,
	SpinnerComponent,
	StdinService,
	injectInput,
} from '@wolfie/angular'
import { InvadersService } from '../services/invaders.service'
import { GameCanvasComponent } from '../components/game-canvas.component'
import { HudComponent } from '../components/hud.component'
import { KillLogComponent } from '../components/kill-log.component'
import { ControlsComponent } from '../components/controls.component'
import { BRAND } from '../theme'

//#region GameComponent
@Component({
	selector: 'app-game',
	standalone: true,
	imports: [
		BoxComponent,
		TextComponent,
		AlertComponent,
		SpinnerComponent,
		GameCanvasComponent,
		HudComponent,
		KillLogComponent,
		ControlsComponent,
	],
	changeDetection: ChangeDetectionStrategy.OnPush,
	template: `
		@if (invaders.waveTransition()) {
			<w-box
				[style]="{
					width: '100vw',
					height: '100vh',
					flexDirection: 'column',
					alignItems: 'center',
					justifyContent: 'center',
					backgroundColor: brand.bgAccent,
				}"
			>
				<w-alert
					variant="success"
					title="Wave Complete!"
					message="Excellent work, Commander! Preparing next wave…"
				/>

				<w-box [style]="{ marginTop: 2 }">
					<w-spinner type="dots" />
					<w-text className="text-cyan ml-2"
						>{{ ' ' }}Loading Wave {{ invaders.state().wave + 1 }}…</w-text
					>
				</w-box>

				<w-box [style]="{ marginTop: 2 }">
					<w-text className="text-yellow font-bold"
						>Score: {{ invaders.state().score }}</w-text
					>
				</w-box>
			</w-box>
		} @else {
			<w-box
				[style]="{
					width: '100vw',
					height: '100vh',
					flexDirection: 'column',
					backgroundColor: brand.bgDark,
				}"
			>
				<w-box
					[style]="{
						flexShrink: 0,
						paddingLeft: 1,
						paddingRight: 1,
						backgroundColor: brand.bgDark,
					}"
				>
					<app-hud />
				</w-box>

				<w-box
					[style]="{
						flexGrow: 1,
						flexDirection: 'column',
						minHeight: 0,
						overflow: 'hidden',
					}"
				>
					<app-game-canvas />
				</w-box>

				@if (invaders.paused()) {
					<w-box
						[style]="{
							position: 'absolute',
							width: '100vw',
							justifyContent: 'center',
							marginTop: pauseOverlayTop(),
						}"
					>
						<w-text className="text-yellow font-bold bg-red"
							>{{ '  ' }}══ PAUSED ══ (P to resume){{ '  ' }}</w-text
						>
					</w-box>
				}

				<w-box
					[style]="{
						flexShrink: 0,
						flexDirection: 'row',
						justifyContent: 'space-between',
						paddingLeft: 2,
						paddingRight: 2,
						backgroundColor: brand.bgAccent,
						paddingTop: 1,
					}"
				>
					<app-kill-log />
					<app-controls />
				</w-box>

				@if (!isRawModeSupported) {
					<w-alert
						variant="warning"
						title="Warning"
						message="Raw mode not supported — input may be limited"
					/>
				}
			</w-box>
		}
	`,
})
export class GameComponent {
	readonly brand = BRAND
	readonly invaders = inject(InvadersService)
	readonly isRawModeSupported: boolean

	//#region FPS Tracking
	readonly fps = signal(0)
	private lastFrameTime = Date.now()
	private frameCount = 0
	//#endregion FPS Tracking

	//#region Computed
	readonly pauseOverlayTop = () =>
		Math.floor(this.invaders.state().board.height / 2)
	//#endregion Computed

	constructor() {
		const stdinService = inject(StdinService)
		this.isRawModeSupported = stdinService.isRawModeSupported

		// FPS calculation via effect on frame changes
		effect(() => {
			// eslint-disable-next-line @typescript-eslint/no-unused-vars
			const _frame = this.invaders.state().frame
			this.frameCount++
			const now = Date.now()
			const elapsed = now - this.lastFrameTime

			if (elapsed >= 1000) {
				this.fps.set(Math.round((this.frameCount * 1000) / elapsed))
				this.frameCount = 0
				this.lastFrameTime = now
			}
		})

		// Input handling
		injectInput(
			(input, key) => {
				if (input === 'p') {
					this.invaders.pause()
					return
				}
				if (input === 'q') {
					this.invaders.navigate('menu')
					return
				}
				if (this.invaders.paused()) return

				if (key.leftArrow) {
					this.invaders.movePlayer(-1)
				} else if (key.rightArrow) {
					this.invaders.movePlayer(1)
				} else if (input === ' ') {
					this.invaders.shoot()
				}
			},
			{ isActive: () => this.invaders.screen() === 'game' }
		)
	}
}
//#endregion GameComponent
