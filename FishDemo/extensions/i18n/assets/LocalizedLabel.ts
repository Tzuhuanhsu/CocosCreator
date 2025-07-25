
import * as i18n from './LanguageData';

import { _decorator, Component, Label, RichText } from 'cc';
const { ccclass, property, executeInEditMode } = _decorator;

@ccclass( 'LocalizedLabel' )
@executeInEditMode
export class LocalizedLabel extends Component
{
    label: Label | null = null;
    richText: RichText = null;

    @property( { visible: false } )
    key: string = '';

    @property( { displayName: 'Key', visible: true } )
    get _key()
    {
        return this.key;
    }
    set _key( str: string )
    {
        this.updateLabel();
        this.key = str;
    }

    onLoad()
    {
        if ( !i18n.ready )
        {
            i18n.init( 'tw' );
        }
        this.fetchRender();
    }

    fetchRender()
    {
        let label = this.getComponent( 'cc.Label' ) as Label;
        if ( label )
        {
            this.label = label;
            this.updateLabel();
            return;
        }

        let richText = this.getComponent( 'cc.RichText' ) as RichText;
        if ( richText )
        {
            this.richText = richText;
            this.updateLabel();
            return;
        }
    }

    updateLabel()
    {
        this.label && ( this.label.string = i18n.t( this.key ) );
        this.richText && ( this.richText.string = i18n.t( this.key ) );
    }
}
