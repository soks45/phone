import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

import { TuiButtonModule, TuiLinkModule } from '@taiga-ui/core';

import { HeaderComponent } from '@client/app/ui/header/header.component';

@Component({
    selector: 'app-call-page',
    standalone: true,
    imports: [HeaderComponent, RouterLink, TuiButtonModule, TuiLinkModule],
    templateUrl: './call-page.component.html',
    styleUrl: './call-page.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CallPageComponent {}
