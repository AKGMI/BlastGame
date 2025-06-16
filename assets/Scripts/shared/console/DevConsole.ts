import { IGameController, IGameCoordinator } from "../../core/types";
import { BoosterType } from "../../features/boosters/BoostersTypes";
import { GameConfig } from "../config/GameConfig";
import { ToastManager } from "../../ui/managers/ToastManager";
import { GameServiceContainer } from "../../core/GameServiceContainer";
import GameController from "../../core/GameController";

export class DevConsole {
    private gameController: IGameController;
    private gameCoordinator: IGameCoordinator;
    private gameConfig: GameConfig;
    private serviceContainer: GameServiceContainer;

    constructor(gameController: IGameController, gameCoordinator: IGameCoordinator) {
        this.gameController = gameController;
        this.gameCoordinator = gameCoordinator;
        this.serviceContainer = GameServiceContainer.getGameInstance();
        this.gameConfig = this.serviceContainer.getGameConfig();
    }

    public setupCommands(): void {
        this.registerCommands();
        this.printAvailableCommands();
    }

    private registerCommands(): void {
        (window as any).restartGame = () => this.restartGame();

        (window as any).testBigField = () => this.testBigField();
        (window as any).testSmallField = () => this.testSmallField();

        (window as any).addBombs = (count: number) => this.addBombs(count);
        (window as any).addSwaps = (count: number) => this.addSwaps(count);

        (window as any).testWin = () => this.testWin();
        (window as any).testLose = () => this.testLose();
        (window as any).addScore = (points: number) => this.addScore(points);
        (window as any).setMoves = (count: number) => this.setMoves(count);
        (window as any).addMoves = (count: number) => this.addMoves(count);

        (window as any).showStats = () => this.showStats();

        (window as any).testToastSuccess = () => this.testToastSuccess();
        (window as any).testToastError = () => this.testToastError();
        (window as any).testToastInfo = () => this.testToastInfo();
        (window as any).testToastWarning = () => this.testToastWarning();
        (window as any).testToastQueue = () => this.testToastQueue();
        (window as any).clearToasts = () => this.clearToasts();

        (window as any).printBoard = (title?: string) => this.printBoard(title);
        (window as any).printBoardStats = () => this.printBoardStats();
    }

    private printAvailableCommands(): void {
        let message = '🎮 Доступные консольные команды:\n';

        message += '📏 Размер поля:\n';
        message += '  testSmallField() - поле 6x6\n';
        message += '  testBigField() - поле 10x10\n';
        message += '💣 Бустеры:\n';
        message += '  addBombs(count) - добавить N бомб\n';
        message += '  addSwaps(count) - добавить N свапов\n';
        message += '🎯 Игровое состояние:\n';
        message += '  testWin() - мгновенная победа\n';
        message += '  testLose() - мгновенное поражение\n';
        message += '  addScore(points) - добавить очки\n';
        message += '  setMoves(count) - установить ходы\n';
        message += '  addMoves(count) - добавить ходы\n';
        message += '🔄 Утилиты:\n';
        message += '  restartGame() - перезапуск\n';
        message += '  showStats() - показать статистику\n';
        message += '🎨 Визуализация доски:\n';
        message += '  printBoard(title?) - отрисовать доску в консоли\n';
        message += '  printBoardStats() - статистика доски\n';
        message += '🍞 Toast уведомления:\n';
        message += '  testToastSuccess() - тест успешного уведомления\n';
        message += '  testToastError() - тест ошибки\n';
        message += '  testToastInfo() - тест информации\n';
        message += '  testToastWarning() - тест предупреждения\n';
        message += '  testToastQueue() - тест очереди (5 toast\'ов)\n';
        message += '  clearToasts() - очистить все toast\'ы';

        console.log(message);
    }
    
    private testSmallField(): void {
        this.gameConfig.updateConfig(GameConfig.getTestConfig());
        this.gameCoordinator.restartGame();
    }

    private testBigField(): void {
        this.gameConfig.updateConfig({
            boardRows: 10,
            boardCols: 10,
            targetScore: 2000,
            totalMoves: 50,
            maxShuffles: 5
        });
        this.gameCoordinator.restartGame();
    }

    private addBombs(count: number): void {
        console.log(`[DevConsole] 💣 Добавляем ${count} бомб`);
        this.serviceContainer.getBoosterManager().addBoosters(BoosterType.BOMB, count);
        (this.gameController as GameController).updateUI();
    }

    private addSwaps(count: number): void {
        console.log(`[DevConsole] 🔄 Добавляем ${count} свапов`);
        this.serviceContainer.getBoosterManager().addBoosters(BoosterType.SWAP, count);
        (this.gameController as GameController).updateUI();
    }

    private testWin(): void {
        console.log('[DevConsole] 🏆 Мгновенная победа!');
        const scoreManager = this.gameController.getGameModel().getScoreManager();
        const targetScore = scoreManager.getTargetScore();
        const currentScore = scoreManager.getScore();
        const pointsNeeded = targetScore - currentScore + 100;
        
        scoreManager.addScore(pointsNeeded);
        (this.gameController as GameController).updateUI();
        (this.gameController as GameController).checkAndHandleGameState();
    }

