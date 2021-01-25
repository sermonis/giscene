import { NavigatorSimple } from './NavigatorSimple.js'
import { NavigatorMobileJoystick } from '../UI/NavigatorMobileJoystick.js'
import { getTempVector } from '../BimWalkPools.js'
import { getForward, updateFriction, updateVelocity, getMousePosition } from '../BimWalkUtils.js'

    var temporalMousePosition = {x: 0, y: 0};
    var MOBILE_SPEED_FACTOR = 15.0;

    /**
     *
     * @constructor
     */
    export function NavigatorMobile(tool) {

        NavigatorSimple.call(this, tool);

        this.configuration.keyboardTopTurnSpeed = 0.5;
        this.configuration.keyboardTurnStopDuration = 0.4;

        this.ui = new NavigatorMobileJoystick(this.viewer, this, tool.options.joystickOptions);
    }

    NavigatorMobile.prototype = Object.create(NavigatorSimple.prototype);
    NavigatorMobile.prototype.constructor = NavigatorMobile;

    var proto = NavigatorMobile.prototype;

    /**
     *
     * @param elapsed
     */
    proto.updateKeyboardDisplacement = function(elapsed) {

        var running = this.running;
        var moveForward = this.moveForward;
        var moveBackward = this.moveBackward;

        // Update acceleration.
        var topSpeed = running ? this.getTopRunSpeed() : this.get('topWalkSpeed');
        var velocity = this.moveKeyboardVelocity;
        var acceleration = getTempVector();
        var accelerationModule = topSpeed * MOBILE_SPEED_FACTOR;

        var moving = (
            moveForward !== 0 ||
            moveBackward !== 0);

        if (moving) {

            var camera = this.tool.camera;
            var upVector = camera.worldup;
            var speed = Math.max(this.moveForward, this.moveBackward);

            var directionForward = getForward(camera);
            var directionForwardXZ = getTempVector(directionForward);
            directionForwardXZ.sub(getTempVector(upVector).multiplyScalar(upVector.dot(directionForward)));
            directionForwardXZ.normalize();

            var directionBackwardXZ = getTempVector(directionForwardXZ).multiplyScalar(-1);

            acceleration.add(directionForwardXZ.multiplyScalar(moveForward));
            acceleration.add(directionBackwardXZ.multiplyScalar(moveBackward));
            acceleration.normalize();

            velocity.copy(acceleration).multiplyScalar(speed);
            acceleration.multiplyScalar(accelerationModule * Math.max(this.moveForward, this.moveBackward));
        }

        // Decelerate if stop running.
        var deceleration = getTempVector();
        if(!running && velocity.lengthSq() > topSpeed * topSpeed) {

            deceleration.copy(velocity).normalize();
            deceleration.multiplyScalar(-this.getTopRunSpeed()/ 1);

            acceleration.copy(deceleration);
        }

        // Update friction contribution.
        var frictionPresent = !moving && updateFriction(accelerationModule, velocity, acceleration);

        // Update velocity.
        var clampToTopSpeed = deceleration.lengthSq() === 0;
        updateVelocity(elapsed, acceleration, topSpeed, clampToTopSpeed, frictionPresent, velocity);
    }

    /**
     *
     * @param elapsed
     */
    proto.updateKeyboardAngularVelocity = function(elapsed) {

        var topSpeed = this.get('keyboardTopTurnSpeed');
        var stopDuration = this.get('keyboardTurnStopDuration');
        var velocity = this.angularKeyboardVelocity;
        var acceleration = getTempVector();
        var accelerationModule = topSpeed / stopDuration;
        var turning = this.turningWithKeyboard;


        // Update angular acceleration.
        if (turning) {

            var speed = Math.min(topSpeed, Math.max(this.moveLeft, this.moveRight) + accelerationModule * elapsed);

            velocity.y = 0;
            velocity.y -= this.moveLeft;
            velocity.y += this.moveRight;

            velocity.normalize().multiplyScalar(speed);
        }

        // Update friction contribution.
        var friction = !turning && updateFriction(accelerationModule, velocity, acceleration);

        // Update velocity.
        updateVelocity(elapsed, acceleration, topSpeed, true, friction, velocity);
    };

    /**
     *
     * @param event
     * @returns {boolean}
     */
    proto.handleMouseMove = function(event) {

        var prevMousePosition = this.mousePosition;
        var currMousePosition = temporalMousePosition;

        getMousePosition(event, this.viewer, currMousePosition);

        if (this.turningWithMouse) {

            this.turnMouseDelta.x -= (currMousePosition.x - prevMousePosition.x);
            this.turnMouseDelta.y -= (currMousePosition.y - prevMousePosition.y);
        }

        this.mousePosition.copy(currMousePosition);
        return true;
    };
