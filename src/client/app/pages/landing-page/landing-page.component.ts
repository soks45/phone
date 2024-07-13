import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

import { TuiButtonModule, TuiLinkModule } from '@taiga-ui/core';

@Component({
    selector: 'app-landing-page',
    standalone: true,
    imports: [RouterLink, TuiButtonModule, TuiLinkModule],
    templateUrl: './landing-page.component.html',
    styleUrl: './landing-page.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LandingPageComponent {}
