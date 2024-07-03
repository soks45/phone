import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { TuiRootModule, TuiDialogModule, TuiAlertModule, TuiModeModule } from '@taiga-ui/core';

@Component({
    selector: 'app-root',
    standalone: true,
    imports: [RouterOutlet, TuiRootModule, TuiDialogModule, TuiAlertModule, TuiModeModule],
    templateUrl: './app.component.html',
    styleUrl: './app.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {}
