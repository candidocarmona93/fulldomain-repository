import { Icon } from "../../src/widgets/elements/Icon";

const placeholders = {
    view: {
        leading: new Icon({ icon: "fa fa-book" }),
        title: "Visualizar detalhes",
        subtitle: "Visualizar detalhes",
        trailing: new Icon({ icon: "fa fa-arrow-right" }),
    },
    edit: {
        leading: new Icon({ icon: "fa fa-edit" }),
        title: "Editar detalhes",
        subtitle: "Editar detalhes",
        trailing: new Icon({ icon: "fa fa-arrow-right" }),
    },
    remove: {
        leading: new Icon({ icon: "fa fa-trash" }),
        title: "Remover registo",
        subtitle: "Remover registo",
        trailing: new Icon({ icon: "fa fa-arrow-right" }),
    }
}

export const VISIT_MENU = (items) => {
    return [
        {
            leading: items?.view?.leading ?? placeholders.view.leading,
            title: items?.view?.title ?? placeholders.view.title,
            subtitle: items?.view?.subtitle ?? placeholders.view.subtitle,
            trailing: items?.view?.trailing ?? placeholders.view.trailing,
            onTap: () => items?.view?.onTap?.()
        },
        {
            leading: items?.edit?.leading ?? placeholders.edit.leading,
            title: items?.edit?.title ?? placeholders.edit.title,
            subtitle: items?.edit?.subtitle ?? placeholders.edit.subtitle,
            trailing: items?.edit?.trailing ?? placeholders.edit.trailing,
            onTap: () => items?.edit?.onTap?.()
        },
        {
            leading: items?.remove?.leading ?? placeholders.remove.leading,
            title: items?.remove?.title ?? placeholders.remove.title,
            subtitle: items?.remove?.subtitle ?? placeholders.remove.subtitle,
            trailing: items?.remove?.trailing ?? placeholders.remove.trailing,
            onTap: () => items?.remove?.onTap?.()
        },
    ]
}

export const TASK_MENU = (items) => {
    return [
        {
            leading: items?.view?.leading ?? placeholders.view.leading,
            title: items?.view?.title ?? placeholders.view.title,
            subtitle: items?.view?.subtitle ?? placeholders.view.subtitle,
            trailing: items?.view?.trailing ?? placeholders.view.trailing,
            onTap: () => items?.view?.onTap?.()
        },
        {
            leading: items?.edit?.leading ?? placeholders.edit.leading,
            title: items?.edit?.title ?? placeholders.edit.title,
            subtitle: items?.edit?.subtitle ?? placeholders.edit.subtitle,
            trailing: items?.edit?.trailing ?? placeholders.edit.trailing,
            onTap: () => items?.edit?.onTap?.()
        },
        {
            leading: items?.remove?.leading ?? placeholders.remove.leading,
            title: items?.remove?.title ?? placeholders.remove.title,
            subtitle: items?.remove?.subtitle ?? placeholders.remove.subtitle,
            trailing: items?.remove?.trailing ?? placeholders.remove.trailing,
            onTap: () => items?.remove?.onTap?.()
        },
    ]
}