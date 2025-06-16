import { IPosition, ITileSwap } from "../../shared/primitives";

export enum BoosterType {
    BOMB = 1,
    SWAP = 2
}

export interface IBoosterResult {
    success: boolean;
    needsSecondClick: boolean;
    removed?: IPosition[];
    swappedTile?: ITileSwap;
    points?: number;
    explosionCenter?: IPosition;
}

export interface IBoosterStrategy {
    readonly type: BoosterType;
    canActivate(board: any, position: IPosition): boolean;
    activate(board: any, position: IPosition): IBoosterResult;
    needsSecondClick(): boolean;
    getHintMessage(): string;
    reset(): void;
} 