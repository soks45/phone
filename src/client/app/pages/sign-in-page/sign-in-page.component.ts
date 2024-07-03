import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
    selector: 'app-sign-in-page',
    standalone: true,
    imports: [],
    templateUrl: './sign-in-page.component.html',
    styleUrl: './sign-in-page.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SignInPageComponent {}
