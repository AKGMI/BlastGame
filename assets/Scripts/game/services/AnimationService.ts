import { EventBus, GameEvents } from "../../core/EventBus";
import { IPosition, ITileMove } from "../../shared/primitives";
import { TileType } from "../../features/tiles/TileTypes";
import { ZIndexConstants } from "../../shared/constants/ZIndexConstants";

export interface IAnimationConfig {
    duration: number;
    easing?: string;
    delay?: number;
}

export interface ITileViewData {
    node: cc.Node;
    row: number;
    col: number;
    type: TileType;
}

export class AnimationService {
    private eventBus: EventBus;
    private _isProcessing: boolean = false;
    private animationLayer: cc.Node | null = null;
    
    private configs = {
        tileRemoval: { duration: 0.25, easing: 'sineOut' },
        tileMove: { duration: 0.15, easing: 'bounceOut' },
        tileSpawn: { duration: 0.4, easing: 'backOut' },
        tileSwap: { duration: 0.6, easing: 'sineInOut' },
        superTileCreate: { duration: 0.6, easing: 'backOut' },
        shuffle: { duration: 1.2, easing: 'sineInOut' }
    };
    
    constructor() {
        this.eventBus = EventBus.getInstance();
        this.createAnimationLayer();
    }
    
    private createAnimationLayer(): void {
        this.animationLayer = new cc.Node('AnimationLayer');
        this.animationLayer.zIndex = ZIndexConstants.ANIMATIONS;
        
        const canvas = cc.find('Canvas');
        if (canvas) {
            canvas.addChild(this.animationLayer);
            
            const canvasSize = canvas.getContentSize();
            this.animationLayer.setContentSize(canvasSize);
            this.animationLayer.setPosition(0, 0);
        }
    }

    private moveToAnimationLayer(node: cc.Node, originalPos: cc.Vec3): cc.Vec3 {
        if (!this.animationLayer) return originalPos;
        
        const worldPos = node.parent.convertToWorldSpaceAR(originalPos);
        const animPos = this.animationLayer.convertToNodeSpaceAR(worldPos);
        
        node.parent = this.animationLayer;
        node.position = animPos;
        
        return animPos;
    }
    
    private convertToAnimationLayerSpace(originalParent: cc.Node, targetPos: cc.Vec3): cc.Vec3 {
        if (!this.animationLayer) return targetPos;
        
        const worldPos = originalParent.convertToWorldSpaceAR(targetPos);
        return this.animationLayer.convertToNodeSpaceAR(worldPos);
    }
    
    private returnFromAnimationLayer(node: cc.Node, originalParent: cc.Node, targetPos: cc.Vec3): void {
        node.parent = originalParent;
        node.position = targetPos;
        this.resetNodeState(node);
    }
    
    private resetNodeState(node: cc.Node): void {
        node.scale = 1.0;
        node.opacity = 255;
        node.angle = 0;
        node.active = true;
    }
    
    public get isProcessing(): boolean {
        return this._isProcessing;
    }
    
    public async animateTileRemoval(tiles: IPosition[], tileNodes: cc.Node[], centerPos?: IPosition): Promise<void> {
        this._isProcessing = true;
        try {
            await this.performTileRemoval(tiles, tileNodes, centerPos);
        } finally {
            this._isProcessing = false;
            this.eventBus.publish(GameEvents.ANIMATION_COMPLETED);
        }
    }
    
    public async animateTileMovement(moves: ITileMove[], tileNodes: cc.Node[], targetPositions: cc.Vec3[]): Promise<void> {
        this._isProcessing = true;
        try {
            await this.performTileMovement(moves, tileNodes, targetPositions);
        } finally {
            this._isProcessing = false;
            this.eventBus.publish(GameEvents.ANIMATION_COMPLETED);
        }
    }
    
    public async animateTileSpawn(tiles: (IPosition & { type?: any })[], tileNodes: cc.Node[], targetPositions: cc.Vec3[]): Promise<void> {
        this._isProcessing = true;
        try {
            await this.performTileSpawn(tiles, tileNodes, targetPositions);
        } finally {
            this._isProcessing = false;
            this.eventBus.publish(GameEvents.ANIMATION_COMPLETED);
        }
    }
    
    public async animateSuperTileCreation(tileNode: cc.Node): Promise<void> {
        this._isProcessing = true;
        try {
            await this.performSuperTileCreation(tileNode);
        } finally {
            this._isProcessing = false;
            this.eventBus.publish(GameEvents.ANIMATION_COMPLETED);
        }
    }
    
