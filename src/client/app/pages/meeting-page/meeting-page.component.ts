import { JsonPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';

import { TuiButtonModule } from '@taiga-ui/core';

import { Meeting } from '@shared/models/meeting';

@Component({
    selector: 'app-meeting-page',
    standalone: true,
    imports: [TuiButtonModule, JsonPipe],
    templateUrl: './meeting-page.component.html',
    styleUrl: './meeting-page.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MeetingPageComponent {
    readonly meeting = input.required<Meeting>();
}
