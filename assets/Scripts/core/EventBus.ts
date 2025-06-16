export type EventCallback = (...args: any[]) => void;

export class EventBus extends cc.EventTarget {
    private static instance: EventBus;

    private constructor() {
        super();
    }

    public static getInstance(): EventBus {
        if (!EventBus.instance) {
            EventBus.instance = new EventBus();
        }
        return EventBus.instance;
    }

    public subscribe(event: string, callback: EventCallback, target?: any): void {
        this.on(event, callback, target);
    }

    public unsubscribe(event: string, callback: EventCallback, target?: any): void {
        this.off(event, callback, target);
    }

    public publish(event: string, ...args: any[]): void {
        this.emit(event, ...args);
    }

    public clear(): void {
        this.targetOff(this);
    }
}

export const GameEvents = {
    TILE_CLICKED: 'game:tile-clicked',
    BOOSTER_ACTIVATION_REQUESTED: 'game:booster-activation-requested',
    BOOSTER_DEACTIVATION_REQUESTED: 'game:booster-deactivation-requested',
    SHUFFLE_REQUESTED: 'game:shuffle-requested',
    GAME_RESTART_REQUESTED: 'game:restart-requested',
    
    NEED_SHUFFLE: 'game:need-shuffle',
    MOVE_COMPLETED: 'game:move-completed',
    
    HINT_REQUEST: 'game:hint-request',
    
    ANIMATION_COMPLETED: 'game:animation-completed'
} as const;

export const UICommands = {
    BOARD_INIT: 'board:init',
    
    UPDATE_SCORE: 'ui:update-score',
    UPDATE_MOVES: 'ui:update-moves',
    UPDATE_SHUFFLES: 'ui:update-shuffles',
    UPDATE_BOOSTERS: 'ui:update-boosters',
    SET_BOOSTER_ACTIVE: 'ui:set-booster-active',

    SHUFFLE_REQUESTED: 'ui:shuffle-requested',
    
    SHOW_GAME_OVER: 'ui:show-game-over',
    HIDE_GAME_OVER: 'ui:hide-game-over',
    INITIALIZE_GAME_OVER: 'ui:initialize-game-over',
    
    HINT_ANIMATION_START: 'ui:hint-animation-start',
    HINT_ANIMATION_STOP: 'ui:hint-animation-stop',

    TOAST_SHOW: 'ui:toast-show',
    TOAST_CLEAR_ALL: 'ui:toast-clear-all'
} as const;