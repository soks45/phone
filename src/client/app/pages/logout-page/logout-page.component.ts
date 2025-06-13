import { ChangeDetectionStrategy, Component, DestroyRef, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';

import { finalize } from 'rxjs';

import { AuthService } from '@client/services/auth.service';

@Component({
    selector: 'app-logout-page',
    standalone: true,
    imports: [],
    template: '',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LogoutPageComponent implements OnInit {
    constructor(
        private readonly authService: AuthService,
        private readonly router: Router,
        private readonly destroyRef: DestroyRef
    ) {}

    ngOnInit(): void {
        this.authService
            .logout()
            .pipe(
                finalize(() => {
                    this.router.navigate(['/auth']);
                }),
                takeUntilDestroyed(this.destroyRef)
            )
            .subscribe();
    }
}
