import { IPosition } from "../assets/Scripts/shared/primitives";
import { TileType } from "../assets/Scripts/features/tiles/TileTypes";

import { GameBoard } from "../assets/Scripts/game/models/GameBoard";
import { TileFactory } from "../assets/Scripts/features/tiles/TileFactory";

describe('GameBoard', () => {
    let gameBoard: GameBoard;
    let factory: TileFactory;
    
    beforeEach(() => {
        gameBoard = new GameBoard(5, 5, 3);
        factory = TileFactory.getInstance();
    });
    
    describe('Basic operations', () => {
        test('creates board with correct size', () => {
            expect(gameBoard.rows).toBe(5);
            expect(gameBoard.cols).toBe(5);
        });
        
        test('sets and gets tiles', () => {
            const tile = factory.createTile(TileType.BLUE, { row: 1, col: 1 });
            
            gameBoard.setTile(1, 1, tile);
            const retrievedTile = gameBoard.getTile(1, 1);
            
            expect(retrievedTile).toBe(tile);
            expect(retrievedTile!.type).toBe(TileType.BLUE);
        });
        
        test('validates positions', () => {
            expect(gameBoard.isValidPosition(0, 0)).toBe(true);
            expect(gameBoard.isValidPosition(4, 4)).toBe(true);
            expect(gameBoard.isValidPosition(-1, 0)).toBe(false);
            expect(gameBoard.isValidPosition(0, -1)).toBe(false);
            expect(gameBoard.isValidPosition(5, 0)).toBe(false);
            expect(gameBoard.isValidPosition(0, 5)).toBe(false);
        });
        
        test('returns null for invalid positions', () => {
            expect(gameBoard.getTile(-1, 0)).toBe(null);
            expect(gameBoard.getTile(10, 10)).toBe(null);
        });
    });
    
    describe('Group removal (removeGroup)', () => {
        test('removes tiles at specified positions', () => {
            const tile1 = factory.createTile(TileType.RED, { row: 0, col: 0 });
            const tile2 = factory.createTile(TileType.BLUE, { row: 1, col: 1 });
            
            gameBoard.setTile(0, 0, tile1);
            gameBoard.setTile(1, 1, tile2);
            
            const removedCount = gameBoard.removeGroup([
                { row: 0, col: 0 },
                { row: 1, col: 1 }
            ]);
            
            expect(removedCount).toBe(2);
            expect(gameBoard.getTile(0, 0)).toBe(null);
            expect(gameBoard.getTile(1, 1)).toBe(null);
        });
        
        test('ignores empty positions', () => {
            gameBoard.removeGroup([
                { row: 0, col: 0 },
                { row: 1, col: 1 }
            ]);

            const removedCount = gameBoard.removeGroup([
                { row: 0, col: 0 },
                { row: 1, col: 1 }
            ]);
            
            expect(removedCount).toBe(0);
        });
        
        test('handles invalid positions', () => {
            const removedCount = gameBoard.removeGroup([
                { row: -1, col: 0 },
                { row: 10, col: 10 }
            ]);
            
            expect(removedCount).toBe(0);
        });
    });

    describe('Gravity (applyGravity)', () => {
        test('tiles fall down correctly', () => {
            gameBoard.removeGroup([
                { row: 4, col: 0 }
            ]);

            const tile1 = factory.createTile(TileType.RED, { row: 1, col: 0 });
            const tile2 = factory.createTile(TileType.BLUE, { row: 3, col: 0 });
            
            gameBoard.setTile(1, 0, tile1);
            gameBoard.setTile(3, 0, tile2);
            
            const moves = gameBoard.applyGravity();

            expect(gameBoard.getTile(4, 0)).toBe(tile2);
            expect(gameBoard.getTile(2, 0)).toBe(tile1);
            expect(gameBoard.getTile(0, 0)).toBe(null);
            
            expect(moves).toEqual([
                { from: { row: 3, col: 0 }, to: { row: 4, col: 0 } },
                { from: { row: 2, col: 0 }, to: { row: 3, col: 0 } },
                { from: { row: 1, col: 0 }, to: { row: 2, col: 0 } },
                { from: { row: 0, col: 0 }, to: { row: 1, col: 0 } }
            ]);
        });
        
        test('preserves tile order', () => {
            const tileBottom = factory.createTile(TileType.RED, { row: 4, col: 0 });
            const tileMiddle = factory.createTile(TileType.BLUE, { row: 2, col: 0 });
            const tileTop = factory.createTile(TileType.GREEN, { row: 0, col: 0 });
            
            gameBoard.setTile(4, 0, tileBottom);
            gameBoard.setTile(2, 0, tileMiddle);
            gameBoard.setTile(0, 0, tileTop);

            gameBoard.removeGroup([
                { row: 3, col: 0 },
                { row: 1, col: 0 }
            ]);
            
            gameBoard.applyGravity();
            
            expect(gameBoard.getTile(4, 0)!.type).toBe(TileType.RED);
            expect(gameBoard.getTile(3, 0)!.type).toBe(TileType.BLUE);
            expect(gameBoard.getTile(2, 0)!.type).toBe(TileType.GREEN);
        });
        
        test('updates tile positions', () => {
            const tile = factory.createTile(TileType.RED, { row: 0, col: 0 });
            gameBoard.setTile(0, 0, tile);

            gameBoard.removeGroup([
                { row: 4, col: 0 },
                { row: 3, col: 0 },
                { row: 2, col: 0 },
                { row: 1, col: 0 }
            ]);
            
            gameBoard.applyGravity();
            
            expect(tile.position).toEqual({ row: 4, col: 0 });
        });
        
        test('empty column generates no moves', () => {
            const moves = gameBoard.applyGravity();
            expect(moves.length).toBe(0);
        });
    });

    describe('Fill empty cells (fillEmptyCells)', () => {
        test('fills only empty cells', () => {
            const board: IPosition[] = [];
            for (let i = 0; i < gameBoard.rows; i++) {
                for (let j = 0; j < gameBoard.cols; j++) {
                    board.push({ row: i, col: j });
                }
            }

            gameBoard.removeGroup(board);

            const existingTile = factory.createTile(TileType.BLUE, { row: 0, col: 0 });
            gameBoard.setTile(0, 0, existingTile);
            
            const newTiles = gameBoard.fillEmptyCells();
            
            expect(gameBoard.getTile(0, 0)).toBe(existingTile);
            
            expect(newTiles.length).toBe(24);
            
            for (let row = 0; row < 5; row++) {
                for (let col = 0; col < 5; col++) {
                    expect(gameBoard.getTile(row, col)).not.toBe(null);
                }
            }
        });
        
        test('returns info about new tiles', () => {
            const board: IPosition[] = [];
            for (let i = 0; i < gameBoard.rows; i++) {
                for (let j = 0; j < gameBoard.cols; j++) {
                    board.push({ row: i, col: j });
                }
            }

            gameBoard.removeGroup(board);

            const newTiles = gameBoard.fillEmptyCells();
            
            expect(newTiles.length).toBe(25);
            newTiles.forEach(tileInfo => {
                expect(tileInfo.row).toBeGreaterThanOrEqual(0);
                expect(tileInfo.row).toBeLessThan(5);
                expect(tileInfo.col).toBeGreaterThanOrEqual(0);
                expect(tileInfo.col).toBeLessThan(5);
                expect(tileInfo.type).toBeDefined();
            });
        });
        
        test('creates real tile types', () => {
            const newTiles = gameBoard.fillEmptyCells();
            
            newTiles.forEach(tileInfo => {
                const tile = gameBoard.getTile(tileInfo.row, tileInfo.col);
                expect(tile).not.toBe(null);
                expect(tile!.type).toBe(tileInfo.type);
                
                const validTypes = [TileType.RED, TileType.BLUE, TileType.GREEN, TileType.YELLOW, TileType.PURPLE];
                expect(validTypes).toContain(tile!.type);
            });
        });
    });

    describe('Super tile creation (createSuperTile)', () => {
        test('creates super tile by rules', () => {
            const group = [
                { row: 0, col: 0 }, { row: 0, col: 1 }, { row: 0, col: 2 },
                { row: 0, col: 3 }, { row: 0, col: 4 }
            ];
            
            const superType = gameBoard.createSuperTile(2, 2, group);
            
            expect(superType).toBeDefined();
            const createdTile = gameBoard.getTile(2, 2);
            expect(createdTile).not.toBe(null);
            expect(createdTile!.type).toBe(superType);
        });
    });

    describe('Board shuffling (shuffleBoard)', () => {
        test('keeps super tiles in place', () => {
            const superTile = factory.createTile(TileType.SUPER_BOMB, { row: 2, col: 2 });
            gameBoard.setTile(2, 2, superTile);
            
            gameBoard.fillEmptyCells();
            
            gameBoard.shuffleBoard();
            
            const tileAtPosition = gameBoard.getTile(2, 2);
            expect(tileAtPosition).not.toBe(null);
            expect(tileAtPosition!.type).toBe(TileType.SUPER_BOMB);
        });
        
        test('board remains filled after shuffling', () => {
            gameBoard.fillEmptyCells();
            gameBoard.shuffleBoard();
            
            for (let row = 0; row < 5; row++) {
                for (let col = 0; col < 5; col++) {
                    expect(gameBoard.getTile(row, col)).not.toBe(null);
                }
            }
        });
    });

    describe('Edge cases', () => {
        test('works with 1x1 board', () => {
            const smallBoard = new GameBoard(1, 1, 1);
            expect(smallBoard.rows).toBe(1);
            expect(smallBoard.cols).toBe(1);
            
            const tile = factory.createTile(TileType.RED, { row: 0, col: 0 });
            smallBoard.setTile(0, 0, tile);
            expect(smallBoard.getTile(0, 0)).toBe(tile);
        });
        
        test('gravity on full column creates no moves', () => {
            for (let row = 0; row < 5; row++) {
                const tile = factory.createTile(TileType.RED, { row, col: 0 });
                gameBoard.setTile(row, 0, tile);
            }
            
            const moves = gameBoard.applyGravity();
            expect(moves.length).toBe(0);
        });
        
        test('removing non-existent tiles', () => {
            const board: IPosition[] = [];
            for (let i = 0; i < gameBoard.rows; i++) {
                for (let j = 0; j < gameBoard.cols; j++) {
                    board.push({ row: i, col: j });
                }
            }
            gameBoard.removeGroup(board);

            const removedCount = gameBoard.removeGroup([
                { row: 0, col: 0 },
                { row: 1, col: 1 }
            ]);
            
            expect(removedCount).toBe(0);
        });
        
        test('applying gravity to empty board', () => {
            const board: IPosition[] = [];
            for (let i = 0; i < gameBoard.rows; i++) {
                for (let j = 0; j < gameBoard.cols; j++) {
                    board.push({ row: i, col: j });
                }
            }

            gameBoard.removeGroup(board);

            const moves = gameBoard.applyGravity();
            const newTiles = gameBoard.fillEmptyCells();
            
            expect(moves.length).toBe(0);
            expect(newTiles.length).toBe(25);
        });
    });

    describe('Performance', () => {
        test('large board processes quickly', () => {
            const bigBoard = new GameBoard(20, 20, 3);
            
            const startTime = Date.now();
            
            bigBoard.fillEmptyCells();
            bigBoard.removeGroup([
                { row: 10, col: 10 }, { row: 10, col: 11 }, { row: 10, col: 12 }
            ]);
            bigBoard.applyGravity();
            bigBoard.fillEmptyCells();
            
            const endTime = Date.now();
            const duration = endTime - startTime;
            
            expect(duration).toBeLessThan(100);
        });
    });

    describe('Integration scenarios', () => {
        test('full cycle: remove -> gravity -> fill', () => {
            gameBoard.fillEmptyCells();
            
            const removedCount = gameBoard.removeGroup([
                { row: 2, col: 2 },
                { row: 2, col: 3 }
            ]);
            expect(removedCount).toBe(2);
            
            const moves = gameBoard.applyGravity();
            expect(moves.length).toBeGreaterThan(0);
            
            const newTiles = gameBoard.fillEmptyCells();
            expect(newTiles.length).toBe(2);
            
            for (let row = 0; row < 5; row++) {
                for (let col = 0; col < 5; col++) {
                    expect(gameBoard.getTile(row, col)).not.toBe(null);
                }
            }
        });
        
        test('sequence of moves preserves board integrity', () => {
            gameBoard.fillEmptyCells();
            
            for (let i = 0; i < 10; i++) {
                const randomPositions = [
                    { row: Math.floor(Math.random() * 5), col: Math.floor(Math.random() * 5) },
                    { row: Math.floor(Math.random() * 5), col: Math.floor(Math.random() * 5) }
                ];
                
                gameBoard.removeGroup(randomPositions);
                gameBoard.applyGravity();
                gameBoard.fillEmptyCells();
                
                for (let row = 0; row < 5; row++) {
                    for (let col = 0; col < 5; col++) {
                        expect(gameBoard.getTile(row, col)).not.toBe(null);
                    }
                }
            }
        });
        
        test('stress test: many operations in sequence', () => {
            gameBoard.fillEmptyCells();
            
            for (let i = 0; i < 100; i++) {
                gameBoard.removeGroup([{ row: 2, col: 2 }]);
                gameBoard.applyGravity();
                gameBoard.fillEmptyCells();
            }
            
            let filledCells = 0;
            for (let row = 0; row < 5; row++) {
                for (let col = 0; col < 5; col++) {
                    if (gameBoard.getTile(row, col) !== null) {
                        filledCells++;
                    }
                }
            }
            
            expect(filledCells).toBe(25);
        });
    });
}); 