    public async animateSwap(tileNodes: cc.Node[], targetPositions: cc.Vec3[]): Promise<void> {
        this._isProcessing = true;
        try {
            await new Promise<void>((resolve) => {
                if (!tileNodes || tileNodes.length < 2 || !targetPositions || targetPositions.length < 2) {
                    resolve();
                    return;
                }
                
                const node1 = tileNodes[0];
                const node2 = tileNodes[1];
                const pos1 = targetPositions[0];
                const pos2 = targetPositions[1];
                
                if (!node1?.isValid || !node2?.isValid) {
                    resolve();
                    return;
                }
                                
                this.performAdvancedSwap(node1, node2, pos1, pos2, () => resolve());
            });
        } finally {
            this._isProcessing = false;
            this.eventBus.publish(GameEvents.ANIMATION_COMPLETED);
        }
    }
    
    public async animateBoardShuffle(allTileNodes: cc.Node[], newTypes: TileType[], targetPositions: cc.Vec3[]): Promise<void> {
        this._isProcessing = true;
        try {
            await this.performBoardShuffle(allTileNodes, newTypes, targetPositions);
        } finally {
            this._isProcessing = false;
            this.eventBus.publish(GameEvents.ANIMATION_COMPLETED);
        }
    }

    public async animateSequence(animations: (() => Promise<void>)[]): Promise<void> {
        this._isProcessing = true;
        
        try {
            for (const animation of animations) {
                await animation();
            }
        } finally {
            this._isProcessing = false;
            this.eventBus.publish(GameEvents.ANIMATION_COMPLETED);
        }
    }
    
    public async animateInvalidMove(tileNodes: cc.Node[]): Promise<void> {
        this._isProcessing = true;
        try {
            await this.performInvalidMoveAnimation(tileNodes);
        } finally {
            this._isProcessing = false;
            this.eventBus.publish(GameEvents.ANIMATION_COMPLETED);
        }
    }

    public async animateHint(hintTileNodes: cc.Node[]): Promise<void> {
        return this.performHintAnimation(hintTileNodes);
    }

    public stopHintAnimation(hintTileNodes: cc.Node[]): void {
        hintTileNodes.forEach(node => {
            if (node && node.isValid) {
                cc.Tween.stopAllByTarget(node);
                node.scale = 1.0;
                node.opacity = 255;
            }
        });
    }
    
    private async performTileRemoval(tiles: IPosition[], tileNodes: cc.Node[], centerPos?: IPosition): Promise<void> {
        return new Promise((resolve) => {
            if (!tileNodes || tileNodes.length === 0) {
                resolve();
                return;
            }
                        
            const center = centerPos || this.findExplosionCenter(tiles);
            
            let finished = 0;
            const check = () => {
                finished++;
                if (finished >= tileNodes.length) {
                    resolve();
                }
            };
            
            tileNodes.forEach((node, index) => {
                if (!node || !node.isValid) {
                    check();
                    return;
                }
                
                const tilePos = tiles[index];
                if (!tilePos) {
                    check();
                    return;
                }
                
                const distance = this.calculateDistance(center, tilePos);
                const delay = distance * 0.08;
                
                setTimeout(() => {
                    cc.tween(node)
                        .parallel(
                            cc.tween().to(this.configs.tileRemoval.duration, { 
                                scale: 1.6,
                                opacity: 0 
                            }, { easing: cc.easing.sineOut }),
                            cc.tween().by(this.configs.tileRemoval.duration, { angle: 540 })
                        )
                        .call(() => {
                            this.resetNodeState(node);
                            node.active = false;
                            check();
                        })
                        .start();
                }, delay * 1000);
            });
        });
    }
    
    private findExplosionCenter(tiles: IPosition[]): IPosition {
        if (tiles.length === 0) return { row: 0, col: 0 };
        
        const sumRow = tiles.reduce((sum, tile) => sum + tile.row, 0);
        const sumCol = tiles.reduce((sum, tile) => sum + tile.col, 0);
        
        return {
            row: Math.round(sumRow / tiles.length),
            col: Math.round(sumCol / tiles.length)
        };
    }
    
    private calculateDistance(pos1: IPosition, pos2: IPosition): number {
        return Math.abs(pos1.row - pos2.row) + Math.abs(pos1.col - pos2.col);
    }
    
