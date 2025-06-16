import { IGameController } from "./types";
import { IGameModel } from "../game/GameTypes";
import { GameServiceContainer } from "./GameServiceContainer";
import { BoosterManager } from "../game/managers/BoosterManager";
import { UICommandService } from "../game/managers/UICommandService";
import { GameConfig } from "../shared/config/GameConfig";
import { AnimationService } from "../game/services/AnimationService";
import { GameModel } from "../game/models/GameModel";
import { TileUtils } from "../shared/utils/TileUtils";
import {HintService} from "../game/services/HintService";
import { ChainReactionService } from "../game/services/ChainReactionService";
import { IPosition } from "../shared/primitives";
import { TileType } from "../features/tiles/TileTypes";

const { ccclass } = cc._decorator;

@ccclass
export default class GameController implements IGameController {
    private gameModel: IGameModel;
    private boosterManager: BoosterManager;
    private UICommandService: UICommandService;
    private animationService: AnimationService;
    private hintService: HintService;
    private gameConfig: GameConfig;
    private pendingGameStateCheck: boolean = false;

    constructor() {       
        const serviceContainer = GameServiceContainer.getGameInstance();
        this.animationService = serviceContainer.getAnimationService();
        this.UICommandService = serviceContainer.getUICommandService();
        this.gameConfig = serviceContainer.getGameConfig();
        this.boosterManager = serviceContainer.getBoosterManager();
        this.hintService = serviceContainer.getHintService();

        setTimeout(() => {
            this.initializeGame();
        }, 0);
    }

    initializeGame(): void {
        this.initializeBoard();
        this.updateUI();
    }

    private initializeBoard(): void {
        const config = this.gameConfig.getCurrentLevel();
        
        this.gameModel = new GameModel(
            config.boardRows,
            config.boardCols,
            config.targetScore,
            config.totalMoves
        );
        
        this.UICommandService.initializeBoard(
            config.boardRows,
            config.boardCols,
            (row: number, col: number) => {
                const tile = this.gameModel.getGameBoard().getTile(row, col);
                const type = tile ? tile.type : null;
                return type;
            }
        );
    }

    private completeMoveSequence(moveResult?: any): void {
        if (moveResult) {
            this.UICommandService.reportMoveResult(moveResult);
            
            if (moveResult.points > 0 && moveResult.explosionCenter) {
                this.UICommandService.showScorePopup(moveResult.points, moveResult.explosionCenter, moveResult);
            }
        }

        this.updateUI();
        
        this.pendingGameStateCheck = true;
        
        if (!this.animationService.isProcessing) {
            this.checkPendingGameState();
        }
    }

    public updateUI(): void {
        if (!this.UICommandService || !this.gameModel) return;
        
        const scoreManager = this.gameModel.getScoreManager();
        const movesManager = this.gameModel.getMovesManager();
        
        this.UICommandService.updateScore(scoreManager.getScore(), scoreManager.getTargetScore());
        this.UICommandService.updateMoves(movesManager.getMovesLeft());
        this.UICommandService.updateShuffles(this.gameModel.getShufflesLeft());
        this.UICommandService.updateBoosters(this.boosterManager.getAllBoosterCounts());
    }

    public checkAndHandleGameState(): void {
        if (!this.gameModel) return;
        
        this.gameModel.checkGameState();
        
        const gameState = this.gameModel.getGameState();
        if (gameState !== 0) {
            setTimeout(() => {
                const scoreManager = this.gameModel.getScoreManager();
                const message = gameState === 1 ? 'Победа!' : 'Поражение!';
                
                this.UICommandService.showGameOver(
                    message,
                    scoreManager.getScore(),
                    scoreManager.getTargetScore()
                );
            }, 1000);
        } else {
            this.gameModel.checkNeedShuffle();
        }
    }

