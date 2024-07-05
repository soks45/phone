import { User } from '@shared/models/user';
import { NullableString } from '@shared/types/nullable';

export interface UserFull extends User {
    readonly password_hash: NullableString;
    readonly is_active: boolean;
    readonly created_at: Date;
    readonly updated_at: Date;
}
