import * as cc from 'cc';
import { Observer, ObserverEventType } from './Observer';

const { ccclass, property } = cc._decorator;

const FakeUserInfo = {
    Balance: 10000000,
    DefaultBet: 100,
}

@ccclass( 'UserOperation' )
export class UserOperation extends cc.Component
{
    @property( { type: cc.Label, tooltip: "Balance Label", visible: true } )
    private _balanceLabel: cc.Label = null;

    @property( { type: cc.SpriteFrame, tooltip: "Turbo Sprite Frame", visible: true } )
    private _turboOnSprite: cc.SpriteFrame = null;

    @property( { type: cc.SpriteFrame, tooltip: "Normal Sprite Frame", visible: true } )
    private _turboOffSprite: cc.SpriteFrame = null;

    @property( { type: cc.Button, tooltip: "Turbo", visible: true } )
    private _turbo: cc.Button = null;

    @property( { type: cc.Button, tooltip: "Shoot Button", visible: true } )
    private _shootButton: cc.Button = null;

    @property( { type: cc.Button, tooltip: "Extra Shoot Button", visible: true } )
    private _extraShootButton: cc.Button = null;



    private isTurbo: boolean = false;
    private onShoot: boolean = false;
    private extraShootMode: boolean = false;
    private currentBet: number = FakeUserInfo.DefaultBet;
    protected onLoad(): void
    {
        this._shootButton.node.on( cc.Node.EventType.TOUCH_START, this.onShootButtonClick.bind( this, true ), this );
        this._shootButton.node.on( cc.Node.EventType.TOUCH_END, this.onShootButtonClick.bind( this, false ), this );
        this._shootButton.node.on( cc.Node.EventType.TOUCH_CANCEL, this.onShootButtonClick.bind( this, false ), this );
        this._turbo.node.on( cc.Button.EventType.CLICK, this.onTurboButtonClick, this );
        this._extraShootButton.node.on( cc.Button.EventType.CLICK, this.onExtraShootButtonClick, this );
    }
    public InitUserInfo(): void
    {
        if ( this._balanceLabel )
        {
            this._balanceLabel.string = FakeUserInfo.Balance.ThousandNumberConvert( 0 );
        }
        else
        {
            console.error( "Balance label not set!" );
        }
    }

    private onExtraShootButtonClick(): void
    {
        this.IsExtraShootMode = !this.IsExtraShootMode;
    }

    private onTurboButtonClick(): void
    {
        this.IsTurbo = !this.IsTurbo;
        Observer.Instance.Notify( ObserverEventType.TurboStateChange, this.IsTurbo );
    }

    public get IsTurbo(): boolean
    {
        return this.isTurbo;
    }

    private set IsTurbo( value: boolean )
    {
        this.isTurbo = value;
        const SpriteFrame = value ? this._turboOnSprite : this._turboOffSprite;
        this._turbo.normalSprite = SpriteFrame;
    }

    private onShootButtonClick( touchStart: boolean, _: cc.EventTouch ): void
    {
        this.onShoot = touchStart;

    }

    /**
     * 檢查下注條件
     * @returns 
     */
    private checkBetCondition(): boolean
    {
        const bet = this.IsExtraShootMode ? FakeUserInfo.DefaultBet * 3 : FakeUserInfo.DefaultBet;
        if ( FakeUserInfo.Balance < bet )
        {
            console.error( "Insufficient balance for the bet!" );
            return false;
        }
        return true;
    }

    /**
     * 下注
     * @param bet 
     */
    public onBet( bet: number )
    {
        FakeUserInfo.Balance -= bet;
        this._balanceLabel.string = FakeUserInfo.Balance.ThousandNumberConvert( 0 );
    }

    /**
     * 獲獎
     * @param reward 
     */
    public onReward( reward: number )
    {
        FakeUserInfo.Balance += reward;
        this._balanceLabel.string = FakeUserInfo.Balance.ThousandNumberConvert( 0 );
    }

    /**
     * 子彈歸還下注
     * @param bet 
     */
    public onResetBullet( bet: number )
    {
        FakeUserInfo.Balance += bet;
        this._balanceLabel.string = FakeUserInfo.Balance.ThousandNumberConvert( 0 );
    }
    onUpdate( dt: number ): void
    {
        this.onShootTouchProcess();

    }

    private onShootTouchProcess(): void
    {
        if ( !this.onShoot )
        {
            return;
        }
        if ( !this.checkBetCondition() )
        {
            return;
        }

        this.CurrentBet = this.extraShootMode ? FakeUserInfo.DefaultBet * 3 : FakeUserInfo.DefaultBet;
        Observer.Instance.Notify( ObserverEventType.Shoot, this.extraShootMode );
    }


    public get IsExtraShootMode(): boolean
    {
        return this.extraShootMode;
    }

    public set IsExtraShootMode( value: boolean )
    {
        const SpriteFrame = value ? this._turboOnSprite : this._turboOffSprite;
        this._extraShootButton.normalSprite = SpriteFrame;
        this.extraShootMode = value;
    }

    public get CurrentBet(): number
    {
        return this.currentBet;
    }

    public set CurrentBet( value: number )
    {
        this.currentBet = value;
    }
}
