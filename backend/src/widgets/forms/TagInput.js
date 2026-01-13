import { BaseWidget } from "../../core/BaseWidget";
import { Badge } from "./Badge";
import "../../styles/tag-input-widget.css";
import { Themes } from "../../themes/Themes";

export class TagInput extends BaseWidget {
    constructor({
        theme = Themes.tagInput.type.basic,
        size = Themes.tagInput.size.medium,
        placeholder = "Add a tag...",
        onChange = null,
        className = [],
        disabled = false,
        prefixIcon = null,
        suffixIcon = null,
        tags = [],
        style = {},
        props = {},
    } = {}) {
        super({
            tagName: "div",
            className: [
                "tag-input-outter-container-widget", theme,
                size,
                ...className,
            ],
            style,
            props,
            events: {
                click: () => {
                    this.inputElement.focus();
                }
            }
        });

        this.tags = [...tags];
        this.onChange = onChange;
        this.prefixIcon = prefixIcon;
        this.suffixIcon = suffixIcon;
        this.placeholder = placeholder;
        this.disabled = disabled;
        this.theme = theme;

        this.initializeIcons();
    }

    initializeIcons() {
        [this.prefixIcon, this.suffixIcon].forEach((icon, index) => {
            if (icon instanceof BaseWidget) {
                Object.assign(icon.style.styles, {
                    position: index === 0 ? "absolute" : "absolute",
                    [index === 0 ? "left" : "right"]: "12px",
                    zIndex: "1",
                    pointerEvents: "auto",
                });

                if (icon.config && icon.config.className) {
                    icon.config.className = icon.config.className.flatMap(cls => cls.split(" "));
                }
            }
        });
    }

    createInnerInputContainer() {
        return new BaseWidget({
            className: ["tag-input-inner-container-widget"],
            children: [
                this.createTagsContainer(),
                this.createInputElement(),
            ],
        });
    }

    createTagsContainer() {
        return new BaseWidget({
            tagName: "div",
            className: ["tag-container-widget"],
            children: this.tags.map((tag) =>
                new Badge({
                    label: tag,
                    closable: true,
                    onClose: () => this.removeTag(tag),
                })
            ),
        });
    }

    createInputElement() {
        return new BaseWidget({
            tagName: "input",
            className: ["tag-input-widget"],
            props: {
                type: "text",
                placeholder: this.placeholder,
                "aria-label": "Tag input",
            },
            events: {
                keyup: (e) => this.handleInputKeyUp(e),
            },
            onAttached: (el) => {
                this.inputElement = el;
            },
        });
    }

    createErrorContainer() {
        return new BaseWidget({
            tagName: "div",
            props: { id: `${this.id}-error`, role: "alert" },
            className: ["input-error-message-widget"],
            onAttached: (el) => {
                this.errorElement = el;
            },
        });
    }

    handleInputKeyUp(event) {
        const value = this.inputElement.value.trim();
        if (event.key === "Enter" || value.endsWith(",")) {
            const tag = value.replace(",", "");
            if (tag && !this.tags.includes(tag)) {
                this.tags.push(tag);
                this.triggerOnChange();
            }
            this.inputElement.value = "";
            this.render();
            this.inputElement.focus();
        }
    }

    removeTag(tag) {
        this.tags = this.tags.filter((t) => t !== tag);
        this.triggerOnChange();
        this.render();
        this.inputElement.focus();
    }

    triggerOnChange() {
        if (typeof this.onChange === "function") {
            this.onChange(this.tags);
        }
    }

    onUpdate() {
        super.update();
    }

    render() {
        this.children = [
            this.createInnerInputContainer(),
            this.createErrorContainer(),
        ];
        return super.render();
    }
}
