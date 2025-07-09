import * as cc from "cc";
import { FishManager } from "../Fish/FishManager";
import { CannonManager } from "../Cannon/CannonManager";
import { BulletManager } from "../Bullet/BulletManager";
import { CommData, CommonFun } from "./CommData";
import { Observer, ObserverEventType } from "./Observer";

const { ccclass, property } = cc._decorator;
export const NormalCoolDownTime = 0.3; // 冷卻時間
export const TurboCoolDownTime = 0.1; // 減少冷卻時間
export const enum ShootMode
{
    Normal = 0, // 普通射擊模式
    Extra = 2, // 額外射擊模式
}

@ccclass( "ShootManager" )
export class ShootManager extends cc.Component
{
    private _coolDownTime: number = 0; // 冷卻時間計時器
    private _countCoolDownTime: number = 0; // 計時器

    protected onLoad(): void
    {
        this._coolDownTime = NormalCoolDownTime;
        this._countCoolDownTime = NormalCoolDownTime;
    }

    public OnShootTouch( shootMode: ShootMode, bet: number ): void
    {
        this.shootProcess( shootMode, bet );
    }

    set CoolDownTime( value: number )
    {
        this._coolDownTime = value;
    }

    get CoolDownTime(): number
    {
        return this._coolDownTime;
    }

    private shootProcess( shootMode: ShootMode, bet: number ): void
    {
        if ( !this.readyToShoot() )
        {
            return;
        }

        this._countCoolDownTime = this._coolDownTime; // 重置冷卻時間
        this.onShoot( shootMode, bet ); // 執行射擊邏輯
    }

    /**
     * 執行射擊邏輯
     * @param shootMode 
     * @param bet 
     * @returns 
     */
    private onShoot( shootMode: ShootMode, bet: number )
    {
        const cannon = CannonManager.Instance.currentCannon;
        const fish = FishManager.instance.currentFish;
        if ( !fish )
        {
            console.error( "No fish available to shoot at!" );
            return;
        }
        if ( !cannon )
        {
            console.error( "No cannon available to shoot with!" );
            return;
        }
        const targetFishes = shootMode === ShootMode.Normal ? [ fish[ 0 ] ] : fish.slice( 0, 3 );

        console.log( "Target fishes for shooting:", targetFishes.length, bet );
        const bulletBet = bet / targetFishes.length
        for ( const target of targetFishes )
        {
            if ( !target ) continue;
            if ( target.IsDie )
            {
                console.warn( "Fish is already dead, skipping..." );
                continue; // 如果魚已經死亡，則跳過
            }

            BulletManager.instance.CreateBullet(
                CommonFun.TransPos( CommData.node.BulletLayer, cannon.muzzleNode ),
                CommonFun.TransPos( CommData.node.BulletLayer, target.node, target.HisPosition ),
                bulletBet
            );
            Observer.Instance.Notify( ObserverEventType.Bet, bulletBet );

        }
        cannon.Shoot();
    }
    /**
     * 檢查是否可以射擊
     * @returns 
     */
    private readyToShoot(): boolean
    {
        if ( this._countCoolDownTime > 0 )
        {
            return false;
        }
        return true;
    }

    public onUpdate( dt: number ): void
    {
        if ( this._countCoolDownTime > 0 )
        {
            this._countCoolDownTime = Math.max( 0, this._countCoolDownTime - dt );
        }
    }
}