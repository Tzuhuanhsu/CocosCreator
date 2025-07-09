import * as cc from "cc";
import { ICollisionEvent } from "cc";
import { Observer, ObserverEventType } from "../Main/Observer";
const { ccclass, property } = cc._decorator;


/**
 * 子彈設定
 */
const BulletSetting =
{
    Speed: 800,
    LifeTime: 5,
}

@ccclass( "Bullet" )
export class Bullet extends cc.Component
{
    @property( cc.BoxCollider )
    private collider: cc.BoxCollider = null;

    //jumpNode
    private _jumpNode: cc.Node = null;
    //水平Node
    private _horizontalNode: cc.Node = null;
    //存活時間
    private _lifeTime: number = BulletSetting.LifeTime;
    //速度
    private _speed: number = BulletSetting.Speed;
    //方向
    private _dir: cc.Vec3 = cc.Vec3.ZERO;
    //增量
    private _delta: cc.Vec3 = cc.Vec3.ZERO;
    //是否結束
    private _isDie: boolean = true;
    //Bet
    private _bet: number = 0;
    protected onLoad(): void
    {
        this._jumpNode = new cc.Node();
        this._jumpNode.parent = this.node;
        this._horizontalNode = new cc.Node();
        this._horizontalNode.parent = this.node;
    }

    protected start(): void
    {
        this.collider.on( "onCollisionEnter", this.onCollisionEnter, this );
        cc.input.on( cc.Input.EventType.KEY_UP, ( event: cc.EventKeyboard ) =>
        {

            if ( event.keyCode === cc.KeyCode.KEY_A )
            {
                console.log( "A key pressed, testing aiming..." );
                this.testAiming();
            }
        }, this );
    }

    public get isDie(): boolean
    {
        return this._isDie;
    }

    public set isDie( value: boolean )
    {
        this._isDie = value;
    }

    onCollisionEnter( event: ICollisionEvent )
    {
        this.isDie = true;
    }

    testAiming()
    {
        const rand = cc.math.randomRangeInt( 10, 15 );
        const jumpHeight = cc.math.randomRangeInt( 30, 40 ); // 跳躍高度
        const duration = 1;      // 跳躍總時長
        const halfDuration = duration / 2;     // 上下各一半
        const jumpUp = cc.tween( this.node ).by( halfDuration, { position: new cc.Vec3( 0, jumpHeight, 0 ) }, { easing: 'sineOut' } );
        const jumpDown = cc.tween( this.node ).by( halfDuration, { position: new cc.Vec3( 0, -jumpHeight, 0 ) }, { easing: 'sineIn' } );
        cc.tween( this._jumpNode )
            .sequence( jumpUp, jumpDown )
            .start();
        this.node.setRotationFromEuler( 0, 0, -rand );
        this.node.setPosition( this.node.position.add( new cc.Vec3( 0, 0, jumpHeight ) ) );
    }

    Init( targetPos: cc.Vec3, bet: number ): void
    {
        this._dir = targetPos.subtract( this.node.position ).normalize();
        const angleRad = Math.atan2( this._dir.x, this._dir.y );
        const angleDeg = cc.math.toDegree( angleRad );
        this.node.angle = angleDeg;
        this._delta = this._dir.multiplyScalar( this._speed );
        this.isDie = false;
        this._lifeTime = BulletSetting.LifeTime;
        this.Bet = bet;
    }

    private set Bet( value: number )
    {
        if ( value < 0 )
        {
            console.error( "Bet cannot be negative!" );
            return;
        }
        this._bet = value;
    }

    public get Bet(): number
    {
        return this._bet;
    }

    onUpdate( deltaTime: number ): void
    {
        if ( this.isDie )
        {
            return;
        }
        this._lifeTime -= deltaTime;
        this.updatePos( deltaTime );
        this.checkLifeTime();
    }

    /**
     * 更新子彈位置
     * @param dt delta time
     */
    private updatePos( dt: number )
    {
        const deltaPos = new cc.Vec3();
        cc.Vec3.multiplyScalar( deltaPos, this._delta, dt );
        this.node.setPosition( this.node.position.add( deltaPos ) );
    }

    private checkLifeTime()
    {
        if ( this.isDie )
        {
            return;
        }
        if ( this._lifeTime <= 0 )
        {
            this.isDie = true;
            Observer.Instance.Notify( ObserverEventType.BulletLifeDie, this.Bet );
        }
    }
}