// import { Mesh, Object3D } from 'three';
import {

	Mesh, Light, Object3D,
	// MeshFaceMaterial, MultiMaterial, // MeshFaceMaterial & MultiMaterial - Removed

} from '../../../libs/three.js/build/three.module.js';

const MATERIAL_MAPS = [

	'alphaMap',
	'aoMap',
	'bumpMap',
	'displacementMap',
	'emissiveMap',
	'envMap',
	'glossinessMap',
	'gradientMap',
	'lightMap',
	'map',
	'metalnessMap',
	'normalMap',
	'roughnessMap',
	'specularMap'

];

// AssetsDisposer
export default class Disposer {

	// constructor ( node ) {
	//
	// 	this.node = node;
	//
	// }

	// scope = this;

	// scope = this;

	// const _this = this,

	// constructor ( object, renderer, options ) {
	constructor ( parameters ) {

		// var scope = this;
		// const _this = this;
		// scope.parameters = parameters || {};
		this.parameters = parameters || {};

		// console.log( object )

		// if ( object === undefined ) {
		//
		// 	console.error( 'THREE.Disposer: scene argument is required.' );
		// 	return;
		//
		// } else if ( object.isScene !== true ) {
		//
		// 	console.error( 'THREE.Disposer: scene argument is not an instance of THREE.Scene.' );
		// 	return;
		//
		// }

		// object
		// object.isScene

		// console.log( object )

		// scope.name = 'THREE.Disposer';
		// scope.version = '0.0.1';

		// this.name = 'THREE.Disposer';
		// this.version = '0.0.1';

		// _this.name = 'THREE.Disposer';
		// _this.version = '0.0.1';

		// this.scene = object;
		// this.renderer = renderer;

		// console.log( renderer )

		// return this;

	}

	// public
	dispose ( root ) {

		return new Promise ( async ( resolve, reject ) => {

			if ( !root ) {

				console.error( 'THREE.Disposer: Root node argument is required.' );
				reject( root );

			} else if ( root instanceof Object3D === false ) {

				console.error( 'THREE.Disposer: Root node is not an instance of THREE.Object3D.' );
				reject( root );

			} else {

				// console.log( '_this.name', _this.name );

				await this.#traverseNode( root, this.#disposeNode );
				resolve( 'Disposed!' );

			}

		} );

	}

	// protected
	#traverseNode ( node, callback ) {

		// if ( node ) {

			for ( let i = 0, l = node.children.length; i < l; i ++ ) {

				const child = node.children[ i ];

	            this.#traverseNode( child, callback );

	            callback.call( this, child );

	        }

		// }

		// for ( let i = 0, l = node.children.length; i < l; i ++ ) {
		//
		// 	const child = node.children[ i ];
		//
        //     this.#traverseNode( child, callback );
		//
        //     callback.call( this, child );
		//
        // }

