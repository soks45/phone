import { User } from '@shared/models/user';

export interface MeetingMessage {
    readonly id: string;
    readonly meeting_id: string;
    readonly author: User;
    readonly text: string;
    readonly created_at: string;
}
