import 'zone.js'
import '@angular/compiler'
import { renderWolfie } from '@wolf-tui/angular'
import { AppComponent } from './app.component'

renderWolfie(AppComponent, { exitOnCtrlC: true })
