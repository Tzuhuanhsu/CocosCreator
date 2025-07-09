import * as cc from "cc";
import { CommData } from "./CommData";
import { Fish, FishInfo } from "../Fish/Fish";
import { t } from "../../../extensions/i18n/assets/LanguageData";

const { ccclass, property } = cc._decorator;
@ccclass( "TipsManager" )
export class TipsManager extends cc.Component
{
    @property( cc.Camera )
    private camera3D: cc.Camera = null; // 3D攝像機

    @property( cc.Camera )
    private camera2D: cc.Camera = null; // 2D攝像機

    @property( cc.Label )
    private tipsLabel: cc.Label = null; // 提示文字的Label組件

    private winTipPool: cc.NodePool = new cc.NodePool()
    protected start(): void
    {
        this.tipsLabel.node.active = false; // 初始時隱藏提示文字
    }

    /**
     * 從 Pool 取得Reward Label
     * @returns 
     */
    private getTipWinLabel(): cc.Label
    {
        let tipNode: cc.Label = null;
        if ( this.winTipPool.size() > 0 )
        {
            tipNode = this.winTipPool.get().getComponent( cc.Label );
        }
        else
        {
            tipNode = cc.instantiate( this.tipsLabel.node ).getComponent( cc.Label );
        }
        return tipNode;
    }

    /**
     * 顯示獲獎
     * @param target 
     * @returns 
     */
    ShowWin( target: FishInfo )
    {
        const fish = target.Node.getComponent( Fish );


        // 取得魚的世界座標
        const uiTransform = fish.node.getComponent( cc.UITransform );
        if ( !uiTransform ) return;

        const worldPos = uiTransform.convertToWorldSpaceAR( fish.HisPosition );

        // 世界座標轉螢幕座標，再轉回2D世界座標
        const position3D = this.camera3D?.worldToScreen( worldPos );
        if ( !position3D ) return;

        const position2D = this.camera2D?.screenToWorld( position3D );
        if ( !position2D ) return;

        // 轉換到 TipLayer 的本地座標
        const tipLayer = CommData.node.TipLayer?.getComponent( cc.UITransform );
        if ( !tipLayer ) return;

        const localPosition = tipLayer.convertToNodeSpaceAR( position2D );
        const label = this.getTipWinLabel();
        // 顯示獎勵金額
        label.string = `$${target.Reward.toFixed( 2 )}`;
        // 設定提示文字的位置
        label.node.setPosition( localPosition );
        label.node.parent = CommData.node.TipLayer;
        label.node.active = true;
        cc.tween( label.node )
            .to( 0.5, { scale: cc.v3( 1.5, 1.5, 1.5 ) } )
            .to( 0.5, { scale: cc.v3( 1, 1, 1 ) } )
            .call( () =>
            {
                // 動畫結束後隱藏提示文字
                this.winTipPool.put( label.node );
            } )
            .start();
    }
}