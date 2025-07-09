import * as cc from "cc";
import { EventTouch, Vec3, UITransform } from "cc";

const { ccclass, property } = cc._decorator;

@ccclass( "Cursor" )
export class Cursor extends cc.Component
{

    @property( { type: cc.Node, tooltip: "Cursor Node" } )
    public cursorNode: cc.Node = null;
    protected onLoad(): void
    {
        this.node.on( cc.Node.EventType.MOUSE_MOVE, this.onTouchMove, this, true );
        const uiTransform = this.node.getComponent( UITransform );
        const canvas = cc.find( "Canvas" );
        if ( uiTransform && canvas )
        {
            uiTransform.setContentSize( canvas.getComponent( UITransform ).contentSize );
        }
        else
        {
            console.error( "UITransform or Canvas not found!" );
        }

    }

    private onTouchMove( event: EventTouch ): void
    {
        const touchPos = event.getUILocation();
        const localPos = new Vec3();
        this.node.getComponent( UITransform )?.convertToNodeSpaceAR(
            new Vec3( touchPos.x, touchPos.y, 0 ),
            localPos
        );
        this.cursorNode.setPosition( localPos );
    }
}