    private generateColumnDelay(columnIndex: number): number {
        const baseRandomDelay = Math.random() * 0.15;
        
        const progressiveDelay = (columnIndex % 3) * 0.05;
        
        const totalDelay = baseRandomDelay + progressiveDelay;
        
        return totalDelay;
    }
    
    private async performTileMovement(moves: ITileMove[], tileNodes: cc.Node[], targetPositions: cc.Vec3[]): Promise<void> {
        return new Promise((resolve) => {
            if (!tileNodes || tileNodes.length === 0) {
                resolve();
                return;
            }
            
            let finished = 0;
            const check = () => {
                finished++;
                if (finished >= tileNodes.length) {
                    resolve();
                }
            };
            
            tileNodes.forEach((node, index) => {
                if (!node || !node.isValid || !targetPositions[index]) {
                    check();
                    return;
                }
                
                const targetPos = targetPositions[index];
                const move = moves[index];
                const fallDistance = move ? (move.to.row - move.from.row) : 1;
                
                const baseDuration = 0.12;
                const durationPerRow = 0.025;
                const duration = Math.min(0.25, baseDuration + (fallDistance * durationPerRow));
                const delay = index * 0.012;
                
                setTimeout(() => {
                    cc.tween(node)
                        .to(duration * 0.8, { position: targetPos }, { 
                            easing: cc.easing.sineIn 
                        })
                        .to(duration * 0.2, { scale: 1.05 })
                        .to(duration * 0.1, { scale: 1.0 })
                        .call(check)
                        .start();
                }, delay * 1000);
            });
        });
    }
    
    private async performTileSpawn(tiles: (IPosition & { type?: any })[], tileNodes: cc.Node[], targetPositions: cc.Vec3[]): Promise<void> {
        return new Promise((resolve) => {
            if (!tileNodes || tileNodes.length === 0) {
                resolve();
                return;
            }
            
            let finished = 0;
            const check = () => {
                finished++;
                if (finished >= tileNodes.length) {
                    resolve();
                }
            };
            
            const tilesByColumn = new Map<number, Array<{
                node: cc.Node,
                targetPos: cc.Vec3,
                tile: IPosition & { type?: any },
                originalIndex: number
            }>>();
            
            tileNodes.forEach((node, index) => {
                const targetPos = targetPositions[index];
                const tile = tiles[index];
                
                if (!node || !node.isValid || !targetPos || !tile) {
                    check();
                    return;
                }
                
                const col = tile.col;
                if (!tilesByColumn.has(col)) {
                    tilesByColumn.set(col, []);
                }
                
                tilesByColumn.get(col)!.push({
                    node,
                    targetPos,
                    tile,
                    originalIndex: index
                });
            });
            
            let columnIndex = 0;
            
            tilesByColumn.forEach((columnTiles) => {
                columnTiles.sort((a, b) => b.tile.row - a.tile.row);
                
                const columnDelay = this.generateColumnDelay(columnIndex);
                columnIndex++;
                
                columnTiles.forEach((tileInfo, indexInColumn) => {
                    const { node, targetPos, tile } = tileInfo;
                    
                    const fallDistance = Math.max(1, tile.row + 10);
                    
                    const startY = targetPos.y + (fallDistance * 60) + 80;
                    node.position = cc.v3(targetPos.x, startY, 0);
                    node.opacity = 255;
                    node.scale = 1.0;
                    node.active = true;
                    
                    const baseDuration = 0.12;
                    const durationPerRow = 0.025;
                    const duration = Math.min(0.25, baseDuration + (fallDistance * durationPerRow));
                    
                    const totalDelay = columnDelay + (indexInColumn * 0.015);
                    
                    setTimeout(() => {
                        cc.tween(node)
                            .to(duration * 0.8, { position: targetPos }, { 
                                easing: cc.easing.sineIn 
                            })
                            .to(duration * 0.2, { scale: 1.05 })
                            .to(duration * 0.1, { scale: 1.0 })
                            .call(check)
                            .start();
                    }, totalDelay * 1000);
                });
            });
        });
    }
    
