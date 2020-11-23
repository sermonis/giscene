import { WebGLRenderer } from 'three';

const Snapshot = function ( width, height ) {

    if ( width === undefined ) console.warn( 'Snapshot: The first parameter "width" is now mandatory.' );
    if ( height === undefined ) console.warn( 'Snapshot: The second parameter "height" is now mandatory.' );

    // Snapshot width.
    this.width = width;

    // Snapshot height.
    this.height = height;

    // Internals.
    const scope = this;

    // This method is exposed.
    this.capture = function ( scene, camera ) {

        if ( scene === undefined ) console.warn( 'Snapshot: The first parameter "scene" is now mandatory.' );
        if ( camera === undefined ) console.warn( 'Snapshot: The second parameter "camera" is now mandatory.' );

        const snapshot = new WebGLRenderer( { antialias: true } );
        snapshot.setSize( scope.width, scope.height );

        const canvas = snapshot.domElement;
        snapshot.render( scene, camera );

        canvas.toBlob( ( blob ) => {

            snapshot.dispose();
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

    }

};

Snapshot.prototype = Object.create( null );
Snapshot.prototype.constructor = Snapshot;

export default Snapshot;
