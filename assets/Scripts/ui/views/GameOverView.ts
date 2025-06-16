import { EventBus, GameEvents, UICommands } from "../../core/EventBus";

const { ccclass, property } = cc._decorator;

@ccclass
export default class GameOverView extends cc.Component {
    @property(cc.Node)
    gameOverPanel: cc.Node = null;

    @property(cc.Label)
    gameOverMessage: cc.Label = null;

    @property(cc.Label)
    finalScoreLabel: cc.Label = null;

    @property(cc.Button)
    restartButton: cc.Button = null;

    private eventBus: EventBus;

    onLoad() {
        this.eventBus = EventBus.getInstance();
        this.setupEventListeners();
        this.setupButtonListeners();
        this.gameOverPanel.active = false;
    }

    private setupEventListeners(): void {
        this.eventBus.subscribe(UICommands.SHOW_GAME_OVER, this.onShowGameOver, this);
        this.eventBus.subscribe(UICommands.HIDE_GAME_OVER, this.onHideGameOver, this);
        this.eventBus.subscribe(UICommands.INITIALIZE_GAME_OVER, this.onInitializeGameOver, this);
    }

    private setupButtonListeners(): void {
        if (this.restartButton) {
            this.restartButton.node.on('click', this.onRestartButtonClicked, this);
        }
    }

    private onShowGameOver(data: { message: string, finalScore?: number, targetScore?: number }): void {        
        if (this.gameOverPanel) {
            this.gameOverPanel.active = true;
        }
        
        if (this.gameOverMessage) {
            this.gameOverMessage.string = data.message;
        }
        
        if (this.finalScoreLabel && data.finalScore !== undefined) {
            this.finalScoreLabel.string = `${data.finalScore}${data.targetScore ? `/${data.targetScore}` : ''}`;
        }
    }

    private onHideGameOver(): void {        
        if (this.gameOverPanel) {
            this.gameOverPanel.active = false;
        }
    }

    private onInitializeGameOver(visible: boolean): void {        
        if (this.gameOverPanel) {
            this.gameOverPanel.active = visible;
        }
    }

    private onRestartButtonClicked(): void {
        this.eventBus.publish(GameEvents.GAME_RESTART_REQUESTED);
    }

    onDestroy() {
        if (this.eventBus) {
            this.eventBus.unsubscribe(UICommands.SHOW_GAME_OVER, this.onShowGameOver, this);
            this.eventBus.unsubscribe(UICommands.HIDE_GAME_OVER, this.onHideGameOver, this);
            this.eventBus.unsubscribe(UICommands.INITIALIZE_GAME_OVER, this.onInitializeGameOver, this);
        }

        if (this.restartButton) {
            this.restartButton.node.off('click', this.onRestartButtonClicked, this);
        }
    }
} 