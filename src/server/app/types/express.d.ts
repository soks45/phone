export {};

declare global {
    namespace Express {
        export interface Request {}
        export interface User {
            id: number;
        }
    }
}
