import { NullableString } from '@shared/types/nullable';

export interface Meeting {
    id: string;
    created_at: string;
    ended_at: NullableString;
    is_active: boolean;
}