    private async performSuperTileCreation(tileNode: cc.Node): Promise<void> {
        return new Promise((resolve) => {
            if (!tileNode || !tileNode.isValid) {
                resolve();
                return;
            }
            
            const originalScale = tileNode.scale;
            
            cc.tween(tileNode)
                .to(0.08, { scale: 0.8 })
                .to(0.15, { scale: 1.4 }, { easing: cc.easing.backOut })
                .to(0.12, { scale: originalScale }, { easing: cc.easing.sineInOut })
                .parallel(
                    cc.tween().by(0.06, { angle: 15 }),
                    cc.tween().delay(0.06).by(0.06, { angle: -30 }),
                    cc.tween().delay(0.12).by(0.06, { angle: 15 })
                )
                .call(() => {
                    tileNode.angle = 0;
                    resolve();
                })
                .start();
        });
    }
    
    private performAdvancedSwap(node1: cc.Node, node2: cc.Node, pos1: cc.Vec3, pos2: cc.Vec3, resolve: () => void): void {
        const originalParent1 = node1.parent;
        const originalParent2 = node2.parent;
        const originalPos1 = node1.position.clone();
        const originalPos2 = node2.position.clone();
        
        const animPos1 = this.moveToAnimationLayer(node1, originalPos1);
        const animPos2 = this.moveToAnimationLayer(node2, originalPos2);
        
        const finalAnimPos1 = this.convertToAnimationLayerSpace(originalParent1, pos1);
        const finalAnimPos2 = this.convertToAnimationLayerSpace(originalParent2, pos2);
        
        const centerX = (animPos1.x + animPos2.x) / 2;
        const centerY = (animPos1.y + animPos2.y) / 2 + 60;
        
        let finished = 0;
        const check = () => {
            finished++;
            if (finished === 2) {
                resolve();
            }
        };
        
        cc.tween(node1)
            .parallel(
                cc.tween().to(0.25, {
                    position: cc.v3(centerX - 30, centerY, 0),
                    scale: 1.2
                }, { easing: cc.easing.sineOut }),
                cc.tween().by(0.25, { angle: 180 })
            )
            .parallel(
                cc.tween().by(0.1, { angle: 90 }),
                cc.tween().to(0.1, { scale: 1.1 })
            )
            .parallel(
                cc.tween().to(0.3, {
                    position: finalAnimPos1,
                    scale: 1.0
                }, { easing: cc.easing.backOut }),
                cc.tween().by(0.3, { angle: 90 })
            )
            .call(() => {
                this.returnFromAnimationLayer(node1, originalParent1, pos1);
                check();
            })
            .start();
            
        setTimeout(() => {
            cc.tween(node2)
                .parallel(
                    cc.tween().to(0.25, {
                        position: cc.v3(centerX + 30, centerY, 0),
                        scale: 1.2
                    }, { easing: cc.easing.sineOut }),
                    cc.tween().by(0.25, { angle: -180 })
                )
                .parallel(
                    cc.tween().by(0.1, { angle: -90 }),
                    cc.tween().to(0.1, { scale: 1.1 })
                )
                .parallel(
                    cc.tween().to(0.3, {
                        position: finalAnimPos2,
                        scale: 1.0
                    }, { easing: cc.easing.backOut }),
                    cc.tween().by(0.3, { angle: -90 })
                )
                .call(() => {
                    this.returnFromAnimationLayer(node2, originalParent2, pos2);
                    check();
                })
                .start();
        }, 50);
    }
    
    private async performBoardShuffle(allTileNodes: cc.Node[], newTypes: TileType[], targetPositions: cc.Vec3[]): Promise<void> {
        return new Promise((resolve) => {
            if (!allTileNodes || allTileNodes.length === 0) {
                resolve();
                return;
            }

            this.performAdvancedShuffle(allTileNodes, newTypes, targetPositions, resolve);
        });
    }
    
