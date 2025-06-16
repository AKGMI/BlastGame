import { TileType } from "../../features/tiles/TileTypes";

export class TileUtils {
    public static getRegularTileTypes(): TileType[] {
        return [
            TileType.RED,
            TileType.BLUE,
            TileType.GREEN,
            TileType.YELLOW,
            TileType.PURPLE
        ];
    }

    public static getSuperTileTypes(): TileType[] {
        return [
            TileType.SUPER_ROW,
            TileType.SUPER_COLUMN,
            TileType.SUPER_BOMB,
            TileType.SUPER_ALL
        ];
    }

    public static isSuperTile(type: TileType): boolean {
        return this.getSuperTileTypes().includes(type);
    }
    
    public static isRegularTile(type: TileType): boolean {
        return this.getRegularTileTypes().includes(type);
    }
} 