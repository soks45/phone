import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
    selector: 'app-call-page',
    standalone: true,
    imports: [],
    templateUrl: './call-page.component.html',
    styleUrl: './call-page.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CallPageComponent {}
