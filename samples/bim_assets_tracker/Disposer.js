//
// const THREE = require("three-full");
//
// var Disposer = function(){};
//
// Disposer.prototype.constructor = Disposer;
//
// Disposer.prototype.disposeOnCascade = (function(){
//     function disposeNode(node){
//         if (node instanceof THREE.Mesh)
//         {
//             if (node.geometry)
//             {
//                 node.geometry.dispose();
//             }
//
//             if (node.material)
//             {
//                 if (node.material && node.material.materials)
//                 {
//                     for(var i=0;i<node.material.materials.length; ++i){
//                         mtrl = node.material.materials[i];
//                         if (mtrl.map)           mtrl.map.dispose();
//                         if (mtrl.lightMap)      mtrl.lightMap.dispose();
//                         if (mtrl.bumpMap)       mtrl.bumpMap.dispose();
//                         if (mtrl.normalMap)     mtrl.normalMap.dispose();
//                         if (mtrl.specularMap)   mtrl.specularMap.dispose();
//                         if (mtrl.envMap)        mtrl.envMap.dispose();
//
//                         mtrl.dispose();    // disposes any programs associated with the material
//                     }
//                 }
//                 else
//                 {
//                     if (node.material.map)          node.material.map.dispose();
//                     if (node.material.lightMap)     node.material.lightMap.dispose();
//                     if (node.material.bumpMap)      node.material.bumpMap.dispose();
//                     if (node.material.normalMap)    node.material.normalMap.dispose();
//                     if (node.material.specularMap)  node.material.specularMap.dispose();
//                     if (node.material.envMap)       node.material.envMap.dispose();
//
//                     node.material.dispose ();   // disposes any programs associated with the material
//                 }
//             }
//         }
//     }   // disposeNode
//
//     function disposeHierarchy (node, callback){
//         for (var i = node.children.length-1; i>=0; i--){
//             var child = node.children[i];
//             disposeHierarchy (child, callback);
//             callback (child);
//         }
//     }
//
//     return function(o){
//         disposeHierarchy(o, disposeNode);
//     };
//
// })();
//
// THREE.Disposer = Disposer;
//
// module.exports = Disposer;

// import { Mesh, Object3D } from 'three';
import {

	Mesh, Light, Object3D,
	MeshFaceMaterial, MultiMaterial, // MeshFaceMaterial & MultiMaterial - Removed

} from '../../../libs/three.js/build/three.module.js';

// AssetsDisposer
export default class Disposer {

	// constructor ( node ) {
	//
	// 	this.node = node;
	//
	// }

	// scope = this;

	constructor ( object, renderer ) {

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

		this.name = 'THREE.Disposer';
		this.version = '0.0.1';

		this.scene = object;
		this.renderer = renderer;

		console.log( renderer )

		// return this;

	}

	dispose ( node ) { // root

		// if ( this.scene === undefined ) return;

		// if ( node instanceof Object3D === false ) {
		//
		// 	console.warn( '!Object3d' );
		// 	// return;
		//
		// }

		// node = node || this.scene;
		//
		// // this.disposeHierarchy( node, this.disposeNode.bind( this ) );
		// this.disposeHierarchy( node, this.disposeNode );

		// console.log( this.renderer.info )
		const memory = JSON.stringify(this.renderer.info.memory);
		console.log( memory )

		return new Promise ( async ( resolve, reject ) => {

			// node = node || this.scene;
			await this._disposeHierarchy( node, this._disposeNode );

			// this.scene.dispose();
			// this.scene.dispose();

			// console.log( this.scene )

			// console.log( this.renderer.info.memory )

			// throw('##############')

			resolve( 'Disposed!' );

			// reject('##############')
			// reject()

		} );

	}

