import { AppException } from '@shared/exceptions/app.exception';

export class StatusException extends AppException {
    constructor(
        public readonly status: number,
        message: string
    ) {
        super(message);
    }
}
