import { BoosterType } from "../../features/boosters/BoostersTypes";

export class BoosterInventory {
    private inventory: Map<BoosterType, number> = new Map();

    constructor() {
        this.initializeInventory();
    }

    private initializeInventory(): void {
        this.inventory.set(BoosterType.BOMB, 3);
        this.inventory.set(BoosterType.SWAP, 3);
    }

    public hasBooster(type: BoosterType): boolean {
        const count = this.inventory.get(type) || 0;
        return count > 0;
    }

    public getBoosterCount(type: BoosterType): number {
        return this.inventory.get(type) || 0;
    }

    public addBoosters(type: BoosterType, count: number): void {
        const currentCount = this.inventory.get(type) || 0;
        this.inventory.set(type, currentCount + count);
    }

    public consumeBooster(type: BoosterType): boolean {
        const currentCount = this.inventory.get(type) || 0;
        if (currentCount > 0) {
            this.inventory.set(type, currentCount - 1);
            return true;
        }
        return false;
    }

    public getAllBoosterCounts(): Record<BoosterType, number> {
        const counts: Record<BoosterType, number> = {} as any;
        
        this.inventory.forEach((count, type) => {
            counts[type] = count;
        });
        
        return counts;
    }

    public reset(): void {
        this.initializeInventory();
    }
} 