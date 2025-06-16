import { IPosition } from "../../shared/primitives";

export enum TileType {
    RED = 'red',
    BLUE = 'blue',
    GREEN = 'green',
    YELLOW = 'yellow',
    PURPLE = 'purple',
    
    SUPER_ROW = 'super_row',
    SUPER_COLUMN = 'super_column',
    SUPER_BOMB = 'super_bomb',
    SUPER_ALL = 'super_all'
}

export interface ITileActivationResult {
    removed: IPosition[];
    points: number;
    affectedSuperTiles?: (IPosition & { type: TileType })[];
}

export interface ITile {
    readonly type: TileType;
    readonly position: IPosition;
    
    getTargets(board: any): IPosition[];
    canActivate(board: any): boolean;
    activate(board: any): ITileActivationResult;
    setPosition(position: IPosition): void;
} 