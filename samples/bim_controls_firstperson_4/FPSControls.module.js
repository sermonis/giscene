import {

	EventDispatcher,
	Raycaster,
	Object3D,
	Matrix4,
	Vector3,
	Euler
	// ArrowHelper
	// MOUSE

// } from 'three';
} from '../../../libs/three.js/build/three.module.js';

const PI05 = Math.PI / 2;

/**
*
* TODO: Rename.
* PlatformerControls, PlayerControls,
* WalkerControls, ExplorerControls, InspectorControls.
*
* TODO: Constructor.
* @see https://github.com/mrdoob/three.js/blob/master/examples/jsm/controls/OrbitControls.js
* @see https://github.com/mrdoob/three.js/blob/master/examples/jsm/controls/FirstPersonControls.js
* @see https://github.com/Mugen87/dive/blob/master/src/controls/FirstPersonControls.js
* @see https://github.com/Mugen87/yuka/blob/master/examples/playground/hideAndSeek/src/FirstPersonControls.js
*
* TODO: Move along the walls.
* @see https://sermonis.github.io/sandbox/?q=bim#bim_controls_firstperson_1
*/
const FPSControls = function ( object, domElement, mass, playerHeight, doubleJump, worldObjects ) {

	// API

	this.enabled = false;

	this.speed = 800; // Movement speed.
	this.velocity = new Vector3( 1, 1, 1 );

	this.mass = mass || 80; // 100
	this.originalMass = this.mass;

	this.playerHeight = playerHeight; // 20
	this.baseHeight = 0; // The minimum plane height.

	this.doubleJump = doubleJump || true; // true
	this.worldObjects = worldObjects; // objects

	this.mouseInvert = true;
	this.mouseSensitivity = 15;

	//

	// Jump Variables.
	this.jumps = 0;
	this.jumping = false;
	this.firstJump = true;
	this.jumpFactor = 90; // Jump height.

	this.walking = false;
	this.walkingSpeed = 2000; // Higher = slower

	// Crouched.
	this.crouching = false;

	//

	var scope = this;

	//

	object.rotation.set( 0, 0, 0 );

	var pitchObject = new Object3D();
	pitchObject.add( object );

	// Represents the human player of the game.
	const player = new Object3D();
	player.position.y = playerHeight;
	player.add( pitchObject );

	// scope.worldObjects = worldObjects;

	// Internals

    // const PI05 = Math.PI / 2;

	//

	var onMouseMove = function ( event ) {

		if ( scope.enabled === false ) return;

		const movementX = event.movementX || event.mozMovementX || event.webkitMovementX || 0;
		const movementY = event.movementY || event.mozMovementY || event.webkitMovementY || 0;
		const multiplier = scope.mouseSensitivity / 10000; // 0.002

		player.rotation.y -= movementX * multiplier;

		if ( scope.mouseInvert ) {

			pitchObject.rotation.x += movementY * multiplier;

		} else {

			pitchObject.rotation.x -= movementY * multiplier;

		}

		pitchObject.rotation.x = Math.max( -PI05, Math.min( PI05, pitchObject.rotation.x ) );

	};

	scope.dispose = function () {

		document.removeEventListener( 'mousemove', onMouseMove, false );
		// scope.domElement.removeEventListener( 'contextmenu', onContextMenu, false );

	};

	document.addEventListener( 'mousemove', onMouseMove, false );

	// scope.enabled = false;

	scope.getPlayer = function () {

		return player;

	};

    // TODO: lock/unlock methods.
    // scope.lock = function () {
    //
	// 	scope.enabled = true;
    //
	// };

	scope.getDirection = function () {

		// Assumes the camera itself is not rotated.
		var direction = new Vector3( 0, 0, -1 );
		var rotation = new Euler( 0, 0, 0, 'YXZ' );

		return function ( v ) {

			rotation.set( pitchObject.rotation.x, player.rotation.y, 0 );

			v.copy( direction ).applyEuler( rotation );

			return v;

		};

	} ();

	// FPS Controls Additions.
	scope.updatePlayerHeight = function ( height ) {

		player.position.y = height;

	};

	scope.raycasters = {

		up: new Raycaster( new Vector3(), new Vector3( 0, 1, 0 ), 0, 20 ),

		down: new Raycaster( new Vector3(), new Vector3( 0, -1, 0 ), 0, 20 ),
		downstairs: new Raycaster( new Vector3(), new Vector3( 0, -1, 0 ), 0, 10 ),

		forward: new Raycaster( new Vector3(), new Vector3( 0, 0, -1 ), 0, 15 ),
		backward: new Raycaster( new Vector3(), new Vector3(), 0, 15 ),
		left: new Raycaster( new Vector3(), new Vector3(), 0, 15 ),
		right: new Raycaster( new Vector3(), new Vector3(), 0, 15 ),
		rightStrafe: new Raycaster( new Vector3(), new Vector3(), 0, 30 ),
		leftStrafe: new Raycaster( new Vector3(), new Vector3(), 0, 30 ),

		updateRaycasters: function () {

			this.up.ray.origin.copy( scope.playersPosition );

			this.down.ray.origin.copy( scope.playersPosition );
			this.downstairs.ray.origin.copy( scope.playersPosition );

			this.forward.ray.set( scope.playersPosition, scope.camDir );
			this.backward.ray.set( scope.playersPosition, scope.camDir.negate() );
			this.left.ray.set( scope.playersPosition, scope.camDir.applyMatrix4( new Matrix4().makeRotationY( - ( Math.PI / 2 ) ) ) );
			this.right.ray.set( scope.playersPosition, scope.camDir.applyMatrix4( new Matrix4().makeRotationY( Math.PI ) ) );
			this.rightStrafe.ray.set( scope.playersPosition, scope.camDir.applyMatrix4( new Matrix4().makeRotationY( ( Math.PI / 4 ) ) ) ); // Works
			this.leftStrafe.ray.set( scope.playersPosition, scope.camDir.applyMatrix4( new Matrix4().makeRotationY( ( Math.PI / 4 ) ) ) );

		}

	};

	scope.intersections = {

		up: scope.raycasters.up.intersectObjects( worldObjects ),

		down: scope.raycasters.down.intersectObjects( worldObjects ),
		downstairs: scope.raycasters.down.intersectObjects( worldObjects ),

		forward: scope.raycasters.forward.intersectObjects( worldObjects ),
		backward: scope.raycasters.backward.intersectObjects( worldObjects ),
		left: scope.raycasters.left.intersectObjects( worldObjects ),
		right: scope.raycasters.right.intersectObjects( worldObjects ),
		rightStrafe: scope.raycasters.rightStrafe.intersectObjects( worldObjects ),
		leftStrafe: scope.raycasters.leftStrafe.intersectObjects( worldObjects ),

		checkIntersections: function () {

			this.up = scope.raycasters.up.intersectObjects( worldObjects );

			this.down = scope.raycasters.down.intersectObjects( worldObjects );
			this.downstairs = scope.raycasters.down.intersectObjects( worldObjects );

			this.forward = scope.raycasters.forward.intersectObjects( worldObjects );
			this.backward = scope.raycasters.backward.intersectObjects( worldObjects );
			this.left = scope.raycasters.left.intersectObjects( worldObjects );
			this.right = scope.raycasters.right.intersectObjects( worldObjects );
			this.rightStrafe = scope.raycasters.rightStrafe.intersectObjects( worldObjects );
			this.leftStrafe = scope.raycasters.leftStrafe.intersectObjects( worldObjects );

		}

	};

	scope.movements = {

		forward: false,
		backward: false,
		left: false,
		right: false,

		locks: {

			forward: true,
			backward: true,
			left: true,
			right: true,

		},

		lock: function () {

			var intersections = scope.intersections;

			for ( var direction in intersections ) {

                if ( intersections[ direction ].length > 0 ) {

                    // console.log( direction, 'lock' );
                    this.locks[ direction ] = true;

                }

			}
		},

		unlock: function () {

			this.locks.forward = false;
			this.locks.backward = false;
			this.locks.left = false;
			this.locks.right = false;

		}

	};

	// scope.doubleJump = doubleJump;
	// scope.baseHeight = 0; // The minimum plane height.
	// scope.mass = mass || 80;
	// scope.originalMass = mass;
	// scope.walkingSpeed = 3000; // Higher = slower
	// scope.speed = 900; // Movement speed.
	// scope.jumpFactor = 90; // Jump height.
	// scope.velocity = new Vector3( 1, 1, 1 );
	//
	// scope.jumps = 0;
	// scope.firstJump = true;
	// scope.walking = false;
	//
	// // Crouched.
	// scope.crouching = false;

	var halfHeight;
	var fullHeight;
	var crouchSmoothing;
	var smoothedHeight;
	var crouched = false;

	// Jump Variables.
	// scope.jumping = false;

	scope.jump = function () {

		scope.jumping = true;

	};

	scope.crouch = function ( boolean ) {

		scope.crouching = boolean;

	};

	scope.walk = function ( boolean ) {

		scope.walking = boolean;

	};

	// So you can update the world objects when they change.
	scope.updateWorldObjects = function ( worldObjects ) {

		scope.worldObjects = worldObjects;

	};

	scope.updateControls = function () {

		scope.time = performance.now();

		scope.movements.unlock();

		// Check change and if Walking?
		scope.delta = ( scope.walking ) ? ( scope.time - scope.prevTime ) / scope.walkingSpeed : ( scope.time - scope.prevTime ) / scope.speed;
		var validDelta = isNaN( scope.delta ) === false;

        if ( validDelta ) {

			// Velocities
			scope.velocity.x -= scope.velocity.x * 8.0 * scope.delta; // Left and right
			scope.velocity.z -= scope.velocity.z * 8.0 * scope.delta; // Forward and back
			scope.velocity.y -= scope.walking ?  9.8 * scope.mass * scope.delta : 5.5 * scope.mass * scope.delta;  // Up and Down

			scope.camDir = scope.getPlayer().getWorldDirection( new Vector3() ).negate(); //
			scope.playersPosition = scope.getPlayer().position.clone();

			scope.raycasters.updateRaycasters();
			scope.intersections.checkIntersections();
			scope.movements.lock();

			// If your head hits an object, turn your mass up to make you fall back to earth.
			scope.isBelowObject = scope.intersections.up.length > 0;
			scope.mass = ( scope.isBelowObject === true ) ? 500 : scope.originalMass;

			scope.isOnObject = scope.intersections.down.length > 0;

			// console.log( scope.intersections.down.length, scope.intersections.down )

			// if ( scope.intersections.down.length ) {
			//
			// 	console.log( 'playerHeight', playerHeight )
			// 	console.log( 'scope.getPlayer().position.y', scope.getPlayer().position.y )
			// 	console.log( 'scope.playersPosition', scope.playersPosition.y )
			// 	console.log( 'scope.intersections.down', scope.intersections.down[0].distance )
			//
			// }

			// if ( scope.intersections.downstairs.length ) {
			//
			// 	console.log( 'playerHeight', playerHeight )
			// 	console.log( 'scope.getPlayer().position.y', scope.getPlayer().position.y )
			// 	console.log( 'scope.playersPosition', scope.playersPosition.y )
			// 	console.log( 'scope.intersections.downstairs', scope.intersections.downstairs[0].distance )
			//
			// }

			if ( scope.isOnObject === true ) {

				scope.velocity.y = Math.max( 0, scope.velocity.y );
				scope.jumps = 0;

				// if ( scope.intersections.downstairs[ 0 ].distance < ( playerHeight / 2 ) ) {
				if ( scope.intersections.downstairs[ 0 ].distance < ( playerHeight * 0.7 ) ) {
					// alert('!!!!!!!!')
					// scope.velocity.y += 0.1 * scope.delta;
					scope.velocity.y += 1000 * scope.delta;

				}

				// this.scene.add( new ArrowHelper( scope.raycasters.down.ray.direction, scope.raycasters.down.ray.origin, 300, 0xff0000 ) );

				// scope.getPlayer().position.y += 0.1;
				// scope.velocity.y += 0.1;

				// If we start to fall through an object
				// if ( ( scope.getPlayer().position.y < playerHeight ) &&
				// 	 scope.intersections.down &&
				// 	 scope.intersections.down[0].distance < (playerHeight / 2) ) {
				//
				// 	 scope.getPlayer().position.y += 0.1;
				// }

			} else {

				this.walking = false;

			}

			// Crouched.
			if ( !crouched && scope.isOnObject ) {

				// console.log( 'Not Crouched' );
				halfHeight = scope.getPlayer().position.y - ( playerHeight * 0.2 );
				fullHeight = scope.getPlayer().position.y + ( playerHeight * 0.2 );

			}

			if ( scope.crouching && scope.isOnObject ) {

				scope.walking = true;

				if ( !crouched && !scope.justCrouched ) {

					scope.updatePlayerHeight( halfHeight );

					crouchSmoothing = 0;
					smoothedHeight = 0;
					crouched = true;

					// Stop player from crouching through the floor.
					scope.justCrouched = true;

					setTimeout( function () {

                        scope.justCrouched = false;

                    }, 300 );

				}

			} else if ( !scope.crouching && smoothedHeight <= fullHeight ) {

                // console.log( finished );

				// Smooth out of crouching.
				smoothedHeight = halfHeight + crouchSmoothing;
				scope.updatePlayerHeight( smoothedHeight );
				crouchSmoothing += 2;

                // console.log( smoothedHeight );

				crouched = false;
				scope.walking = false;

			}

			// Jumping - must come after isBelowObject but before isOnObject.
			if ( scope.jumping ) {

				scope.walking = false;
				scope.crouching = false;

				if ( scope.jumps === 0 && !scope.isBelowObject ) {

					scope.velocity.y += scope.jumpFactor * 2.3;
					scope.velocity.z *= 2; // Jumping also increases our forward velocity a little.
					scope.jumps = 1;

				} else if ( scope.doubleJump && scope.jumps === 1 && !scope.isOnObject && !scope.isBelowObject ) {

					scope.velocity.y += scope.jumpFactor * 1.5;
					scope.jumps = 2;

				}

			}

			// Movements.
			if ( scope.movements.forward && !scope.walking && !scope.movements.locks.forward ) scope.velocity.z -= 400.0 * scope.delta;
			if ( scope.movements.forward && scope.walking && !scope.movements.locks.forward ) scope.velocity.z -= 1000.0 * scope.delta;
			if ( scope.movements.backward && !scope.movements.locks.backward ) scope.velocity.z += 400.0 * scope.delta;
			if ( scope.movements.left && !scope.movements.locks.left ) scope.velocity.x -= 400.0 * scope.delta;
			if ( scope.movements.right && !scope.movements.locks.right ) scope.velocity.x += 400.0 * scope.delta;

			// Velocity translations.
			scope.getPlayer().translateX( scope.velocity.x * scope.delta );
			scope.getPlayer().translateY( scope.velocity.y * scope.delta );
			scope.getPlayer().translateZ( scope.velocity.z * scope.delta );

			scope.jumping = false;

		}

		// Set the previous time to the time we set at the begining.
		scope.prevTime = scope.time;

	};

};

FPSControls.prototype = Object.create( EventDispatcher.prototype );
FPSControls.prototype.constructor = FPSControls;

export { FPSControls };
