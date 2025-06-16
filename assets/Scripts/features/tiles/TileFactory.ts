import { ITile, TileType } from "./TileTypes";
import { IPosition } from "../../shared/primitives";

import { TileUtils } from "../../shared/utils/TileUtils";

import { RegularTile } from "./regular/RegularTile";
import { SuperRowTile } from "./super/SuperRowTile";
import { SuperColTile } from "./super/SuperColTile";
import { SuperBombTile } from "./super/SuperBombTile";
import { SuperAllTile } from "./super/SuperAllTile";

export class TileFactory {
    private static instance: TileFactory;

    public static getInstance(): TileFactory {
        if (!TileFactory.instance) {
            TileFactory.instance = new TileFactory();
        }
        return TileFactory.instance;
    }

    createTile(type: TileType, position: IPosition): ITile {
        switch (type) {
            case TileType.RED:
            case TileType.BLUE:
            case TileType.GREEN:
            case TileType.YELLOW:
            case TileType.PURPLE:
                return new RegularTile(type, position);
            
            case TileType.SUPER_ROW:
                return new SuperRowTile(position);
            
            case TileType.SUPER_COLUMN:
                return new SuperColTile(position);
            
            case TileType.SUPER_BOMB:
                return new SuperBombTile(position);
            
            case TileType.SUPER_ALL:
                return new SuperAllTile(position);
            
            default:
                throw new Error(`Unknown tile type: ${type}`);
        }
    }

    createRandomRegularTile(position: IPosition): ITile {
        const regularTypes = TileUtils.getRegularTileTypes();
        
        const randomType = regularTypes[Math.floor(Math.random() * regularTypes.length)];
        return this.createTile(randomType, position);
    }
} 