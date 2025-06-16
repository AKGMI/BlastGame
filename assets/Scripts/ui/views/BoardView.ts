import { TileType } from "../../features/tiles/TileTypes";
import { IMoveResult } from "../../game/GameTypes";
import { IPosition, ITileMove, ITileSwap } from "../../shared/primitives";

import TileView from "./TileView";
import { EventBus, GameEvents, UICommands } from "../../core/EventBus";
import { AnimationService } from "../../game/services/AnimationService";
import { GameServiceContainer } from "../../core/GameServiceContainer";
import { CoordinateService } from "../../game/services/CoordinateService";
import { SwapVisualService } from "../../game/services/SwapVisualService";

const { ccclass, property } = cc._decorator;

@ccclass
export default class BoardView extends cc.Component {
    @property(cc.Prefab)
    tilePrefab: cc.Prefab = null;

    @property(cc.Float)
    tileSize: number = 100;

    @property(cc.Float)
    tileSpacing: number = 0;

    @property
    boardPadding: number = 50;

    private tileViews: TileView[][] = [];
    private boardRows: number = 0;
    private boardCols: number = 0;
    private eventBus: EventBus;
    private animationService: AnimationService;
    private coordinateService: CoordinateService;
    private swapVisualService: SwapVisualService;

    onLoad() {
        this.eventBus = EventBus.getInstance();
        
        const serviceContainer = GameServiceContainer.getGameInstance();
        this.animationService = serviceContainer.getAnimationService();
        this.coordinateService = serviceContainer.getCoordinateService();
        this.swapVisualService = serviceContainer.getSwapVisualService();
        
        this.setupEventListeners();
        this.setupTileClickHandler();
        this.setupSwapVisualService();
    }

    private setupEventListeners(): void {
        this.eventBus.subscribe(GameEvents.MOVE_COMPLETED, this.handleMoveCompleted, this);

        this.eventBus.subscribe(UICommands.SHUFFLE_REQUESTED, this.handleShuffleAnimation, this);
        this.eventBus.subscribe(UICommands.HINT_ANIMATION_START, this.handleHintStart, this);
        this.eventBus.subscribe(UICommands.HINT_ANIMATION_STOP, this.handleHintStop, this);
        
        this.eventBus.subscribe(UICommands.BOARD_INIT, this.handleBoardInit, this);
    }

    private setupTileClickHandler(): void {
        this.node.on('tile-clicked', this.onTileClicked, this);
    }

    private onTileClicked(event: cc.Event.EventCustom): void {
        const data = event.getUserData();

        this.eventBus.publish(GameEvents.TILE_CLICKED, data.row, data.col);
    }

    private setupSwapVisualService(): void {
        this.swapVisualService.setTileViewProvider((row: number, col: number) => {
            return this.tileViews[row]?.[col];
        });
    }
    
    public getTileNode(row: number, col: number): cc.Node | null {
        const tileView = this.tileViews[row]?.[col];
        return tileView?.node?.isValid ? tileView.node : null;
    }
    
    public createTileNode(row: number, col: number, tileType: TileType): cc.Node {
        const tileNode = cc.instantiate(this.tilePrefab);
        this.node.addChild(tileNode);
        
        const tileView = tileNode.getComponent(TileView);
        
        if (!this.tileViews[row]) {
            this.tileViews[row] = [];
        }
        this.tileViews[row][col] = tileView;
        
        tileNode.width = this.tileSize;
        tileNode.height = this.tileSize;
        
        tileNode.zIndex = this.boardRows - row;
        
        tileView.setType(tileType);
        tileView.setGridPosition(row, col);
        
        const position = this.getTilePosition(row, col);
        tileNode.position = cc.v3(position.x, position.y, 0);
        
        return tileNode;
    }
    
    public removeTileNode(row: number, col: number): void {
        const tileView = this.tileViews[row]?.[col];
        if (tileView) {
            tileView.node.active = false;
            this.tileViews[row][col] = null;
        }
    }
    
