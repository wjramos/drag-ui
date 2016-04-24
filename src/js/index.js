'use strict';

// Import page class and elements
import Page from './Page';
import ELEMS from './data';
import $ from 'jquery';

// Instanciate initial page with supplied elements
// Call draw method on docReady ( shorthand )
$( ( ) => new Page( ELEMS ).draw( ) );
