const gulp         = require( 'gulp' );
const del          = require( 'del' );
const browserSync  = require( 'browser-sync' );
const buffer       = require( 'vinyl-buffer' );
const source       = require( 'vinyl-source-stream' );
const browserify   = require( 'browserify' );
const babelify     = require( 'babelify' );
const sass         = require( 'gulp-sass' );
const pug          = require( 'gulp-pug' );
const inline       = require( 'gulp-inline' );
const uglify       = require( 'gulp-uglify' )
const cleanCss     = require( 'gulp-clean-css' );
const sourcemaps   = require( 'gulp-sourcemaps' );
const concat       = require( 'gulp-concat' );
const reload       = browserSync.reload;

const PATH = {
    JS:   './src/js/*.js',
    TEST: './src/js/test/*-spec.js',
    PUG:  './src/templates/*.pug',
    SCSS: './src/scss/*.scss',
    DIST: './dist/'
};

// Clean -- Purge old files
gulp.task( 'clean', () => {
    return del( [ 'dist' ] );
} );

/**
 * JS - Bundle, sourcemap, transpile, concatenate
 */
gulp.task( 'js', () => {
    return browserify( './src/js/index.js', { debug: true } )
        .transform( babelify, { presets: [ "es2015" ], compact: false } )
        .bundle()
        .pipe( source( 'dist/main.js' ) )
        .pipe( buffer() )
        .pipe( sourcemaps.init( { loadMaps: true } ) )
        .pipe( concat( 'main.js' ) )
        .pipe( sourcemaps.write( '.' ) )
        .pipe( gulp.dest( PATH.DIST ) );
    }
);

/**
 * Sass - Sourcemap, minify, compile, and trigger reload
 */
gulp.task( 'sass', () => {

    return gulp.src( PATH.SCSS )
        .pipe( sourcemaps.init() )
        .pipe( sass() )
        .pipe( cleanCss() )
        .pipe( sourcemaps.write( '.' ) )
        .pipe( gulp.dest( PATH.DIST ) );
} );


/**
 * Compile jade files into HTML
 */
gulp.task( 'templates', () => {
    const options = {
        pretty: false
    };

    return gulp.src( PATH.PUG )
        .pipe( pug( options ) )
        .pipe( gulp.dest( PATH.DIST ) );
} );

/**
 * Compile sources into inline styles and scripts
 */
gulp.task( 'inline', [ 'sass', 'js', 'templates' ], () => {
    const options = {
        base: PATH.DIST,
        js: uglify,
        css: cleanCss
    };

    return gulp.src( PATH.DIST + 'index.html' )
        .pipe( inline( options ) )
        .pipe( gulp.dest( PATH.DIST ) )
        .pipe( reload( { stream: true } ) );
} );

/**
 * Template task for live injecting into all browsers
 */
gulp.task( 'pug-watch', [ 'templates' ], reload );


/**
 * Serve and watch the scss/jade files for changes
 */
gulp.task( 'default', [ 'clean', 'inline' ], () => {
    var options = {
        server: PATH.DIST
    };

    browserSync( options );

    gulp.watch( PATH.JS, [ 'js', 'inline' ] );
    gulp.watch( PATH.SCSS, [ 'sass', 'inline' ] );
    gulp.watch( PATH.PUG, [ 'pug-watch', 'inline' ] );
} );
