import { ServiceContainer } from "./ServiceContainer";
import { TileFactory } from "../features/tiles/TileFactory";
import { EventBus } from "./EventBus";
import { AnimationService } from "../game/services/AnimationService";
import { BoosterManager } from "../game/managers/BoosterManager";
import { GameConfig } from "../shared/config/GameConfig";
import { UICommandService } from "../game/managers/UICommandService";
import { CoordinateService } from "../game/services/CoordinateService";
import { SwapVisualService } from "../game/services/SwapVisualService";
import { ChainReactionService } from "../game/services/ChainReactionService";
import { HintService } from "../game/services/HintService";

export class GameServiceContainer extends ServiceContainer {
    private static gameInstance: GameServiceContainer;

    public static getGameInstance(): GameServiceContainer {
        if (!GameServiceContainer.gameInstance) {
            GameServiceContainer.gameInstance = new GameServiceContainer();
            GameServiceContainer.gameInstance.configureServices();
        }
        return GameServiceContainer.gameInstance;
    }

    configureServices(): void {
        this.registerSingleton('TileFactory', () => TileFactory.getInstance());
        this.registerSingleton('GameConfig', () => GameConfig.getInstance());

        this.registerSingleton('EventBus', () => EventBus.getInstance());
        this.registerSingleton('AnimationService', () => new AnimationService());
        this.registerSingleton('UICommandService', () => new UICommandService());
        this.registerSingleton('CoordinateService', () => CoordinateService.getInstance());
        this.registerSingleton('SwapVisualService', () => SwapVisualService.getInstance());
        this.registerSingleton('ChainReactionService', () => ChainReactionService.getInstance());
        this.registerSingleton('HintService', () => new HintService());

        this.register('BoosterManager', () => new BoosterManager());
    }

    getTileFactory(): TileFactory {
        return this.resolve<TileFactory>('TileFactory');
    }

    getEventBus(): EventBus {
        return this.resolve<EventBus>('EventBus');
    }

    getAnimationService(): AnimationService {
        return this.resolve<AnimationService>('AnimationService');
    }

    getBoosterManager(): BoosterManager {
        return this.resolve<BoosterManager>('BoosterManager');
    }

    getGameConfig(): GameConfig {
        return this.resolve<GameConfig>('GameConfig');
    }

    getUICommandService(): UICommandService {
        return this.resolve<UICommandService>('UICommandService');
    }

    getCoordinateService(): CoordinateService {
        return this.resolve<CoordinateService>('CoordinateService');
    }

    getSwapVisualService(): SwapVisualService {
        return this.resolve<SwapVisualService>('SwapVisualService');
    }

    getChainReactionService(): ChainReactionService {
        return this.resolve<ChainReactionService>('ChainReactionService');
    }

    getHintService(): HintService {
        return this.resolve<HintService>('HintService');
    }

    static reset(): void {
        if (GameServiceContainer.gameInstance) {
            GameServiceContainer.gameInstance.clear();
            GameServiceContainer.gameInstance = null;
        }
    }
} 