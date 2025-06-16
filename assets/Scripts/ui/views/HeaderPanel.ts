import { EventBus, UICommands } from "../../core/EventBus";

const { ccclass, property } = cc._decorator;

@ccclass
export default class HeaderPanel extends cc.Component {
    @property(cc.Label)
    scoreLabel: cc.Label = null;
    @property(cc.Label)
    movesLabel: cc.Label = null;
    @property(cc.Label)
    shufflesLabel: cc.Label = null;

    private eventBus: EventBus;

    onLoad() {
        this.eventBus = EventBus.getInstance();
        this.setupEventListeners();
    }

    private setupEventListeners(): void {
        this.eventBus.subscribe(UICommands.UPDATE_SCORE, this.onUpdateScore, this);
        this.eventBus.subscribe(UICommands.UPDATE_MOVES, this.onUpdateMoves, this);
        this.eventBus.subscribe(UICommands.UPDATE_SHUFFLES, this.onUpdateShuffles, this);
    }

    private onUpdateScore(scoreText: string): void {
        if (this.scoreLabel) {
            this.scoreLabel.string = scoreText;
        }
    }

    private onUpdateMoves(movesText: string): void {
        if (this.movesLabel) {
            this.movesLabel.string = movesText;
        }
    }

    private onUpdateShuffles(shufflesText: string): void {
        if (this.shufflesLabel) {
            this.shufflesLabel.string = shufflesText;
        }
    }

    onDestroy() {
        if (this.eventBus) {
            this.eventBus.unsubscribe(UICommands.UPDATE_SCORE, this.onUpdateScore, this);
            this.eventBus.unsubscribe(UICommands.UPDATE_MOVES, this.onUpdateMoves, this);
            this.eventBus.unsubscribe(UICommands.UPDATE_SHUFFLES, this.onUpdateShuffles, this);
        }
    }
} 