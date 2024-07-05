import { ChangeDetectionStrategy, Component } from '@angular/core';

import { HeaderComponent } from '@client/app/ui/header/header.component';

@Component({
    selector: 'app-call-page',
    standalone: true,
    imports: [HeaderComponent],
    templateUrl: './call-page.component.html',
    styleUrl: './call-page.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CallPageComponent {}
