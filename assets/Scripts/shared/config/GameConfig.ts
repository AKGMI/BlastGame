export interface ILevelConfig {
    boardRows: number;
    boardCols: number;
    targetScore: number;
    totalMoves: number;
    
    minimumGroupSize: number;
    maxShuffles: number;
}

export interface IConfigProvider {
    getCurrentLevelConfig(): ILevelConfig;
    onLevelCompleted(score: number, movesUsed: number): void;
    onLevelFailed(score: number): void;
}

class LocalConfigProvider implements IConfigProvider {
    private config: ILevelConfig;
    
    constructor(config?: Partial<ILevelConfig>) {
        this.config = {
            boardRows: 8,
            boardCols: 8,
            
            targetScore: 10000,
            totalMoves: 30,
            
            minimumGroupSize: 2,
            maxShuffles: 3,
        };
        
        if (config) {
            this.config = { ...this.config, ...config };
        }
    }
    
    getCurrentLevelConfig(): ILevelConfig {
        return { ...this.config };
    }
    
    onLevelCompleted(score: number, movesUsed: number): void {
        console.log(`[LocalConfigProvider] Уровень завершен: ${score} очков за ${movesUsed} ходов`);
    }
    
    onLevelFailed(score: number): void {
        console.log(`[LocalConfigProvider] Уровень провален с результатом: ${score} очков`);
    }
    
    public updateConfig(newConfig: Partial<ILevelConfig>): void {
        this.config = { ...this.config, ...newConfig };
    }
}

export class GameConfig {
    private static instance: GameConfig;
    private configProvider: IConfigProvider;
    
    private constructor() {
        this.configProvider = new LocalConfigProvider();
    }
    
    public static getInstance(): GameConfig {
        if (!GameConfig.instance) {
            GameConfig.instance = new GameConfig();
        }
        return GameConfig.instance;
    }
    
    public getCurrentLevel(): ILevelConfig {
        return this.configProvider.getCurrentLevelConfig();
    }
    
    public onLevelCompleted(score: number, movesUsed: number): void {
        this.configProvider.onLevelCompleted(score, movesUsed);
    }
    
    public onLevelFailed(score: number): void {
        this.configProvider.onLevelFailed(score);
    }
    
    public updateConfig(newConfig: Partial<ILevelConfig>): void {
        if (this.configProvider instanceof LocalConfigProvider) {
            this.configProvider.updateConfig(newConfig);
        }
    }
    
    public setConfigProvider(provider: IConfigProvider): void {
        this.configProvider = provider;
    }
    
    public static createLocalProvider(config?: Partial<ILevelConfig>): IConfigProvider {
        return new LocalConfigProvider(config);
    }
    
    public static getTestConfig(): Partial<ILevelConfig> {
        return {
            boardRows: 6,
            boardCols: 6,
            targetScore: 300,
            totalMoves: 15,
            minimumGroupSize: 2,
            maxShuffles: 1
        };
    }
    
    public static getBigFieldConfig(): Partial<ILevelConfig> {
        return {
            boardRows: 10,
            boardCols: 10,
            targetScore: 2000,
            totalMoves: 50,
            minimumGroupSize: 2,
            maxShuffles: 5
        };
    }
} 