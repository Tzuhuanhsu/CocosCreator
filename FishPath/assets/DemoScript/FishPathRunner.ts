import * as cc from "cc";
import { FishPositionInfoData } from "./FishPositionInfo";
const { ccclass, property } = cc._decorator;

@ccclass( 'FishPathRunner' )
export class FishPathRunner extends cc.Component
{
    @property( cc.JsonAsset )
    pathData: cc.JsonAsset = null;

    @property( { type: cc.CCFloat, unit: "s", tooltip: "延遲時間" } )
    delayTime: number = 0;

    //旋轉速度
    private _rotationSpeed: number = 1;
    //魚位置數據
    private _fishPositionInfo: FishPositionInfoData[] = [];
    //腳本索引
    private _currentIndex: number = 0;
    //當前方向
    private _direction: cc.Vec3 = cc.Vec3.ZERO;
    //變化量
    private _delta: cc.Vec3 = cc.Vec3.ZERO;
    //當前速度
    private _speed: number = 0;
    //目標旋轉
    private _targetQuat: cc.Quat = cc.Quat.IDENTITY;
    // 是否有延遲
    private _delay: boolean = false;
    // 是否結束
    private _isEnd: boolean = false;
    start()
    {
        // this.scheduleOnce( () => { this.Setup(); }, this.delayTime );
    }

    LoadPathData(): Promise<void>
    {

        return new Promise<void>( ( resolve, reject ) =>
        {
            if ( !this.pathData ) reject();
            cc.assetManager.loadAny( { uuid: this.pathData.uuid }, ( err, fishPositionData: cc.JsonAsset ) =>
            {
                if ( err )
                {
                    console.error( "Failed to load path data:", err );
                    reject();
                }
                this._fishPositionInfo = fishPositionData.json as FishPositionInfoData[];
                resolve();
            } );
        } );


    }

    Setup()
    {
        this.scheduleOnce( () =>
        {
            this.LoadPathData()
                .then( () =>
                {
                    this._delay = true;
                    this._currentIndex = 0;
                    this.applyFishTransform( this._currentIndex );
                    this._speed = this._fishPositionInfo[ this._currentIndex ].speed;
                    this._direction = cc.Vec3.ZERO;
                    this._delta = cc.Vec3.ZERO;
                    this.node.active = true;
                    this.NextScript();
                } )
                .catch( ( err ) =>
                {
                    console.error( "Error setting up fish path data:", err );
                } );
        }, this.delayTime );
    }

    private applyFishTransform( index: number )
    {
        const target = this._fishPositionInfo[ index ];
        const targetPosition = cc.v3( target.position );
        const quat = new cc.Quat();
        cc.Quat.fromEuler( quat, target.rotation.x, target.rotation.y, target.rotation.z );
        this.node.setWorldPosition( targetPosition );
        this.node.setWorldRotation( quat );
    }

    NextScript()
    {
        if ( this._fishPositionInfo.length === 0 )
        {
            //沒有腳本
            console.warn( "No fish position data available to play." );
            return;
        }
        if ( this._currentIndex === this._fishPositionInfo.length - 1 )
        {
            //已經到達最後一個腳本
            this._isEnd = true;
            return;
        }
        if ( !this._fishPositionInfo[ this._currentIndex ] )
        {
            //當前索引沒有魚位置數據
            console.warn( "No fish position data available at current index." );
            return;
        }
        this._currentIndex++;
        const target = this._fishPositionInfo[ this._currentIndex ];
        const targetPosition = cc.v3( target.position );
        const quat = new cc.Quat();
        cc.Quat.fromEuler( quat, target.rotation.x, target.rotation.y, target.rotation.z );
        this._direction = targetPosition.subtract( this.node.worldPosition.clone() ).normalize();
        this._targetQuat = quat;
        this._speed = target.speed;
        this._delta = this._direction.multiplyScalar( this._speed );
        //檢查是否有延遲時間
        if ( target.delayTime > 0 )
        {
            this._delay = true;
            this.scheduleOnce( () =>
            {
                this._delay = false;
            }, target.delayTime );
        }
        else
        {
            this._delay = false;
        }
    }

    //更新旋轉
    private updateRotation( dt: number )
    {
        if ( this._fishPositionInfo.length === 0 )
        {
            //沒有腳本
            return;
        }

        if ( this._delay )
        {
            // 如果有延遲，則不更新位置
            return;
        }
        const currentQuat = this.node.worldRotation.clone();
        cc.Quat.slerp( currentQuat, currentQuat, this._targetQuat, dt * this._rotationSpeed );
        this.node.setWorldRotation( currentQuat );
    }

    //更新路徑
    updatePosition( dt: number )
    {
        if ( this._fishPositionInfo.length === 0 )
        {
            //沒有腳本
            return;
        }

        if ( this._delay )
        {
            // 如果有延遲，則不更新位置
            return;
        }
        const targetPosition = cc.v3( this._fishPositionInfo[ this._currentIndex ].position );
        const from = this.node.worldPosition.clone();
        const deltaPos = this._delta.clone().multiplyScalar( dt );
        const to = from.clone().add( deltaPos );
        const toTargetBefore = targetPosition.clone().subtract( from );
        const toTargetAfter = targetPosition.clone().subtract( to );

        if ( toTargetBefore.dot( toTargetAfter ) <= 0 )
        {
            // 已經超過或到達目標點，直接修正到目標點
            this.node.setWorldPosition( targetPosition );
            this.NextScript();
            return;
        }
        this.node.setWorldPosition( to );
    }

    get Index(): number
    {
        return this._currentIndex;
    }

    get IsEnd(): boolean
    {
        return this._isEnd;
    }



    onUpdate( dt: number ): void
    {
        this.updatePosition( dt );
        this.updateRotation( dt );
    }
}