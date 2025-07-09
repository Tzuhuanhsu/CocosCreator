import { _decorator, Component, input, Input, Node, EventKeyboard, PhysicsSystem, PhysicsSystem2D, EPhysicsDrawFlags } from 'cc';

import { CommData } from './CommData';
import { UserOperation } from './UserOperation';
import { NormalCoolDownTime, ShootManager, ShootMode, TurboCoolDownTime } from './ShootManager';
import { BulletManager } from '../Bullet/BulletManager';
import { Observer, ObserverEventType } from './Observer';
import { FishInfo } from '../Fish/Fish';
import { TipsManager } from './TipsManager';
import { FishManager } from '../Fish/FishManager';
const { ccclass, property } = _decorator;

@ccclass( 'GameManager' )
export class GameManager extends Component
{

    @property( { type: UserOperation, tooltip: "User Option Node" } )
    public userOperation: UserOperation = null;

    @property( { type: Node, tooltip: "Bullet Layer Node" } )
    public bulletLayer: Node = null;

    @property( { type: Node, tooltip: "Fish Layer Node" } )
    public fishLayer: Node = null;

    @property( { type: Node, tooltip: "Cannon Layer Node" } )
    public cannonLayer: Node = null;

    @property( { type: Node, tooltip: "Tip Layer Node" } )
    public tipLayer: Node = null;

    @property( { type: ShootManager, tooltip: "Shoot Manager Node" } )
    public shootManager: ShootManager = null;

    @property( { type: TipsManager, tooltip: "Tips Manager Node" } )
    public tipsManager: TipsManager = null;

    protected onLoad(): void
    {
        // PhysicsSystem.instance.enable = true;
        // PhysicsSystem.instance.debugDrawFlags = EPhysicsDrawFlags.AABB |
        //     EPhysicsDrawFlags.WIRE_FRAME |
        //     EPhysicsDrawFlags.CONSTRAINT;


        this.init();
    }

    private init()
    {
        this.initCommon();
        this.initObserver();
    }

    private initCommon()
    {
        CommData.node.BulletLayer = this.bulletLayer;
        CommData.node.FishLayer = this.fishLayer;
        CommData.node.CannonLayer = this.cannonLayer;
        CommData.node.TipLayer = this.tipLayer;
        this.userOperation.InitUserInfo();
    }

    private initObserver()
    {
        Observer.Instance.Register( { name: "Main", callback: this.onObserverEvent.bind( this ) } );
    }

    private onObserverEvent( eventName: ObserverEventType, data: any ): void
    {
        switch ( eventName )
        {
            case ObserverEventType.TurboStateChange:
                this.shootManager.CoolDownTime = ( data as boolean ) === true ? TurboCoolDownTime : NormalCoolDownTime;
                break;
            case ObserverEventType.Shoot:
                this.shootManager.OnShootTouch( this.userOperation.IsExtraShootMode ? ShootMode.Extra : ShootMode.Normal, this.userOperation.CurrentBet );
                break;
            case ObserverEventType.Bet:
                this.userOperation.onBet( data as number );
                break;
            case ObserverEventType.FishDie:
                const fishInfo = data as FishInfo;
                this.tipsManager.ShowWin( fishInfo );
                this.userOperation.onReward( fishInfo.Reward );
                FishManager.instance.OnFishDie( fishInfo );
                break;
            case ObserverEventType.FishMiss:
                FishManager.instance.OnFishMiss( data as FishInfo );
                break;
            case ObserverEventType.BulletLifeDie:
                // 重置子彈下注
                const bet = data as number;
                this.userOperation.onResetBullet( bet );
                break;
        }
    }

    protected update( dt: number ): void
    {
        BulletManager.instance.onUpdate( dt );
        this.userOperation.onUpdate( dt );
        this.shootManager.onUpdate( dt );
    }
}