    private testLose(): void {
        console.log('[DevConsole] 💀 Мгновенное поражение!');
        const movesManager = this.gameController.getGameModel().getMovesManager();
        
        while (movesManager.getMovesLeft() > 0) {
            movesManager.useMove();
        }
        
        (this.gameController as GameController).updateUI();
        (this.gameController as GameController).checkAndHandleGameState();
    }

    private addScore(points: number): void {
        console.log(`[DevConsole] ⭐ Добавляем ${points} очков`);
        const scoreManager = this.gameController.getGameModel().getScoreManager();
        scoreManager.addScore(points);
        (this.gameController as GameController).updateUI();
    }

    private setMoves(count: number): void {
        console.log(`[DevConsole] 🎯 Устанавливаем ${count} ходов`);
        const movesManager = this.gameController.getGameModel().getMovesManager();
        const currentMoves = movesManager.getMovesLeft();

        movesManager.addMoves(count - currentMoves);
        
        (this.gameController as GameController).updateUI();
    }

    private addMoves(count: number): void {
        console.log(`[DevConsole] ➕ Добавляем ${count} ходов`);
        const movesManager = this.gameController.getGameModel().getMovesManager();
        movesManager.addMoves(count);
        (this.gameController as GameController).updateUI();
    }

    private restartGame(): void {
        this.gameCoordinator.restartGame();
    }

    private showStats(): void {       
        const gameModel = this.gameController.getGameModel();
        const scoreManager = gameModel.getScoreManager();
        const movesManager = gameModel.getMovesManager();
        const gameBoard = gameModel.getGameBoard();
        const boosterManager = this.serviceContainer.getBoosterManager();

        let message = '📊 === СТАТИСТИКА ИГРЫ ===\n';
        
        message += `🎯 Счет: ${scoreManager.getScore()}/${scoreManager.getTargetScore()}\n`;
        message += `🎮 Ходы: ${movesManager.getMovesLeft()}/${movesManager.getTotalMoves()}\n`;
        message += `🎲 Перемешивания: ${gameModel.getShufflesLeft()}/3\n`;
        message += `📏 Размер поля: ${gameBoard.rows}x${gameBoard.cols}\n`;
        message += `💣 Бомбы: ${boosterManager.getBoosterCount(BoosterType.BOMB)}\n`;
        message += `🔄 Свапы: ${boosterManager.getBoosterCount(BoosterType.SWAP)}\n`;
        message += `🎮 Состояние: ${gameModel.getGameState() === 0 ? 'Playing' : gameModel.getGameState() === 1 ? 'WON' : 'LOST'}\n`;

        message += '===========================';

        console.log(message);
    }

    private testToastSuccess(): void {
        const toastManager = ToastManager.getInstance();
        toastManager.showSuccess('🎉 Отличная работа! Вы набрали много очков!');
    }

    private testToastError(): void {
        const toastManager = ToastManager.getInstance();
        toastManager.showError('❌ Ошибка! Недостаточно ходов для завершения уровня');
    }

    private testToastInfo(): void {
        const toastManager = ToastManager.getInstance();
        toastManager.showInfo('ℹ️ Совет: Попробуйте создать супертайлы для больших очков');
    }

    private testToastWarning(): void {
        const toastManager = ToastManager.getInstance();
        toastManager.showWarning('⚠️ Внимание! У вас осталось мало ходов');
    }

    private testToastQueue(): void {
        const toastManager = ToastManager.getInstance();
        toastManager.showSuccess('Toast 1: Успех!');
        toastManager.showError('Toast 2: Ошибка!');
        toastManager.showInfo('Toast 3: Информация!');
        toastManager.showWarning('Toast 4: Предупреждение!');
        toastManager.showSuccess('Toast 5: Еще один успех!');
    }

    private clearToasts(): void {
        const toastManager = ToastManager.getInstance();
        toastManager.clear();
        console.log('🧹 Все toast уведомления очищены');
    }

    private printBoard(title?: string): void {
        console.log('[DevConsole] 🎨 Отрисовка доски в консоли');
        const gameBoard = this.gameController.getGameModel().getGameBoard();
        gameBoard.printBoard(title);
    }

    private printBoardStats(): void {
        console.log('[DevConsole] 📊 Статистика доски');
        const gameBoard = this.gameController.getGameModel().getGameBoard();
        gameBoard.printBoardStats();
    }

    public destroy(): void {
        delete (window as any).restartGame;
        delete (window as any).testBigField;
        delete (window as any).testSmallField;
        delete (window as any).addBombs;
        delete (window as any).addSwaps;
        delete (window as any).testWin;
        delete (window as any).testLose;
        delete (window as any).addScore;
        delete (window as any).setMoves;
        delete (window as any).addMoves;
        delete (window as any).showStats;
        delete (window as any).testToastSuccess;
        delete (window as any).testToastError;
        delete (window as any).testToastInfo;
        delete (window as any).testToastWarning;
        delete (window as any).testToastQueue;
        delete (window as any).clearToasts;
        delete (window as any).printBoard;
        delete (window as any).printBoardStats;
    }
} 