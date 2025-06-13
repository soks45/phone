import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { TuiButtonModule } from '@taiga-ui/core';

import { HeaderComponent } from '@client/app/ui/header/header.component';

@Component({
    selector: 'app-main-page',
    standalone: true,
    imports: [RouterOutlet, HeaderComponent, TuiButtonModule],
    templateUrl: './main-page.component.html',
    styleUrl: './main-page.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MainPageComponent {}
