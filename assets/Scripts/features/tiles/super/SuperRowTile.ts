import { BaseSuperTile } from "./BaseSuperTile";
import { IPosition } from "../../../shared/primitives";
import { TileType } from "../TileTypes";

export class SuperRowTile extends BaseSuperTile {
    constructor(position: IPosition) {
        super(TileType.SUPER_ROW, position, 20);
    }

    getTargets(board: any): IPosition[] {
        const targets: IPosition[] = [];
        
        for (let col = 0; col < board.cols; col++) {
            targets.push({ row: this.position.row, col });
        }
        
        return targets;
    }
} 