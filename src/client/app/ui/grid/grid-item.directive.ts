import { Directive, ElementRef, inject, Renderer2 } from '@angular/core';

export interface GridItemPosition {
    width: number;
    height: number;
    top: number;
    left: number;
}

@Directive({
    selector: '[appGridItem]',
    standalone: true,
})
export class GridItemDirective {
    readonly renderer = inject(Renderer2);
    readonly elementRef: ElementRef = inject(ElementRef);

    applyPosition({ top, left, width, height }: GridItemPosition): void {
        this.renderer.setStyle(this.elementRef.nativeElement, 'position', 'absolute');
        this.renderer.setStyle(this.elementRef.nativeElement, 'transition', '0.4s all');
        this.renderer.setStyle(this.elementRef.nativeElement, 'top', `${top}px`);
        this.renderer.setStyle(this.elementRef.nativeElement, 'left', `${left}px`);
        this.renderer.setStyle(this.elementRef.nativeElement, 'width', `${width}px`);
        this.renderer.setStyle(this.elementRef.nativeElement, 'height', `${height}px`);
    }
}
