/**
** Geometry Addon.
** @see http://threejs.hofk.de/
** @see https://hofk.de/main/threejs/js/THREEg.js
**/
import {

	BufferGeometry,
	BufferAttribute,
	Vector3,
	CatmullRomCurve3,

} from '../../../libs/three.js/build/three.module.js';

// All parameters are optional.
const WallBufferGeometry = function ( curvePoints, lengthSegments, sidesDistances, widthDistance, hightDistance ) {

	BufferGeometry.call( this );

	const g = this;

	g.sd = sidesDistances !== undefined
		? sidesDistances
		: [ [ -1, 1 ], [ -0.5, 0.5 ], [ -1, 1 ], [ -0.5, 0.5 ] ];

	if ( widthDistance !== undefined ) {

		g.wd = widthDistance;

	} else {

		g.wd = ( sidesDistances !== undefined && sidesDistances[ 1 ].length > 1 )
			? g.sd[ 1 ][ g.sd[ 1 ].length - 1 ] - g.sd[ 1 ][ 0 ]
			: 1;

	}

	if ( hightDistance !== undefined  ) {

		g.hd = hightDistance;

	} else {

		g.hd = ( sidesDistances !== undefined && sidesDistances[ 0 ].length > 1 )
			?  g.sd[ 0 ][ g.sd[ 0 ].length - 1 ] - g.sd[ 0 ][ 0 ]
			: 2;

	}

	g.sides = [ false, false, false, false ];

	g.wss = [];
	g.ws = [];

	for ( var s = 0; s < 4; s ++ ) {

		g.wss[ s ] = g.sd[ s ].length;

		if ( g.wss[ s ] !== 0  ) {

			g.sides[ s ] = true; g.ws[ s ] = g.wss[ s ] - 1;

		} else {

			g.ws[ s ] = 0;

		}

	}

	g.ls = lengthSegments !== undefined
		? lengthSegments
		: 100;

	g.lss = g.ls + 1;

	g.cP = curvePoints !== undefined
		? curvePoints
		: [ -10, 0, 5, 0, 1, 0, 10, 0, 5 ];

	var pts = [];

	for ( var i = 0; i < g.cP.length; i += 3 ) {

		pts.push( new Vector3( g.cP[ i ], g.cP[ i + 1 ], g.cP[ i + 2 ] ) );

	}

	g.curve = new CatmullRomCurve3( pts );

	g.len = g.curve.getLength();

	g.points = g.curve.getPoints( g.ls );
	g.len = g.curve.getLength();
	g.lenList = g.curve.getLengths ( g.ls );

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

	let a, b1, c1, c2;
	let posIdxCount = 0;
	let offset = 0;
	let mmOffs = 0;

	for ( let s = 0; s < 4; s ++ ) {

		if ( g.sides[ s ] ) {

			for ( let j = 0; j < g.ls; j ++ ) {

				for ( let i = 0; i < g.ws[ s ]; i ++ ) {

					// 2 faces / segment, 3 vertex indices
					a  = offset + g.wss[ s ] * j + i;
					b1 = offset + g.wss[ s ] * ( j + 1 ) + i; // right-bottom
					c1 = offset + g.wss[ s ] * ( j + 1 ) + 1 + i;

					// b2 = c1
					c2 = offset + g.wss[ s ] * j + 1 + i; // left-top

					g.faceIndices[ posIdxCount ] = a; // right-bottom
					g.faceIndices[ posIdxCount + 1 ] = b1;
					g.faceIndices[ posIdxCount + 2 ] = c1;

					g.faceIndices[ posIdxCount + 3 ] = a; // left-top
					g.faceIndices[ posIdxCount + 4 ] = c1; // = b2,
					g.faceIndices[ posIdxCount + 5 ] = c2;

					// Write groups for multi material.
					g.addGroup( posIdxCount, 6, mmOffs + i );

					posIdxCount += 6;

				}

			}

			offset += g.lss * g.wss[ s ];
			mmOffs += g.ws[ s ];

		}

	}

	let uvIdxCount = 0;

	for ( let s = 0; s < 4; s ++ ) {

		if ( g.sides[ s ] ) {

			for ( let j = 0; j < g.lss; j ++ ) {

				for ( let i = 0; i < g.wss[ s ]; i ++ ) {

					g.uvs[ uvIdxCount ] = g.lenList[ j ] / g.len;
					g.uvs[ uvIdxCount + 1 ] = i / g.ws[ s ];

					uvIdxCount += 2;

				}

			}

		}

	}

	let tangent;
	let normal = new Vector3( 0, 0, 0 );
	let binormal = new Vector3( 0, 1, 0 );

	g.t = []; // tangents
	g.n = []; // normals
	g.b = []; // binormals

	let x, y, z;
	let hd2, wd2;

	let vIdx = 0; // vertex index
	let posIdx; // position index

	for ( let j = 0; j < g.lss; j ++ ) { // length

		tangent = g.curve.getTangent( j / g.ls ); //  .. / length segments
		g.t.push( tangent.clone() );

		normal.crossVectors( tangent, binormal );

		normal.y = 0;

		normal.normalize();
		g.n.push( normal.clone() );

		binormal.crossVectors( normal, tangent ); // new binormal
		g.b.push( binormal.clone() );

	}

	for ( let s = 0; s < 4; s ++ ) {

		if ( g.sides[ s ] ) {

			if ( s === 1 || s === 3 ) { //  1 top (road), 2 bottom

				hd2 = ( s === 1 ? 1 : -1 ) * g.hd / 2;

				for ( let j = 0; j < g.lss; j ++ ) { // length

					for ( let i = 0; i < g.wss[ s ]; i ++ ) { // width

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

				for ( let j = 0; j < g.lss; j ++ ) { // length

					for ( let i = 0; i < g.wss[ s ]; i ++ ) { // width	=> height

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

	// Set vertex position.
	function xyzSet () {

		posIdx = vIdx * 3;

		g.vertices[ posIdx ] = x;
		g.vertices[ posIdx + 1 ] = y;
		g.vertices[ posIdx + 2 ] = z;

	}

};

WallBufferGeometry.prototype = Object.create( BufferGeometry.prototype );
WallBufferGeometry.prototype.constructor = WallBufferGeometry;

export { WallBufferGeometry };
