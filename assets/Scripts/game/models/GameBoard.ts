import { IGameBoard } from "../GameTypes";
import { IPosition, ITileMove } from "../../shared/primitives";
import { ITile, TileType } from "../../features/tiles/TileTypes";
import { SuperTileRules } from "./SuperTileRules";

import { TileUtils } from "../../shared/utils/TileUtils";
import { TileFactory } from "../../features/tiles/TileFactory";

const { ccclass } = cc._decorator;

@ccclass
export class GameBoard implements IGameBoard {
    private _rows: number;
    private _cols: number;
    private _minimumGroupSize: number;
    private tiles: ITile[][];
    private tileFactory: TileFactory;
    private superTileRules: SuperTileRules;
    
    constructor(rows: number, cols: number, minimumGroupSize: number) {
        this._rows = rows;
        this._cols = cols;
        this._minimumGroupSize = minimumGroupSize;
        this.tiles = [];
        this.tileFactory = TileFactory.getInstance();
        this.superTileRules = new SuperTileRules();
        
        this.initBoard();
        this.generateBoardWithMoves();
    }

    public get rows(): number {
        return this._rows;
    }
    
    public get cols(): number {
        return this._cols;
    }
    
    private initBoard(): void {
        for (let row = 0; row < this._rows; row++) {
            this.tiles[row] = [];
            for (let col = 0; col < this._cols; col++) {
                this.tiles[row][col] = null;
            }
        }
    }
    
    private fillBoard(): void {
        for (let row = 0; row < this._rows; row++) {
            for (let col = 0; col < this._cols; col++) {
                if (this.tiles[row][col] === null) {
                    this.tiles[row][col] = this.createRandomTile(row, col);
                }
            }
        }
    }
    
    private createRandomTile(row: number, col: number): ITile {
        return this.tileFactory.createRandomRegularTile({ row, col });
    }
    
    public hasMatchableGroups(): boolean {                
        for (let row = 0; row < this._rows; row++) {
            for (let col = 0; col < this._cols; col++) {
                const tile = this.tiles[row][col];
                if (!tile) continue;
                
                if (tile.canActivate(this)) {
                    const group = tile.getTargets(this);
                    if (group.length >= this._minimumGroupSize) {
                        return true;
                    }
                }
            }
        }
        
        return false;
    }
    
    public createSuperTile(row: number, col: number, group: IPosition[]): TileType {
        const superType = this.superTileRules.determineSuperTileType(group);
        
        if (!superType) {
            return null;
        }
        
        this.tiles[row][col] = this.tileFactory.createTile(superType, { row, col });
        
        return superType;
    }
    
    public removeGroup(group: IPosition[]): number {        
        let removedCount = 0;
        for (const pos of group) {
            if (this.tiles[pos.row] && this.tiles[pos.row][pos.col]) {
                this.tiles[pos.row][pos.col] = null;
                removedCount++;
            }
        }

        return removedCount;
    }
    
    public applyGravity(): ITileMove[] {
        const moves: ITileMove[] = [];
        
        for (let col = 0; col < this.cols; col++) {
            const existingTiles: ITile[] = [];
            const originalRows: number[] = [];
            
            for (let row = this.rows - 1; row >= 0; row--) {
                if (this.tiles[row][col] !== null) {
                    existingTiles.push(this.tiles[row][col]);
                    originalRows.push(row);
                    this.tiles[row][col] = null;
                }
            }
            
            for (let i = 0; i < existingTiles.length; i++) {
                const newRow = this.rows - 1 - i;
                const oldRow = originalRows[i];
                const tile = existingTiles[i];
                
                tile.setPosition({ row: newRow, col: col });
                
                this.tiles[newRow][col] = tile;
                
                if (oldRow !== newRow) {
                    moves.push({
                        from: { row: oldRow, col },
                        to: { row: newRow, col }
                    });
                }
            }
        }
        
        return moves;
    }
    
