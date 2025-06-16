import { IPosition } from "../../../shared/primitives";
import { ITile, ITileActivationResult, TileType } from "../TileTypes";

export abstract class BaseTile implements ITile {
    constructor(
        public readonly type: TileType,
        private _position: IPosition
    ) {}

    public get position(): IPosition {
        return this._position;
    }

    public setPosition(position: IPosition): void {
        this._position = { ...position };
    }

    abstract getTargets(board: any): IPosition[];
    abstract canActivate(board: any): boolean;
    abstract activate(board: any): ITileActivationResult;
} 