    public moveTileNode(fromRow: number, fromCol: number, toRow: number, toCol: number): void {
        const tileView = this.tileViews[fromRow]?.[fromCol];
        if (tileView) {
            this.tileViews[toRow][toCol] = tileView;
            this.tileViews[fromRow][fromCol] = null;
            
            const targetPos = this.getTilePosition(toRow, toCol);
            tileView.node.position = cc.v3(targetPos.x, targetPos.y, 0);
            
            tileView.node.zIndex = this.boardRows - toRow;
            
            tileView.setGridPosition(toRow, toCol);
        }
    }
    
    public swapTileNodes(pos1: IPosition, pos2: IPosition): void {
        const tileView1 = this.tileViews[pos1.row]?.[pos1.col];
        const tileView2 = this.tileViews[pos2.row]?.[pos2.col];
        
        if (tileView1 && tileView2) {
            this.tileViews[pos1.row][pos1.col] = tileView2;
            this.tileViews[pos2.row][pos2.col] = tileView1;
            
            tileView1.setGridPosition(pos2.row, pos2.col);
            tileView2.setGridPosition(pos1.row, pos1.col);

            tileView1.node.zIndex = this.boardRows - pos2.row;
            tileView2.node.zIndex = this.boardRows - pos1.row;
        } else {
            console.error(`[BoardView] ❌ Не найдены TileView для swap`);
        }
    }

    private updateBoardSize(): void {
        const boardWidth = this.boardPadding * 2 + this.boardCols * this.tileSize + (this.boardCols - 1) * this.tileSpacing;
        const boardHeight = this.boardPadding * 2 + this.boardRows * this.tileSize + (this.boardRows - 1) * this.tileSpacing;
        
        this.node.width = boardWidth;
        this.node.height = boardHeight;
    }

    private getTilePosition(row: number, col: number): cc.Vec2 {
        const boardWidth = this.node.width;
        const boardHeight = this.node.height;
        
        const startX = -boardWidth / 2 + this.boardPadding + this.tileSize / 2;
        const startY = -boardHeight / 2 + this.boardPadding + this.tileSize / 2;
        
        const x = startX + col * (this.tileSize + this.tileSpacing);
        const y = startY + (this.boardRows - 1 - row) * (this.tileSize + this.tileSpacing);
        
        return cc.v2(x, y);
    }

    private handleBoardInit(boardData: any): void {
        this.initializeBoard(boardData.rows, boardData.cols, boardData.getTileType);
    }

    private handleMoveCompleted(eventData: any): void {
        const moveResult = eventData.moveResult;
        if (!moveResult) {
            console.error('[BoardView] Нет данных moveResult в событии');
            return;
        }
        
        this.animateWithService(moveResult).catch(error => {
            console.error('[BoardView] ❌ Ошибка при выполнении анимаций:', error);
        });
    }

    private handleShuffleAnimation(shuffleEvent: any): void {
        if (shuffleEvent.boardData) {
            this.animateShuffleWithService(shuffleEvent.boardData.getTileType);
        }
    }

    private async animateShuffleWithService(getTileType: (row: number, col: number) => TileType): Promise<void> {
        const allTileNodes: cc.Node[] = [];
        const newTypes: TileType[] = [];
        const targetPositions: cc.Vec3[] = [];
        
        for (let row = 0; row < this.boardRows; row++) {
            for (let col = 0; col < this.boardCols; col++) {
                const tileNode = this.getTileNode(row, col);
                if (tileNode) {
                    allTileNodes.push(tileNode);
                    newTypes.push(getTileType(row, col));
                    const pos = this.getTilePosition(row, col);
                    targetPositions.push(cc.v3(pos.x, pos.y, 0));
                }
            }
        }
        
        await this.animationService.animateBoardShuffle(allTileNodes, newTypes, targetPositions);
        
        this.updateTileTypes(getTileType);
    }
    
