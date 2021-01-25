/**
 * @see https://forge.autodesk.com/en/docs/viewer/v7/developers_guide/viewer_basics/extensions/
 * @see https://learnforge.autodesk.io/#/tutorials/extensions
 */

function MyAwesomeExtension ( viewer, options ) {

	Autodesk.Viewing.Extension.call( this, viewer, options );

}

MyAwesomeExtension.prototype = Object.create( Autodesk.Viewing.Extension.prototype );
MyAwesomeExtension.prototype.constructor = MyAwesomeExtension;

MyAwesomeExtension.prototype.load = function () {

	// console.log( Object.keys( window ) );
	// Object.keys( window ).forEach( key => console.log( key ) );

	alert( 'MyAwesomeExtension is loaded!' );
	return true;

};

MyAwesomeExtension.prototype.unload = function () {

	alert( 'MyAwesomeExtension is unloaded!' );
	return true;

};

Autodesk.Viewing.theExtensionManager.registerExtension( 'MyAwesomeExtension', MyAwesomeExtension );
