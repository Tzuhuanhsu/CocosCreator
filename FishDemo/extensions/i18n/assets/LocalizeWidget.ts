
import * as i18n from './LanguageData';
import * as cc from "cc";
const { ccclass, property, executeInEditMode, requireComponent } = cc._decorator;

@ccclass( "WidgetItem" )
export class WidgetItem 
{
    @property( cc.CCString )
    public Lang: string = "UNKNOWN";
    @property( { tooltip: "Widget Left 對齊位置", type: cc.CCFloat } )
    public Left: number = 0;
    @property( { tooltip: "Widget Right 對齊位置", type: cc.CCFloat } )
    public Right: number = 0;
    @property( { tooltip: "Widget Top 對齊位置", type: cc.CCFloat } )
    public Top: number = 0;
    @property( { tooltip: "Widget Bottom 對齊位置", type: cc.CCFloat } )
    public Bottom: number = 0;
    @property( { tooltip: "scale", type: cc.Vec3 } )
    public Scale: cc.Vec3 = cc.v3( 1, 1, 1 );
    refreshWidget( target: cc.Widget )
    {
        target.top = this.Top;
        target.bottom = this.Bottom;
        target.right = this.Right;
        target.left = this.Left;
        target.node.scale = this.Scale;
    }
}


@ccclass( 'LocalizedWidget' )
@requireComponent( cc.UITransform )
@requireComponent( cc.Widget )
@executeInEditMode
export class LocalizedWidget extends cc.Component
{
    @property( cc.CCBoolean )
    public RefreshLandscape: boolean = false

    @property( cc.CCBoolean )
    public RefreshPortrait: boolean = false

    @property( { type: WidgetItem, group: { name: "Landscape" } } )
    public LandscapeWidgetItems: WidgetItem[] = [];

    @property( { type: WidgetItem, group: { name: " Portrait" } } )
    public PortraitWidgetItems: WidgetItem[] = [];

    private _selfWidget: cc.Widget;
    private _useWidgetItems: WidgetItem[] = null;
    onLoad()
    {
        this._selfWidget = this.node.getComponent( cc.Widget );
        if ( !i18n.ready )
        {
            i18n.init( 'tw' );
        }
        this.OnLandscape();

    }

    OnLandscape()
    {
        this._useWidgetItems = this.LandscapeWidgetItems;
    }

    OnPortrait()
    {
        this._useWidgetItems = this.PortraitWidgetItems;
    }

    updateWidget()
    {
        for ( let i = 0; i < this._useWidgetItems.length; i++ )
        {
            const item = this._useWidgetItems[ i ];
            if ( item.Lang === i18n._language )
            {
                item.refreshWidget( this._selfWidget );
            }
        }
    }

    protected update( dt: number ): void
    {
        if ( this.RefreshPortrait )
        {
            this.RefreshPortrait = !this.RefreshPortrait;
            this.OnPortrait();
            this.updateWidget();
            cc.log( this.name, "refreshPortrait Finish" );
        }

        if ( this.RefreshLandscape )
        {
            this.RefreshLandscape = !this.RefreshLandscape;
            this.OnLandscape();
            this.updateWidget();
            cc.log( this.name, "refreshLandscape Finish" );
        }
    }
}