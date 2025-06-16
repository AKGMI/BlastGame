import { TileFactory } from "../assets/Scripts/features/tiles/TileFactory";
import { TileType } from "../assets/Scripts/features/tiles/TileTypes";
import { GameBoard } from "../assets/Scripts/game/models/GameBoard";

describe('Super Tiles Refactoring', () => {
    let factory: TileFactory;
    let gameBoard: GameBoard;
    
    beforeEach(() => {
        factory = TileFactory.getInstance();
        gameBoard = new GameBoard(5, 5, 3);
    });

    describe('Super tile creation and basic functionality', () => {
        test('SuperRowTile creates correctly with proper type and points', () => {
            const tile = factory.createTile(TileType.SUPER_ROW, { row: 2, col: 2 });
            
            expect(tile.type).toBe(TileType.SUPER_ROW);
            expect(tile.position).toEqual({ row: 2, col: 2 });
            expect(tile.canActivate(gameBoard)).toBe(true);
        });
        
        test('SuperColTile creates correctly with proper type and points', () => {
            const tile = factory.createTile(TileType.SUPER_COLUMN, { row: 1, col: 3 });
            
            expect(tile.type).toBe(TileType.SUPER_COLUMN);
            expect(tile.position).toEqual({ row: 1, col: 3 });
            expect(tile.canActivate(gameBoard)).toBe(true);
        });
        
        test('SuperBombTile creates correctly with proper type and points', () => {
            const tile = factory.createTile(TileType.SUPER_BOMB, { row: 2, col: 2 });
            
            expect(tile.type).toBe(TileType.SUPER_BOMB);
            expect(tile.position).toEqual({ row: 2, col: 2 });
            expect(tile.canActivate(gameBoard)).toBe(true);
        });
        
        test('SuperAllTile creates correctly with proper type and points', () => {
            const tile = factory.createTile(TileType.SUPER_ALL, { row: 0, col: 0 });
            
            expect(tile.type).toBe(TileType.SUPER_ALL);
            expect(tile.position).toEqual({ row: 0, col: 0 });
            expect(tile.canActivate(gameBoard)).toBe(true);
        });
    });

    describe('Super tile activation and points calculation', () => {
        test('SuperRowTile calculates points correctly (20 per tile)', () => {
            const tile = factory.createTile(TileType.SUPER_ROW, { row: 2, col: 2 });
            gameBoard.setTile(2, 2, tile);
            
            const result = tile.activate(gameBoard);
            
            expect(result.removed.length).toBe(5);
            expect(result.points).toBe(100); // 5 * 20 = 100
        });
        
        test('SuperColTile calculates points correctly (20 per tile)', () => {
            const tile = factory.createTile(TileType.SUPER_COLUMN, { row: 2, col: 2 });
            gameBoard.setTile(2, 2, tile);
            
            const result = tile.activate(gameBoard);
            
            expect(result.removed.length).toBe(5);
            expect(result.points).toBe(100); // 5 * 20 = 100
        });
        
        test('SuperBombTile calculates points correctly (25 per tile)', () => {
            const tile = factory.createTile(TileType.SUPER_BOMB, { row: 2, col: 2 });
            gameBoard.setTile(2, 2, tile);
            
            const result = tile.activate(gameBoard);
            
            expect(result.removed.length).toBe(25);
            expect(result.points).toBe(625); // 25 * 25 = 625
        });
        
        test('SuperAllTile calculates points correctly (50 per tile)', () => {
            const tile = factory.createTile(TileType.SUPER_ALL, { row: 2, col: 2 });
            gameBoard.setTile(2, 2, tile);
            
            const result = tile.activate(gameBoard);
            
            expect(result.removed.length).toBe(25);
            expect(result.points).toBe(1250); // 25 * 50 = 1250
        });
    });

    describe('Affected super tiles detection', () => {
        test('SuperRowTile detects other super tiles in row', () => {
            const rowTile = factory.createTile(TileType.SUPER_ROW, { row: 2, col: 2 });
            const bombTile = factory.createTile(TileType.SUPER_BOMB, { row: 2, col: 4 });
            
            gameBoard.setTile(2, 2, rowTile);
            gameBoard.setTile(2, 4, bombTile);
            
            const result = rowTile.activate(gameBoard);
            
            expect(result.affectedSuperTiles).toBeDefined();
            expect(result.affectedSuperTiles!.length).toBe(1);
            expect(result.affectedSuperTiles![0]).toEqual({
                row: 2,
                col: 4,
                type: TileType.SUPER_BOMB
            });
        });
        
        test('SuperAllTile does not detect affected super tiles', () => {
            const allTile = factory.createTile(TileType.SUPER_ALL, { row: 2, col: 2 });
            const bombTile = factory.createTile(TileType.SUPER_BOMB, { row: 1, col: 1 });
            
            gameBoard.setTile(2, 2, allTile);
            gameBoard.setTile(1, 1, bombTile);
            
            const result = allTile.activate(gameBoard);
            
            expect(result.affectedSuperTiles).toBeUndefined();
        });
    });

    describe('Target generation', () => {
        test('SuperRowTile targets entire row', () => {
            const tile = factory.createTile(TileType.SUPER_ROW, { row: 2, col: 2 });
            
            const targets = tile.getTargets(gameBoard);
            
            expect(targets.length).toBe(5);
            expect(targets).toEqual([
                { row: 2, col: 0 },
                { row: 2, col: 1 },
                { row: 2, col: 2 },
                { row: 2, col: 3 },
                { row: 2, col: 4 }
            ]);
        });
        
        test('SuperColTile targets entire column', () => {
            const tile = factory.createTile(TileType.SUPER_COLUMN, { row: 2, col: 2 });
            
            const targets = tile.getTargets(gameBoard);
            
            expect(targets.length).toBe(5);
            expect(targets).toEqual([
                { row: 0, col: 2 },
                { row: 1, col: 2 },
                { row: 2, col: 2 },
                { row: 3, col: 2 },
                { row: 4, col: 2 }
            ]);
        });
        
        test('SuperBombTile targets 5x5 area around center', () => {
            const tile = factory.createTile(TileType.SUPER_BOMB, { row: 2, col: 2 });
            
            const targets = tile.getTargets(gameBoard);
            
            expect(targets.length).toBe(25);
            expect(targets).toContainEqual({ row: 0, col: 0 });
            expect(targets).toContainEqual({ row: 4, col: 4 });
            expect(targets).toContainEqual({ row: 2, col: 2 });
        });
    });
}); 