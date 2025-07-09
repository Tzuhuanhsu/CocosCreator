import * as cc from "cc";
import { FishPathRunner } from "./FishPathRunner";

const { ccclass, property } = cc._decorator
@ccclass( "FishPathGroup" )
class FishPathGroup 
{
    @property( { type: cc.JsonAsset, tooltip: "路徑資料", displayName: "Fish Path" } )
    pathData: cc.JsonAsset = null;

    @property( { type: cc.CCInteger, tooltip: "魚群數量", displayName: "Fish Count" } )
    fishCount: number = 0;

    @property( { type: cc.CCFloat, tooltip: "魚群間距", displayName: "Fish Spacing", unit: "/s" } )
    fishSpacing: number = 2;

    @property( { type: cc.Prefab, tooltip: "魚 Prefab", displayName: "Fish Prefab" } )
    fishPrefab: cc.Prefab = null;
}

@ccclass( 'FishPathRow' )
export class FishPathRow
{
    @property( { type: [ FishPathGroup ], tooltip: "波次資料" } )
    group: FishPathGroup[] = [];
}

@ccclass( 'FishPathGroupManager' )
export class FishPathGroupManager extends cc.Component
{
    @property( { type: FishPathRow, tooltip: "Fish wave", displayName: "Fish wave" } )
    pathWaveData: FishPathRow[] = [];

    private fishWaveIndex: number = -1;
    private fishPathRunners: FishPathRunner[] = [];

    protected start(): void
    {
        this.CrateFishPathRunners();
    }

    /**
     * 建立Fish
     * @returns 
     */
    CrateFishPathRunners(): void
    {
        if ( !this.pathWaveData || this.pathWaveData.length === 0 ) return;
        this.fishWaveIndex++;
        const currentWave = this.pathWaveData[ this.fishWaveIndex ];
        if ( !currentWave || !currentWave.group || currentWave.group.length === 0 ) return;
        this.fishPathRunners = [];
        for ( const group of currentWave.group )
        {
            if ( !group.pathData || !group.fishPrefab || group.fishCount <= 0 ) continue;

            for ( let i = 0; i < group.fishCount; i++ )
            {
                // 創建魚群要使用 Pool 目前為Demo 直接實例化
                const fishNode = cc.instantiate( group.fishPrefab );
                const fishPathRunner = fishNode.addComponent( FishPathRunner );
                fishNode.parent = this.node;
                fishNode.active = false;
                fishPathRunner.pathData = group.pathData;
                fishPathRunner.delayTime = i * group.fishSpacing;
                fishPathRunner.Setup();
                this.fishPathRunners.push( fishPathRunner );
            }
        }


    }

    /**
     * 切換到下一個魚群波次
     */
    public nextFishWave(): void
    {
        if ( this.fishWaveIndex > this.pathWaveData.length - 1 )
        {
            return;
        }

        this.CrateFishPathRunners();
    }

    protected update( dt: number ): void
    {
        if ( this.fishPathRunners.length === 0 && this.fishWaveIndex === -1 )
        {
            console.warn( "沒有魚群資料，請先設置魚群波次。" );
            return;
        }

        if ( this.fishPathRunners.length === 0
            && this.fishWaveIndex < this.pathWaveData.length - 1 )
        {
            // 如果沒有魚群，並且還有下一個波次，則創建新的魚群
            this.nextFishWave();
            return;
        }

        for ( const runner of this.fishPathRunners )
        {
            if ( !runner.IsEnd )
            {
                runner.onUpdate( dt );
            }
            else
            {
                // 如果已經到達最後一個腳本，移出陣列
                this.onFishPathEnd( runner );
            }
        }
    }

    // 當魚群路徑結束時，從陣列中移除
    private onFishPathEnd( runner: FishPathRunner ): void
    {
        const index = this.fishPathRunners.indexOf( runner );
        if ( index !== -1 )
        {
            this.fishPathRunners.splice( index, 1 );
            runner.node.active = false;
        }
    }
}