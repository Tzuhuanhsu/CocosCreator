import * as cc from "cc";
import { GameFactory } from "../Main/GameFactory";
import { CommData } from "../Main/CommData";
import { Bullet } from "./Bullet";


const { ccclass, property } = cc._decorator;

//子彈類型
export enum BulletType
{
    Node = 0,
    Normal = 1,
    Explosive = 2,
}
//子彈資料
export class BulletData
{
    ID: number = 0;
    Type: BulletType = BulletType.Node;
    time: number = 0;
    bet: number = 0;
}

@ccclass( "BulletManager" )
export class BulletManager extends cc.Component
{
    private _lifeBulletData: BulletData[] = [];
    private _lifeBullets: Bullet[] = [];
    private static _instance: BulletManager = null;

    protected onLoad(): void
    {
        BulletManager.instance = this;
        if ( CommData.node.BulletLayer )
        {
            // CommData.node.BulletLayer.removeAllChildren();
        }
    }

    static get instance(): BulletManager
    {
        if ( !BulletManager._instance )
        {
            console.error( "BulletManager instance not initialized!" );
            return null;
        }
        return BulletManager._instance;
    }

    private static set instance( value: BulletManager )
    {
        BulletManager._instance = value;
    }


    /**
     * 建立子彈
     * @param stPos 
     * @param endPos 
     * @param bet 
     */
    CreateBullet( stPos: cc.Vec3, endPos: cc.Vec3, bet: number ): void
    {
        const bulletNode = GameFactory.instance.createBullet();
        bulletNode.parent = CommData.node.BulletLayer;
        bulletNode.setPosition( stPos );
        const bullet: Bullet = bulletNode.getComponent( Bullet );
        bullet.Init( endPos, bet );
        this._lifeBullets.push( bullet );
    }

    getBullet()
    {

    }

    onUpdate( dt: number ): void
    {
        this._lifeBullets.forEach( ( bullet, index ) =>
        {
            if ( bullet.isDie )
            {
                this._lifeBullets.splice( index, 1 );
                GameFactory.instance.recycleBullet( bullet.node );
            }
            else
            {
                bullet.onUpdate( dt );
            }
        } )
    }

    private onBulletHit()
    {

    }

    private onBulletEffect()
    {

    }
}