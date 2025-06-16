import { GameState } from "../models/GameState";

export class MovesManager {
    private gameState: GameState;
    
    constructor(gameState: GameState) {
        this.gameState = gameState;
    }
    
    public useMove(): boolean {
        if (this.gameState.movesLeft > 0) {
            this.gameState.movesLeft--;
            return true;
        }
        return false;
    }
    
    public hasMovesLeft(): boolean {
        return this.gameState.movesLeft > 0;
    }
    
    public getMovesLeft(): number {
        return this.gameState.movesLeft;
    }
    
    public getTotalMoves(): number {
        return this.gameState.totalMoves;
    }
    
    public addMoves(count: number): void {
        this.gameState.movesLeft += count;
    }
    
    public reset(): void {
        this.gameState.movesLeft = this.gameState.totalMoves;
    }
} 