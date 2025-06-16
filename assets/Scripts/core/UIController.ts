import { EventBus, GameEvents } from "./EventBus";
import GameController from "./GameController";

export class UIController {
    private eventBus: EventBus;
    private gameController: GameController;

    constructor(gameController: GameController) {
        this.gameController = gameController;
        this.eventBus = EventBus.getInstance();
        this.setupEventListeners();
    }

    private setupEventListeners(): void {
        this.eventBus.subscribe(GameEvents.ANIMATION_COMPLETED, this.onAnimationCompleted, this);
        
        this.eventBus.subscribe(GameEvents.NEED_SHUFFLE, this.gameController.handleNeedShuffle, this.gameController);
        this.eventBus.subscribe(GameEvents.HINT_REQUEST, this.gameController.handleHintRequest, this.gameController);
        
        this.eventBus.subscribe(GameEvents.TILE_CLICKED, this.onUITileClicked, this);
        this.eventBus.subscribe(GameEvents.BOOSTER_ACTIVATION_REQUESTED, this.onUIBoosterActivationRequested, this);
        this.eventBus.subscribe(GameEvents.BOOSTER_DEACTIVATION_REQUESTED, this.onUIBoosterDeactivationRequested, this);
        this.eventBus.subscribe(GameEvents.SHUFFLE_REQUESTED, this.onUIShuffleRequested, this);
    }

    private onAnimationCompleted(): void {
        this.gameController.checkPendingGameState();
        this.gameController.updateUI();
    }

    private onUITileClicked(row: number, col: number): void {
        this.gameController.handleTileClick(row, col);
    }

    private onUIBoosterActivationRequested(boosterType: number): void {
        this.gameController.activateBooster(boosterType);
    }

    private onUIBoosterDeactivationRequested(): void {
        this.gameController.deactivateBooster();
    }

    private onUIShuffleRequested(): void {
        this.gameController.requestShuffle();
    }

    public destroy(): void {
        this.eventBus.unsubscribe(GameEvents.ANIMATION_COMPLETED, this.onAnimationCompleted, this);
        
        this.eventBus.unsubscribe(GameEvents.NEED_SHUFFLE, this.gameController.handleNeedShuffle, this);
        this.eventBus.unsubscribe(GameEvents.HINT_REQUEST, this.gameController.handleHintRequest, this);
        
        this.eventBus.unsubscribe(GameEvents.TILE_CLICKED, this.onUITileClicked, this);
        this.eventBus.unsubscribe(GameEvents.BOOSTER_ACTIVATION_REQUESTED, this.onUIBoosterActivationRequested, this);
        this.eventBus.unsubscribe(GameEvents.BOOSTER_DEACTIVATION_REQUESTED, this.onUIBoosterDeactivationRequested, this);
        this.eventBus.unsubscribe(GameEvents.SHUFFLE_REQUESTED, this.onUIShuffleRequested, this);
    }
} 