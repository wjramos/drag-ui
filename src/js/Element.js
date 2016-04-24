'use strict';

import $ from 'jquery';
import {
    draggable,
    droppable,
    resizable
} from 'jquery-ui';

export default class Element {
    constructor ( element = { }, parent ) {

        // Use to store jQuery object to only instanciate once per element
        const frame = this.frame = element.frame || { };
        this.unique_id = element.unique_id;
        this.type      = element.type;
        this.parent    = parent;
        this.children  = [];

        // Create DOM element -- store initial state
        this.$elem = $( '<div />', {
            id: this.unique_id   || '',
            class: 'tile',
            height: frame.height || 0,
            width:  frame.width  || 0,
            offset: {
                top:  frame.top  || 0,
                left: frame.left || 0
            },
            css: {
                position: 'absolute',
                overflow: 'hidden',
                'background-color' : frame[ 'background-color' ] || 'transparent'
            }

        } ).disableSelection( );

        // Recursively add child element classes-- set parent pointer to current Element
        if ( element.elements ) {
            element.elements.forEach( element => this.children.push( new Element( element, this ) ) );
        }

        this.bind( this.$elem );

        if ( this.parent ) {
            this.bind( this.parent.$elem );
        }

        // Delegate events and draw
        return this.delegate( );
    }

    delegate ( ) {
        /* Bind interaction handlers */
        let $elem = this.$elem;
        let self = this;

        $elem.on( 'dragstop', function( event, ui ) {
            /* Update element model on drag stop */
            self.frame.top  = ui.offset.top;
            self.frame.left = ui.offset.left;
        } );

        $elem.on( 'resizestop', function( event, ui ) {
            /* Update element model on resize stop */
            self.frame.height = ui.size.height;
            self.frame.width  = ui.size.width;
        } );

        $elem.on( 'drop', function ( event, ui ) {
            /* Prevent event bubbling */
            event.stopPropagation();

            /* Reset elem as dropped elem */
            self.$elem = ui.draggable;

            /* If current element is not already a child of drop point position and rebound */
            if ( self.parent && self.$elem.parent( )[ 0 ] !== self.parent.$elem[ 0 ] ) {
                let parentOffset = self.parent.$elem.offset();
                let offset = self.$elem.offset();

                /* Recalculate offset */
                self.$elem.detach( )
                          .css( 'top', offset.top - parentOffset.top )
                          .css( 'left', offset.left - parentOffset.left )
                          .appendTo( self.parent.$elem );

                self.bind( self.parent.$elem );

                /* Reset draggable bounds -- connect to new parent */
                return self.$elem.draggable( 'option', { containment: 'parent', connectWith: self.parent.$elem } ).droppable( 'option', { hoverClass: 'drop-hover' } );
            }
        } );

        $elem.on( 'dropover', function( event, ui ) {
            if ( self.parent ) {
                /* Update parent when context changes */
                return self.parent.$elem = self.bind( $( this ) );
            }
        } );


        return this.place( );
    }

    bind ( $target ) {
        /* Bind draggable and drag event callback -- needs to be reset when DOM changes */
        return $target.draggable( {
            containment: 'parent',
            connectWith: '.phone',
            cursor:      'move',
            delay:       150,
            opacity:     0.5,
            stack:       '.ui-draggable',
            snap:        '.ui-draggable',
        } ).droppable( {
            accept:      '.ui-draggable',
            hoverClass:  'drop-hover',
            tolerance:   'fit',
            greedy:      true
        } ).resizable( {
            containment: 'parent',
            handles:     'all'
        } );
    }

    place ( ) {
        /* Insert / Re-insert */
        if ( this.parent ) {
            this.$elem.appendTo( this.parent.$elem );
        } else {
            this.$elem.appendTo( '.phone' );
        }
        return this.draw( );
    }

    draw ( ) {
        this.bind( this.$elem );

        return this;
    }

    remove ( ) {
        /* Detach the element */
        this.$elem.detach( );

        return this;
    }

    destroy ( ) {
        /* Destroy the element */
        this.$elem.remove( );

        return this;
    }
}
