import { IPosition } from "../../shared/primitives";
import { ITileActivationResult } from "../../features/tiles/TileTypes";
import { TileUtils } from "../../shared/utils/TileUtils";

export interface IChainReactionResult {
    allRemovedTiles: IPosition[];
    totalPoints: number;
    chainLength: number;
    explosionCenters: IPosition[];
}

export class ChainReactionService {
    private static instance: ChainReactionService;
    
    public static getInstance(): ChainReactionService {
        if (!ChainReactionService.instance) {
            ChainReactionService.instance = new ChainReactionService();
        }
        return ChainReactionService.instance;
    }
    
    private constructor() {}
    
    public processChainReaction(
        board: any, 
        initialResult: ITileActivationResult, 
        initialPosition: IPosition
    ): IChainReactionResult {      
        const allRemovedTiles: IPosition[] = [...initialResult.removed];
        let totalPoints = initialResult.points;
        let chainLength = 1;
        const explosionCenters: IPosition[] = [initialPosition];
        
        let superTilesToActivate = initialResult.affectedSuperTiles || [];
        const processedPositions = new Set<string>();
        
        processedPositions.add(`${initialPosition.row},${initialPosition.col}`);
        
        while (superTilesToActivate.length > 0) {           
            const currentBatch = [...superTilesToActivate];
            superTilesToActivate = [];
            
            for (const superTileInfo of currentBatch) {
                const posKey = `${superTileInfo.row},${superTileInfo.col}`;
                
                if (processedPositions.has(posKey)) {
                    continue;
                }
                
                processedPositions.add(posKey);
                
                const tile = board.getTile(superTileInfo.row, superTileInfo.col);
                if (!tile || !TileUtils.isSuperTile(tile.type)) {
                    continue;
                }

                const activationResult = tile.activate(board);
                
                allRemovedTiles.push(...activationResult.removed);
                totalPoints += activationResult.points;
                explosionCenters.push({ row: superTileInfo.row, col: superTileInfo.col });
                
                if (activationResult.affectedSuperTiles) {
                    for (const newSuperTile of activationResult.affectedSuperTiles) {
                        const newPosKey = `${newSuperTile.row},${newSuperTile.col}`;
                        if (!processedPositions.has(newPosKey)) {
                            superTilesToActivate.push(newSuperTile);
                        }
                    }
                }
            }
            
            chainLength++;
            
            if (chainLength > 10) {
                break;
            }
        }
        
        const uniqueRemovedTiles = this.removeDuplicatePositions(allRemovedTiles);

        return {
            allRemovedTiles: uniqueRemovedTiles,
            totalPoints,
            chainLength: chainLength - 1,
            explosionCenters
        };
    }
    
    private removeDuplicatePositions(positions: IPosition[]): IPosition[] {
        const seen = new Set<string>();
        const unique: IPosition[] = [];
        
        for (const pos of positions) {
            const key = `${pos.row},${pos.col}`;
            if (!seen.has(key)) {
                seen.add(key);
                unique.push(pos);
            }
        }
        
        return unique;
    }
} 