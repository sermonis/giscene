import { NavigatorSimple } from './NavigatorSimple.js';
import { getMousePosition } from '../BimWalkUtils.js';

/**
 * The AEC Navgator will do the following:
 * 1. Left clicking selection is disabled. Selection can be done through the context menu.
 * 2. Dragging the mouse on the Y axis will move the camera forward|backwards.
 * 3. The 'L' key will enable the look around mode (this is the same as the NavigatorSimple implementation).
 * 4. Cursors change depending on if the user is in walk mode or look mode.
 * 5. The info button is removed and the viewcube is displayed.
 */
export class NavigatorAEC extends NavigatorSimple {
    constructor(tool) {
        super(tool);
        this.lookingEnabled = false;
        this.walkDelta = 0;
        this.onClickMousePosition = new THREE.Vector2(0, 0);
        // minimize the camera movement when releasing the mouse button
        this.configuration.mouseTurnStopDuration = 0.01;
    }

    activate() {
        NavigatorSimple.prototype.activate.call(this);
        this.ui.showInfoIcon(false);
        this.viewer.getExtension("Autodesk.ViewCubeUi", function(ext) {
            ext.displayViewCube(true);
            ext.displayHomeButton(true);
        });
        this.viewer.impl.disableSelection(true);
        this.viewer.registerContextMenuCallback('Autodesk.BimWalk', this._onContextMenu.bind(this));
    }

    deactivate() {
        NavigatorSimple.prototype.deactivate.call(this);
        this.viewer.impl.disableSelection(false);
        this.viewer.unregisterContextMenuCallback('Autodesk.BimWalk');
    }

    handleKeyDown(event, keyCode) {
        let handled = NavigatorSimple.prototype.handleKeyDown.call(this, event, keyCode);

        switch (keyCode) {
            case this.keys.w:
            case this.keys.s:
            case this.keys.a:
            case this.keys.d:
            case this.keys.q:
            case this.keys.e:
            case this.keys.UP:
            case this.keys.DOWN:
            case this.keys.LEFT:
            case this.keys.RIGHT:
            case this.keys.l:
                this.lookingEnabled = true;
                handled = true;
                break;
            default:
                break;
        }

        return handled;
    }

    handleKeyUp(event, keyCode) {
        let handled = NavigatorSimple.prototype.handleKeyUp.call(this, event, keyCode);

        switch (keyCode) {
            case this.keys.w:
            case this.keys.s:
            case this.keys.a:
            case this.keys.d:
            case this.keys.q:
            case this.keys.e:
            case this.keys.UP:
            case this.keys.DOWN:
            case this.keys.LEFT:
            case this.keys.RIGHT:
            case this.keys.l:
                this.lookingEnabled = false;
                handled = true;
                break;
            default:
                break;
        }

        return handled;
    }

    handleMouseDoubleClick(event) {
        const ret = NavigatorSimple.prototype.handleMouseDoubleClick.call(this, event);
        this.viewer.clearSelection();
        return ret;
    }

    update(elapsed, camera, updateNumber, updatesCount) {
        NavigatorSimple.prototype.update.call(this, elapsed, camera, updateNumber, updatesCount);

        if(!this.lookingEnabled) {
            // Disable looking up.
            this.angularVelocity.x = 0;
        }

        if (this.turningWithMouse && !this.lookingEnabled) {
            // sets the moveMouseTargetDistance with the current delta
            this.applyDeltaToMouseTargetDistance(this.walkDelta);
        }
    }

    calculateMouseDisplacementSpeed() {
        // because we love magic.
        const MAGIC_NUBER = 90;
        // The walkDelta is calculated with the mouse y position
        const speedDelta = Math.abs(this.walkDelta / MAGIC_NUBER);
        return speedDelta > 0.5 ? speedDelta : 0;
    }

    updateMoveMouseTargetDistance() {
        this.moveMouseTargetDistance = 0;
    }

    /**
     *
     * @param event
     * @returns {boolean}
     */
    handleMouseMove(event) {
        var prevMousePosition = this.mousePosition;
        var currMousePosition = { x: 0, y: 0, z: 0 };

        getMousePosition(event, this.viewer, currMousePosition);

        if (this.turningWithMouse) {
            // let delta;
            if (this.get('mouseTurnInverted')) {
                this.turnMouseDelta.x += currMousePosition.x - prevMousePosition.x;
                this.turnMouseDelta.y += currMousePosition.y - prevMousePosition.y;
            } else {
                this.turnMouseDelta.x -= currMousePosition.x - prevMousePosition.x;
                this.turnMouseDelta.y -= currMousePosition.y - prevMousePosition.y;
            }
            // Calculate the walkDelta
            if (!this.lookingEnabled && this.onClickMousePosition) {
                this.walkDelta = currMousePosition.y - this.onClickMousePosition.y;
            }
        }

        this.mousePosition.copy(currMousePosition);
        return true;
    }

    handleButtonDown(event, button) {
        NavigatorSimple.prototype.handleButtonDown.call(this, event, button);
        if (button === 0) {
            getMousePosition(event, this.viewer, this.onClickMousePosition);
        }

        return true;
    }

