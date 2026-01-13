export class Hooks {
	constructor({
		onBeforeCreated = null,
		onCreated = null,
		onBeforeAttached = null,
		onAttached = null,
		onMounted = null,
		onBeforeDetached = null,
		onDetached = null,
		onBeforeUpdate = null,
		onDidUpdated = null,
	} = {}) {
		this.onBeforeCreated = onBeforeCreated;
		this.onCreated = onCreated;
		this.onBeforeAttached = onBeforeAttached;
		this.onAttached = onAttached;
		this.onMounted = onMounted;
		this.onBeforeDetached = onBeforeDetached;
		this.onDetached = onDetached;
		this.onBeforeUpdate = onBeforeUpdate;
		this.onDidUpdated = onDidUpdated;
		this._deferredMountedCalls = new Map();
	}

	beforeCreated(widget) {
		this.onBeforeCreated?.(widget);
	}

	created(el, widget) {
		this.onCreated?.(el, widget);
	}

	beforeAttached(el, widget) {
		this.onBeforeAttached?.(el, widget);
	}

	attached(el, widget) {
		this.onAttached?.(el, widget);
	}

	mounted(el, widget) {
		this.onMounted?.(el, widget);
		// Execute deferred mounted calls for children
		for (let [child, mountedFn] of this._deferredMountedCalls) {
			if (child && child._element && child._element.isConnected) {
				mountedFn(child._element, child);
			}
		}
		this._deferredMountedCalls.clear();
	}

	beforeDetached() {
		this.onBeforeDetached?.();
	}

	detached(removedChildNode) {
		this.onDetached?.(removedChildNode);
	}

	beforeUpdate() {
		this.onBeforeUpdate?.();
	}

	didUpdated() {
		this.onDidUpdated?.();
	}

	addDeferredMountedCall(child, mountedFn) {
		this._deferredMountedCalls.set(child, mountedFn);
	}

	clearDeferredMountedCalls() {
		this._deferredMountedCalls.clear();
	}

	deleteDeferredMountedCall(child) {
		this._deferredMountedCalls.delete(child);
	}

	hasDeferredMountedCall(child) {
		return this._deferredMountedCalls.has(child);
	}

	getDeferredMountedCalls() {
		return Array.from(this._deferredMountedCalls.entries());
	}
}