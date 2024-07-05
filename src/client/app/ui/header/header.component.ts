import { NgOptimizedImage } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

import { AuthService } from '@client/services/auth.service';

@Component({
    selector: 'app-header',
    standalone: true,
    imports: [RouterLink, NgOptimizedImage],
    templateUrl: './header.component.html',
    styleUrl: './header.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeaderComponent {
    readonly isAuthenticated = inject(AuthService).isAuthed;
    readonly user = inject(AuthService).user;
}
