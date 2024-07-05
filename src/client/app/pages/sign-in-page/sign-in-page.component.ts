import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { TuiButtonModule, TuiErrorModule, TuiHintModule, TuiLinkModule } from '@taiga-ui/core';
import { TuiFieldErrorPipeModule, TuiInputModule, TuiInputPasswordModule } from '@taiga-ui/kit';

import { AuthService } from '@client/services/auth.service';

interface SignInFormControls {
    login: FormControl<string>;
    password: FormControl<string>;
}

@Component({
    selector: 'app-sign-in-page',
    standalone: true,
    imports: [
        ReactiveFormsModule,
        TuiInputModule,
        TuiHintModule,
        TuiErrorModule,
        TuiFieldErrorPipeModule,
        AsyncPipe,
        TuiButtonModule,
        TuiLinkModule,
        RouterLink,
        TuiInputPasswordModule,
    ],
    templateUrl: './sign-in-page.component.html',
    styleUrl: './sign-in-page.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SignInPageComponent {
    public readonly form: FormGroup<SignInFormControls> = new FormGroup<SignInFormControls>({
        login: new FormControl<string>('', { nonNullable: true, validators: [Validators.required] }),
        password: new FormControl<string>('', { nonNullable: true, validators: [Validators.required] }),
    });

    constructor(
        private readonly authService: AuthService,
        private readonly destroyRef: DestroyRef,
        private readonly router: Router
    ) {}

    public onSubmit(): void {
        this.form.markAllAsTouched();
        if (this.form.valid) {
            this.authService
                .authenticateLoginPassword({
                    login: this.form.getRawValue().login,
                    password_hash: this.form.getRawValue().password,
                })
                .pipe(takeUntilDestroyed(this.destroyRef))
                .subscribe(() => this.router.navigate(['/call']));
        }
    }
}
