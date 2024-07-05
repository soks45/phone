import { NullableString } from '@shared/types/nullable';

export interface User {
    readonly id: number;
    readonly email: NullableString;
    readonly login: NullableString;
}