    private async animateWithService(moveResult: IMoveResult): Promise<void> {
        const animations: (() => Promise<void>)[] = [];
        
        if (moveResult.removed?.length === 0 && moveResult.points === 0 && moveResult.clickedGroup?.length > 0) {
            await this.animateInvalidMoveGroup(moveResult.clickedGroup);
            return;
        }
        
        if (moveResult.removed?.length > 0) {
            animations.push(() => this.animateRemoval(moveResult.removed, moveResult.explosionCenter));
        }

        if (moveResult.superTile) {
            animations.push(() => this.animateSuperTile(moveResult.superTile));
        }
        
        if (moveResult.movedTiles?.length > 0) {
            animations.push(() => this.animateMovement(moveResult.movedTiles));
        }
        
        if (moveResult.newTiles?.length > 0) {
            const validNewTiles = moveResult.newTiles.filter(tile => tile.type !== undefined) as Array<IPosition & { type: TileType }>;
            animations.push(() => this.animateSpawn(validNewTiles));
        }
        
        if (moveResult.swappedTile) {
            animations.push(() => this.animateSwap(moveResult.swappedTile));
        }
                
        if (animations.length === 0) {
            return;
        }
        
        await this.animationService.animateSequence(animations);
    }
    
    private async animateRemoval(positions: IPosition[], explosionCenter?: IPosition): Promise<void> {
        const tileNodes = positions
            .map(pos => this.getTileNode(pos.row, pos.col))
            .filter(node => node !== null);
        
        await this.animationService.animateTileRemoval(positions, tileNodes, explosionCenter);
        
        positions.forEach(pos => {
            this.removeTileNode(pos.row, pos.col);
        });
    }
    
    private async animateMovement(moves: ITileMove[]): Promise<void> {
        const tileNodes = [];
        const targetPositions = [];
        
        moves.forEach(move => {
            const node = this.getTileNode(move.from.row, move.from.col);
            if (node) {
                tileNodes.push(node);
                const targetPos = this.getTilePosition(move.to.row, move.to.col);
                targetPositions.push(cc.v3(targetPos.x, targetPos.y, 0));
            }
        });
        
        await this.animationService.animateTileMovement(moves, tileNodes, targetPositions);
        
        moves.forEach(move => {
            this.moveTileNode(move.from.row, move.from.col, move.to.row, move.to.col);
        });
    }
    
    private async animateSpawn(newTiles: Array<IPosition & { type: TileType }>): Promise<void> {
        const tileNodes = [];
        const targetPositions = [];
        
        newTiles.forEach(tile => {
            const node = this.createTileNode(tile.row, tile.col, tile.type);
            tileNodes.push(node);
            const targetPos = this.getTilePosition(tile.row, tile.col);
            targetPositions.push(cc.v3(targetPos.x, targetPos.y, 0));
        });
        
        await this.animationService.animateTileSpawn(newTiles, tileNodes, targetPositions);
    }
    
    private async animateSwap(swappedTile: ITileSwap): Promise<void> {
        const tileNode1 = this.getTileNode(swappedTile.pos1.row, swappedTile.pos1.col);
        const tileNode2 = this.getTileNode(swappedTile.pos2.row, swappedTile.pos2.col);
        
        if (tileNode1 && tileNode2) {
            const targetPos1 = this.getTilePosition(swappedTile.pos2.row, swappedTile.pos2.col);
            const targetPos2 = this.getTilePosition(swappedTile.pos1.row, swappedTile.pos1.col);

            const nodes = [tileNode1, tileNode2];
            const positions = [cc.v3(targetPos1.x, targetPos1.y, 0), cc.v3(targetPos2.x, targetPos2.y, 0)];
            
            await this.animationService.animateSwap(nodes, positions);
            
            this.swapTileNodes(swappedTile.pos1, swappedTile.pos2);
        } else {
            console.error(`[BoardView] ❌ Не найдены ноды для swap`);
        }
    }
    
