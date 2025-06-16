import { IPosition } from "../../shared/primitives";

export interface ISwapVisualService {
    liftTile(position: IPosition): void;
    putDownTile(position: IPosition): void;
    putDownAllTiles(): void;
    setTileViewProvider(provider: (row: number, col: number) => any): void;
}

export class SwapVisualService implements ISwapVisualService {
    private static instance: SwapVisualService;
    private getTileView: ((row: number, col: number) => any) | null = null;
    private liftedTiles: IPosition[] = [];

    private constructor() {}

    public static getInstance(): SwapVisualService {
        if (!SwapVisualService.instance) {
            SwapVisualService.instance = new SwapVisualService();
        }
        return SwapVisualService.instance;
    }

    public setTileViewProvider(provider: (row: number, col: number) => any): void {
        this.getTileView = provider;
    }

    public liftTile(position: IPosition): void {
        if (!this.getTileView) {
            return;
        }

        const tileView = this.getTileView(position.row, position.col);
        if (tileView && tileView.liftUp) {
            tileView.liftUp();
            this.liftedTiles.push(position);
        }
    }

    public putDownTile(position: IPosition): void {
        if (!this.getTileView) {
            return;
        }

        const tileView = this.getTileView(position.row, position.col);
        if (tileView && tileView.putDown) {
            tileView.putDown();
            
            this.liftedTiles = this.liftedTiles.filter(
                tile => !(tile.row === position.row && tile.col === position.col)
            );
        }
    }

    public putDownAllTiles(): void {       
        const tilesToPutDown = [...this.liftedTiles];
        
        tilesToPutDown.forEach(position => {
            this.putDownTile(position);
        });
        
        this.liftedTiles = [];
    }

    public destroy(): void {
        this.putDownAllTiles();
    }
} 