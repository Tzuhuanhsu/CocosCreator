import { _decorator, assetManager, CCBoolean, CCFloat, Component, JsonAsset, Label, Line, Node, Vec3 } from "cc";
import { FishPositionInfo, FishPositionInfoData } from "./FishPositionInfo";


const { ccclass, property, executeInEditMode, type } = _decorator;



@ccclass( 'FishPathCreator' )
@executeInEditMode( true )
export class FishPathCreator extends Line 
{

    @property( { type: Node, tooltip: "Formation Root Node", displayName: "Formation Root" } )
    formationRoot: Node;

    @property( { type: Node, tooltip: "Path Root Node", displayName: "Path Root" } )
    pathRoot: Node;

    @property( { type: JsonAsset, tooltip: "Path Data", displayName: "Path Data" } )
    pathData: JsonAsset;

    @type( [ Vec3 ] )
    fishPositions: Vec3[] = [];

    @type( [ Vec3 ] )
    fishRotations: Vec3[] = [];

    @type( [ Vec3 ] )
    fishScales: Vec3[] = [];

    @type( [ CCFloat ] )
    fishSpeeds: number[] = [];

    @type( [ CCFloat ] )
    fishDelays: number[] = [];

    @type( CCBoolean )
    refreshPath: boolean = false;

    start()
    {
        this.width.constant = 10;

    }

    updatePath()
    {
        const points = this.pathRoot.children.map( n => n.worldPosition );
        if ( points.length < 2 ) return;
        this.positions = points;
        const positions = this.pathRoot.children.map( n => n.getComponent( FishPositionInfo ) ).filter( info => info !== null );
        this.fishPositions = positions.map( info => info.PositionInfo.position );
        this.fishRotations = positions.map( info => info.PositionInfo.rotation );
        this.fishScales = positions.map( info => info.PositionInfo.scale );
        this.fishSpeeds = positions.map( info => info.PositionInfo.speed );
        this.fishDelays = positions.map( info => info.DelayTime );
    }

    protected update( dt: number ): void
    {
        this.updatePath();
        if ( this.refreshPath )
        {
            this.refreshPath = false;
            this.RefreshPathData();
        }
    }

    RefreshPathData()
    {
        if ( !this.pathData ) return;
        assetManager.loadAny( { uuid: this.pathData.uuid }, ( err, fishPositionData: JsonAsset ) =>
        {
            if ( err )
            {
                console.error( "Failed to load path data:", err );
                return;
            }

            const data: FishPositionInfoData[] = fishPositionData.json as FishPositionInfoData[];
            this.pathRoot.children.forEach( n =>
            {
                n.destroy();
            } );
            this.pathRoot.removeAllChildren();
            ;
            data.forEach( ( d, index ) =>
            {
                if ( index === 0 )
                {
                    this.formationRoot.setWorldPosition( new Vec3( d.position ) );
                }

                const node = new Node( `FishPositionInfo_${index}` );
                const info = node.addComponent( FishPositionInfo );
                node.parent = this.pathRoot;
                const position = new Vec3( d.position.x, d.position.y, d.position.z );
                const rotation = new Vec3( d.rotation.x, d.rotation.y, d.rotation.z );
                const scale = new Vec3( d.scale.x, d.scale.y, d.scale.z );
                const speed = d.speed;
                node.setWorldPosition( position );
                node.setRotationFromEuler( rotation );
                node.setWorldScale( scale );
                info.Speed = speed;

                info.DelayTime = d.delayTime;

            } );
        } );
    }
}