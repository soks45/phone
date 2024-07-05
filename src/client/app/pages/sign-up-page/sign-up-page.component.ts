import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

import { TuiButtonModule, TuiErrorModule, TuiLinkModule } from '@taiga-ui/core';
import { TuiFieldErrorPipeModule, TuiInputModule } from '@taiga-ui/kit';

import { AuthService } from '@client/services/auth.service';

interface SignUpFormControls {
    login: FormControl<string>;
    password: FormControl<string>;
}

@Component({
    selector: 'app-sign-up-page',
    standalone: true,
    imports: [
        AsyncPipe,
        ReactiveFormsModule,
        TuiButtonModule,
        TuiErrorModule,
        TuiFieldErrorPipeModule,
        TuiInputModule,
        TuiLinkModule,
    ],
    templateUrl: './sign-up-page.component.html',
    styleUrl: './sign-up-page.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SignUpPageComponent {
    public readonly form: FormGroup<SignUpFormControls> = new FormGroup<SignUpFormControls>({
        login: new FormControl<string>('', { nonNullable: true, validators: [Validators.required] }),
        password: new FormControl<string>('', { nonNullable: true, validators: [Validators.required] }),
    });

    constructor(
        private readonly authService: AuthService,
        private readonly destroyRef: DestroyRef
    ) {}

    public onSubmit(): void {
        this.form.markAllAsTouched();
        if (this.form.valid) {
            this.authService
                .registerLoginPassword({
                    login: this.form.getRawValue().login,
                    password_hash: this.form.getRawValue().password,
                })
                .pipe(takeUntilDestroyed(this.destroyRef))
                .subscribe();
        }
    }
}
