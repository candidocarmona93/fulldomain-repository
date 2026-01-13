import { preventDefault } from "@fullcalendar/core/internal";
import { App } from "../../../src/core/App";
import { BaseWidget } from "../../../src/core/BaseWidget";
import { Builder } from "../../../src/widgets/builders/Builder";
import { Button } from "../../../src/widgets/buttons/Button";
import { Icon } from "../../../src/widgets/elements/Icon";
import { Text } from "../../../src/widgets/elements/Text";
import { Form } from "../../../src/widgets/forms/Form";
import { FormController } from "../../../src/widgets/forms/FormController";
import { PasswordInput } from "../../../src/widgets/forms/PasswordInput";
import { TextInput } from "../../../src/widgets/forms/TextInput";
import { Center } from "../../../src/widgets/layouts/Center";
import { Column } from "../../../src/widgets/layouts/Column";
import { AppBarComponent } from "../../Components/AppBarComponent";
import { AuthService } from "../../Services/AuthService";
import { UIHelper } from "../../Utils/UIHelper";

export class SigninPage extends BaseWidget {

    constructor() {
        super();

        this.initState({
            loading: false,
        });
        this.formData = {};
    }

    handleFormSubmit = async () => {
        try {
            this.setState({ loading: true });

            const result = await AuthService.login(this.formData);
            if (result) {
                UIHelper.showSuccessNotification({ message: "Autenticou com successo" });
                App.instance.to("/");
            }
        } catch (error) {
            console.error(error)
            UIHelper.showErrorNotification({ message: error });
        } finally {
            this.setState({ loading: false });
        }
    };

    createFooter() {
        return new Center({
            children: [
                new Text({
                    tag: "a",
                    props: {
                        href: "javascript:void(0)"
                    },
                    text: "Esqueceu sua senha? clique aqui para recuperar",
                    events: {

                        click: (e) => {
                            e.preventDefault()
                            App.instance.to("/recover-password");
                        }
                    }
                }),
            ],
        });
    }

    createForm() {
        const controller = new FormController();
        return new Form({
            style: {
                maxWidth: "500px",
                margin: "auto"
            },
            controller,
            onSubmit: this.handleFormSubmit,
            children: [
                new Column({
                    style: {
                        padding: ".5rem"
                    },
                    gap: "15px",
                    children: [
                        new TextInput({
                            style: [
                                 
                            ],
                            placeholder: "Utilizador ou Email",
                            name: "userNameOrEmail",
                            required: true,
                            props: {
                                'autocomplete': 'email'
                            },
                            prefixIcon: new Icon({ icon: "fa-solid fa-user" }),
                            onChange: (val) => {
                                this.formData.userNameOrEmail = val;
                            },
                            style: {
                                height: "4rem"
                            }
                        }),
                        new PasswordInput({
                            placeholder: "Senha",
                            name: "password",
                            required: true,
                            props: {
                                'autocomplete': 'current-password'
                            },
                            prefixIcon: new Icon({ icon: "fa-solid fa-lock" }),
                            onChange: (val) => {
                                this.formData.password = val;
                            },
                            style: {
                                height: "4rem"
                            }
                        }),
                        new Builder({
                            watch: () => this.state.loading ? UIHelper.createLoadingSpinner({ height: 'auto' }) : new Button({
                                label: "Entrar",
                                onPressed: async () => {
                                    const isValid = await controller.isValid();
                                    if (isValid) {
                                        controller.submit();
                                    }
                                },
                                style: {
                                    height: "4rem",
                                    width: "100%"
                                }
                            })
                        }),

                        this.createFooter(),
                    ],
                }),
            ],
        });
    }

    render() {
        this.children = [
            new AppBarComponent({
                title: "Painel administrativo",
                subtitle: "Informe suas credenciais para continuar",
                showBrand: true,
            }),
            this.createForm(),
        ];
        return super.render();
    }
}