    public fillEmptyCells(): (IPosition & { type: TileType })[] {
        const newTiles: (IPosition & { type: TileType })[] = [];
        
        for (let col = 0; col < this._cols; col++) {
            for (let row = this._rows - 1; row >= 0; row--) {
                if (!this.tiles[row][col]) {
                    const newTile = this.createRandomTile(row, col);
                    this.tiles[row][col] = newTile;
                    newTiles.push({ 
                        row, 
                        col, 
                        type: newTile.type 
                    });
                }
            }
        }
        
        return newTiles;
    }
    
    public shuffleBoard(): void {               
        const MAX_SHUFFLE_ATTEMPTS = 10;
        let attempts = 0;
        
        while (attempts < MAX_SHUFFLE_ATTEMPTS) {
            attempts++;
            
            const superTiles: { row: number, col: number, type: TileType }[] = [];
            for (let row = 0; row < this._rows; row++) {
                for (let col = 0; col < this._cols; col++) {
                    if (this.tiles[row][col] && TileUtils.isSuperTile(this.tiles[row][col].type)) {
                        superTiles.push({
                            row,
                            col,
                            type: this.tiles[row][col].type
                        });
                    }
                }
            }
            
            const normalTileTypes: TileType[] = [];
            for (let row = 0; row < this._rows; row++) {
                for (let col = 0; col < this._cols; col++) {
                    if (this.tiles[row][col]) {
                        const tileType = this.tiles[row][col].type;
                        if (TileUtils.isRegularTile(tileType)) {
                            normalTileTypes.push(tileType);
                        }
                    }
                }
            }
            
            const totalSlots = this._rows * this._cols - superTiles.length;
            while (normalTileTypes.length < totalSlots) {
                const randomType = this.getRandomTileType();
                normalTileTypes.push(randomType);
            }
            
            this.shuffleArray(normalTileTypes);
            
            for (let row = 0; row < this._rows; row++) {
                for (let col = 0; col < this._cols; col++) {
                    this.tiles[row][col] = null;
                }
            }
            
            let index = 0;
            for (let row = 0; row < this._rows; row++) {
                for (let col = 0; col < this._cols; col++) {
                    const hasSuperTile = superTiles.find(st => st.row === row && st.col === col);
                    if (!hasSuperTile && index < normalTileTypes.length) {
                        const newType = normalTileTypes[index++];
                        this.tiles[row][col] = this.tileFactory.createTile(newType, { row, col });
                    }
                }
            }
            
            for (const superTile of superTiles) {
                this.tiles[superTile.row][superTile.col] = this.tileFactory.createTile(
                    superTile.type, 
                    { row: superTile.row, col: superTile.col }
                );
            }
            
            if (this.hasMatchableGroups()) {
                return;
            }
        }
    }
    
    private shuffleArray(array: any[]): void {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }
    
    private getRandomTileType(): TileType {
        const normalTypes = TileUtils.getRegularTileTypes();
        return normalTypes[Math.floor(Math.random() * normalTypes.length)];
    }
    
    public getTile(row: number, col: number): ITile | null {
        if (this.isValidPosition(row, col)) {
            return this.tiles[row][col];
        }
        return null;
    }
    
    public setTile(row: number, col: number, tile: ITile): void {
        if (this.isValidPosition(row, col)) {
            this.tiles[row][col] = tile;
        }
    }
    
    public isValidPosition(row: number, col: number): boolean {
        return row >= 0 && row < this.rows && col >= 0 && col < this.cols;
    }
    
    private generateBoardWithMoves(): void {
        const maxAttempts = 50;
        let attempts = 0;
        
        while (attempts < maxAttempts) {
            for (let row = 0; row < this._rows; row++) {
                for (let col = 0; col < this._cols; col++) {
                    this.tiles[row][col] = null;
                }
            }
            
            this.fillBoard();
            
            if (this.hasMatchableGroups()) {
                return;
            }
            
            attempts++;
        }
        
        this.forceCreateGroup();
    }
    
