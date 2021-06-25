/**
 * @author alteredq / http://alteredqualia.com/
 * @author Lewy Blue https://github.com/looeee
 *
 * The model is expected to follow real world car proportions. You can try unusual car types
 * but your results may be unexpected. Scaled models are also not supported.
 *
 * Defaults are rough estimates for a real world scale car model.
 *
 */
import {

	Box3,
	Group,
	Math as _Math,
	Vector3,

} from '../../../libs/three.js/build/three.module.js';

const CarControls = ( function ( ) {

	// Private variables.
	let steeringWheelSpeed = 1.5;
	let maxSteeringRotation = 0.6;

	let acceleration = 0;

	let maxSpeedReverse, accelerationReverse, deceleration; 

	let controlKeys = { LEFT: 37, UP: 38, RIGHT: 39, DOWN: 40, BRAKE: 32 };

	let wheelOrientation = 0;
	let carOrientation = 0;

	let root = null;

	let frontLeftWheelRoot = null;
	let frontRightWheelRoot = null;

	let frontLeftWheel = new Group();
	let frontRightWheel = new Group();

	let backLeftWheel = null;
	let backRightWheel = null;

	let steeringWheel = null;

	let wheelDiameter = 1;
	let length = 1;

	let loaded = false;

	let controls = {

		brake: false,
		moveForward: false,
		moveBackward: false,
		moveLeft: false,
		moveRight: false

	};

	function CarControls ( maxSpeed, acceleration, brakePower, turningRadius, keys ) {

		this.enabled = true;

		this.elemNames = {

			flWheel: 'wheel_fl',
			frWheel: 'wheel_fr',
			rlWheel: 'wheel_rl',
			rrWheel: 'wheel_rr',

			// Set to null to disable.
			steeringWheel: 'steering_wheel',

		};

		// km/hr
		this.maxSpeed = maxSpeed || 180;
		maxSpeedReverse = - this.maxSpeed * 0.25;

		// m/s
		this.acceleration = acceleration || 10;
		accelerationReverse = this.acceleration * 0.5;

		// metres
		this.turningRadius = turningRadius || 6;

		// m/s
		deceleration = this.acceleration * 2;

		// Multiplied with deceleration,
		// so breaking deceleration = ( acceleration * 2 * brakePower ) m/s
		this.brakePower = brakePower || 10;

		// Exposed so that a user can use this
		// for various effect, e.g blur.
		this.speed = 0;

		// Keys used to control car - by default
		// the arrow keys and space to brake.
		controlKeys = keys || controlKeys;

		// local axes of rotation - these are
		// likely to vary between models.
		this.wheelRotationAxis = 'x';
		this.wheelTurnAxis = 'z';
		this.steeringWheelTurnAxis = 'y';

		document.addEventListener( 'keydown', this.onKeyDown, false );
		document.addEventListener( 'keyup', this.onKeyUp, false );

	}

	CarControls.prototype = {

		constructor: CarControls,

		onKeyDown: function ( event ) {

			switch ( event.keyCode ) {

				case controlKeys.BRAKE:
					controls.brake = true;
					controls.moveForward = false;
					controls.moveBackward = false;
					break;

				case controlKeys.UP:
					controls.moveForward = true;
					break;

				case controlKeys.DOWN:
					controls.moveBackward = true;
					break;

				case controlKeys.LEFT:
					controls.moveLeft = true;
					break;

				case controlKeys.RIGHT:
					controls.moveRight = true;
					break;

			}

		},

		onKeyUp: function ( event ) {

			switch ( event.keyCode ) {

				case controlKeys.UP:
					controls.moveForward = false;
					break;

				case controlKeys.DOWN:
					controls.moveBackward = false;
					break;

				case controlKeys.LEFT:
					controls.moveLeft = false;
					break;

				case controlKeys.RIGHT:
					controls.moveRight = false;
					break;

				case controlKeys.BRAKE:
					controls.brake = false;
					break;


			}

		},

		moveForward: function () {

			controls.moveForward = true;

		},

		moveRight: function () {

			controls.moveRight = true;

		},

		brake: function () {

			controls.moveForward = false;
			controls.brake = true;

		},

		dispose: function () {

			document.removeEventListener( 'keydown', this.onKeyDown, false );
			document.removeEventListener( 'keyup', this.onKeyUp, false );

		},

		update: function ( delta ) {

			if ( ! loaded || ! this.enabled ) {

				return;

			}

			let brakingDeceleration = 1;

			if ( controls.brake ) {

				brakingDeceleration = this.brakePower;

			}

			if ( controls.moveForward ) {

				this.speed = _Math.clamp( ( this.speed + delta * this.acceleration ), maxSpeedReverse, this.maxSpeed );
				// acceleration = _Math.clamp( acceleration + delta, - 1, 1 );

			}

			if ( controls.moveBackward ) {

				this.speed = _Math.clamp( ( this.speed - delta * accelerationReverse ), maxSpeedReverse, this.maxSpeed );
				// acceleration = _Math.clamp( acceleration - delta, - 1, 1 );

			}

			if ( controls.moveLeft ) {

				wheelOrientation = _Math.clamp( ( wheelOrientation + delta * steeringWheelSpeed ), - maxSteeringRotation, maxSteeringRotation );

			}

			if ( controls.moveRight ) {

				wheelOrientation = _Math.clamp( ( wheelOrientation - delta * steeringWheelSpeed ), - maxSteeringRotation, maxSteeringRotation );

			}

			// this.speed decay
			if ( ! ( controls.moveForward || controls.moveBackward ) ) {

				if ( this.speed > 0 ) {

					let k = exponentialEaseOut( this.speed / this.maxSpeed );

					this.speed = _Math.clamp( this.speed - k * delta * deceleration * brakingDeceleration, 0, this.maxSpeed );
					// acceleration = _Math.clamp( acceleration - k * delta, 0, 1 );

				} else {

					let k = exponentialEaseOut( this.speed / maxSpeedReverse );

					this.speed = _Math.clamp( this.speed + k * delta * accelerationReverse * brakingDeceleration, maxSpeedReverse, 0 );
					// acceleration = _Math.clamp( acceleration + k * delta, - 1, 0 );

				}

			}

			// Steering decay.
			if ( ! ( controls.moveLeft || controls.moveRight ) ) {

				if ( wheelOrientation > 0 ) {

					wheelOrientation = _Math.clamp( wheelOrientation - delta * steeringWheelSpeed, 0, maxSteeringRotation );

				} else {

					wheelOrientation = _Math.clamp( wheelOrientation + delta * steeringWheelSpeed, - maxSteeringRotation, 0 );

				}

			}

			const forwardDelta = - this.speed * delta;

			carOrientation -= ( forwardDelta * this.turningRadius * 0.02 ) * wheelOrientation;

			// Movement of car.
			root.position.x += Math.sin( carOrientation ) * forwardDelta * length;
			root.position.z += Math.cos( carOrientation ) * forwardDelta * length;

			// console.log( 'length', length );
			// console.log( 'wheelDiameter', wheelDiameter );

			// Angle of car.
			root.rotation.y = carOrientation;

			// Wheels rolling.
			const angularSpeedRatio = - 2 / wheelDiameter;

			const wheelDelta = forwardDelta * angularSpeedRatio * length;

			frontLeftWheel.rotation[ this.wheelRotationAxis ] -= wheelDelta;
			frontRightWheel.rotation[ this.wheelRotationAxis ] -= wheelDelta;
			backLeftWheel.rotation[ this.wheelRotationAxis ] -= wheelDelta;
			backRightWheel.rotation[ this.wheelRotationAxis ] -= wheelDelta;

			// Rotation while steering.
			frontLeftWheelRoot.rotation[ this.wheelTurnAxis ] = wheelOrientation;
			frontRightWheelRoot.rotation[ this.wheelTurnAxis ] = wheelOrientation;

			steeringWheel.rotation[ this.steeringWheelTurnAxis ] = - wheelOrientation * 6;

			// console.log(
			// 	'speed:', this.speed,
			// 	// 'acceleration:', acceleration,
			// 	'forwardDelta:', forwardDelta,
			// 	'carOrientation:', carOrientation,
			// 	'angularSpeedRatio:', angularSpeedRatio,
			// 	'wheelDelta:', wheelDelta,
			// );

		},

		setModel: function ( model, elemNames ) {

			if ( elemNames ) {

				this.elemNames = elemNames;

			}

			root = model;

			this.setupWheels();
			this.computeDimensions();

			loaded = true;

		},

		setupWheels: function () {

			frontLeftWheelRoot = root.getObjectByName( this.elemNames.flWheel );
			frontRightWheelRoot = root.getObjectByName( this.elemNames.frWheel );

			// console.log( 'frontLeftWheelRoot', frontLeftWheelRoot );

			backLeftWheel = root.getObjectByName( this.elemNames.rlWheel );
			backRightWheel = root.getObjectByName( this.elemNames.rrWheel );

			if ( this.elemNames.steeringWheel !== null ) {

				steeringWheel = root.getObjectByName( this.elemNames.steeringWheel );

			}

			while ( frontLeftWheelRoot.children.length > 0 ) {

				frontLeftWheel.add( frontLeftWheelRoot.children[ 0 ] );

			}

			while ( frontRightWheelRoot.children.length > 0 ) {

				frontRightWheel.add( frontRightWheelRoot.children[ 0 ] );

			}

			frontLeftWheelRoot.add( frontLeftWheel );
			frontRightWheelRoot.add( frontRightWheel );

			// console.log( 'frontLeftWheelRoot', frontLeftWheelRoot );
			// console.log( 'frontRightWheelRoot', frontRightWheelRoot );

		},

		computeDimensions: function () {

			const bbox = new Box3().setFromObject( frontLeftWheelRoot );

			let size = new Vector3();
			bbox.getSize( size );

			wheelDiameter = Math.max( size.x, size.y, size.z );

			bbox.setFromObject( root );

			size = bbox.getSize( size );
			length = Math.max( size.x, size.y, size.z );

		}

	};

	function exponentialEaseOut ( k ) {

		return k === 1 ? 1 : - Math.pow( 2, - 10 * k ) + 1;

	}

	return CarControls;

} )();

export { CarControls };
