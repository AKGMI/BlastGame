import { IPosition } from "../../../shared/primitives";
import { IBoosterStrategy, IBoosterResult, BoosterType } from "../BoostersTypes";

export class BombBoosterStrategy implements IBoosterStrategy {
    readonly type = BoosterType.BOMB;

    canActivate(board: any, position: IPosition): boolean {
        return board.isValidPosition(position.row, position.col);
    }

    activate(board: any, position: IPosition): IBoosterResult {
        if (!this.canActivate(board, position)) {
            return {
                success: false,
                needsSecondClick: false
            };
        }

        const targets = this.getExplosionTargets(board, position);
        
        return {
            success: true,
            needsSecondClick: false,
            removed: targets,
            points: targets.length,
            explosionCenter: position
        };
    }

    needsSecondClick(): boolean {
        return false;
    }

    getHintMessage(): string {
        return 'Выберите тайл для взрыва';
    }

    reset(): void {}

    private getExplosionTargets(board: any, center: IPosition): IPosition[] {
        const targets: IPosition[] = [];
        const radius = 1;

        for (let row = center.row - radius; row <= center.row + radius; row++) {
            for (let col = center.col - radius; col <= center.col + radius; col++) {
                if (board.isValidPosition(row, col)) {
                    targets.push({ row, col });
                }
            }
        }

        return targets;
    }
} 