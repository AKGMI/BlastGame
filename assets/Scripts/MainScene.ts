import { IGameController, IGameCoordinator } from "./core/types";
import { EventBus, GameEvents } from "./core/EventBus";
import GameController from "./core/GameController";
import { UIController } from "./core/UIController";
import { GameServiceContainer } from "./core/GameServiceContainer";
import { DevConsole } from "./shared/console/DevConsole";

const { ccclass } = cc._decorator;

@ccclass
export default class MainScene extends cc.Component implements IGameCoordinator {
    private gameController: IGameController;
    private uiController: UIController;
    private eventBus: EventBus;
    private serviceContainer: GameServiceContainer;
    private devConsole: DevConsole;
    
    onLoad() {
        this.eventBus = EventBus.getInstance();
        this.setupEventListeners();
        this.initializeGameCoordinator();

        this.setupDevConsole();
    }

    private initializeGameCoordinator(): void {
        this.serviceContainer = GameServiceContainer.getGameInstance();
        
        this.gameController = new GameController();
        this.uiController = new UIController(this.gameController as GameController);
        
        const uiCommandService = this.serviceContainer.getUICommandService();
        uiCommandService.initializeUI();
    }

    private setupDevConsole(): void {
        this.devConsole = new DevConsole(this.gameController, this);
        this.devConsole.setupCommands();
    }

    restartGame(): void {
        const uiCommandService = this.serviceContainer.getUICommandService();
        this.gameController.resetGame();
        uiCommandService.hideGameOver();
    }

    private setupEventListeners(): void {
        this.eventBus.subscribe(GameEvents.GAME_RESTART_REQUESTED, this.handleRestartRequested, this);
    }

    private handleRestartRequested(): void {
        this.restartGame();
    }

    shutdown(): void {        
        if (this.devConsole) {
            this.devConsole.destroy();
        }
        
        if (this.uiController) {
            this.uiController.destroy();
        }
        
        this.eventBus.unsubscribe(GameEvents.GAME_RESTART_REQUESTED, this.handleRestartRequested, this);
    }

    onDestroy() {
        this.shutdown();
    }
} 