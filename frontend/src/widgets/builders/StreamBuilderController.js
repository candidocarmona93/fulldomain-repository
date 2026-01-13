/**
 * @class StreamBuilderController
 * @description
 * A controller class for managing a StreamBuilder instance from outside the component. Useful for triggering
 * data reloads or changing the stream based on external events.
 *
 * @example
 * const controller = new StreamBuilderController();
 *
 * const streamBuilder = new StreamBuilder({
 *   stream: new Observable(...),
 *   builder: (data) => new BaseWidget({ children: [JSON.stringify(data)] }),
 *   controller: controller,
 * });
 *
 * // To reload the stream:
 * controller.reload();
 *
 * // To change the stream:
 * controller.setStream(new Observable(...));
 */
export class StreamBuilderController {
    /**
     * @constructor
     */
    constructor() {
        /**
         * @property {StreamBuilder|null} streamBuilder - The StreamBuilder instance being controlled.
         * @private
         */
        this.streamBuilder = null;
    }

    /**
     * @method attach
     * @description
     * Attaches a StreamBuilder instance to this controller.
     * @param {StreamBuilder} streamBuilder - The StreamBuilder instance to control.
     * @returns {void}
     */
    attach(streamBuilder) {
        if (this.streamBuilder && this.streamBuilder !== streamBuilder) {
            throw new Error(`[StreamBuilderController.attach] Controller is already attached to another StreamBuilder.`);
        }
        this.streamBuilder = streamBuilder;
    }

    /**
     * @method _ensureStreamBuilder
     * @description
     * Ensures a StreamBuilder is associated with this controller.
     * @param {string} methodName - The name of the method calling the check.
     * @throws {Error} If no StreamBuilder is associated.
     * @private
     */
    _ensureStreamBuilder(methodName) {
        if (!this.streamBuilder) {
            throw new Error(`[StreamBuilderController.${methodName}] No StreamBuilder associated with this controller`);
        }
    }

    /**
     * @method setParams
     * @description Sets new parameters on the StreamBuilder and triggers a reload.
     * @param {object} params - The new parameters.
     * @returns {void}
     */
    setParams(params) {
        this._ensureStreamBuilder("setParams");
        this.streamBuilder.setParams(params);
    }

    /**
     * @method reload
     * @description Triggers the StreamBuilder to reload its stream.
     * @returns {void}
     */
    reload() {
        this._ensureStreamBuilder("reload");
        this.streamBuilder.reload();
    }

    /**
     * @method setStream
     * @description Sets a new stream for the StreamBuilder to use.
     * @param {Observable} newStream - The new stream.
     * @returns {void}
     */
    setStream(newStream) {
        this._ensureStreamBuilder("setStream");
        this.streamBuilder.setStream(newStream);
    }
}