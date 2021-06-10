import {

	// EventDispatcher,
	BufferGeometry,
	Vector3,
	CatmullRomCurve3,
	BufferAttribute,
	// MOUSE,
	// Quaternion,
	// Spherical,
	// TOUCH,
	// Vector2,
	// Vector3

} from '../../../libs/three.js/build/three.module.js';

// https://hofk.de/main/discourse.threejs/2019/RoadRace/RoadRace.html
// https://hofk.de/main/threejs/WallTHREEg/WallTHREEg.html
// https://hofk.de/main/discourse.threejs/2019/js/THREEg.js

// export default class RoadSplineBufferGeometry extends BufferGeometry {
//
// 	constructor () {
//
// 		super();
//
// 	}
//
// };

const RoadSplineBufferGeometry = function ( curvePoints, lengthSegments, trackDistances ) {

	BufferGeometry.call( this );

	// console.log( this );

	// const createRoad = ( curvePoints, lengthSegments, trackDistances ) => {

		// all parameters optional

		 //  THREE.BufferGeometry() - geometry object from three.js
		const g = this;

		g.sd = trackDistances !== undefined ?  [ [], trackDistances, [], [] ]  :  [ [], [ -0.5, 0.5 ], [], [] ]  ;

		g.wss = [ 0, g.sd[ 1 ].length, 0, 0 ];
		g.ws = [ 0, g.sd[ 1 ].length - 1, 0, 0 ];

		g.sides = [ false, true, false, false ];

		g.ls = lengthSegments !== undefined ? lengthSegments : 500;
		g.lss = g.ls + 1;

		g.cP = curvePoints !== undefined ? curvePoints : [ -10, 0, 5, 0, 1, 0, 10, 0, 5 ];

		var pts = [];

		for ( var i = 0; i < g.cP.length; i += 3 ) {

			pts.push( new Vector3( g.cP[ i ], g.cP[ i + 1 ], g.cP[ i + 2 ] ) );

		}

		g.curve = new CatmullRomCurve3( pts );

		g.len = g.curve.getLength( );

		g.points = g.curve.getPoints( g.ls );
		g.len = g.curve.getLength( );
		g.lenList = g.curve.getLengths ( g.ls );

		g.isWall = false;

		// g.buildRoadWall = buildRoadWall;
		// g.buildRoadWall();

		// ---------------------------------------------------
		// ---------------------------------------------------
		// ---------------------------------------------------

		g.faceCount = g.ls * ( g.ws[ 0 ] + g.ws[ 1 ] + g.ws[ 2 ] + g.ws[ 3 ] ) * 2;
		g.vertexCount = g.lss * ( g.wss[ 0 ] + g.wss[ 1 ] + g.wss[ 2 ] + g.wss[ 3 ] );

		g.faceIndices = new Uint32Array( g.faceCount * 3 );
		g.vertices = new Float32Array( g.vertexCount * 3 );
		g.uvs = new Float32Array( g.vertexCount * 2 );

		g.setIndex( new BufferAttribute( g.faceIndices, 1 ) );
		g.setAttribute( 'position', new BufferAttribute( g.vertices, 3 ) );
		g.setAttribute( 'uv', new BufferAttribute( g.uvs, 2 ) );

		var a, b1, c1, c2;
		var posIdxCount = 0;
		var offset = 0;
		var mmOffs = 0;

		for ( var s = 0; s < 4; s ++ ) {

			if ( g.sides[ s ] ) {

				for ( var j = 0; j < g.ls; j ++ ) {

					for ( var i = 0; i < g.ws[ s ]; i ++ ) {

						// 2 faces / segment,  3 vertex indices
						a  = offset + g.wss[ s ] * j + i;
						b1 = offset + g.wss[ s ] * ( j + 1 ) + i;		// right-bottom
						c1 = offset + g.wss[ s ] * ( j + 1 ) + 1 + i;
					// b2 = c1							// left-top
						c2 = offset + g.wss[ s ] * j + 1 + i;

						g.faceIndices[ posIdxCount     ] = a; // right-bottom
						g.faceIndices[ posIdxCount + 1 ] = b1;
						g.faceIndices[ posIdxCount + 2 ] = c1;

						g.faceIndices[ posIdxCount + 3 ] = a; // left-top
						g.faceIndices[ posIdxCount + 4 ] = c1; // = b2,
						g.faceIndices[ posIdxCount + 5 ] = c2;

						g.addGroup( posIdxCount, 6, mmOffs  + i ); // write groups for multi material

						posIdxCount += 6;

					}

				}

				offset += g.lss * g.wss[ s ];
				mmOffs += g.ws[ s ];

			}

		}

		var uvIdxCount = 0;

		for ( var s = 0; s < 4; s ++ ) {

			if ( g.sides[ s ] ) {

				for ( var j = 0; j < g.lss; j ++ ) {

					for ( var i = 0; i < g.wss[ s ]; i ++ ) {

						g.uvs[ uvIdxCount     ] = g.lenList[ j ] / g.len;
						g.uvs[ uvIdxCount + 1 ] = i / g.ws[ s ];

						uvIdxCount += 2;

					}

				}

			}

		}

		var tangent;
		var normal = new Vector3( 0, 0, 0 );
		var binormal = new Vector3( 0, 1, 0 );

		g.t = []; // tangents
		g.n = []; // normals
		g.b = []; // binormals

		var x, y, z;
		var hd2, wd2;
		var vIdx = 0; // vertex index
		var posIdx;   // position index

		for ( var j = 0; j < g.lss; j ++ ) {  // length

			tangent = g.curve.getTangent( j / g.ls ); //  .. / length segments
			g.t.push( tangent.clone( ) );

			normal.crossVectors( tangent, binormal );

			normal.y = 0;

			normal.normalize( );
			g.n.push( normal.clone( ) );

			binormal.crossVectors( normal, tangent ); // new binormal
			g.b.push( binormal.clone( ) );

		}

		for ( var s = 0; s < 4; s ++ ) {

			if ( g.sides[ s ] ) {

				if ( s === 1 || s === 3 ) {   //  1 top (road), 2 bottom

					if ( g.isWall ) {

						hd2 = ( s === 1 ? 1 : -1 ) * g.hd / 2;

					} else {

						hd2 = 0;

					}

					for ( var j = 0; j < g.lss; j ++ ) {  // length

						for ( var i = 0; i < g.wss[ s ]; i ++ ) { // width

							x = g.points[ j ].x + g.sd[ s ][ i ] * g.n[ j ].x;
							y = g.points[ j ].y + hd2;
							z = g.points[ j ].z + g.sd[ s ][ i ] * g.n[ j ].z;

							xyzSet();

							vIdx ++;

						}

					}

				}

				if ( s === 0 || s === 2 ) { // wall side 0 left,  2 right

					wd2 = ( s === 0 ? -1 : 1 ) * g.wd / 2;

					for ( var j = 0; j < g.lss; j ++ ) {  // length

						for ( var i = 0; i < g.wss[ s ]; i ++ ) { // width	=> height

							x = g.points[ j ].x + wd2 * g.n[ j ].x;
							y = g.points[ j ].y + g.sd[ s ][ i ];
							z = g.points[ j ].z + wd2 * g.n[ j ].z;

							xyzSet();

							vIdx ++;

						}

					}

				}

			}

		}

		// set vertex position
		function xyzSet () {

			posIdx = vIdx * 3;

			g.vertices[ posIdx ]  = x;
			g.vertices[ posIdx + 1 ]  = y;
			g.vertices[ posIdx + 2 ]  = z;

		}

	// }

	// createRoad();

};

