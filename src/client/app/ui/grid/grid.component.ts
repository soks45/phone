import { ChangeDetectionStrategy, Component, contentChildren, Signal } from '@angular/core';

import { ResizeObserverModule } from '@ng-web-apis/resize-observer';

import { GridItemDirective } from '@client/app/ui/grid/grid-item.directive';
import { createGrid } from '@client/app/ui/grid/grid.position';

@Component({
    selector: 'app-grid',
    standalone: true,
    imports: [ResizeObserverModule],
    templateUrl: './grid.component.html',
    styleUrl: './grid.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GridComponent {
    readonly items: Signal<readonly GridItemDirective[]> = contentChildren(GridItemDirective);

    recalculateGrid([entry]: ResizeObserverEntry[]): void {
        const items = this.items();

        const { width, height, getPosition } = createGrid({
            dimensions: entry.contentRect,
            count: items.length,
            aspectRatio: '16:9',
            gap: 10,
        });

        items.forEach((item, index) => {
            const { top, left } = getPosition(index);

            item.applyPosition({
                width,
                height,
                top,
                left,
            });
        });
    }
}
