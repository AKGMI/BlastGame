import { TileType } from "../features/tiles/TileTypes";

export interface IUIManager {
    initializeUI(): void;
    initializeBoard(rows: number, cols: number, getTileType: (row: number, col: number) => TileType | null): void;

    updateScore(current: number, target: number): void;
    updateMoves(movesLeft: number): void;
    updateShuffles(shufflesLeft: number): void;
    updateBoosters(boosterCounts: { [key: number]: number }): void;

    showGameOver(message: string, finalScore?: number, targetScore?: number): void;
    hideGameOver(): void;
    showMessage(message: string): void;
    setBoosterActive(boosterType: number | null): void;
}

export enum ToastType {
    SUCCESS = 'success',
    ERROR = 'error', 
    INFO = 'info',
    WARNING = 'warning'
}

export interface IToastConfig {
    message: string;
    type: ToastType;
    duration?: number;
    showCloseButton?: boolean;
    position?: 'top' | 'center' | 'bottom';
}

export interface IToastManager {
    show(config: IToastConfig): void;
    showSuccess(message: string, duration?: number): void;
    showError(message: string, duration?: number): void;
    showInfo(message: string, duration?: number): void;
    showWarning(message: string, duration?: number): void;
    clear(): void;
}

export enum ScorePopupType {
    NORMAL = 'normal',
    BONUS = 'bonus',
    SUPER = 'super',
    COMBO = 'combo'
}

export interface IScorePopupConfig {
    points: number;
    type: ScorePopupType;
    startPosition: cc.Vec2;
    duration?: number;
    showPlusSign?: boolean;
    fontSize?: number;
}

export interface IScorePopupManager {
    showScorePopup(config: IScorePopupConfig): void;
    showPointsAt(points: number, worldPosition: cc.Vec2, type?: ScorePopupType): void;
    clear(): void;
} 