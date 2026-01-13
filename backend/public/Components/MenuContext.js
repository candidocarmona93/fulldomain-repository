import { BaseWidget } from "../../src/core/BaseWidget";
import { ListTile } from "../../src/widgets/data-display/ListTile";
import { BottomSheet } from "../../src/widgets/overlays/BottomSheet";
import { HeaderTitleComponent } from "./HeaderTitleComponent";

export class MenuContext extends BaseWidget {
    constructor({
        items = [],
        title = "Que acção deseja realizar",
        dismissable = false,
    } = {}) {
        super()

        this.items = items;
        this.title = title;
        this.dismissable = dismissable;
        this.menuContext = null;

        this.create();
    }

    create() {
        this.menuContext = new BottomSheet({
            showCloseIcon: true,
            dismissable: this.dismissable,
            content: [
                new HeaderTitleComponent({ text: this.title }),
                ...this.items.map(item => {
                    return new ListTile({
                        leading: item.leading,
                        title: item.title,
                        subtitle: item.subtitle,
                        trailing: item.trailing,
                        onTap: item.onTap
                    });
                })
            ],
            props: {
                ariaLabel: "Menu context",
            }
        });

        return this.menuContext;
    }

    show() {
        this.menuContext?.show();
    }

    close() {
        this.menuContext?.close();
    }
}