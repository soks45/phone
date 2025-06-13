import { StatusException } from '@shared/exceptions/status.exception';

export class ShouldNotBeUsedDuringSsrException extends StatusException {
    constructor(restricted: string) {
        super(500, `[${restricted}] should not be used during SSR`);
    }
}