	_disposeHierarchy ( node, callback ) {

		// TODO: node.traverse( function (node) {
		for ( let i = node.children.length - 1; i >= 0; i-- ) {

			const child = node.children[ i ];
            this._disposeHierarchy( child, callback );

			// console.log(this)
            // callback.call( child ).bind(this);
            callback.call( this, child );

        }

    }

	_disposeNode ( node ) {

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

		// TODO: Texture
		// https://jsfiddle.net/x7Le8pda/
		// texture.dispose();

		// if ( node instanceof Mesh ) { // .isMesh
		if ( node.isMesh ) { // .isMesh

			// console.log( 'MESH', node )

			// TODO: BufferGeometry
			// https://github.com/mrdoob/three.js/pull/12464#issuecomment-518616514
			// https://github.com/mrdoob/three.js/pull/12464
            if ( node.geometry ) {

                node.geometry.dispose();
            }

            if ( node.material ) {

				// console.log( node.material )

				// glTF texture types. `envMap` is deliberately omitted, as it's used internally
				// by the loader but not part of the glTF format.
				// const MAP_NAMES = [
				//   'map',
				//   'aoMap',
				//   'emissiveMap',
				//   'glossinessMap',
				//   'metalnessMap',
				//   'normalMap',
				//   'roughnessMap',
				//   'specularMap',
				// ];

                // if ( node.material && node.material.materials ) { // ???
                // TODO: MeshFaceMaterial & MultiMaterial - Removed
                // TODO: Check if material is array and thats it.
                if ( node.material && ( node.material instanceof MeshFaceMaterial || node.material instanceof MultiMaterial ) ) { // ???

                    for ( let i = 0; i < node.material.materials.length; ++i ) {
					// TODO: check perfomance: node.material.materials.forEach( ( material, idx ) {
					// TODO: https://stackoverflow.com/a/45383375

                        const material = node.material.materials[ i ];

                        if ( material.map )				material.map.dispose();
                        if ( material.lightMap )		material.lightMap.dispose();
                        if ( material.bumpMap )			material.bumpMap.dispose();
                        if ( material.normalMap )		material.normalMap.dispose();
                        if ( material.specularMap )		material.specularMap.dispose();
                        if ( material.envMap )			material.envMap.dispose();
						if ( material.alphaMap )		material.alphaMap.dispose();
						if ( material.aoMap )			material.aoMap.dispose();
						if ( material.displacementMap )	material.displacementMap.dispose();
						if ( material.emissiveMap )		material.emissiveMap.dispose();
						if ( material.gradientMap )		material.gradientMap.dispose();
						if ( material.metalnessMap )	material.metalnessMap.dispose();
						if ( material.roughnessMap )	material.roughnessMap.dispose();

                        material.dispose();    // disposes any programs associated with the material

                    }

                } else {

                    if ( node.material.map )          node.material.map.dispose();
                    if ( node.material.lightMap )     node.material.lightMap.dispose();
                    if ( node.material.bumpMap )      node.material.bumpMap.dispose();
                    if ( node.material.normalMap )    node.material.normalMap.dispose();
                    if ( node.material.specularMap )  node.material.specularMap.dispose();
                    if ( node.material.envMap )       node.material.envMap.dispose();

                    node.material.dispose();   // disposes any programs associated with the material

                }

				// // dispose textures
			   // traverseMaterials( this.content, (material) => {
			   //
				//  MAP_NAMES.forEach( (map) => {
			   //
				//    if (material[ map ]) material[ map ].dispose();
			   //
				//  } );
			   //
			   // } );

			   // https://github.com/donmccurdy/three-gltf-viewer/blob/master/src/viewer.js

			   // function traverseMaterials (object, callback) {
				//   object.traverse((node) => {
				//     if (!node.isMesh) return;
				//     const materials = Array.isArray(node.material)
				//       ? node.material
				//       : [node.material];
				//     materials.forEach(callback);
				//   });

            }

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

		node.parent && node.parent.remove( node );
		// node = undefined; // TODO: Check.

    }   // disposeNode

};
