import { GameState } from "../models/GameState";

export class ScoreManager {
    private gameState: GameState;
    
    constructor(gameState: GameState) {
        this.gameState = gameState;
    }
    
    public addScore(points: number): number {
        this.gameState.score += points;

        return points;
    }
    
    public isTargetReached(): boolean {
        return this.gameState.score >= this.gameState.targetScore;
    }
    
    public getProgress(): number {
        return Math.min(this.gameState.score / this.gameState.targetScore, 1);
    }
    
    public getScore(): number {
        return this.gameState.score;
    }
    
    public getTargetScore(): number {
        return this.gameState.targetScore;
    }
    
    public reset(): void {
        this.gameState.score = 0;
    }
} 