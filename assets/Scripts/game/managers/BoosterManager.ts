import { IPosition } from "../../shared/primitives";
import { IBoosterStrategy, IBoosterResult, BoosterType } from "../../features/boosters/BoostersTypes";
import { BoosterInventory } from "../models/BoosterInventory";

import { BombBoosterStrategy } from "../../features/boosters/strategies/BombBoosterStrategy";
import { SwapBoosterStrategy } from "../../features/boosters/strategies/SwapBoosterStrategy";

export class BoosterManager {
    private strategies: Map<BoosterType, IBoosterStrategy> = new Map();
    private activeStrategy: IBoosterStrategy | null = null;
    private inventory: BoosterInventory;

    constructor() {
        this.inventory = new BoosterInventory();
        this.registerStrategies();
    }

    private registerStrategies(): void {
        this.strategies.set(BoosterType.BOMB, new BombBoosterStrategy());
        this.strategies.set(BoosterType.SWAP, new SwapBoosterStrategy());
    }

    activateBooster(type: BoosterType): boolean {
        if (!this.inventory.hasBooster(type)) {
            return false;
        }

        const strategy = this.strategies.get(type);
        if (!strategy) {
            return false;
        }

        if (this.activeStrategy) {
            this.activeStrategy.reset();
        }

        this.activeStrategy = strategy;
        return true;
    }

    handleClick(board: any, position: IPosition): IBoosterResult {
        if (!this.activeStrategy) {
            return { success: false, needsSecondClick: false };
        }

        const result = this.activeStrategy.activate(board, position);

        if (result.success && !result.needsSecondClick) {
            this.inventory.consumeBooster(this.activeStrategy.type);
            this.deactivateBooster();
        }

        return result;
    }

    deactivateBooster(): void {
        if (this.activeStrategy) {
            this.activeStrategy.reset();
            this.activeStrategy = null;
        }
    }

    getActiveBoosterType(): BoosterType | null {
        return this.activeStrategy ? this.activeStrategy.type : null;
    }

    getBoosterHint(): string {
        if (!this.activeStrategy) {
            return '';
        }
        return this.activeStrategy.getHintMessage();
    }

    needsSecondClick(): boolean {
        return this.activeStrategy ? this.activeStrategy.needsSecondClick() : false;
    }

    hasBooster(type: BoosterType): boolean {
        return this.inventory.hasBooster(type);
    }

    getBoosterCount(type: BoosterType): number {
        return this.inventory.getBoosterCount(type);
    }

    addBoosters(type: BoosterType, count: number): void {
        this.inventory.addBoosters(type, count);
    }

    getAllBoosterCounts(): Record<BoosterType, number> {
        return this.inventory.getAllBoosterCounts();
    }

    reset(): void {
        this.deactivateBooster();
        this.inventory.reset();
    }
} 