    handleButtonUp(event, button) {
        NavigatorSimple.prototype.handleButtonUp.call(this, event, button);
        if (button === 0) {
            this.onClickMousePosition = new THREE.Vector2(0, 0);
            this.walkDelta = 0;
        }

        return true;
    }

    getCursor() {
        if (Autodesk.Viewing.isIE11) {
            return null; // Custom cursors don't work in MS platforms, so we set the default one.
        }
        if (this.lookingEnabled) {
            return 'url(data:image/x-icon;base64,iVBORw0KGgoAAAANSUhEUgAAABwAAAAcCAQAAADYBBcfAAAACXBIWXMAABYlAAAWJQFJUiTwAAADGGlDQ1BQaG90b3Nob3AgSUNDIHByb2ZpbGUAAHjaY2BgnuDo4uTKJMDAUFBUUuQe5BgZERmlwH6egY2BmYGBgYGBITG5uMAxIMCHgYGBIS8/L5UBFTAyMHy7xsDIwMDAcFnX0cXJlYE0wJpcUFTCwMBwgIGBwSgltTiZgYHhCwMDQ3p5SUEJAwNjDAMDg0hSdkEJAwNjAQMDg0h2SJAzAwNjCwMDE09JakUJAwMDg3N+QWVRZnpGiYKhpaWlgmNKflKqQnBlcUlqbrGCZ15yflFBflFiSWoKAwMD1A4GBgYGXpf8EgX3xMw8BSMDVQYqg4jIKAUICxE+CDEESC4tKoMHJQODAIMCgwGDA0MAQyJDPcMChqMMbxjFGV0YSxlXMN5jEmMKYprAdIFZmDmSeSHzGxZLlg6WW6x6rK2s99gs2aaxfWMPZ9/NocTRxfGFM5HzApcj1xZuTe4FPFI8U3mFeCfxCfNN45fhXyygI7BD0FXwilCq0A/hXhEVkb2i4aJfxCaJG4lfkaiQlJM8JpUvLS19QqZMVl32llyfvIv8H4WtioVKekpvldeqFKiaqP5UO6jepRGqqaT5QeuA9iSdVF0rPUG9V/pHDBYY1hrFGNuayJsym740u2C+02KJ5QSrOutcmzjbQDtXe2sHY0cdJzVnJRcFV3k3BXdlD3VPXS8Tbxsfd99gvwT//ID6wIlBS4N3hVwMfRnOFCEXaRUVEV0RMzN2T9yDBLZE3aSw5IaUNak30zkyLDIzs+ZmX8xlz7PPryjYVPiuWLskq3RV2ZsK/cqSql01jLVedVPrHzbqNdU0n22VaytsP9op3VXUfbpXta+x/+5Em0mzJ/+dGj/t8AyNmf2zvs9JmHt6vvmCpYtEFrcu+bYsc/m9lSGrTq9xWbtvveWGbZtMNm/ZarJt+w6rnft3u+45uy9s/4ODOYd+Hmk/Jn58xUnrU+fOJJ/9dX7SRe1LR68kXv13fc5Nm1t379TfU75/4mHeY7En+59lvhB5efB1/lv5dxc+NH0y/fzq64Lv4T8Ffp360/rP8f9/AA0ADzT6lvFdAAAAIGNIUk0AAHolAACAgwAA+f8AAIDpAAB1MAAA6mAAADqYAAAXb5JfxUYAAAEtSURBVHja7JQxTkJBFEXPQ/xQEDG0ljRYSU1iLN2AtSWlC7Gw04QtGF2ApQVLIDY2hlgIDagJwWCOhf74JXxRYumbaib3ZO7c9zIhq1WBfzAfjJViDWPdYBq/w0pKITjhd7eGJwQkDu2I8rOFHYcmkqgDz4wfoeGZA01BHXtsbSla89ixZsH3an2LtpRUOQde28xFm17PgyPvVK1bl5yYEOtuq3rnyMQCXNJgiiTchuHCnhrGbYBMaXAJULGqlJz54O43bcFdH5xZUqpWJJWW7duza/tDmTWJbbv27Fs2PS2m1iZRNeGcI/aAEevOgCKnbAI7DNjjhUmk1ouf7xgHbLgF3MSzT7wCaxxSiW3hnsf4OngLotj3ILO74CoWTWzOIGcTXab4/6z+CnwbAGjXSZC++vLvAAAAAElFTkSuQmCC), auto';
        } else {
            return 'url(data:image/x-icon;base64,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), auto';
        }
    }

    _onContextMenu(menu, status) {
        const event = status.event;
        const intersection = this.viewer.impl.hitTest(status.canvasX, status.canvasY);
        if (!intersection) return;
        const dbId = intersection.dbId;
        menu.push({
            title: 'Select',
            target: () => {
                const dbIds = event.shiftKey ? this.viewer.getSelection() : [];
                dbIds.push(dbId);
                this.viewer.impl.disableSelection(false);
                this.viewer.select(dbIds);
                this.viewer.impl.disableSelection(true);
            }
        });
    }
}
