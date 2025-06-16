import { NullableString } from '@shared/types/nullable';

export interface MeetingData {
    name: string;
    description?: NullableString;
}
