import { inject, Injectable } from '@angular/core';
import { CanActivate, GuardResult, MaybeAsync, Router } from '@angular/router';

import { AuthService } from '@client/services/auth.service';

@Injectable({
    providedIn: 'root',
})
export class AuthenticatedGuard implements CanActivate {
    private readonly authService: AuthService = inject(AuthService);
    private readonly router: Router = inject(Router);
    private readonly authUrl = this.router.parseUrl('/auth');

    canActivate(): MaybeAsync<GuardResult> {
        return this.authService.isAuthed() || this.authUrl;
    }
}
