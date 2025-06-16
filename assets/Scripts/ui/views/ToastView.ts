import { IToastConfig, ToastType } from "../UITypes";
import { EventBus, UICommands } from "../../core/EventBus";
import { ToastManager } from "../managers/ToastManager";
import { ZIndexConstants } from "../../shared/constants/ZIndexConstants";

const { ccclass, property } = cc._decorator;

@ccclass
export default class ToastView extends cc.Component {
    
    @property(cc.Node)
    toastContainer: cc.Node = null;
    
    @property(cc.Prefab)
    toastPrefab: cc.Prefab = null;
    
    private eventBus: EventBus;
    private activeToasts: cc.Node[] = [];
    private toastManager: ToastManager;
    
    onLoad() {
        this.eventBus = EventBus.getInstance();
        this.toastManager = ToastManager.getInstance();
        this.setupEventListeners();
        
        if (!this.toastContainer) {
            console.error('[ToastView] toastContainer не назначен!');
        } else {
            this.toastContainer.zIndex = ZIndexConstants.TOAST_MESSAGES;
        }
    }
    
    private setupEventListeners(): void {
        this.eventBus.subscribe(UICommands.TOAST_SHOW, this.onShowToast, this);
        this.eventBus.subscribe(UICommands.TOAST_CLEAR_ALL, this.onClearAll, this);
    }
    
    private onShowToast(config: IToastConfig): void {
        this.createToast(config);
    }
    
    private onClearAll(): void {
        this.activeToasts.forEach(toast => {
            if (toast && cc.isValid(toast)) {
                toast.destroy();
            }
        });
        this.activeToasts = [];
    }
    
    private createToast(config: IToastConfig): void {
        if (!this.toastContainer) {
            console.error('[ToastView] Нет контейнера для toast\'ов');
            return;
        }
        
        const toastNode = cc.instantiate(this.toastPrefab)
            
        if (!toastNode) {
            console.error('[ToastView] Не удалось создать toast node');
            return;
        }
        
        this.setupToast(toastNode, config);
        
        this.toastContainer.addChild(toastNode);
        this.activeToasts.push(toastNode);
        
        this.positionToast(toastNode, config.position || 'top');
        this.animateToastIn(toastNode);
        
        if (config.duration && config.duration > 0) {
            this.scheduleToastHide(toastNode, config.duration);
        }
    }
    
    private setupToast(toastNode: cc.Node, config: IToastConfig): void {
        toastNode.name = `Toast_${config.type}_${Date.now()}`;

        const overlay = toastNode.getChildByName('Overlay');
        const message = toastNode.getChildByName('Message');
        message.getComponent(cc.Label).string = config.message;

        this.scheduleOnce(() => {
            const size = message.getContentSize()
            overlay.setContentSize(size.width + 100, size.height + 50);
        }, 0);
        
        toastNode['toastConfig'] = config;
    }
    
    private positionToast(toastNode: cc.Node, position: string): void {
        const containerSize = this.toastContainer.getContentSize();
        const toastSize = toastNode.getContentSize();
        
        let yPosition = 0;
        switch (position) {
            case 'top':
                yPosition = containerSize.height / 2 - toastSize.height / 2 - 20;
                break;
            case 'center':
                yPosition = 0;
                break;
            case 'bottom':
                yPosition = -containerSize.height / 2 + toastSize.height / 2 + 20;
                break;
        }
        
        const samePositionToasts = this.activeToasts.filter(toast => {
            const config = toast['toastConfig'] as IToastConfig;
            return config && config.position === position;
        });
        
        yPosition -= (samePositionToasts.length - 1) * (toastSize.height + 10);
        
        toastNode.setPosition(0, yPosition);
    }
    
    private animateToastIn(toastNode: cc.Node): void {
        toastNode.opacity = 0;
        toastNode.scale = 0.8;
        
        cc.tween(toastNode)
            .to(0.3, { 
                opacity: 255, 
                scale: 1 
            }, { 
                easing: 'backOut' 
            })
            .start();
    }
    
    private animateToastOut(toastNode: cc.Node, callback?: () => void): void {
        cc.tween(toastNode)
            .to(0.2, { 
                opacity: 0, 
                scale: 0.8 
            }, { 
                easing: 'backIn' 
            })
            .call(() => {
                if (callback) callback();
            })
            .start();
    }
    
    private scheduleToastHide(toastNode: cc.Node, duration: number): void {
        setTimeout(() => {
            this.hideToast(toastNode);
        }, duration * 1000);
    }
    
    private hideToast(toastNode: cc.Node): void {
        if (!toastNode || !cc.isValid(toastNode)) return;
        
        this.animateToastOut(toastNode, () => {
            const index = this.activeToasts.indexOf(toastNode);
            if (index > -1) {
                this.activeToasts.splice(index, 1);
            }
            
            if (cc.isValid(toastNode)) {
                toastNode.destroy();
            }
            
            this.toastManager.onToastClosed();
        });
    }
    
    onDestroy() {
        if (this.eventBus) {
            this.eventBus.unsubscribe(UICommands.TOAST_SHOW, this.onShowToast, this);
            this.eventBus.unsubscribe(UICommands.TOAST_CLEAR_ALL, this.onClearAll, this);
        }
        
        this.onClearAll();
    }
} 