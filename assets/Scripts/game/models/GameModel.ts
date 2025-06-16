import { 
    IGameModel, 
    IMoveResult, 
    GameState
} from "../GameTypes";
import { IPosition } from "../../shared/primitives";
import { TileType } from "../../features/tiles/TileTypes";

import { GameBoard } from "./GameBoard";
import { ScoreManager } from "../managers/ScoreManager";
import { MovesManager } from "../managers/MovesManager";
import { GameState as GameStateModel } from "./GameState";
import { GameConfig } from "../../shared/config/GameConfig";
import { TileUtils } from "../../shared/utils/TileUtils";
import { EventBus, GameEvents } from "../../core/EventBus";
import { ChainReactionService } from "../services/ChainReactionService";

const { ccclass } = cc._decorator;

@ccclass
export class GameModel implements IGameModel {
    private eventBus: EventBus;
    private gameBoard: GameBoard;

    private gameConfig: GameConfig;

    private scoreManager: ScoreManager;
    private movesManager: MovesManager;
    private chainReactionService: ChainReactionService;

    private gameState: GameState;
    private shufflesLeft: number = 3;   
    private isShuffling: boolean = false;
    
    constructor(rows: number, cols: number, targetScore: number, totalMoves: number) {
        this.eventBus = EventBus.getInstance();
        this.gameConfig = GameConfig.getInstance();
        this.gameBoard = new GameBoard(rows, cols, this.gameConfig.getCurrentLevel().minimumGroupSize);

        const gameStateModel = new GameStateModel(targetScore, totalMoves);
        this.scoreManager = new ScoreManager(gameStateModel);
        this.movesManager = new MovesManager(gameStateModel);

        this.chainReactionService = ChainReactionService.getInstance();
        this.gameState = GameState.PLAYING;
    }
    
    public handleTileClick(row: number, col: number): IMoveResult {
        const clickPosition = { row, col };
        
        if (this.gameState !== GameState.PLAYING) {
            return {
                removed: [],
                points: 0,
                movesLeft: this.movesManager.getMovesLeft(),
                gameState: this.gameState,
                explosionCenter: { row, col },
                clickedGroup: [clickPosition]
            };
        }
        
        const clickedTile = this.gameBoard.getTile(row, col);
        if (!clickedTile) {
            return {
                removed: [],
                points: 0,
                movesLeft: this.movesManager.getMovesLeft(),
                gameState: this.gameState,
                explosionCenter: { row, col },
                clickedGroup: [clickPosition]
            };
        }

        const connectedGroup = clickedTile.getTargets(this.gameBoard);
        if (!clickedTile.canActivate(this.gameBoard)) {
            return {
                removed: [],
                points: 0,
                movesLeft: this.movesManager.getMovesLeft(),
                gameState: this.gameState,
                explosionCenter: { row, col },
                clickedGroup: connectedGroup
            };
        }
        
        const activationResult = clickedTile.activate(this.gameBoard);
        
        let superTile: (IPosition & { type: TileType }) | undefined;
        let finalRemovedTiles: IPosition[];
        let totalPoints: number;
        let chainLength = 1;
        let explosionCenters: IPosition[] = [{ row, col }];
        
        if (TileUtils.isRegularTile(clickedTile.type) && activationResult.removed.length >= 5) {
            const superTileType = this.gameBoard.createSuperTile(row, col, activationResult.removed);
            if (superTileType) {
                superTile = { row, col, type: superTileType };
                
                const tilesToRemove = activationResult.removed.filter(pos => !(pos.row === row && pos.col === col));
                this.gameBoard.removeGroup(tilesToRemove);
            } else {
                this.gameBoard.removeGroup(activationResult.removed);
            }
            finalRemovedTiles = activationResult.removed;
            totalPoints = this.scoreManager.addScore(activationResult.points);
        } else {
            if (TileUtils.isSuperTile(clickedTile.type) && activationResult.affectedSuperTiles?.length > 0) {
                const chainResult = this.chainReactionService.processChainReaction(
                    this.gameBoard, 
                    activationResult, 
                    { row, col }
                );
                
                this.gameBoard.removeGroup(chainResult.allRemovedTiles);
                
                finalRemovedTiles = chainResult.allRemovedTiles;
                totalPoints = this.scoreManager.addScore(chainResult.totalPoints);
                chainLength = chainResult.chainLength;
                explosionCenters = chainResult.explosionCenters;
            } else {
                this.gameBoard.removeGroup(activationResult.removed);
                finalRemovedTiles = activationResult.removed;
                totalPoints = this.scoreManager.addScore(activationResult.points);
            }
        }
        
        const movedTiles = this.gameBoard.applyGravity();
        const newTiles = this.gameBoard.fillEmptyCells();
        
        this.movesManager.useMove();
        this.updateGameState();
        
        return {
            removed: finalRemovedTiles,
            points: totalPoints,
            movesLeft: this.movesManager.getMovesLeft(),
            gameState: this.gameState,
            superTile,
            movedTiles,
            newTiles: newTiles,
            explosionCenter: { row, col },
            clickedGroup: connectedGroup,
            chainLength: chainLength > 1 ? chainLength : undefined,
            explosionCenters: chainLength > 1 ? explosionCenters : undefined
        };
    }
    
    private updateGameState(): void {
        const currentScore = this.scoreManager.getScore();
        const targetScore = this.scoreManager.getTargetScore();
        const movesLeft = this.movesManager.getMovesLeft();
        
        if (currentScore >= targetScore) {
            this.gameState = GameState.WON;
        } else if (movesLeft <= 0) {
            this.gameState = GameState.LOST;
        }
    }
    
    public shuffleBoard(): void {
        if (this.shufflesLeft > 0) {
            this.gameBoard.shuffleBoard();
            this.shufflesLeft--;
            this.isShuffling = false;
        }
    }
    
    public resetGame(rows: number, cols: number, targetScore: number, totalMoves: number): void {
        this.gameBoard = new GameBoard(rows, cols, this.gameConfig.getCurrentLevel().minimumGroupSize);
        const gameStateModel = new GameStateModel(targetScore, totalMoves);
        this.scoreManager = new ScoreManager(gameStateModel);
        this.movesManager = new MovesManager(gameStateModel);
        this.gameState = GameState.PLAYING;
        this.shufflesLeft = 3;
        this.isShuffling = false;
    }
    
    public getGameBoard(): GameBoard {
        return this.gameBoard;
    }
    
    public getScoreManager(): ScoreManager {
        return this.scoreManager;
    }
    
    public getMovesManager(): MovesManager {
        return this.movesManager;
    }
    
    public getGameState(): GameState {
        return this.gameState;
    }
    
    public getShufflesLeft(): number {
        return this.shufflesLeft;
    }
    
    public checkGameState(): void {
        this.updateGameState();
    }
    
    public checkNeedShuffle(): void {
        if (this.gameState === GameState.PLAYING && 
            !this.isShuffling && 
            !this.gameBoard.hasMatchableGroups()) {
            this.isShuffling = true;
            this.eventBus.publish(GameEvents.NEED_SHUFFLE);
        }
    }
} 