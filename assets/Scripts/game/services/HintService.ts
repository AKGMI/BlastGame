import { EventBus, GameEvents, UICommands } from "../../core/EventBus";

export class HintService {
    private eventBus: EventBus;
    private hintTimer: number | null = null;
    private readonly hintDelay: number = 10000;
    private isHintActive: boolean = false;
    
    constructor() {
        this.eventBus = EventBus.getInstance();
        this.setupEventListeners();
        this.startHintTimer();
    }
    
    private setupEventListeners(): void {
        this.eventBus.subscribe(GameEvents.TILE_CLICKED, this.resetHintTimer, this);
        this.eventBus.subscribe(GameEvents.BOOSTER_ACTIVATION_REQUESTED, this.resetHintTimer, this);
        this.eventBus.subscribe(GameEvents.ANIMATION_COMPLETED, this.resetHintTimer, this);
    }
    
    private resetHintTimer(): void {
        this.stopCurrentHint();
        
        if (this.hintTimer !== null) {
            clearTimeout(this.hintTimer);
        }
        
        this.hintTimer = setTimeout(() => {
            this.onInactivityTimeout();
        }, this.hintDelay) as any;
    }
    
    private onInactivityTimeout(): void {
        this.eventBus.publish(GameEvents.HINT_REQUEST);
    }
    
    public showHint(hintPositions: { row: number, col: number }[]): void {
        if (this.isHintActive) {
            this.stopCurrentHint();
        }
        
        if (hintPositions && hintPositions.length > 0) {
            this.isHintActive = true;
            this.eventBus.publish(UICommands.HINT_ANIMATION_START, { positions: hintPositions });
        }
    }
    
    public stopCurrentHint(): void {
        if (this.isHintActive) {
            this.isHintActive = false;
            this.eventBus.publish(UICommands.HINT_ANIMATION_STOP);
        }
    }
    
    public startHintTimer(): void {
        this.resetHintTimer();
    }
    
    public stopHintTimer(): void {
        if (this.hintTimer !== null) {
            clearTimeout(this.hintTimer);
            this.hintTimer = null;
        }
        this.stopCurrentHint();
    }
    
    public destroy(): void {
        this.stopHintTimer();
        
        if (this.eventBus) {
            this.eventBus.unsubscribe(GameEvents.TILE_CLICKED, this.resetHintTimer, this);
            this.eventBus.unsubscribe(GameEvents.BOOSTER_ACTIVATION_REQUESTED, this.resetHintTimer, this);
            this.eventBus.unsubscribe(GameEvents.ANIMATION_COMPLETED, this.resetHintTimer, this);
        }
    }
} 