    private forceCreateGroup(): void {
        const centerRow = Math.floor(this._rows / 2);
        const centerCol = Math.floor(this._cols / 2);
        
        const normalTypes = TileUtils.getRegularTileTypes();
        const groupType = normalTypes[Math.floor(Math.random() * normalTypes.length)];
        
        const positions: { row: number, col: number }[] = [];
        
        if (this._minimumGroupSize === 4) {
            positions.push(
                { row: centerRow, col: centerCol },
                { row: centerRow, col: centerCol + 1 },
                { row: centerRow + 1, col: centerCol },
                { row: centerRow + 1, col: centerCol + 1 }
            );
        } else {
            positions.push({ row: centerRow, col: centerCol });
            
            const directions = [
                { row: -1, col: 0 }, { row: 1, col: 0 },
                { row: 0, col: -1 }, { row: 0, col: 1 }
            ];
            
            for (let i = 1; i < this._minimumGroupSize && positions.length < this._minimumGroupSize; i++) {
                const dir = directions[(i - 1) % directions.length];
                const newRow = centerRow + dir.row * Math.ceil(i / directions.length);
                const newCol = centerCol + dir.col * Math.ceil(i / directions.length);
                
                if (this.isValidPosition(newRow, newCol)) {
                    positions.push({ row: newRow, col: newCol });
                }
            }
        }
        
        for (const pos of positions) {
            if (this.isValidPosition(pos.row, pos.col)) {
                this.tiles[pos.row][pos.col] = this.tileFactory.createTile(groupType, { row: pos.row, col: pos.col });
            }
        }
    }

    public printBoard(title?: string): void {
        let output = '';
        
        if (title) {
            output += `\n=== ${title} ===\n`;
        } else {
            output += '\n=== Game Board ===\n';
        }

        let header = '   ';
        for (let col = 0; col < this._cols; col++) {
            header += ` ${col.toString().padStart(2)} `;
        }
        output += header + '\n';

        let separator = '   ';
        for (let col = 0; col < this._cols; col++) {
            separator += '----';
        }
        output += separator + '\n';

        for (let row = 0; row < this._rows; row++) {
            let line = `${row.toString().padStart(2)}|`;
            
            for (let col = 0; col < this._cols; col++) {
                const tile = this.tiles[row][col];
                const symbol = this.getTileSymbol(tile);
                line += ` ${symbol} `;
            }
            
            output += line + '\n';
        }

        console.log(output);
    }

    private getTileSymbol(tile: ITile | null): string {
        if (!tile) {
            return ' . ';
        }

        switch (tile.type) {
            case TileType.RED:
                return ' R ';
            case TileType.BLUE:
                return ' B ';
            case TileType.GREEN:
                return ' G ';
            case TileType.YELLOW:
                return ' Y ';
            case TileType.PURPLE:
                return ' P ';
            case TileType.SUPER_ROW:
                return '[R]';
            case TileType.SUPER_COLUMN:
                return '[C]';
            case TileType.SUPER_BOMB:
                return '[B]';
            case TileType.SUPER_ALL:
                return '[A]';
            default:
                return ' ? ';
        }
    }

    public printBoardStats(): void {
        let output = '\n=== Board Statistics ===\n';
        
        const stats = new Map<TileType, number>();
        let emptyCount = 0;
        
        for (let row = 0; row < this._rows; row++) {
            for (let col = 0; col < this._cols; col++) {
                const tile = this.tiles[row][col];
                if (!tile) {
                    emptyCount++;
                } else {
                    stats.set(tile.type, (stats.get(tile.type) || 0) + 1);
                }
            }
        }

        output += `Board size: ${this._rows}x${this._cols} (${this._rows * this._cols} cells)\n`;
        output += `Empty cells: ${emptyCount}\n`;
        output += `Filled cells: ${this._rows * this._cols - emptyCount}\n`;
        
        if (stats.size > 0) {
            output += '\nTile distribution:\n';
            stats.forEach((count, type) => {
                const symbol = this.getTileSymbol({ type } as ITile).trim();
                const percentage = ((count / (this._rows * this._cols - emptyCount)) * 100).toFixed(1);
                output += `  ${symbol} ${type}: ${count} (${percentage}%)\n`;
            });
        }

        output += `Has matchable groups: ${this.hasMatchableGroups()}\n`;
        
        console.log(output);
    }
} 