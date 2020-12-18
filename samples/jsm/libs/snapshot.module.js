const Snapshot = function ( renderer ) {

    console.log( renderer )

    if ( renderer === undefined ) console.warn( 'Snapshot: The parameter "renderer" is now mandatory.' );

    // Snapshot renderer.
    this.renderer = renderer;

    // Internals.
    const scope = this;

    // This method is exposed.
    this.capture = function ( scene, camera ) {

        if ( scene === undefined ) console.warn( 'Snapshot: The second parameter "scene" is now mandatory.' );
        if ( camera === undefined ) console.warn( 'Snapshot: The second parameter "camera" is now mandatory.' );

        // console.log( scope )
        // console.log( scope.renderer )

        const canvas = scope.renderer.domElement;
        scope.renderer.render( scene, camera );

        canvas.toBlob( ( blob ) => {

            _saveBlob( blob, `snapshot-${ canvas.width }x${ canvas.height }.jpg`);

        } );

    };

    // This method is private.
    function _saveBlob ( blob, fileName ) {

        const a = document.createElement( 'a' );

        document.body.appendChild( a );
        a.style.display = 'none';

        const url = window.URL.createObjectURL( blob );

        a.href = url;
        a.download = fileName;
        a.click();
		document.body.removeChild( a );

		// TODO:
		// const link = document.createElement( 'a' );
		//
	    // link.href = window.URL.createObjectURL( blob );
	    // link.download = fileName;
		//
	    // document.body.appendChild( link );
	    // link.click();
	    // document.body.removeChild( link );

    }

};

Snapshot.prototype = Object.create( null );
Snapshot.prototype.constructor = Snapshot;

export default Snapshot;
