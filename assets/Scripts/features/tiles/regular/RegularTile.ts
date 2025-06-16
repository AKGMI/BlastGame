import { BaseTile } from "../base/BaseTile";
import { ITileActivationResult, TileType } from "../TileTypes";
import { IPosition } from "../../../shared/primitives";
import { GameConfig } from "../../../shared/config/GameConfig";

export class RegularTile extends BaseTile {
    getTargets(board: any): IPosition[] {
        return this.getConnectedTiles(board, this.position.row, this.position.col);
    }

    canActivate(board: any): boolean {
        const targets = this.getTargets(board);
        const config = GameConfig.getInstance();
        const minSize = config.getCurrentLevel().minimumGroupSize;
        return targets.length >= minSize;
    }

    activate(board: any): ITileActivationResult {
        const targets = this.getTargets(board);
        const points = this.calculatePoints(targets.length);
        
        return {
            removed: targets,
            points: points
        };
    }

    private getConnectedTiles(board: any, row: number, col: number): IPosition[] {
        const visited: boolean[][] = [];
        const group: IPosition[] = [];
        
        for (let r = 0; r < board.rows; r++) {
            visited[r] = [];
            for (let c = 0; c < board.cols; c++) {
                visited[r][c] = false;
            }
        }

        const explore = (r: number, c: number) => {
            if (!board.isValidPosition(r, c) || 
                visited[r][c]) {
                return;
            }

            const tile = board.getTile(r, c);
            if (!tile || tile.type !== this.type) {
                return;
            }

            visited[r][c] = true;
            group.push({ row: r, col: c });

            explore(r - 1, c);
            explore(r + 1, c);
            explore(r, c - 1);
            explore(r, c + 1);
        };

        explore(row, col);
        return group;
    }

    private calculatePoints(tileCount: number): number {
        return tileCount * 10 + Math.max(0, (tileCount - 3) * 5);
    }
} 