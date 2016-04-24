'use strict';

import Element from './Element';

export default class Page {
    // Create page object, return this to allow chaining
    constructor ( elements = [] ) {
        this.elements = [];
        /* Push top level elements to page */
        elements.forEach( element => this.elements.push( new Element( element ) ) );

        return this;
    }

    // Add new element to the page
    addElement( element ) {
        this.elements.push( new Element( element ) );

        return this;
    }

    // The state of the page is stored in the class, leverage that
    draw ( ) {
        this.elements.forEach(
            element => element.draw( )
        );

        return this;
    }

    // Removes all elements from page
    clear ( ) {
        this.elements.forEach(
            element => element.remove( )
        );

        return this;
    }
}