RoadSplineBufferGeometry.prototype = Object.create( BufferGeometry.prototype );
RoadSplineBufferGeometry.prototype.constructor = RoadSplineBufferGeometry;

export { RoadSplineBufferGeometry };

// export default class ChildClass extends EventDispatcher { value: 1 };
// export default class RoadSplineBufferGeometry {
//
// 	constructor ( curvePoints, lengthSegments, trackDistances ) {
//
// 		this.g;
// 		this.curvePoints = curvePoints;
// 		this.lengthSegments = lengthSegment;
// 		this.trackDistances = trackDistances;
//
// 	}
//
// 	createRoad () {
//
// 		// all parameters optional
//
// 		this.g = new BufferGeometry();  //  THREE.BufferGeometry() - geometry object from three.js
//
// 		const g = this.g;
//
// 		g.sd = trackDistances !== undefined ?  [ [], trackDistances, [], [] ]  :  [ [], [ -0.5, 0.5 ], [], [] ]  ;
//
// 		g.wss = [ 0, g.sd[ 1 ].length, 0, 0 ];
// 		g.ws = [ 0, g.sd[ 1 ].length - 1, 0, 0 ];
//
// 		g.sides = [ false, true, false, false ];
//
// 		g.ls = lengthSegments !== undefined ? lengthSegments : 500;
// 		g.lss = g.ls + 1;
//
// 		g.cP = curvePoints !== undefined ? curvePoints : [ -10,0,5, 0,1,0, 10,0,5 ];
//
// 		var pts = [];
//
// 		for ( var i = 0; i < g.cP.length; i += 3 ) {
//
// 			pts.push( new Vector3( g.cP[ i ], g.cP[ i + 1 ], g.cP[ i + 2 ] ) );
//
// 		}
//
// 		g.curve = new CatmullRomCurve3( pts );
//
// 		g.len = g.curve.getLength( );
//
// 		g.points = g.curve.getPoints( g.ls );
// 		g.len = g.curve.getLength( );
// 		g.lenList = g.curve.getLengths ( g.ls );
//
// 		g.isWall = false;
//
// 		g.buildRoadWall = this.buildRoadWall;
// 		g.buildRoadWall();
//
// 	}
//
// 	buildRoadWall () {
//
// 		const g = this.g;
//
// 		g.faceCount = g.ls * ( g.ws[ 0 ] + g.ws[ 1 ] + g.ws[ 2 ] + g.ws[ 3 ] ) * 2;
// 		g.vertexCount = g.lss * ( g.wss[ 0 ] + g.wss[ 1 ] + g.wss[ 2 ] + g.wss[ 3 ] );
//
// 		g.faceIndices = new Uint32Array( g.faceCount * 3 );
// 		g.vertices = new Float32Array( g.vertexCount * 3 );
// 		g.uvs = new Float32Array( g.vertexCount * 2 );
//
// 		g.setIndex( new THREE.BufferAttribute( g.faceIndices, 1 ) );
// 		g.addAttribute( 'position', new THREE.BufferAttribute( g.vertices, 3 ) );
// 		g.addAttribute( 'uv', new THREE.BufferAttribute( g.uvs, 2 ) );
//
// 		var a, b1, c1, c2;
// 		var posIdxCount = 0;
// 		var offset = 0;
// 		var mmOffs = 0;
//
// 		for ( var s = 0; s < 4; s ++ ) {
//
// 			if ( g.sides[ s ] ) {
//
// 				for ( var j = 0; j < g.ls; j ++ ) {
//
// 					for ( var i = 0; i < g.ws[ s ]; i ++ ) {
//
// 						// 2 faces / segment,  3 vertex indices
// 						a  = offset + g.wss[ s ] * j + i;
// 						b1 = offset + g.wss[ s ] * ( j + 1 ) + i;		// right-bottom
// 						c1 = offset + g.wss[ s ] * ( j + 1 ) + 1 + i;
// 					// b2 = c1							// left-top
// 						c2 = offset + g.wss[ s ] * j + 1 + i;
//
// 						g.faceIndices[ posIdxCount     ] = a; // right-bottom
// 						g.faceIndices[ posIdxCount + 1 ] = b1;
// 						g.faceIndices[ posIdxCount + 2 ] = c1;
//
// 						g.faceIndices[ posIdxCount + 3 ] = a; // left-top
// 						g.faceIndices[ posIdxCount + 4 ] = c1; // = b2,
// 						g.faceIndices[ posIdxCount + 5 ] = c2;
//
// 						g.addGroup( posIdxCount, 6, mmOffs  + i ); // write groups for multi material
//
// 						posIdxCount += 6;
//
// 					}
//
// 				}
//
// 				offset += g.lss * g.wss[ s ];
// 				mmOffs += g.ws[ s ];
//
// 			}
//
// 		}
//
// 		var uvIdxCount = 0;
//
// 		for ( var s = 0; s < 4; s ++ ) {
//
// 			if ( g.sides[ s ] ) {
//
// 				for ( var j = 0; j < g.lss; j ++ ) {
//
// 					for ( var i = 0; i < g.wss[ s ]; i ++ ) {
//
// 						g.uvs[ uvIdxCount     ] = g.lenList[ j ] / g.len;
// 						g.uvs[ uvIdxCount + 1 ] = i / g.ws[ s ];
//
// 						uvIdxCount += 2;
//
// 					}
//
// 				}
//
// 			}
//
// 		}
//
// 		var tangent;
// 		var normal = new THREE.Vector3( 0, 0, 0 );
// 		var binormal = new THREE.Vector3( 0, 1, 0 );
//
// 		g.t = []; // tangents
// 		g.n = []; // normals
// 		g.b = []; // binormals
//
// 		var x, y, z;
// 		var hd2, wd2;
// 		var vIdx = 0; // vertex index
// 		var posIdx;   // position index
//
// 		for ( var j = 0; j < g.lss; j ++ ) {  // length
//
// 			tangent = g.curve.getTangent( j / g.ls ); //  .. / length segments
// 			g.t.push( tangent.clone( ) );
//
// 			normal.crossVectors( tangent, binormal );
//
// 			normal.y = 0;
//
// 			normal.normalize( );
// 			g.n.push( normal.clone( ) );
//
// 			binormal.crossVectors( normal, tangent ); // new binormal
// 			g.b.push( binormal.clone( ) );
//
// 		}
//
// 		for ( var s = 0; s < 4; s ++ ) {
//
// 			if ( g.sides[ s ] ) {
//
// 				if ( s === 1 || s === 3 ) {   //  1 top (road), 2 bottom
//
// 					if ( g.isWall ) {
//
// 						hd2 = ( s === 1 ? 1 : -1 ) * g.hd / 2;
//
// 					} else {
//
// 						hd2 = 0;
//
// 					}
//
// 					for ( var j = 0; j < g.lss; j ++ ) {  // length
//
// 						for ( var i = 0; i < g.wss[ s ]; i ++ ) { // width
//
// 							x = g.points[ j ].x + g.sd[ s ][ i ] * g.n[ j ].x;
// 							y = g.points[ j ].y + hd2;
// 							z = g.points[ j ].z + g.sd[ s ][ i ] * g.n[ j ].z;
//
// 							xyzSet();
//
// 							vIdx ++;
//
// 						}
//
// 					}
//
// 				}
//
// 				if ( s === 0 || s === 2 ) { // wall side 0 left,  2 right
//
// 					wd2 = ( s === 0 ? -1 : 1 ) * g.wd / 2;
//
// 					for ( var j = 0; j < g.lss; j ++ ) {  // length
//
// 						for ( var i = 0; i < g.wss[ s ]; i ++ ) { // width	=> height
//
// 							x = g.points[ j ].x + wd2 * g.n[ j ].x;
// 							y = g.points[ j ].y + g.sd[ s ][ i ];
// 							z = g.points[ j ].z + wd2 * g.n[ j ].z;
//
// 							xyzSet();
//
// 							vIdx ++;
//
// 						}
//
// 					}
//
// 				}
//
// 			}
//
// 		}
//
// 		// set vertex position
// 		function xyzSet() {
//
// 			posIdx = vIdx * 3;
//
// 			g.vertices[ posIdx ]  = x;
// 			g.vertices[ posIdx + 1 ]  = y;
// 			g.vertices[ posIdx + 2 ]  = z;
//
// 		}
//
// 	}
//
// };
