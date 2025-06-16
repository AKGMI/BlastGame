import { IToastManager, IToastConfig, ToastType } from "../UITypes";
import { EventBus, UICommands } from "../../core/EventBus";

export class ToastManager implements IToastManager {
    private static instance: ToastManager;
    private eventBus: EventBus;
    private toastQueue: IToastConfig[] = [];
    private activeToasts: number = 0;
    private maxActiveToasts: number = 1;

    private constructor() {
        this.eventBus = EventBus.getInstance();
    }

    public static getInstance(): ToastManager {
        if (!ToastManager.instance) {
            ToastManager.instance = new ToastManager();
        }
        return ToastManager.instance;
    }

    public show(config: IToastConfig): void {
        const toastConfig: IToastConfig = {
            duration: 1.5,
            showCloseButton: false,
            position: 'top',
            ...config
        };

        if (this.activeToasts < this.maxActiveToasts) {
            this.displayToast(toastConfig);
        } else {
            this.toastQueue.push(toastConfig);
        }
    }

    public showSuccess(message: string, duration: number = 3): void {
        this.show({
            message,
            type: ToastType.SUCCESS,
            duration
        });
    }

    public showError(message: string, duration: number = 5): void {
        this.show({
            message,
            type: ToastType.ERROR,
            duration,
            showCloseButton: true
        });
    }

    public showInfo(message: string, duration: number = 3): void {
        this.show({
            message,
            type: ToastType.INFO,
            duration
        });
    }

    public showWarning(message: string, duration: number = 4): void {
        this.show({
            message,
            type: ToastType.WARNING,
            duration
        });
    }

    public clear(): void {
        this.toastQueue = [];
        this.eventBus.publish(UICommands.TOAST_CLEAR_ALL);
        this.activeToasts = 0;
    }

    private displayToast(config: IToastConfig): void {
        this.activeToasts++;
        
        this.eventBus.publish(UICommands.TOAST_SHOW, config);

        if (config.duration && config.duration > 0) {
            setTimeout(() => {
                this.hideToast();
            }, config.duration * 1000);
        }
    }

    private hideToast(): void {
        this.activeToasts = Math.max(0, this.activeToasts - 1);
        
        if (this.toastQueue.length > 0 && this.activeToasts < this.maxActiveToasts) {
            const nextToast = this.toastQueue.shift();
            if (nextToast) {
                this.displayToast(nextToast);
            }
        }
    }

    public onToastClosed(): void {
        this.hideToast();
    }
} 