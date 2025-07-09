import * as cc from "cc";
import { Contact2DType, ICollisionEvent } from "cc";
import { Bullet } from "../Bullet/Bullet";
import { FishSetting } from "./FishSetting";
import { ProbabilityManager } from "../Main/ProbabilityManager";
import { Observer, ObserverEventType } from "../Main/Observer";

const { ccclass, property } = cc._decorator;
// 魚資訊類型
export type FishInfo =
    {
        //押注
        Bet: number;
        //獎勵
        Reward: number;
        //節點位置
        Node: cc.Node;
    }
@ccclass( "Fish" )
export class Fish extends cc.Component
{

    @property( cc.Animation )
    public animation: cc.Animation = null;

    @property( cc.BoxCollider )
    private collider: cc.BoxCollider = null;

    @property( { type: FishSetting } )
    public fishSetting: FishSetting = null;

    private _isDie: boolean = false;

    protected onLoad(): void
    {
    }

    /**
     * 初始化魚
     */
    Init()
    {
        this.animation.play( "idle" );
        this.collider.enabled = true;
        this._isDie = false; // 重置死亡狀態
    }
    /**
     * 命中處理
     * @param event 碰撞事件
     * @returns 
     */
    private onHitProcess( event: ICollisionEvent ): void
    {
        if ( this._isDie )
        {
            // Die
            return;
        }
        const bullet = event.otherCollider.node.getComponent( Bullet );
        const reward = ProbabilityManager.Instance.Hit( bullet.Bet, this.fishSetting );
        if ( reward == 0 )
        {
            //Miss
            Observer.Instance.Notify( ObserverEventType.FishMiss, { Bet: bullet.Bet, Reward: reward, Node: this.node } as FishInfo );
            return;
        }
        this.IsDie = true;
        Observer.Instance.Notify( ObserverEventType.FishDie, { Bet: bullet.Bet, Reward: reward, Node: this.node } as FishInfo );
    }

    /**
     * 獲取魚的Hit位置 = collider的中心點
     */
    public get HisPosition(): cc.Vec3
    {
        return this.collider.center;
    }

    protected start(): void
    {
        this.collider.on( "onCollisionEnter", this.onHitProcess, this );
        this.Init();
    }

    private set IsDie( value: boolean )
    {
        this._isDie = value;
        if ( value )
        {
            this.collider.enabled = false; // 停止碰撞檢測
            this.animation.play( "die" ); // 播放死亡動畫
        }

    }

    public get IsDie(): boolean
    {

        return this._isDie;
    }

}