    public handleNeedShuffle(): void {      
        const model = this.gameModel;
        
        if (model.getShufflesLeft() > 0) {
            this.UICommandService.showMessage('Нет доступных ходов!\nПеремешиваем поле...', 2.5);
            
            const performShuffle = () => {
                model.shuffleBoard();
                
                const gameBoard = model.getGameBoard();
                this.UICommandService.reportShuffleEvent({
                    reason: 'auto',
                    boardData: {
                        rows: gameBoard.rows,
                        cols: gameBoard.cols,
                        getTileType: (row: number, col: number) => {
                            const tile = gameBoard.getTile(row, col);
                            return tile ? tile.type : null;
                        }
                    }
                });
                
                this.updateUI();
            };

            this.waitForAnimationsToComplete(() => {
                setTimeout(performShuffle, 1000);
            }, performShuffle);
        } else {
            const showGameOver = () => {
                this.UICommandService.showGameOver(
                    'ПОРАЖЕНИЕ!',
                    model.getScoreManager().getScore(),
                    model.getScoreManager().getTargetScore()
                );
            };

            this.waitForAnimationsToComplete(showGameOver);
        }
    }

    private waitForAnimationsToComplete(callbackWithDelay: () => void, callbackImmediate?: () => void): void {
        if (this.animationService.isProcessing) {
            const waitForAnimations = () => {
                if (this.animationService.isProcessing) {
                    setTimeout(waitForAnimations, 100);
                } else {
                    callbackWithDelay();
                }
            };
            waitForAnimations();
        } else {
            if (callbackImmediate) {
                callbackImmediate();
            } else {
                callbackWithDelay();
            }
        }
    }

    public handleHintRequest(): void {
        if (!this.gameModel || this.gameModel.getGameState() !== 0) {
            return;
        }
        
        const availableHint = this.findAvailableHint();
        
        if (availableHint && availableHint.length > 0) {
            this.hintService.showHint(availableHint);
        }
    }
    
    private findAvailableHint(): { row: number, col: number }[] {
        const gameBoard = this.gameModel.getGameBoard();
        
        for (let row = 0; row < gameBoard.rows; row++) {
            for (let col = 0; col < gameBoard.cols; col++) {
                const tile = gameBoard.getTile(row, col);
                if (!tile) continue;
                
                if (tile.canActivate(gameBoard)) {
                    const targets = tile.getTargets(gameBoard);
                    
                    if (TileUtils.isSuperTile(tile.type)) {
                        return [{ row, col }];
                    }
                    
                    return targets;
                }
            }
        }
        
        return [];
    }

    public handleTileClick(row: number, col: number): void {
        if (this.animationService.isProcessing) {
            console.log('[GameController] Анимация в процессе, клик игнорируется');
            return;
        }

        const activeBoosterType = this.boosterManager.getActiveBoosterType();
        if (activeBoosterType !== null) {
            this.processBoosterClick(row, col);
        } else {
            this.processRegularClick(row, col);
        }
    }

    private processRegularClick(row: number, col: number): void {
        const gameResult = this.gameModel.handleTileClick(row, col);
        
        this.completeMoveSequence(gameResult);
    }

    private processBoosterClick(row: number, col: number): void {
        const boosterResult = this.boosterManager.handleClick(
            this.gameModel.getGameBoard(), 
            { row, col }
        );
        
        if (boosterResult.success) {
            const moveResult = this.applyBoosterChanges(boosterResult);
            
            this.boosterManager.deactivateBooster();
            this.UICommandService.setBoosterActive(null);
            
            this.completeMoveSequence(moveResult);
        }
    }

