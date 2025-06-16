import { BaseSuperTile } from "./BaseSuperTile";
import { IPosition } from "../../../shared/primitives";
import { TileType } from "../TileTypes";

export class SuperBombTile extends BaseSuperTile {
    constructor(position: IPosition) {
        super(TileType.SUPER_BOMB, position, 25);
    }

    getTargets(board: any): IPosition[] {
        const targets: IPosition[] = [];
        const radius = 2;
        
        for (let row = this.position.row - radius; row <= this.position.row + radius; row++) {
            for (let col = this.position.col - radius; col <= this.position.col + radius; col++) {
                if (board.isValidPosition(row, col)) {
                    targets.push({ row, col });
                }
            }
        }
        
        return targets;
    }
} 