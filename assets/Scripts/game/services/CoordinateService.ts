export interface ICoordinateService {
    setGameBoard(boardNode: cc.Node, tileSize: number, rows: number, cols: number): void;
    gameToWorldPosition(row: number, col: number): cc.Vec2;
    worldToGamePosition(worldPos: cc.Vec2): { row: number, col: number } | null;
}

export class CoordinateService implements ICoordinateService {
    private static instance: CoordinateService;
    private boardNode: cc.Node | null = null;
    private tileSize: number = 100;
    private rows: number = 8;
    private cols: number = 8;

    private constructor() {}

    public static getInstance(): CoordinateService {
        if (!CoordinateService.instance) {
            CoordinateService.instance = new CoordinateService();
        }
        return CoordinateService.instance;
    }

    public setGameBoard(boardNode: cc.Node, tileSize: number, rows: number, cols: number): void {
        this.boardNode = boardNode;
        this.tileSize = tileSize;
        this.rows = rows;
        this.cols = cols;
    }

    public gameToWorldPosition(row: number, col: number): cc.Vec2 {
        return this.calculatePositionFromBoard(row, col);
    }

    public worldToGamePosition(worldPos: cc.Vec2): { row: number, col: number } | null {
        if (!this.boardNode) {
            return null;
        }

        const localPos = this.boardNode.convertToNodeSpaceAR(worldPos);
        
        const startX = -this.boardNode.width / 2 + this.tileSize / 2;
        const startY = this.boardNode.height / 2 - this.tileSize / 2;
        
        const col = Math.floor((localPos.x - startX) / this.tileSize + 0.5);
        const row = Math.floor((startY - localPos.y) / this.tileSize + 0.5);
        
        if (row >= 0 && row < this.rows && col >= 0 && col < this.cols) {
            return { row, col };
        }
        
        return null;
    }

    private calculatePositionFromBoard(row: number, col: number): cc.Vec2 {
        if (!this.boardNode) {
            return this.calculateApproximatePosition(row, col);
        }

        const startX = -this.boardNode.width / 2 + this.tileSize / 2;
        const startY = this.boardNode.height / 2 - this.tileSize / 2;
        
        const localPos = new cc.Vec2(
            startX + col * this.tileSize,
            startY - row * this.tileSize
        );
        
        return this.boardNode.convertToWorldSpaceAR(localPos);
    }

    private calculateApproximatePosition(row: number, col: number): cc.Vec2 {
        const centerX = 0;
        const centerY = 0;
        const boardWidth = this.cols * this.tileSize;
        const boardHeight = this.rows * this.tileSize;
        
        const x = centerX - boardWidth / 2 + col * this.tileSize + this.tileSize / 2;
        const y = centerY + boardHeight / 2 - row * this.tileSize - this.tileSize / 2;
        
        return new cc.Vec2(x, y);
    }

    public reset(): void {
        this.boardNode = null;
    }
} 