import {

	EventDispatcher,
	Raycaster,
	Object3D,
	Matrix4,
	Vector3,
	Euler
	// MOUSE

// } from 'three';
} from '../../../libs/three.js/build/three.module.js';

/**
* Holds the implementation of the First-Person Shooter Controls.
* Holds the implementation of the First-Person Player Controls.
*/
// const FirstPersonShooterControls = function ( object, domElement ) {
// const FPPControls = function ( object, domElement ) {
const PlatformerControls = function ( object, domElement, mass, playerHeight, doubleJump, worldObjects ) {


	if ( domElement === undefined ) {

		console.warn( 'THREE.PlatformerControls: The second parameter "domElement" is now mandatory.' );
		domElement = document;

	}

	this.object = object;
	this.domElement = domElement;

	// API

	this.enabled = true;
	// ---

	// Internals

	// ---

	// Private variables

	// ---

	this.onMouseDown = function ( event ) {

		if ( this.domElement !== document ) {

			this.domElement.focus();

		}

		event.preventDefault();
		event.stopPropagation();

		console.log( 'onMouseDown', event );

		// if ( this.activeLook ) {
		//
		// 	switch ( event.button ) {
		//
		// 		case 0: this.moveForward = true; break;
		// 		case 2: this.moveBackward = true; break;
		//
		// 	}
		//
		// }
		//
		// this.mouseDragOn = true;

	};

	this.onMouseUp = function ( event ) {

		event.preventDefault();
		event.stopPropagation();

		console.log( 'onMouseUp', event );

		// if ( this.activeLook ) {
		//
		// 	switch ( event.button ) {
		//
		// 		case 0: this.moveForward = false; break;
		// 		case 2: this.moveBackward = false; break;
		//
		// 	}
		//
		// }
		//
		// this.mouseDragOn = false;

	};

	this.onMouseMove = function ( event ) {

		console.log( 'onMouseMove', event );

		// if ( this.domElement === document ) {
		//
		// 	this.mouseX = event.pageX - this.viewHalfX;
		// 	this.mouseY = event.pageY - this.viewHalfY;
		//
		// } else {
		//
		// 	this.mouseX = event.pageX - this.domElement.offsetLeft - this.viewHalfX;
		// 	this.mouseY = event.pageY - this.domElement.offsetTop - this.viewHalfY;
		//
		// }

	};

	this.onContextMenu = function ( event ) {

		event.preventDefault();
		event.stopPropagation();

		console.log( 'onContextMenu', event );

	}

	this.onKeyDown = function ( event ) {

		// event.preventDefault();

		console.log( 'onKeyDown', event.keyCode );

		// switch ( event.keyCode ) {
		//
		// 	case 38: /*up*/
		// 	case 87: /*W*/ this.moveForward = true; break;
		//
		// 	case 37: /*left*/
		// 	case 65: /*A*/ this.moveLeft = true; break;
		//
		// 	case 40: /*down*/
		// 	case 83: /*S*/ this.moveBackward = true; break;
		//
		// 	case 39: /*right*/
		// 	case 68: /*D*/ this.moveRight = true; break;
		//
		// 	case 82: /*R*/ this.moveUp = true; break;
		// 	case 70: /*F*/ this.moveDown = true; break;
		//
		// }

	};

	this.onKeyUp = function ( event ) {

		// event.preventDefault();

		console.log( 'onKeyUp', event.keyCode );

		// switch ( event.keyCode ) {
		//
		// 	case 38: /*up*/
		// 	case 87: /*W*/ this.moveForward = false; break;
		//
		// 	case 37: /*left*/
		// 	case 65: /*A*/ this.moveLeft = false; break;
		//
		// 	case 40: /*down*/
		// 	case 83: /*S*/ this.moveBackward = false; break;
		//
		// 	case 39: /*right*/
		// 	case 68: /*D*/ this.moveRight = false; break;
		//
		// 	case 82: /*R*/ this.moveUp = false; break;
		// 	case 70: /*F*/ this.moveDown = false; break;
		//
		// }

	};

	this.dispose = function () {

		this.domElement.removeEventListener( 'contextmenu', _onContextMenu, false );
		this.domElement.removeEventListener( 'mousedown', _onMouseDown, false );
		this.domElement.removeEventListener( 'mousemove', _onMouseMove, false );
		this.domElement.removeEventListener( 'mouseup', _onMouseUp, false );

		window.removeEventListener( 'keydown', _onKeyDown, false );
		window.removeEventListener( 'keyup', _onKeyUp, false );

	};

	var _onMouseMove = bind( this, this.onMouseMove );
	var _onContextMenu = bind( this, this.onContextMenu );
	var _onMouseDown = bind( this, this.onMouseDown );
	var _onMouseUp = bind( this, this.onMouseUp );
	var _onKeyDown = bind( this, this.onKeyDown );
	// var _onKeyDown = bind( this, this.handleKeyDown );
	var _onKeyUp = bind( this, this.onKeyUp );

	this.domElement.addEventListener( 'contextmenu', _onContextMenu, false );
	this.domElement.addEventListener( 'mousemove', _onMouseMove, false );
	this.domElement.addEventListener( 'mousedown', _onMouseDown, false );
	this.domElement.addEventListener( 'mouseup', _onMouseUp, false );

	window.addEventListener( 'keydown', _onKeyDown, false );
	window.addEventListener( 'keyup', _onKeyUp, false );

	function bind ( scope, fn ) {

		return function () {

			fn.apply( scope, arguments );

		};

	}

	// function onKeyDown( event ) {
	//
	// 	if ( scope.enabled === false || scope.enableKeys === false || scope.enablePan === false ) return;
	//
	// 	handleKeyDown( event );
	//
	// }

};

PlatformerControls.prototype = Object.create( EventDispatcher.prototype );
PlatformerControls.prototype.constructor = PlatformerControls;

export { PlatformerControls };
