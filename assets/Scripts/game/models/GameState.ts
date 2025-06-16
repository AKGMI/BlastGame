export class GameState {
    public score: number = 0;
    public targetScore: number = 0;
    public movesLeft: number = 0;
    public totalMoves: number = 0;
    public shufflesLeft: number = 3;
    public isGameOver: boolean = false;
    public isWin: boolean = false;
    
    constructor(targetScore: number, totalMoves: number) {
        this.targetScore = targetScore;
        this.totalMoves = totalMoves;
        this.movesLeft = totalMoves;
    }
    
    public reset(targetScore: number, totalMoves: number): void {
        this.score = 0;
        this.targetScore = targetScore;
        this.totalMoves = totalMoves;
        this.movesLeft = totalMoves;
        this.shufflesLeft = 3;
        this.isGameOver = false;
        this.isWin = false;
    }
} 