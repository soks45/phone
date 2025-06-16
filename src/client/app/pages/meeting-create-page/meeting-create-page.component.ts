import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { TuiButtonModule, TuiErrorModule, TuiLinkModule, TuiModeModule } from '@taiga-ui/core';
import {
    TuiFieldErrorPipeModule,
    TuiInputDateModule,
    TuiInputModule,
    TuiInputPasswordModule,
    TuiTextareaModule,
} from '@taiga-ui/kit';

import { MeetingService } from '@client/services/meeting.service';
import { Meeting } from '@shared/models/meeting';

@Component({
    selector: 'app-meeting-create-page',
    standalone: true,
    imports: [
        ReactiveFormsModule,
        TuiButtonModule,
        AsyncPipe,
        TuiErrorModule,
        TuiFieldErrorPipeModule,
        TuiInputDateModule,
        TuiInputModule,
        TuiModeModule,
        TuiInputPasswordModule,
        TuiLinkModule,
        TuiTextareaModule,
    ],
    templateUrl: './meeting-create-page.component.html',
    styleUrl: './meeting-create-page.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MeetingCreatePageComponent {
    readonly meetingForm = inject(FormBuilder).nonNullable.group({
        name: ['', Validators.required],
        description: [null],
    });

    constructor(
        private readonly meetingService: MeetingService,
        private readonly destroyRef: DestroyRef,
        private readonly router: Router
    ) {}

    createMeeting(): void {
        if (this.meetingForm.invalid) {
            return;
        }

        const value = this.meetingForm.getRawValue();
        this.meetingService
            .create(value)
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe((meeting: Meeting) => this.router.navigateByUrl(`/meeting/${meeting.id}/join`));
    }
}