    private performAdvancedShuffle(allTileNodes: cc.Node[], newTypes: TileType[], targetPositions: cc.Vec3[], resolve: () => void): void {
        const canvas = cc.find('Canvas');
        const centerWorldPos = canvas ? canvas.convertToWorldSpaceAR(cc.v3(0, 0, 0)) : cc.v3(0, 0, 0);
        const centerAnimPos = this.animationLayer.convertToNodeSpaceAR(centerWorldPos);
        
        const tileInfo = allTileNodes.map((node, index) => {
            const originalParent = node.parent;
            const originalPos = node.position.clone();
            const targetPos = targetPositions[index];
            const newType = newTypes[index];
            
            return {
                node,
                originalParent,
                originalPos,
                targetPos,
                newType,
                index,
                animPos: cc.v3(0, 0, 0)
            };
        });
        
        let finished = 0;
        const totalTiles = tileInfo.length;
        
        const check = () => {
            finished++;
            if (finished >= totalTiles) {
                resolve();
            }
        };
        
        tileInfo.forEach(info => {
            const animPos = this.moveToAnimationLayer(info.node, info.originalPos);
            info.animPos = animPos;
        });
        
        tileInfo.forEach((info, index) => {
            const angle = (index / totalTiles) * Math.PI * 8;
            const radius = 30 + (index % 4) * 15;
            
            const spiralX = centerAnimPos.x + Math.cos(angle) * radius;
            const spiralY = centerAnimPos.y + Math.sin(angle) * radius;
            
            const finalAnimPos = this.convertToAnimationLayerSpace(info.originalParent, info.targetPos);
            
            const delay = 0.015 * index;
            
            setTimeout(() => {
                cc.tween(info.node)
                    .parallel(
                        cc.tween().to(0.3, {
                            position: cc.v3(spiralX, spiralY, 0),
                            scale: 0.5,
                            opacity: 150
                        }, { easing: cc.easing.sineOut }),
                        cc.tween().by(0.3, { angle: 360 })
                    )
                    .call(() => {
                        const tileView = info.node.getComponent('TileView');
                        if (tileView && tileView.setType && info.newType !== undefined) {
                            tileView.setType(info.newType);
                        }
                    })
                    .by(0.4, { angle: 720 }, { easing: cc.easing.sineInOut })
                    .parallel(
                        cc.tween().to(0.35, {
                            position: finalAnimPos,
                            scale: 1.0,
                            opacity: 255
                        }, { easing: cc.easing.backOut }),
                        cc.tween().by(0.35, { angle: 360 })
                    )
                    .call(() => {
                        this.returnFromAnimationLayer(info.node, info.originalParent, info.targetPos);
                        info.node.angle = 0;
                        check();
                    })
                    .start();
            }, delay * 1000);
        });
    }
    
    private async performInvalidMoveAnimation(tileNodes: cc.Node[]): Promise<void> {
        return new Promise((resolve) => {
            if (!tileNodes || tileNodes.length === 0) {
                resolve();
                return;
            }
            
            let finished = 0;
            const check = () => {
                finished++;
                if (finished >= tileNodes.length) {
                    resolve();
                }
            };
            
            tileNodes.forEach((node) => {
                if (!node || !node.isValid) {
                    check();
                    return;
                }
                
                const originalPos = node.position.clone();
                
                setTimeout(() => {
                    cc.tween(node)
                        .to(0.05, { position: cc.v3(originalPos.x - 8, originalPos.y, originalPos.z) })
                        .to(0.05, { position: cc.v3(originalPos.x + 8, originalPos.y, originalPos.z) })
                        .to(0.05, { position: cc.v3(originalPos.x - 6, originalPos.y, originalPos.z) })
                        .to(0.05, { position: cc.v3(originalPos.x + 6, originalPos.y, originalPos.z) })
                        .to(0.05, { position: cc.v3(originalPos.x - 4, originalPos.y, originalPos.z) })
                        .to(0.05, { position: cc.v3(originalPos.x + 4, originalPos.y, originalPos.z) })
                        .to(0.05, { position: originalPos })
                        .call(() => {
                            check();
                        })
                        .start();
                }, 0);
            });
        });
    }
    
    private async performHintAnimation(hintTileNodes: cc.Node[]): Promise<void> {
        return new Promise((resolve) => {
            if (!hintTileNodes || hintTileNodes.length === 0) {
                resolve();
                return;
            }
            
            hintTileNodes.forEach((node, index) => {
                if (!node || !node.isValid) {
                    return;
                }
                
                setTimeout(() => {
                    const pulseAnimation = cc.tween(node)
                        .to(0.6, { 
                            scale: 0.9
                        }, { 
                            easing: cc.easing.sineInOut 
                        })
                        .to(0.6, { 
                            scale: 1.0
                        }, { 
                            easing: cc.easing.sineInOut 
                        });
                    
                    cc.tween(node)
                        .repeatForever(pulseAnimation)
                        .start();
                }, 1000);
            });
            
            resolve();
        });
    }
    
    public destroy(): void {
        if (this.animationLayer && this.animationLayer.isValid) {
            this.animationLayer.destroy();
            this.animationLayer = null;
        }
    }
} 