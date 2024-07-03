import { NullableString } from 'shared/types/nullable';

export interface User {
    readonly id: number;
    readonly email: NullableString;
    readonly password_hash: NullableString;
    readonly login: NullableString;
    readonly is_active: boolean;
    readonly created_at: Date;
    readonly updated_at: Date;
}
