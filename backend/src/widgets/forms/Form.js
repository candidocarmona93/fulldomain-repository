import { BaseWidget } from "../../core/BaseWidget";
import { FormValidator } from "./FormValidator";
import { _InputBaseWidget } from "./_InputBaseWidget";
import { _TypingInput } from "./_TypingInput";
import { FormController } from "./FormController";
import { RadioGroupInput } from "./RadioGroupInput";
import { TextAreaInputBuilder } from "./TextAreaInputBuilder";

/**
 * @class Form
 * @extends BaseWidget
 */
export class Form extends BaseWidget {

  constructor({
    controller = null,
    preventDefault = true,
    action = "",
    method = "GET",
    name = "",
    onSubmit = null,
    payload = {},
    onReset = null,
    validateOnSubmit = true,
    initialValues = {},
    children = [],
    style = {},
    className = [],
    props = {},
  } = {}) {
    super({
      tagName: "form",
      style: { ...style },
      className: ["form-widget", ...className],
      children,
      props: {
        action,
        method,
        name,
        ...props,
      },
      events: {
        submit: (e) => this.handleSubmit(e),
        reset: (e) => this.handleReset(e),
      },
      onAttached: (el) => {
        this.formElement = el;
      },
    });

    // --- Initialize all class properties here ---

    /** @type {HTMLFormElement} */
    this.formElement = null;

    /** @type {boolean} */
    this.preventDefault = preventDefault;

    /** @type {boolean} */
    this.validateOnSubmit = validateOnSubmit;

    /** @type {object} */
    this.initialValues = { ...initialValues };

    this.payload = payload;

    /** @type {function} */
    this.onSubmit = onSubmit;

    /** @type {function} */
    this.onReset = onReset;

    /** @type {FormValidator} */
    this._validator; // Will be assigned below

    /** @type {FormController|null} */
    this._controller = null; // Default value

    // -------------------------------------------------
    // 1. Initialise the validator
    // -------------------------------------------------
    this._validator = new FormValidator({
      onSubmit: (data) => this.performSubmit(data),
      onSuccess: (data, resp) => this.notifySuccess(data, resp),
      onError: (err, data) => this.notifyError(err, data),
      onInvalid: () => this.notifyInvalid(),
    });

    // -------------------------------------------------
    // 2. Hook the external controller (if any)
    // -------------------------------------------------
    if (controller) {
      controller.attach(this);
      this._controller = controller; // Assign the controller
    }

    // -------------------------------------------------
    // 3. Register all children that are form fields
    // -------------------------------------------------
    this.registerChildrenFields(this.children);
  }

  // -----------------------------------------------------------------
  // PUBLIC API – mirrors the old Form (kept for backward compatibility)
  // -----------------------------------------------------------------
  getValues() {
    return this._validator.getFormData();
  }

  getField(name) {
    const map = this._validator.getFormData();
    return { [name]: map[name] ?? undefined };
  }

  async validate() {
    const isValid = await this._validator.validateAll({ focusFirstInvalid: true });
    const errors = {};
    this._validator.inputs.forEach((inp) => {
      const valid = inp.validate ? inp.validate({ force: true }) : true;
      errors[inp.name || inp.id] = valid ? null : (inp.errorMessage ?? "Invalid");
    });
    return errors;
  }

  updateValues(values = {}) {
    const updates = Object.entries(values).filter(([name]) => this._validator.findInputByName(name));
    updates.forEach(([name, val]) => {
      const inp = this._validator.findInputByName(name);
      if (inp) inp.value = val;
    });
  }

  async setInitialValues(values = {}) {
    const resolvedValues = await Promise.resolve(values);
    this.initialValues = { ...resolvedValues };
    this.updateValues(resolvedValues);
  }

  // -----------------------------------------------------------------
  // EVENT HANDLERS
  // -----------------------------------------------------------------
  handleSubmit(e) {
    if (this.preventDefault) {
      e.preventDefault();
      e.stopPropagation();
    }

    if (!this.validateOnSubmit) {
      this.performSubmit(this.getValues());
      return;
    }

    this._validator.submit(e);
  }

  handleReset(e) {
    this.formElement?.reset();
    this.updateValues(this.initialValues);
    this.onReset?.();
  }

  // -----------------------------------------------------------------
  // VALIDATOR CALLBACKS (bridge to user-provided callbacks)
  // -----------------------------------------------------------------
  async performSubmit(data) {
    if (this.onSubmit) {
      const p = { values: data, event: null, ...this.payload };
      return await this.onSubmit(p);
    }
    return null;
  }

  notifySuccess(data, response) {
    // you can forward to a custom hook if you want
  }

  notifyError(err, data) {
    // optional: surface server errors automatically
    const serverErrors = this._validator.extractServerErrors?.(err);
    if (serverErrors) this._validator.applyServerErrors?.(serverErrors);
  }

  notifyInvalid() {
    // optional UI feedback
  }

  // -----------------------------------------------------------------
  // FIELD REGISTRATION (recursive, works with nested widgets)
  // -----------------------------------------------------------------
  registerChildrenFields(children) {
    if (!Array.isArray(children)) return;

    const registeredInputs = new Set();

    const register = (child) => {
      if (
        (child instanceof _TypingInput ||
          child instanceof _InputBaseWidget ||
          child instanceof TextAreaInputBuilder ||
          child instanceof RadioGroupInput) &&
        child.id &&
        !registeredInputs.has(child.id)
      ) {
        this._validator.register(child);
        registeredInputs.add(child.id);
      } else if (child instanceof BaseWidget) {
        const sub = child.children ?? child.body ?? child.content;
        if (sub) {
          (Array.isArray(sub) ? sub : [sub]).forEach(register);
        }
      }
    };

    children.forEach(register);
  }

  // -----------------------------------------------------------------
  // LIFECYCLE
  // -----------------------------------------------------------------
  render() {
    const el = super.render();
    this.setInitialValues(this.initialValues);
    return el;
  }

  // -----------------------------------------------------------------
  // EXPOSE VALIDATOR (optional, for power-users)
  // -----------------------------------------------------------------
  get validator() {
    return this._validator;
  }

  get controller() {
    return this._controller;
  }
}