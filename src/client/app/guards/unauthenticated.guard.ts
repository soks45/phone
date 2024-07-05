import { inject, Injectable } from '@angular/core';
import { CanActivate, GuardResult, MaybeAsync } from '@angular/router';

import { AuthService } from '@client/services/auth.service';

@Injectable({
    providedIn: 'root',
})
export class UnauthenticatedGuard implements CanActivate {
    private readonly authService: AuthService = inject(AuthService);

    canActivate(): MaybeAsync<GuardResult> {
        return !this.authService.isAuthed();
    }
}