		// node.traverse( child => {
		//
		// 	this.#disposeNode( child );
		// 	// ( child.isScene === false ) && this.#disposeNode( child );
		//
		// 	callback.call( this, child );
		//
		// } );

    }

	// protected
	// #remove ( node ) {
	#disposeNode ( node ) {

		// console.log( 'disposeNode', 'this', that );
		console.log( node );

		// Renderer
		// this.dispose = function () {
		//
		// 	_canvas.removeEventListener( 'webglcontextlost', onContextLost, false );
		// 	_canvas.removeEventListener( 'webglcontextrestored', onContextRestore, false );
		//
		// 	renderLists.dispose();
		// 	renderStates.dispose();
		// 	properties.dispose();
		// 	cubemaps.dispose();
		// 	objects.dispose();
		// 	bindingStates.dispose();
		//
		// 	xr.dispose();
		//
		// 	animation.stop();
		//
		// };

		const disposeGeometry = ( node ) => {

			// TODO: BufferGeometry
			// https://github.com/mrdoob/three.js/pull/12464#issuecomment-518616514
			// https://github.com/mrdoob/three.js/pull/12464
            if ( node.geometry ) {

                node.geometry.dispose();
            }

		}

		const disposeMaterial = ( node ) => {

			if ( node.material ) {

				// Cast to array.
				const materials = Array.isArray( node.material )
					? node.material
					: [ node.material ];

				// Dispose material maps.
				materials.forEach( material => {

					MATERIAL_MAPS.forEach( name => {

						material[ name ] && material[ name ].dispose();

					} );

				} );

				// Dispose material.
				node.material.dispose();

            }

		}

		// TODO: Texture
		// https://jsfiddle.net/x7Le8pda/
		// texture.dispose();

		// if ( node instanceof Mesh ) { // .isMesh
		// if ( node.isMesh ) { // .isMesh
		if ( node.isObject3D ) { // .isObject3D

			// console.log( 'MESH', node )

			// node.visible = false;

			// // TODO: BufferGeometry
			// // https://github.com/mrdoob/three.js/pull/12464#issuecomment-518616514
			// // https://github.com/mrdoob/three.js/pull/12464
            // if ( node.geometry ) {
			//
            //     node.geometry.dispose();
            // }
			//
            // if ( node.material ) {
			//
			// 	// Cast to array.
			// 	const materials = Array.isArray( node.material )
			// 		? node.material
			// 		: [ node.material ];
			//
			// 	// Dispose material maps.
			// 	materials.forEach( material => {
			//
			// 		MATERIAL_MAPS.forEach( name => {
			//
			// 			material[ name ] && material[ name ].dispose();
			//
			// 		} );
			//
			// 	} );
			//
			// 	// Dispose material.
			// 	node.material.dispose();
			//
            // }

			disposeGeometry( node );
			disposeMaterial( node );

			// node.parent.remove( node );

        }

		// if ( node instanceof Light ) { // .isLight
		//
		// 	console.log( node.type )
		//
		// }

		// TODO:
		// isGroup: true
		// isObject3D: true

		// TODO: Helpers
		// type: "GridHelper"
		// type: "AxesHelper"
		// isLine: true
		// isLineSegments

		// if ( node.isLineSegments ) {
		//
		// 	if ( node.geometry ) {
		//
        //         node.geometry.dispose();
        //     }
		//
		// 	if ( node.material ) {
		//
		// 		// Cast to array.
		// 		const materials = Array.isArray( node.material )
		// 			? node.material
		// 			: [ node.material ];
		//
		// 		// Dispose material maps.
		// 		materials.forEach( material => {
		//
		// 			MATERIAL_MAPS.forEach( name => {
		//
		// 				material[ name ] && material[ name ].dispose();
		//
		// 			} );
		//
		// 		} );
		//
		// 		// Dispose material.
		// 		node.material.dispose();
		//
        //     }
		//
		// 	// console.log( 'node.parent', node.parent );
		// 	//
		// 	// if (node.parent.isScene === false) {
		// 	//
		// 	// 	node.parent.remove( node );
		// 	//
		// 	// }
		// 	// console.log( 'node.parent.children', node.parent.children );
		// 	// node.parent.remove( node );
		// 	// console.log( 'node.parent.children', node.parent.children );
		//
		// }

		// https://habr.com/ru/post/521470/
		// else if (node.constructor.name === "Object3D") {
		//    node.parent.remove(node);
		//    node.parent = undefined;
	   // }

		// if ( node instanceof Light ) { // .isLight

		// isDirectionalLight: true
		// isHemisphereLight: true

		if ( node.isLight ) { // .isLight

			if ( node.shadow && node.shadow.map ) {

				// console.log( node.shadow );
				// console.log( node.shadow.map );

				node.shadow.map.dispose();

				// console.log( '-------------------------' );
				// console.log( node.shadow );
				// console.log( node.shadow.map );

			}

			// console.log( node.type );
			// console.log( node );
			//
			// // console.log( that.name )
			// console.log( this.name )
			//
			// // this.scene.remove( node );

		}

		// if ( node.parent ) {
		//
		//
		//
		// }

		// console.log( 'node.parent', node.parent )

		// node.parent && node.parent.remove( node );
		// node = undefined; // TODO: Check.

		// if ( node.parent )
		if ( node.isScene === false ) { // node.isScene === false

			node.parent.remove( node );
			node = undefined;

		} else {

			node.children = [];

		}

		// this.scene.remove(node)

		// console.log( 'node.children', node.children );
		// console.log( 'node.isScene', node.isScene );
		// node.children = [];
		// node = undefined;

		// if ( node.isScene === undefined ) { // node.isScene === false
		//
		// 	this.scene.remove(node)
		//
		// }

    }   // disposeNode

};
