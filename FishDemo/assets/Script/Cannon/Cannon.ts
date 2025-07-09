import * as cc from "cc";

const { ccclass, property } = cc._decorator;

@ccclass( "Cannon" )
export class Cannon extends cc.Component
{
    @property( { type: cc.Node, tooltip: "Muzzle Node", visible: true } )
    private _muzzleNode: cc.Node = null;


    @property( { type: cc.Animation, tooltip: "Cannon Animation", visible: true } )
    public animation: cc.Animation = null;

    get muzzleNode(): cc.Node
    {
        return this._muzzleNode;
    }

    /**
     * @description 發射子彈
     */
    Shoot(): void
    {
        this.animation.play( "CharacterArmature|Weapon" );
        this.animation.once( cc.Animation.EventType.FINISHED, () =>
        {
            console.log( "Cannon shoot animation finished." );
        } );
    }


    Idle(): void
    {
        this.animation.play( "CharacterArmature|Idle" );
    }

}