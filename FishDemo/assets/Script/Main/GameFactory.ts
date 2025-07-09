import * as cc from "cc";
import { BUILD } from "cc/env";
import { Bullet } from "../Bullet/Bullet";
import { Fish } from "../Fish/Fish";
import { Cannon } from "../Cannon/Cannon";
import { FishID } from "../Fish/FishSetting";

const { ccclass, property } = cc._decorator;
@ccclass( "GameFactory" )
export class GameFactory extends cc.Component
{
    @property( { type: cc.Prefab, tooltip: "Bullet Prefab" } )
    public BulletPrefab: cc.Prefab = null;

    @property( { type: cc.Prefab, tooltip: "Fish Prefab" } )
    public FishPrefab: cc.Prefab[] = [];

    @property( { type: cc.Prefab, tooltip: "Cannon Prefab" } )
    public CannonPrefab: cc.Prefab = null;

    @property( { type: cc.Node, tooltip: "Fish Miss Effect Node" } )
    public FishMissEffect: cc.Node = null;

    @property( { type: cc.Node, tooltip: "Fish Hit Effect Node" } )
    public FishHitEffect: cc.Node = null;


    private static _instance: GameFactory = null;
    private _bulletPool: cc.NodePool = new cc.NodePool();
    private _fishPool: Map<FishID, cc.NodePool> = new Map<FishID, cc.NodePool>();
    private _cannonPool: cc.NodePool = new cc.NodePool();
    private _fishMissEffectPool: cc.NodePool = new cc.NodePool();
    private _fishHitEffectPool: cc.NodePool = new cc.NodePool();

    protected onLoad(): void
    {
        GameFactory._instance = this;
        this.preloadFishPools();
    }

    /**
     * Preload fish pools based on the FishPrefab array.
     */
    public preloadFishPools(): void
    {
        for ( const fishPrefab of this.FishPrefab )
        {

            const fish = cc.instantiate( fishPrefab );
            const fishSetting = fish.getComponent( Fish )?.fishSetting;
            if ( fishSetting )
            {
                const fishID = fishSetting.FishID;
                const fishPool = this.getFishPool( fishID );
                fishPool.put( fish );
            }
        }
    }

    /**
     * 魚池
     * @param fishID 
     * @returns 
     */
    private getFishPool( fishID: FishID ): cc.NodePool
    {
        if ( !this._fishPool.has( fishID ) )
        {
            this._fishPool.set( fishID, new cc.NodePool() );
        }
        return this._fishPool.get( fishID );
    }

    public static get instance(): GameFactory
    {
        if ( !GameFactory._instance )
        {
            console.error( "GameFactory instance not initialized!" );
            return null;
        }
        return GameFactory._instance;
    }

    public CreateCannon(): cc.Node
    {
        if ( this._cannonPool.size() > 0 )
        {
            return this._cannonPool.get();
        }
        else
        {
            // 如果池中沒有可用的砲，則創建一個新的砲節點
            const cannonNode = cc.instantiate( this.CannonPrefab ); // 假設砲的Prefab與子彈相同
            if ( cannonNode )
            {
                return cannonNode;
            }
            else
            {
                console.error( "Failed to create a new cannon node!" );
                return null;
            }
        }
    }

    public recycleCannon( cannonNode: cc.Node ): void
    {
        if ( !cannonNode || !cannonNode.getComponent( Cannon ) )
        {
            console.error( "Cannot recycle a null cannon node!" );
            return;
        }
        this._cannonPool.put( cannonNode );
    }

    /**
     * 命中特效
     * @returns 
     */
    public getHitEffect(): cc.Node
    {
        if ( this._fishHitEffectPool.size() > 0 )
        {
            return this._fishHitEffectPool.get();
        }
        else
        {
            // 如果池中沒有可用的魚擊中特效，則創建一個新的特效節點
            const effectNode = cc.instantiate( this.FishHitEffect );
            if ( effectNode )
            {
                return effectNode;
            }
            else
            {
                console.error( "Failed to create a new fish hit effect node!" );
                return null;
            }
        }
    }

    public recycleHitEffect( effectNode: cc.Node ): void
    {
        if ( !effectNode || !effectNode.getComponent( cc.ParticleSystem ) )
        {
            console.error( "Cannot recycle a null hit effect node!" );
            return;
        }
        this._fishHitEffectPool.put( effectNode );
    }

    public getMissEffect(): cc.Node
    {
        if ( this._fishMissEffectPool.size() > 0 )
        {
            return this._fishMissEffectPool.get();
        }
        else
        {
            // 如果池中沒有可用的魚錯過特效，則創建一個新的特效節點
            const effectNode = cc.instantiate( this.FishMissEffect );
            if ( effectNode )
            {
                return effectNode;
            }
            else
            {
                console.error( "Failed to create a new fish miss effect node!" );
                return null;
            }
        }
    }

    public recycleMissEffect( effectNode: cc.Node ): void
    {
        if ( !effectNode || !effectNode.getComponent( cc.ParticleSystem ) )
        {
            console.error( "Cannot recycle a null miss effect node!" );
            return;
        }
        this._fishMissEffectPool.put( effectNode );
    }
    /**
     * 建立魚
     * @returns 
     */
    public createFish(): cc.Node
    {
        const randomIndex = cc.math.randomRangeInt( 0, this._fishPool.size );
        const fishPool = this.getFishPool( randomIndex );
        if ( fishPool.size() > 0 )
        {
            return fishPool.get();
        }
        else
        {
            // 如果池中沒有可用的魚，則創建一個新的魚節點
            const fishNode = cc.instantiate( this.FishPrefab[ randomIndex ] ); // 假設魚的Prefab與子彈相同
            if ( fishNode )
            {
                return fishNode;
            }
            else
            {
                console.error( "Failed to create a new fish node!" );
                return null;
            }
        }
    }

    /**
     * 回收魚
     * @param fishId 
     * @param fishNode 
     * @returns 
     */
    public recycleFish( fishId: FishID, fishNode: cc.Node ): void
    {
        if ( !fishNode || !fishNode.getComponent( Fish ) )
        {
            console.error( "Cannot recycle a null fish node!" );
            return;
        }
        this.getFishPool( fishId )?.put( fishNode );
    }

    /**
     * 建立子彈
     * @returns A new bullet node from the pool or a newly created bullet node.
     */
    public createBullet(): cc.Node
    {
        if ( this._bulletPool.size() > 0 )
        {
            return this._bulletPool.get();
        }
        else
        {
            // 如果池中沒有可用的子彈，則創建一個新的子彈節點
            const bulletNode = cc.instantiate( this.BulletPrefab );
            if ( bulletNode )
            {
                return bulletNode;
            }
            else
            {
                console.error( "Failed to create a new bullet node!" );
                return null;
            }
        }
    }

    /**
     * Recycle a bullet node back to the pool.
     * @param bulletNode The bullet node to recycle.
     */
    public recycleBullet( bulletNode: cc.Node ): void
    {
        if ( !bulletNode || !bulletNode.getComponent( Bullet ) )
        {
            console.error( "Cannot recycle a null bullet node!" );
            return;
        }
        this._bulletPool.put( bulletNode );
    }

}