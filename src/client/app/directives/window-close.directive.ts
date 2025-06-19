import { Directive, HostListener, inject } from '@angular/core';

import { WINDOW } from '@ng-web-apis/common';

@Directive({
    selector: '[appWindowClose]',
    standalone: true,
})
export class WindowCloseDirective {
    private readonly window: Window = inject(WINDOW);

    @HostListener('click')
    private close(): void {
        this.window.close();
    }
}
