import { IPosition } from "../../../shared/primitives";
import { IBoosterStrategy, IBoosterResult, BoosterType } from "../BoostersTypes";
import { SwapVisualService } from "../../../game/services/SwapVisualService";

export class SwapBoosterStrategy implements IBoosterStrategy {
    readonly type = BoosterType.SWAP;
    private firstClick: IPosition | null = null;
    private swapVisualService: SwapVisualService;

    constructor() {
        this.swapVisualService = SwapVisualService.getInstance();
    }

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

        if (!this.firstClick) {
            this.firstClick = { row: position.row, col: position.col };
            this.swapVisualService.liftTile(this.firstClick);
            
            return {
                success: false,
                needsSecondClick: true
            };
        } else {
            const firstClickPosition = this.firstClick;
            const swapResult = this.performSwap(board, this.firstClick, position);
            
            this.swapVisualService.putDownTile(firstClickPosition);
            this.firstClick = null;
            
            return swapResult;
        }
    }

    needsSecondClick(): boolean {
        return this.firstClick !== null;
    }

    getHintMessage(): string {
        if (!this.firstClick) {
            return 'Выберите первый тайл для обмена';
        } else {
            return 'Выберите второй тайл для обмена';
        }
    }

    reset(): void {
        if (this.firstClick) {
            this.swapVisualService.putDownTile(this.firstClick);
        }
        
        this.firstClick = null;
    }

    private performSwap(board: any, pos1: IPosition, pos2: IPosition): IBoosterResult {
        if (pos1.row === pos2.row && pos1.col === pos2.col) {
            return {
                success: false,
                needsSecondClick: false
            };
        }

        const tile1 = board.getTile(pos1.row, pos1.col);
        const tile2 = board.getTile(pos2.row, pos2.col);

        if (tile1 && tile2) {
            tile1.position.row = pos2.row;
            tile1.position.col = pos2.col;
            tile2.position.row = pos1.row;
            tile2.position.col = pos1.col;
            
            board.setTile(pos1.row, pos1.col, tile2);
            board.setTile(pos2.row, pos2.col, tile1);

            return {
                success: true,
                needsSecondClick: false,
                swappedTile: {
                    pos1: pos1,
                    pos2: pos2
                },
                points: 5
            };
        }

        return {
            success: false,
            needsSecondClick: false
        };
    }
} 