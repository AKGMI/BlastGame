import { IUIManager } from "../../ui/UITypes";
import { IMoveResult, IShuffleEvent } from "../GameTypes";
import { EventBus, GameEvents, UICommands } from "../../core/EventBus";
import { ToastManager } from "../../ui/managers/ToastManager";
import { ScorePopupManager } from "../../ui/managers/ScorePopupManager";
import { CoordinateService } from "../services/CoordinateService";

export class UICommandService implements IUIManager {
    private eventBus: EventBus;
    private toastManager: ToastManager;
    private scorePopupManager: ScorePopupManager;
    private coordinateService: CoordinateService;

    constructor() {
        this.eventBus = EventBus.getInstance();
        this.toastManager = ToastManager.getInstance();
        this.scorePopupManager = ScorePopupManager.getInstance();
        this.coordinateService = CoordinateService.getInstance();
    }

    initializeUI(): void {
        this.eventBus.publish(UICommands.INITIALIZE_GAME_OVER, false);
    }

    initializeBoard(rows: number, cols: number, getTileType: (row: number, col: number) => any): void {
        this.eventBus.publish(UICommands.BOARD_INIT, {
            rows: rows,
            cols: cols,
            getTileType: getTileType
        });
    }

    updateScore(score: number, target: number): void {
        this.eventBus.publish(UICommands.UPDATE_SCORE, `${score}/${target}`);
    }

    updateMoves(movesLeft: number): void {
        this.eventBus.publish(UICommands.UPDATE_MOVES, movesLeft.toString());
    }

    updateShuffles(shufflesLeft: number): void {
        this.eventBus.publish(UICommands.UPDATE_SHUFFLES, shufflesLeft.toString());
    }

    updateBoosters(boosterCounts: { [key: number]: number }): void {
        this.eventBus.publish(UICommands.UPDATE_BOOSTERS, boosterCounts);
    }

    reportMoveResult(moveResult: IMoveResult): void {
        const eventData = {
            moveResult: moveResult
        };
        
        this.eventBus.publish(GameEvents.MOVE_COMPLETED, eventData);
    }

    showGameOver(message: string, finalScore?: number, targetScore?: number): void {
        this.eventBus.publish(UICommands.SHOW_GAME_OVER, { message, finalScore, targetScore });
    }

    hideGameOver(): void {
        this.eventBus.publish(UICommands.HIDE_GAME_OVER);
    }

    showMessage(message: string, duration?: number): void {
        this.toastManager.showInfo(message, duration);
    }

    setBoosterActive(boosterType: number | null): void {
        this.eventBus.publish(UICommands.SET_BOOSTER_ACTIVE, boosterType);
    }

    reportShuffleEvent(shuffleEvent: IShuffleEvent): void {      
        this.eventBus.publish(UICommands.SHUFFLE_REQUESTED, shuffleEvent);
    }

    showScorePopup(points: number, explosionCenter: { row: number, col: number }, moveResult?: any): void {
        if (points <= 0) return;
        
        const worldPosition = this.coordinateService.gameToWorldPosition(
            explosionCenter.row, 
            explosionCenter.col
        );
        
        this.scorePopupManager.showPointsAt(points, worldPosition);
    }
} 