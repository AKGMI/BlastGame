import { TileType } from "../../features/tiles/TileTypes";
import { TileUtils } from "../../shared/utils/TileUtils";

const { ccclass, property } = cc._decorator;

@ccclass
export default class TileView extends cc.Component {
    
    @property(cc.SpriteFrame)
    redSprite: cc.SpriteFrame = null;
    
    @property(cc.SpriteFrame)
    blueSprite: cc.SpriteFrame = null;
    
    @property(cc.SpriteFrame)
    greenSprite: cc.SpriteFrame = null;
    
    @property(cc.SpriteFrame)
    yellowSprite: cc.SpriteFrame = null;
    
    @property(cc.SpriteFrame)
    purpleSprite: cc.SpriteFrame = null;
    
    @property(cc.SpriteFrame)
    superRowSprite: cc.SpriteFrame = null;
    
    @property(cc.SpriteFrame)
    superColumnSprite: cc.SpriteFrame = null;
    
    @property(cc.SpriteFrame)
    superBombSprite: cc.SpriteFrame = null;
    
    @property(cc.SpriteFrame)
    superAllSprite: cc.SpriteFrame = null;
    
    private type: TileType = null;
    private row: number = -1;
    private col: number = -1;
    private zIndex: number;
    private pulseTween: cc.Tween = null;
    
    onLoad() {
        this.node.on(cc.Node.EventType.TOUCH_END, this.onTileClicked, this);
    }
    
    public setType(type: TileType): void {
        this.type = type;
        this.updateSprite();
    }
    
    public setGridPosition(row: number, col: number): void {
        this.row = row;
        this.col = col;
    }
    
    private updateSprite(): void {
        const sprite = this.getComponent(cc.Sprite);
        if (!sprite) return;
        
        switch (this.type) {
            case TileType.RED:
                sprite.spriteFrame = this.redSprite;
                break;
            case TileType.BLUE:
                sprite.spriteFrame = this.blueSprite;
                break;
            case TileType.GREEN:
                sprite.spriteFrame = this.greenSprite;
                break;
            case TileType.YELLOW:
                sprite.spriteFrame = this.yellowSprite;
                break;
            case TileType.PURPLE:
                sprite.spriteFrame = this.purpleSprite;
                break;
            case TileType.SUPER_ROW:
                sprite.spriteFrame = this.superRowSprite;
                break;
            case TileType.SUPER_COLUMN:
                sprite.spriteFrame = this.superColumnSprite;
                break;
            case TileType.SUPER_BOMB:
                sprite.spriteFrame = this.superBombSprite;
                break;
            case TileType.SUPER_ALL:
                sprite.spriteFrame = this.superAllSprite;
                break;
        }
        
        if (TileUtils.isSuperTile(this.type)) {
            this.addPulseEffect();
        } else {
            this.removePulseEffect();
        }
    }
    
    private addPulseEffect(): void {
        this.removePulseEffect();
        
        this.pulseTween = cc.tween(this.node)
            .repeatForever(
                cc.tween()
                    .to(0.8, { scale: 1.1 }, { easing: 'sineInOut' })
                    .to(0.8, { scale: 1.0 }, { easing: 'sineInOut' })
            )
            .start();
    }
    
    private removePulseEffect(): void {
        if (this.pulseTween) {
            this.pulseTween.stop();
            this.pulseTween = null;
        }
        
        this.node.scale = 1.0;
    }
    
    private onTileClicked(): void {        
        if (typeof this.row === 'undefined' || typeof this.col === 'undefined' || this.row === -1 || this.col === -1) {
            console.error(`[TileView.onTileClicked] row (${this.row}) или col (${this.col}) не установлены!`);
            return;
        }
        
        const eventData = { row: this.row, col: this.col };
        const customEvent = new cc.Event.EventCustom('tile-clicked', true);
        customEvent.setUserData(eventData);
        
        this.node.dispatchEvent(customEvent);
    }
    
    public getType(): TileType {
        return this.type;
    }
    
    public getRow(): number {
        return this.row;
    }
    
    public getCol(): number {
        return this.col;
    }
    
    public getGridPosition(): { row: number, col: number } {
        return { row: this.row, col: this.col };
    }

    public liftUp(): void {
        cc.Tween.stopAllByTarget(this.node);
        
        this.zIndex = this.node.zIndex;
        this.node.zIndex = 1000;
        
        cc.tween(this.node)
            .to(0.2, { 
                scale: 1.1,
                y: this.node.y + 10
            }, { 
                easing: 'backOut' 
            })
            .start();
        
        cc.tween(this.node)
            .delay(0.2)
            .then(
                cc.tween()
                    .repeatForever(
                        cc.tween()
                            .to(0.3, { scale: 1.15 })
                            .to(0.3, { scale: 1.1 })
                    )
            )
            .start();
    }

    public putDown(): void {
        cc.Tween.stopAllByTarget(this.node);
        
        this.node.zIndex = this.zIndex;
        
        cc.tween(this.node)
            .to(0.2, { 
                scale: 1.0,
                y: this.node.y - 10
            }, { 
                easing: 'sineIn' 
            })
            .call(() => {
                if (TileUtils.isSuperTile(this.type)) {
                    this.addPulseEffect();
                }
            })
            .start();
    }

    public isLifted(): boolean {
        return this.node.zIndex === 1000;
    }

    onDestroy() {
        this.removePulseEffect();
        cc.Tween.stopAllByTarget(this.node);
    }
} 