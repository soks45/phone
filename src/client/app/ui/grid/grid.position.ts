export type Dimensions = {
    width: number;
    height: number;
};

export type GetGridItemDimensionsParams = {
    count: number;
    dimensions: Dimensions;
    aspectRatio: string;
    gap: number;
};

export type GridItemDimensions = {
    width: number;
    height: number;
    rows: number;
    cols: number;
};

export type CreateGridItemPositionerParams = {
    parentDimensions: Dimensions;
    dimensions: Dimensions;
    rows: number;
    cols: number;
    count: number;
    gap: number;
};

export type CreateGridParams = {
    aspectRatio: string;
    count: number;
    dimensions: Dimensions;
    gap: number;
};

export type Position = {
    top: number;
    left: number;
};

export type Grid = {
    width: number;
    height: number;
    rows: number;
    cols: number;
    getPosition: (index: number) => Position;
};

export function getAspectRatio(ratio: string): number {
    const [width, height] = ratio.split(':');
    if (!width || !height) {
        throw new Error('Invalid aspect ratio provided, expected format is "width:height".');
    }
    return Number.parseInt(height) / Number.parseInt(width);
}

export function getGridItemDimensions({
    count,
    dimensions,
    aspectRatio,
    gap,
}: GetGridItemDimensionsParams): GridItemDimensions {
    let { width: W, height: H } = dimensions;
    if (W === 0 || H === 0) {
        return { width: 0, height: 0, rows: 1, cols: 1 };
    }
    W -= gap * 2;
    H -= gap * 2;
    const s = gap,
        N = count;
    const r = getAspectRatio(aspectRatio);
    let w = 0,
        h = 0;
    let a = 1,
        b = 1;
    const widths: number[] = [];

    for (let n = 1; n <= N; n++) {
        widths.push((W - s * (n - 1)) / n, (H - s * (n - 1)) / (n * r));
    }

    widths.sort((a2, b2) => b2 - a2);

    for (const width of widths) {
        w = width;
        h = w * r;
        a = Math.floor((W + s) / (w + s));
        b = Math.floor((H + s) / (h + s));
        if (a * b >= N) {
            a = Math.ceil(N / b);
            b = Math.ceil(N / a);
            break;
        }
    }

    return { width: w, height: h, rows: b, cols: a };
}

export function createGridItemPositioner({
    parentDimensions,
    dimensions,
    rows,
    cols,
    count,
    gap,
}: CreateGridItemPositionerParams): (index: number) => Position {
    const { width: W, height: H } = parentDimensions;
    const { width: w, height: h } = dimensions;

    const topAdd = h + gap;
    const leftAdd = w + gap;

    let col = 0;
    let row = 0;
    const incompleteRowCols = count % cols;

    let firstTop = (H - (h * rows + (rows - 1) * gap)) / 2;
    let firstLeft = (W - (w * cols + (cols - 1) * gap)) / 2;

    return (index: number): Position => {
        const remaining = count - index;
        if (remaining === incompleteRowCols) {
            firstLeft = (W - (w * remaining + (remaining - 1) * gap)) / 2;
        }
        const top = firstTop + row * topAdd;
        const left = firstLeft + col * leftAdd;
        col++;
        if ((index + 1) % cols === 0) {
            row++;
            col = 0;
        }
        return { top, left };
    };
}

export function createGrid({ aspectRatio, count, dimensions, gap }: CreateGridParams): Grid {
    const { width, height, rows, cols } = getGridItemDimensions({
        aspectRatio,
        count,
        dimensions,
        gap,
    });

    const getPosition = createGridItemPositioner({
        parentDimensions: dimensions,
        dimensions: { width, height },
        rows,
        cols,
        count,
        gap,
    });

    return {
        width,
        height,
        rows,
        cols,
        getPosition,
    };
}
