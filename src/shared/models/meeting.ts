import { NullableString } from '@shared/types/nullable';

export interface Meeting {
    id: string;
    name: string;
    description: NullableString;
    created_at: string;
    ended_at: NullableString;
    is_active: boolean;
}
