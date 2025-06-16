import { ScorePopupManager } from "../managers/ScorePopupManager";

const { ccclass, property } = cc._decorator;

@ccclass
export default class ScorePopupView extends cc.Component {
    
    @property(cc.Node)
    popupContainer: cc.Node = null;
    
    private scorePopupManager: ScorePopupManager;
    
    onLoad() {
        this.scorePopupManager = ScorePopupManager.getInstance();
        
        this.setupScorePopupManager();
        
        if (!this.popupContainer) {
            console.error('[ScorePopupView] popupContainer не назначен!');
        }
    }
    
    private setupScorePopupManager(): void {
        if (this.popupContainer) {
            this.scorePopupManager.setPopupContainer(this.popupContainer);
        }
    }
    
    onDestroy() {
        this.scorePopupManager.clear();
    }
} 