    private applyBoosterChanges(boosterResult: any): any {
        let moveResult: any = {
            removed: [],
            points: boosterResult.points || 0,
            movesLeft: this.gameModel.getMovesManager().getMovesLeft(),
            gameState: this.gameModel.getGameState(),
            explosionCenter: undefined,
            movedTiles: [],
            newTiles: [],
            swappedTile: undefined,
            clickedGroup: undefined,
            chainLength: undefined,
            explosionCenters: undefined
        };

        if (boosterResult.points) {
            this.gameModel.getScoreManager().addScore(boosterResult.points);
        }

        if (boosterResult.removed?.length > 0) {
            const gameBoard = this.gameModel.getGameBoard();
            const chainReactionService = ChainReactionService.getInstance();
            let finalRemovedTiles = boosterResult.removed;
            let totalPoints = boosterResult.points || 0;
            let chainLength = 1;
            let explosionCenters = [boosterResult.explosionCenter || boosterResult.removed[0]];
            
            const affectedSuperTiles: (IPosition & { type: TileType })[] = [];
            for (const pos of boosterResult.removed) {
                const tile = gameBoard.getTile(pos.row, pos.col);
                if (tile && TileUtils.isSuperTile(tile.type)) {
                    affectedSuperTiles.push({
                        row: pos.row,
                        col: pos.col,
                        type: tile.type
                    });
                }
            }
            
            if (affectedSuperTiles.length > 0) {
                const fakeActivationResult = {
                    removed: boosterResult.removed,
                    points: boosterResult.points || 0,
                    affectedSuperTiles: affectedSuperTiles
                };
                
                const chainResult = chainReactionService.processChainReaction(
                    gameBoard,
                    fakeActivationResult,
                    boosterResult.explosionCenter || boosterResult.removed[0]
                );
                
                finalRemovedTiles = chainResult.allRemovedTiles;
                totalPoints = chainResult.totalPoints;
                chainLength = chainResult.chainLength;
                explosionCenters = chainResult.explosionCenters;
                
                this.gameModel.getScoreManager().addScore(totalPoints - (boosterResult.points || 0));
            }
            
            gameBoard.removeGroup(finalRemovedTiles);
            
            const movedTiles = gameBoard.applyGravity();
            const newTiles = gameBoard.fillEmptyCells();
            
            moveResult.removed = finalRemovedTiles;
            moveResult.points = totalPoints;
            moveResult.movedTiles = movedTiles;
            moveResult.newTiles = newTiles;
            moveResult.explosionCenter = boosterResult.explosionCenter || boosterResult.removed[0];
            moveResult.chainLength = chainLength > 1 ? chainLength : undefined;
            moveResult.explosionCenters = chainLength > 1 ? explosionCenters : undefined;
        }
        
        if (boosterResult.swappedTile) {           
            moveResult.swappedTile = boosterResult.swappedTile;
            moveResult.explosionCenter = boosterResult.swappedTile.pos2;
        }

        return moveResult;
    }

    private handleBoosterActivation(boosterType: number): void {
        const success = this.boosterManager.activateBooster(boosterType);
        
        if (success) {
            this.UICommandService.setBoosterActive(boosterType);
        }
    }

    public checkPendingGameState(): void {
        if (!this.pendingGameStateCheck) return;
        
        this.pendingGameStateCheck = false;
        
        this.checkAndHandleGameState();
    }

    public resetGame(): void {
        this.boosterManager.reset();
        
        const config = this.gameConfig.getCurrentLevel();
        this.gameModel.resetGame(
            config.boardRows,
            config.boardCols,
            config.targetScore,
            config.totalMoves
        );
        
        this.initializeBoard();
        this.updateUI();
    }

    public getGameModel(): IGameModel {
        return this.gameModel;
    }

    public activateBooster(boosterType: number): void {
        this.handleBoosterActivation(boosterType);
    }

    public deactivateBooster(): void {
        this.boosterManager.deactivateBooster();
        this.UICommandService.setBoosterActive(null);
    }

    public requestShuffle(): void {       
        if (this.gameModel.getShufflesLeft() > 0) {
            this.UICommandService.showMessage('Перемешиваем поле...');
            
            this.gameModel.shuffleBoard();
            
            const gameBoard = this.gameModel.getGameBoard();
            this.UICommandService.reportShuffleEvent({
                reason: 'manual',
                boardData: {
                    rows: gameBoard.rows,
                    cols: gameBoard.cols,
                    getTileType: (row: number, col: number) => {
                        const tile = gameBoard.getTile(row, col);
                        return tile ? tile.type : null;
                    }
                }
            });
            
            this.updateUI();
        }
    }
}