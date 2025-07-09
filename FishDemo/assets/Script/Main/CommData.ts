import * as cc from "cc";
import { Cannon } from "../Cannon/Cannon";

export namespace CommData
{
    export const node =
    {
        BulletLayer: null as cc.Node,
        FishLayer: null as cc.Node,
        CannonLayer: null as cc.Node,
        TipLayer: null as cc.Node
    }


}

export namespace CommonFun
{

    /**
     * 轉換節點到相對目標的節點座標
     * @param target 
     * @param node 
     * @param pos 
     * @returns 
     */
    export function TransPos( target: cc.Node, node: cc.Node, pos: cc.Vec3 = cc.Vec3.ZERO ): cc.Vec3
    {
        const localPos = new cc.Vec3();
        const worldPos = node.getComponent( cc.UITransform )?.convertToWorldSpaceAR( pos );
        target.getComponent( cc.UITransform )?.convertToNodeSpaceAR( worldPos, localPos );
        return localPos;
    }
}