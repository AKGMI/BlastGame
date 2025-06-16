import { IScorePopupManager, IScorePopupConfig, ScorePopupType } from "../UITypes";

export class ScorePopupManager implements IScorePopupManager {
    private static instance: ScorePopupManager;
    private popupContainer: cc.Node | null = null;
    private activePopups: cc.Node[] = [];

    private constructor() {}

    public static getInstance(): ScorePopupManager {
        if (!ScorePopupManager.instance) {
            ScorePopupManager.instance = new ScorePopupManager();
        }
        return ScorePopupManager.instance;
    }

    public setPopupContainer(container: cc.Node): void {
        this.popupContainer = container;
    }

    public showPointsAt(points: number, worldPosition: cc.Vec2, type: ScorePopupType = ScorePopupType.NORMAL): void {
        if (!this.popupContainer) {
            return;
        }

        const popupType = this.determinePopupType(points, type);
        
        const localPosition = this.popupContainer.convertToNodeSpaceAR(worldPosition);

        const config: IScorePopupConfig = {
            points,
            type: popupType,
            startPosition: localPosition,
            duration: 1.5,
            showPlusSign: true,
            fontSize: this.getFontSizeForPoints(points)
        };

        this.showScorePopup(config);
    }

    public showScorePopup(config: IScorePopupConfig): void {
        if (!this.popupContainer) {
            return;
        }

        const popupNode = this.createScorePopup(config);
        if (!popupNode) return;

        this.popupContainer.addChild(popupNode);
        this.activePopups.push(popupNode);

        this.animateScorePopup(popupNode);
    }

    public clear(): void {
        this.activePopups.forEach(popup => {
            if (popup && cc.isValid(popup)) {
                popup.destroy();
            }
        });
        this.activePopups = [];
    }

    public determinePopupType(points: number, suggestedType: ScorePopupType): ScorePopupType {
        if (suggestedType !== ScorePopupType.NORMAL) {
            return suggestedType;
        }

        if (points >= 200) {
            return ScorePopupType.COMBO;
        } else if (points >= 100) {
            return ScorePopupType.SUPER;
        } else if (points >= 50) {
            return ScorePopupType.BONUS;
        } else {
            return ScorePopupType.NORMAL;
        }
    }

    private getFontSizeForPoints(points: number): number {
        if (points >= 200) return 60;
        if (points >= 100) return 48;
        if (points >= 50) return 36;
        if (points >= 20) return 30;
        return 24;
    }

    private createScorePopup(config: IScorePopupConfig): cc.Node | null {
        const popupNode = new cc.Node('ScorePopup');
        
        const label = popupNode.addComponent(cc.Label);
        const pointsText = config.showPlusSign ? `+${config.points}` : config.points.toString();
        label.string = pointsText;
        label.fontFamily = 'Marvin';
        label.fontSize = config.fontSize || 24;
        
        this.setupPopupStyle(label, config.type);
        
        popupNode.setPosition(config.startPosition);
        
        popupNode.opacity = 255;
        popupNode.scale = 0.5;
        
        return popupNode;
    }

    private setupPopupStyle(label: cc.Label, type: ScorePopupType): void {
        label.node.color = this.getColorForType(type);
        
        const outline = label.node.addComponent(cc.LabelOutline);
        outline.color = cc.Color.BLACK;
        outline.width = 2;
        
        const shadow = label.node.addComponent(cc.LabelShadow);
        shadow.color = new cc.Color(0, 0, 0, 100);
        shadow.offset = new cc.Vec2(2, -2);
        shadow.blur = 1;
    }

    private getColorForType(type: ScorePopupType): cc.Color {
        switch (type) {
            case ScorePopupType.NORMAL:
                return cc.Color.WHITE;
            case ScorePopupType.BONUS:
                return cc.Color.YELLOW;
            case ScorePopupType.SUPER:
                return new cc.Color(255, 215, 0);
            case ScorePopupType.COMBO:
                return cc.Color.MAGENTA;
            default:
                return cc.Color.WHITE;
        }
    }

    private animateScorePopup(popupNode: cc.Node): void {      
        cc.tween(popupNode)
            .to(0.2, { 
                scale: 1.2,
                opacity: 255 
            }, { 
                easing: 'backOut' 
            })
            .call(() => {
                this.animateRiseAndFade(popupNode);
            })
            .start();
    }

    private animateRiseAndFade(popupNode: cc.Node): void {
        cc.tween(popupNode)
            .to(0.8, {
                scale: 1.0,
                y: popupNode.y + 80
            }, {
                easing: 'sineOut'
            })
            .start();

        cc.tween(popupNode)
            .to(0.5, {
                opacity: 0
            }, {
                easing: 'sineIn'
            })
            .call(() => {
                this.removePopup(popupNode);
            })
            .start();
    }

    private removePopup(popupNode: cc.Node): void {
        const index = this.activePopups.indexOf(popupNode);
        if (index > -1) {
            this.activePopups.splice(index, 1);
        }
        
        if (cc.isValid(popupNode)) {
            popupNode.destroy();
        }
    }
} 