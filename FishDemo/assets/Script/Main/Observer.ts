
export enum ObserverEventType
{
    Shoot,
    TurboStateChange,
    ExtraShootStateChange,
    Bet,
    FishDie,
    FishMiss,
    BulletLifeDie,
}
export type ObserverListener = { name: string, callback: ( eventType: ObserverEventType, data?: any ) => void };
export class Observer
{
    private _listeners: ObserverListener[] = [];
    private static s_instance: Observer = null;
    static get Instance(): Observer
    {
        if ( Observer.s_instance == null )
        {
            Observer.s_instance = new Observer();
        }
        return Observer.s_instance;
    }
    public Register( listener: ObserverListener )
    {
        this._listeners.push( listener );
    }

    public UnRegister( name: string )
    {
        for ( let x = 0; x < this._listeners.length; x++ )
        {
            if ( this._listeners[ x ].name === name )
            {
                this._listeners.splice( x, 1 );
                x--;
            }
        }
    }

    public Notify( event: ObserverEventType, data?: any )
    {
        this._listeners.forEach( listener => listener.callback( event, data ) );
    }
}