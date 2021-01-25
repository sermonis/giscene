import { getTempVector } from './BimWalkPools.js';

    var tempBoundingBox = new Float32Array(6);
    var EPSILON = 0.0001;

    export function metersToModel(meters, viewer) {
        const model = viewer.impl.get3DModels()[0] || viewer.model;
        return Autodesk.Viewing.Private.convertUnits('meters', model.getUnitString(), 1, meters, 'default');
    }

    export function getMousePosition(event, viewer, position) {

        position.x = event.canvasX;
        position.y = event.canvasY;
    }

    export function getWorldPosition(x, y, viewer) {

        const viewport = viewer.navigation.getScreenViewport();

        x /= viewport.width;
        y /= viewport.height;

        return viewer.navigation.getWorldPoint(x, y);
    }

    export function getWorldUpComponent(camera, vector) {

        // Assume up vector can be perfectly aligned to y or z axes.
        if (camera.worldup.y > camera.worldup.z) {
            return vector.y;
        } else {
            return vector.z;
        }
    }

    export function setWorldUpComponent(camera, vector, value) {

        // Assume up vector can be perfectly aligned to y or z axes.
        if (camera.worldup.y > camera.worldup.z) {
            vector.y = value;
        } else {
            vector.z = value;
        }

        return vector;
    }

    export function getSmallestFloorSide(intersection, camera, instanceTree) {

        var w = 0;
        var l = 0;

        instanceTree.getNodeBox(intersection.dbId, tempBoundingBox);

        // Assume up vector can be perfectly aligned to y or z axes.
        if (camera.worldup.y > camera.worldup.z) {
            w = Math.abs(tempBoundingBox[0] - tempBoundingBox[3]);
            l = Math.abs(tempBoundingBox[2] - tempBoundingBox[5]);
        } else {
            w = Math.abs(tempBoundingBox[0] - tempBoundingBox[3]);
            l = Math.abs(tempBoundingBox[1] - tempBoundingBox[4]);
        }

        return Math.min(w, l);
    }

    export function isFloorIntersection(intersection, camera) {

        if(!intersection.face) {
            return false;
        }

        var normal = intersection.face.normal;
        // In some cases the face does not contain a normal
        if (!normal) {
            return false;
        }

        if (normal.lengthSq() > 1 + EPSILON) {
            normal.normalize();
        }

        var cos = camera.worldup.dot(normal);
        return cos >= 0.5;
    }

    export function isWallIntersection(intersection, camera) {

        if(!intersection.face) {
            return false;
        }

        var normal = intersection.face.normal;
        // In some cases the face does not contain a normal
        if (!normal) {
            return false;
        }

        if (normal.lengthSq() > 1 + EPSILON) {
            normal.normalize();
        }

        var cos = camera.worldup.dot(normal);
        return cos >= 0.0 && cos <= 0.1;
    }

    export function getFloorCandidates(
        position,
        cameraDistanceFromFloor,
        minAllowedRoofDistance,
        smallAllowedVerticalStep,
        bigAllowedVerticalStep,
        minFloorSidesLengthForBigVerticalStep,
        viewer,
        candidates,
        obstacles) {

        var camera = viewer.impl.camera;
        var upVector = getTempVector(camera.worldup);

        // Search new floors with a ray downwards starting above the camera position at the maximum allowed roof distance.
        var rayOrigin = getTempVector(position).add(upVector.multiplyScalar(minAllowedRoofDistance));
        var rayDirection = getTempVector(upVector).multiplyScalar(-1);

        viewer.impl.rayIntersect(new THREE.Ray(rayOrigin, rayDirection), false, false, false, candidates);
        var candidatesCount = candidates.length;

        // If there are not collisions then return -1 (no best candidate index).
        if (candidatesCount === 0) {

            return -1;
        }

        // If we have just one candidate we take it as a floor only if it has the correct normal and it's below the previous camera position.
        if (candidatesCount === 1) {

            if(!isFloorIntersection(candidates[0], camera)) {

                return -1;
            }

            var allowedRoofDistanceSquared = minAllowedRoofDistance * minAllowedRoofDistance;
            if (candidates[0].point.distanceToSquared(position) < allowedRoofDistanceSquared) {

                return -1;
            }

            return 0;
        }

        // Search for the best candidate.
        var floorDistance = minAllowedRoofDistance + cameraDistanceFromFloor;
        var smallVerticalStepDistance = floorDistance - smallAllowedVerticalStep;
        var bigVerticalStepDistance = floorDistance - bigAllowedVerticalStep;

        var bestCandidate = -1;
        var feetDistanceSqured = cameraDistanceFromFloor + minAllowedRoofDistance;
        feetDistanceSqured *= feetDistanceSqured;

        var minDistance = Number.MAX_VALUE;
        var instanceTree = viewer.impl.model.getData().instanceTree;

        for (var i = 0; i < candidatesCount; ++i) {

            var candidate = candidates[i];

            // Walls are ignored completely, user goes through them, they are not roofs nor floors.
            if (isWallIntersection(candidate, camera)) {
                continue;
            }

            // Obstacles are geometries between the minimum roof distance and the big vertical step.
            if (obstacles &&
                candidate.distance > minAllowedRoofDistance &&
                candidate.distance < bigAllowedVerticalStep) {
                obstacles.push(candidate);
                continue;
            }

            // Geometry at maximum vertical step or lower is considered a roof if its slope is too steep to be considered a floor.
            if(!isFloorIntersection(candidate, camera)) {
                continue;
            }

            // Choose vertical step.
            var verticalStepDistance = smallVerticalStepDistance;

             // If the instance tree is still loading we use the bigger step (it's better to climb on a table than fall though a floor).
            if(!instanceTree) {
                verticalStepDistance = bigVerticalStepDistance;
            } else {

                var side = getSmallestFloorSide(candidate, camera, instanceTree);
                if (side > minFloorSidesLengthForBigVerticalStep) {
                    verticalStepDistance = bigVerticalStepDistance;
                }
            }

            // Check if candidate can be climbed.
            if (candidate.distance < verticalStepDistance) {
                continue;
            }

            // Best candidate is the one closer along the world up vector to the currenct camera position.
            var distance = Math.abs(
                getWorldUpComponent(camera, position),
                getWorldUpComponent(camera, candidate.point)
            );

            if (minDistance > distance) {
                minDistance = distance;
                bestCandidate = i;
            }
        }

        return bestCandidate;
    };

    export function easeInOutQuad(t, b, c, d) {

	    t /= d / 2;
	    if (t < 1){
            return c / 2 * t * t + b;
        }
	    t--;
	    return -c / 2 * (t * (t- 2) - 1) + b;
    };

    export function easeInQuad(t, b, c, d) {

        t /= d;
	    return c*t*t + b;
    };

    // Calculate friction contribution to final accelerator vector.
    export function updateFriction(accelerationModule, velocity, acceleration) {

        var speedSquared = velocity.lengthSq();
        if (speedSquared > 0) {

            var friction = getTempVector();
            friction.copy(velocity).normalize().multiplyScalar(-1);

            // Hack friction factor.
            friction.multiplyScalar(accelerationModule * accelerationModule);
            acceleration.add(friction);
        }
        return speedSquared > 0;
    };

    // Calculate velocity contribution to velocity vector.
    export function updateVelocity(elapsed, acceleration, topSpeed, clampSpeed, friction, velocity) {

        var current = getTempVector(velocity);
        current.add(acceleration.multiplyScalar(elapsed));

        if (clampSpeed) {

            if (current.lengthSq() > topSpeed * topSpeed) {
                current.normalize();
                current.multiplyScalar(topSpeed);
            }
        }

        if (friction) {

            if (current.lengthSq() < EPSILON || current.dot(velocity) < 0) {
                current.set(0,0,0);
            }
        }

        velocity.copy(current);
    };

    export function getForward(camera) {

        return getTempVector(camera.target).sub(camera.position).normalize();
    };
