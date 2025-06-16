import { EventBus, GameEvents, UICommands } from "../../core/EventBus";
import { BoosterType } from "../../features/boosters/BoostersTypes";

const { ccclass, property } = cc._decorator;

@ccclass
export default class BoosterPanel extends cc.Component {
    @property(cc.Button)
    bombButton: cc.Button = null;

    @property(cc.Button)
    swapButton: cc.Button = null;

    @property(cc.Label)
    bombCountLabel: cc.Label = null;

    @property(cc.Label)
    swapCountLabel: cc.Label = null;

    private eventBus: EventBus;
    private activeBoosterType: BoosterType | null = null;

    onLoad() {
        this.eventBus = EventBus.getInstance();
        this.setupEventListeners();
        this.setupButtonListeners();
    }

    private setupEventListeners(): void {
        this.eventBus.subscribe(UICommands.UPDATE_BOOSTERS, this.onUpdateBoosters, this);
        this.eventBus.subscribe(UICommands.SET_BOOSTER_ACTIVE, this.onSetActiveBooster, this);
    }

    private setupButtonListeners(): void {
        if (this.bombButton) {
            this.bombButton.node.on('click', () => this.onBoosterButtonClicked(BoosterType.BOMB), this);
        } else {
            console.error('[BoosterPanel] Кнопка BOMB не найдена!');
        }
        
        if (this.swapButton) {
            this.swapButton.node.on('click', () => this.onBoosterButtonClicked(BoosterType.SWAP), this);
        } else {
            console.error('[BoosterPanel] Кнопка SWAP не найдена!');
        }
    }

    private onUpdateBoosters(boosterCounts: { [key: number]: number }): void {
        if (this.bombCountLabel) {
            this.bombCountLabel.string = (boosterCounts[BoosterType.BOMB] || 0).toString();
        }
        
        if (this.swapCountLabel) {
            this.swapCountLabel.string = (boosterCounts[BoosterType.SWAP] || 0).toString();
        }
        
        this.updateButtonAvailability(boosterCounts);
    }

    private updateButtonAvailability(boosterCounts: { [key: number]: number }): void {
        if (this.bombButton) {
            this.bombButton.interactable = (boosterCounts[BoosterType.BOMB] || 0) > 0;
        }
        
        if (this.swapButton) {
            this.swapButton.interactable = (boosterCounts[BoosterType.SWAP] || 0) > 0;
        }
    }

    private onSetActiveBooster(boosterType: BoosterType | null): void {
        this.activeBoosterType = boosterType;
        
        this.updateButtonVisualState();
    }

    private updateButtonVisualState(): void {
        this.setButtonHighlight(this.bombButton, false);
        this.setButtonHighlight(this.swapButton, false);
        
        if (this.activeBoosterType === BoosterType.BOMB) {
            this.setButtonHighlight(this.bombButton, true);
        } else if (this.activeBoosterType === BoosterType.SWAP) {
            this.setButtonHighlight(this.swapButton, true);
        }
    }

    private setButtonHighlight(button: cc.Button, highlight: boolean): void {
        if (!button) return;
        
        const buttonNode = button.node.parent;
        
        if (highlight) {
            cc.Tween.stopAllByTarget(buttonNode);
            
            buttonNode.scale = 1.15;
            buttonNode.color = cc.Color.YELLOW;
            
            cc.tween(buttonNode)
                .repeatForever(
                    cc.tween()
                        .to(0.3, { scale: 1.2 })
                        .to(0.3, { scale: 1.15 })
                )
                .start();
        } else {
            cc.Tween.stopAllByTarget(buttonNode);
            buttonNode.scale = 1.0;
            buttonNode.color = cc.Color.WHITE;
        }
    }

    private onBoosterButtonClicked(boosterType: BoosterType): void {
        const isEnabled = boosterType === BoosterType.BOMB ? 
            this.bombButton?.interactable : 
            this.swapButton?.interactable;
            
        if (!isEnabled) {
            console.warn(`[BoosterPanel] Бустер ${boosterType} недоступен для использования`);
            return;
        }
        
        if (this.activeBoosterType === boosterType) {
            this.eventBus.publish(GameEvents.BOOSTER_DEACTIVATION_REQUESTED, boosterType);
        } else {
            this.eventBus.publish(GameEvents.BOOSTER_ACTIVATION_REQUESTED, boosterType);
        }
    }

    onDestroy() {
        if (this.eventBus) {
            this.eventBus.unsubscribe(UICommands.UPDATE_BOOSTERS, this.onUpdateBoosters, this);
            this.eventBus.unsubscribe(UICommands.SET_BOOSTER_ACTIVE, this.onSetActiveBooster, this);
        }

        if (this.bombButton) {
            this.bombButton.node.off('click');
            cc.Tween.stopAllByTarget(this.bombButton.node.parent);
        }
        
        if (this.swapButton) {
            this.swapButton.node.off('click');
            cc.Tween.stopAllByTarget(this.swapButton.node.parent);
        }
    }
} 