    private async animateSuperTile(superTile: IPosition & { type?: TileType }): Promise<void> {
        if (!superTile.type) {
            console.error(`[BoardView] ❌ Тип супертайла не определен`);
            return;
        }
        
        const tileNode = this.createTileNode(superTile.row, superTile.col, superTile.type);
        await this.animationService.animateSuperTileCreation(tileNode);
        
        const tileView = this.tileViews[superTile.row]?.[superTile.col];
        if (tileView) {
            tileView.setType(superTile.type);
        }
    }
    
    private initializeBoard(rows: number, cols: number, getTileType: (row: number, col: number) => TileType): void {
        this.boardRows = rows;
        this.boardCols = cols;
        
        this.updateBoardSize();

        this.coordinateService.setGameBoard(this.node, this.tileSize, rows, cols);
        
        this.clearBoard();
        this.createTileGrid();
        this.updateTileTypes(getTileType);
    }

    private clearBoard(): void {
        this.node.removeAllChildren();
        this.tileViews = [];
    }

    private createTileGrid(): void {
        this.tileViews = [];
        
        for (let row = 0; row < this.boardRows; row++) {
            this.tileViews[row] = [];
            
            for (let col = 0; col < this.boardCols; col++) {
                const tileNode = cc.instantiate(this.tilePrefab);
                const tileView = tileNode.getComponent(TileView);
                
                if (tileView) {
                    tileView.setGridPosition(row, col);
                    this.tileViews[row][col] = tileView;
                    
                    const position = this.getTilePosition(row, col);
                    tileNode.setPosition(position.x, position.y);
                    
                    tileNode.width = this.tileSize;
                    tileNode.height = this.tileSize;
                    
                    this.node.addChild(tileNode);
                    tileNode.zIndex = this.boardRows - row;
                }
            }
        }
    }

    private updateTileTypes(getTileType: (row: number, col: number) => TileType): void {
        for (let row = 0; row < this.boardRows; row++) {
            for (let col = 0; col < this.boardCols; col++) {
                const tileView = this.tileViews[row][col];
                if (tileView) {
                    const tileType = getTileType(row, col);
                    tileView.setType(tileType);
                }
            }
        }
    }

    private handleHintStart(eventData: any): void {
        const positions = eventData.positions || eventData;
        
        const hintPositions = positions;
        
        if (hintPositions && hintPositions.length > 0) {
            const hintTileNodes = hintPositions
                .map((pos: IPosition) => {
                    const node = this.getTileNode(pos.row, pos.col);
                    return node;
                })
                .filter(node => node !== null);
                
            if (hintTileNodes.length > 0) {
                this.animationService.animateHint(hintTileNodes);
            }
        }
    }

    private handleHintStop(): void {
        const nodes: cc.Node[] = [];
        for (let row = 0; row < this.boardRows; row++) {
            for (let col = 0; col < this.boardCols; col++) {
                nodes.push(this.getTileNode(row, col));
            }
        }
        this.animationService.stopHintAnimation(nodes);
    }

    private async animateInvalidMoveGroup(clickedGroup: IPosition[]): Promise<void> {
        const tileNodes = clickedGroup
            .map(pos => this.getTileNode(pos.row, pos.col))
            .filter(node => node !== null);
            
        if (tileNodes.length > 0) {
            await this.animationService.animateInvalidMove(tileNodes);
        }
    }

    onDestroy() {
        if (this.eventBus) {
            this.eventBus.unsubscribe(GameEvents.MOVE_COMPLETED, this.handleMoveCompleted, this);
            this.eventBus.unsubscribe(UICommands.SHUFFLE_REQUESTED, this.handleShuffleAnimation, this);
            this.eventBus.unsubscribe(UICommands.HINT_ANIMATION_START, this.handleHintStart, this);
            this.eventBus.unsubscribe(UICommands.HINT_ANIMATION_STOP, this.handleHintStop, this);
            this.eventBus.unsubscribe(UICommands.BOARD_INIT, this.handleBoardInit, this);
        }

        this.node.off('tile-clicked', this.onTileClicked, this);
    }
} 