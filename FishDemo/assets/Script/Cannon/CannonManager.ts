import * as cc from 'cc';
import { CommData } from '../Main/CommData';
import { GameFactory } from '../Main/GameFactory';
import { Cannon } from './Cannon';

const { ccclass, property } = cc._decorator;

@ccclass( 'CannonManager' )
export class CannonManager extends cc.Component
{
    private static _instance: CannonManager = null;

    private _currentCannon: Cannon = null;

    private static set Instance( value: CannonManager )
    {
        CannonManager._instance = value;
    }

    static get Instance(): CannonManager
    {
        if ( !CannonManager._instance )
        {
            console.error( "CannonManager instance not initialized!" );
            return null;
        }
        return CannonManager._instance;
    }



    protected onLoad(): void
    {
        CannonManager.Instance = this;
        if ( CommData.node.CannonLayer )
        {
            this.currentCannon = CommData.node.CannonLayer.getComponentInChildren( Cannon );
        }
    }

    get currentCannon(): Cannon
    {
        return this._currentCannon;
    }

    private set currentCannon( value: Cannon )
    {
        if ( value instanceof Cannon )
        {
            this._currentCannon = value;
        }
        else
        {
            console.error( "Invalid Cannon instance!" );
        }
    }
}