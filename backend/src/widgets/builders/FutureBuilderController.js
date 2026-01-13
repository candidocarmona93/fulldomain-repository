/**
 * @class FutureBuilderController
 * @description
 * A controller class for managing a FutureBuilder instance from outside the component. Useful for triggering
 * data reloads or changing the future based on external events.
 *
 * @example
 * const controller = new FutureBuilderController();
 *
 * const futureBuilder = new FutureBuilder({
 *   future: () => fetch('/api/initial').then(res => res.json()),
 *   builder: (data) => new BaseWidget({ children: [JSON.stringify(data)] }),
 *   controller: controller,
 * });
 *
 * // To reload the data:
 * controller.reload();
 *
 * // To change the data source:
 * controller.setFuture(() => fetch('/api/updated').then(res => res.json()));
 */
export class FutureBuilderController {
    /**
     * @constructor
     */
    constructor() {
        /**
         * @property {FutureBuilder|null} futureBuilder - The FutureBuilder instance being controlled.
         * @private
         */
        this.futureBuilder = null;
    }

    /**
     * @method _setFutureBuilder
     * @description
     * Sets the FutureBuilder instance that this controller will manage. This method is intended to be
     * called by the FutureBuilder itself during initialization.
     * @param {FutureBuilder} futureBuilder - The FutureBuilder instance to control.
     * @returns {void}
     * @private
     */
    _setFutureBuilder(futureBuilder) {
        this.futureBuilder = futureBuilder;
    }

    /**
     * @method attach
     * @description
     * Public method to attach a FutureBuilder instance to this controller.
     * @param {FutureBuilder} futureBuilder - The FutureBuilder instance to control.
     * @returns {void}
     */
    attach(futureBuilder) {
        this._setFutureBuilder(futureBuilder);
    }

    /**
     * @method _ensureFutureBuilder
     * @description
     * Ensures a FutureBuilder is associated with this controller, throwing an error if not.
     * @param {string} methodName - The name of the method calling the check.
     * @throws {Error} If no FutureBuilder is associated.
     * @private
     */
    _ensureFutureBuilder(methodName) {
        if (!this.futureBuilder) {
            throw new Error(`[FutureBuilderController.${methodName}] No FutureBuilder associated with this controller`);
        }
    }

    /**
     * @method setParams
     * @description Sets new parameters on the FutureBuilder and triggers a reload.
     * @param {object} params - The new parameters.
     * @returns {void}
     */
    setParams(params) {
        this._ensureFutureBuilder("setParams");
        this.futureBuilder.setParams(params);
    }

    /**
     * @method reload
     * @description Triggers the FutureBuilder to reload its data.
     * @returns {void}
     */
    reload() {
        this._ensureFutureBuilder("reload");
        this.futureBuilder.reload();
    }

    /**
     * @method setFuture
     * @description Sets a new `future` for the FutureBuilder to use.
     * @param {Promise|function(): Promise} newFuture - The new future.
     * @returns {void}
     */
    setFuture(newFuture) {
        this._ensureFutureBuilder("setFuture");
        this.futureBuilder.setFuture(newFuture);
    }
}