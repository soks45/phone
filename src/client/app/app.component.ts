import { TuiRootModule, TuiDialogModule, TuiAlertModule } from '@taiga-ui/core';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
    selector: 'app-root',
    standalone: true,
    imports: [RouterOutlet, TuiRootModule, TuiDialogModule, TuiAlertModule],
    templateUrl: './app.component.html',
    styleUrl: './app.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {
    title = 'phone';
}
