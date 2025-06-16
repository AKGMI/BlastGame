import { IPosition, ITileMove, ITileSwap } from "../shared/primitives";
import { TileType, ITile } from "../features/tiles/TileTypes";
import { ScoreManager } from "./managers/ScoreManager";
import { MovesManager } from "./managers/MovesManager";

export enum GameState {
    PLAYING = 0,
    WON = 1,
    LOST = 2
}

export interface IMoveResult {
    removed?: IPosition[];
    movedTiles?: ITileMove[];
    newTiles?: (IPosition & { type?: TileType })[];
    swappedTile?: ITileSwap;
    superTile?: IPosition & { type: TileType };
    explosionCenter?: IPosition;
    clickedGroup?: IPosition[];
    points: number;
    movesLeft: number;
    gameState: GameState;
    chainLength?: number;
    explosionCenters?: IPosition[];
}

export interface IShuffleEvent {
    reason: 'auto' | 'manual';
    boardData: {
        rows: number;
        cols: number;
        getTileType: (row: number, col: number) => TileType | null;
    };
}

export interface IGameBoard {
    readonly rows: number;
    readonly cols: number;
    
    getTile(row: number, col: number): ITile | null;
    setTile(row: number, col: number, tile: ITile): void;
    
    hasMatchableGroups(): boolean;
    removeGroup(group: IPosition[]): number;
    
    applyGravity(): ITileMove[];
    fillEmptyCells(): (IPosition & { type: TileType })[];
    shuffleBoard(minimumGroupSize: number): void;
    
    isValidPosition(row: number, col: number): boolean;
    
    // Debug methods
    printBoard(title?: string): void;
    printBoardStats(): void;
}

export interface IGameModel {
    handleTileClick(row: number, col: number): IMoveResult;
    getGameBoard(): IGameBoard;
    getGameState(): GameState;
    getScoreManager(): ScoreManager;
    getMovesManager(): MovesManager;
    getShufflesLeft(): number;
    shuffleBoard(): void;
    resetGame(rows: number, cols: number, targetScore: number, totalMoves: number): void;
    checkGameState(): void;
    checkNeedShuffle(): void;
} 