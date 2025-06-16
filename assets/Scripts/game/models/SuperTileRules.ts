import { IPosition } from "../../shared/primitives";
import { TileType } from "../../features/tiles/TileTypes";

export interface IGroupGeometry {
    uniqueRows: number;
    uniqueCols: number;
}

export class SuperTileRules {
    public determineSuperTileType(group: IPosition[]): TileType | null {
        const groupSize = group.length;
        
        if (groupSize < 5) {
            return null;
        }
        
        if (groupSize >= 9) {
            return TileType.SUPER_ALL;
        }
        
        if (groupSize >= 7) {
            return TileType.SUPER_BOMB;
        }
        
        const geometry = this.analyzeGroupGeometry(group);
        
        if (geometry.uniqueRows > geometry.uniqueCols) {
            return TileType.SUPER_COLUMN;
        } else {
            return TileType.SUPER_ROW;
        }
    }
    
    public analyzeGroupGeometry(group: IPosition[]): IGroupGeometry {
        const uniqueRows = new Set(group.map(pos => pos.row)).size;
        const uniqueCols = new Set(group.map(pos => pos.col)).size;
        
        return { uniqueRows, uniqueCols };
    }
} 