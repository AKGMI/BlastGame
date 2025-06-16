import { BaseSuperTile } from "./BaseSuperTile";
import { IPosition } from "../../../shared/primitives";
import { TileType } from "../TileTypes";

export class SuperAllTile extends BaseSuperTile {
    constructor(position: IPosition) {
        super(TileType.SUPER_ALL, position, 50);
    }

    getTargets(board: any): IPosition[] {
        const targets: IPosition[] = [];
        
        for (let row = 0; row < board.rows; row++) {
            for (let col = 0; col < board.cols; col++) {
                targets.push({ row, col });
            }
        }
        
        return targets;
    }

    protected findAffectedSuperTiles(): (IPosition & { type: TileType })[] {
        return [];
    }
} 