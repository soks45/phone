import { inject, Injectable } from '@angular/core';
import { CanActivate, GuardResult, MaybeAsync, Router } from '@angular/router';

import { AuthService } from '@client/services/auth.service';

@Injectable({
    providedIn: 'root',
})
export class UnauthenticatedGuard implements CanActivate {
    private readonly authService: AuthService = inject(AuthService);
    private readonly router: Router = inject(Router);

    canActivate(): MaybeAsync<GuardResult> {
        if (this.authService.isAuthed()) {
            this.router.navigate(['/']);
        }

        return !this.authService.isAuthed();
    }
}
