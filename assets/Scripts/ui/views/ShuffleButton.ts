import { EventBus, GameEvents } from "../../core/EventBus";

const { ccclass, property } = cc._decorator;

@ccclass
export default class ShuffleButton extends cc.Component {
    
    @property(cc.Button)
    shuffleButton: cc.Button = null;
    
    private eventBus: EventBus;
    
    onLoad() {
        this.eventBus = EventBus.getInstance();
        this.setupButtonListener();
    }
    
    private setupButtonListener(): void {
        if (this.shuffleButton) {
            this.shuffleButton.node.on('click', this.onShuffleButtonClicked, this);
        }
    }
    
    private onShuffleButtonClicked(): void {
        this.eventBus.publish(GameEvents.SHUFFLE_REQUESTED);
    }
    
    onDestroy() {        
        if (this.shuffleButton) {
            this.shuffleButton.node.off('click', this.onShuffleButtonClicked, this);
        }
    }
} 