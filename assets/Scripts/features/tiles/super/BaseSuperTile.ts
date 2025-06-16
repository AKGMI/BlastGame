import { BaseTile } from "../base/BaseTile";
import { IPosition } from "../../../shared/primitives";
import { ITileActivationResult, TileType } from "../TileTypes";
import { TileUtils } from "../../../shared/utils/TileUtils";

export abstract class BaseSuperTile extends BaseTile {
    protected pointsPerTile: number;

    constructor(type: TileType, position: IPosition, pointsPerTile: number = 20) {
        super(type, position);
        this.pointsPerTile = pointsPerTile;
    }

    abstract getTargets(board: any): IPosition[];

    canActivate(): boolean {
        return true;
    }

    activate(board: any): ITileActivationResult {
        const targets = this.getTargets(board);
        const points = targets.length * this.pointsPerTile;
        
        const affectedSuperTiles = this.findAffectedSuperTiles(board, targets);
        
        return {
            removed: targets,
            points: points,
            affectedSuperTiles: affectedSuperTiles.length > 0 ? affectedSuperTiles : undefined
        };
    }

    protected findAffectedSuperTiles(board: any, targets: IPosition[]): (IPosition & { type: TileType })[] {
        const affectedSuperTiles: (IPosition & { type: TileType })[] = [];
        
        for (const target of targets) {
            if (target.row === this.position.row && target.col === this.position.col) {
                continue;
            }
            
            const tile = board.getTile(target.row, target.col);
            if (tile && TileUtils.isSuperTile(tile.type)) {
                affectedSuperTiles.push({
                    row: target.row,
                    col: target.col,
                    type: tile.type
                });
            }
        }
        
        return affectedSuperTiles;
    }
} 