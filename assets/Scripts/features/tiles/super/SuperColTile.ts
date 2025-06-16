import { BaseSuperTile } from "./BaseSuperTile";
import { IPosition } from "../../../shared/primitives";
import { TileType } from "../TileTypes";

export class SuperColTile extends BaseSuperTile {
    constructor(position: IPosition) {
        super(TileType.SUPER_COLUMN, position, 20);
    }

    getTargets(board: any): IPosition[] {
        const targets: IPosition[] = [];
        
        for (let row = 0; row < board.rows; row++) {
            targets.push({ row, col: this.position.col });
        }
        
        return targets;
    }
} 