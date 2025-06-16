export interface IPosition {
    row: number;
    col: number;
}

export interface ITileMove {
    from: IPosition;
    to: IPosition;
}

export interface ITileSwap {
    pos1: IPosition;
    pos2: IPosition;
} 