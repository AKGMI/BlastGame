import { IGameModel } from "../game/GameTypes";

export interface IGameCoordinator {
    restartGame(): void;
    shutdown(): void;
}

export interface IGameController {
    getGameModel(): IGameModel;
    handleTileClick(row: number, col: number): void;
    handleHintRequest(): void;
    handleNeedShuffle(): void;
    checkPendingGameState(): void;
    resetGame(): void;
} 