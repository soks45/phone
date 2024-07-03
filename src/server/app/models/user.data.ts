export type UserData =
    | {
          readonly email: string;
          readonly password_hash: null;
          readonly login: null;
      }
    | {
          readonly email: null;
          readonly password_hash: string;
          readonly login: string;
      }
    | {
          readonly email: string;
          readonly password_hash: string;
          readonly login: string;
      };
