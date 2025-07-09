import * as cc from "cc";
import { Fish, FishInfo } from "./Fish";
import { CommData } from "../Main/CommData";
import { GameFactory } from "../Main/GameFactory";
import { Observer, ObserverEventType } from "../Main/Observer";
const { ccclass, property } = cc._decorator;

@ccclass( "FishManager" )
export class FishManager extends cc.Component
{
    private _currentFish: Fish[] = [];
    private static _instance: FishManager = null;

    protected onLoad(): void
    {
        FishManager.instance = this;
        if ( CommData.node.FishLayer )
        {
            this.currentFish = CommData.node.FishLayer.getComponentsInChildren( Fish );
        }
    }

    /**
     * 魚死亡事件處理
     * @param fishInfo 魚資訊
     */
    public OnFishDie( fishInfo: FishInfo ): void
    {
        if ( fishInfo && fishInfo.Node )
        {
            const fishNode = fishInfo.Node;
            const fish = fishNode.getComponent( Fish );
            if ( fish )
            {
                //放出煙霧
                const smokeParticleNode = GameFactory.instance.getHitEffect();
                if ( smokeParticleNode )
                {
                    const smokeParticle = smokeParticleNode.getComponent( cc.ParticleSystem );
                    smokeParticleNode.parent = CommData.node.FishLayer;
                    smokeParticleNode.position = fishNode.position;
                    smokeParticle.node.active = true;
                    smokeParticle.clear();
                    smokeParticle.stop();
                    smokeParticle.play();
                    this.scheduleOnce( () =>
                    {
                        smokeParticle.clear();
                        smokeParticle.stop();
                        smokeParticle.node.active = false;
                        GameFactory.instance.recycleHitEffect( smokeParticleNode );
                        this.ResetFish( fish );

                    }, 1.5 );
                }
            }
        }
    }


    /**
     * Fish Miss Event Handler
     * @param fishInfo 
     */
    public OnFishMiss( fishInfo: FishInfo )
    {
        if ( fishInfo && fishInfo.Node )
        {
            const fishNode = fishInfo.Node;
            const missParticleNode = GameFactory.instance.getMissEffect();
            if ( missParticleNode )
            {
                const missParticle = missParticleNode.getComponent( cc.Animation );
                missParticleNode.parent = CommData.node.FishLayer;
                missParticleNode.position = fishNode.position;
                missParticle.play( missParticle.defaultClip.name );
                missParticle.once( cc.Animation.EventType.FINISHED, () =>
                {
                    missParticleNode.active = false;
                    GameFactory.instance.recycleMissEffect( missParticleNode );
                } );

            }
        }
    }

    ResetFish( diedFish: Fish ): void
    {
        const fishNode = GameFactory.instance.createFish();
        if ( fishNode )
        {
            //回收魚
            GameFactory.instance.recycleFish( diedFish.fishSetting.FishID, diedFish.node );
            const fish = fishNode.getComponent( Fish );

            for ( let x = 0; x < this._currentFish.length; x++ )
            {
                if ( this._currentFish[ x ] === diedFish )
                {
                    this._currentFish[ x ] = fish;
                    break;
                }
            }
            fish.Init();
            fishNode.parent = CommData.node.FishLayer;
            fishNode.setPosition( diedFish.node.position );
        }
        else
        {
            console.error( "Failed to create fish!" );
        }
    }

    static get instance(): FishManager
    {
        if ( !FishManager._instance )
        {
            console.error( "FishManager instance not initialized!" );
            return null;
        }
        return FishManager._instance;
    }

    private static set instance( value: FishManager )
    {
        FishManager._instance = value;
    }

    get currentFish(): Fish[]
    {
        return this._currentFish;
    }

    private set currentFish( value: Fish[] )
    {
        this._currentFish = value;
    }
}