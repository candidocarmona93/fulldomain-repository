import { App } from "../../../src/core/App";
import { BaseWidget } from "../../../src/core/BaseWidget";
import { Button } from "../../../src/widgets/buttons/Button";
import { Form } from "../../../src/widgets/forms/Form";
import { TextInput } from "../../../src/widgets/forms/TextInput";
import { Column } from "../../../src/widgets/layouts/Column";
import { Text } from "../../../src/widgets/elements/Text";
import { Icon } from "../../../src/widgets/elements/Icon";
import { FormController } from "../../../src/widgets/forms/FormController";

export class RecoverPasswordPage extends BaseWidget {

    constructor() {
        super()
    }

    handleFormSubmit = async () =>{

    }

    _createRecoverPasswordForm() {
       const  controll = new FormController()
        return new Form({
            style: {
                maxWidth: '500px',
                minHeight: '100vh',
                width: '100%',
                display: 'flex',
                //justifyContent: 'center',
                alignItems: 'center',
                margin: "auto"
            },
            controll,
            onSubmit:this.handleFormSubmit,

            children: [
                new Column({
                    children: [
                        new Text({
                            style: {
                                'font-size': '2.75rem',
                                'font-weight': 900,
                                'letter-spacing': '-0.025em',
                                'line-height': '1.4'
                            },
                            text: "Recuperar a senha"
                        }),
                        new TextInput({
                            style: {
                                gap: '35px',
                                height: '4rem',
                                'padding-left': '2rem'
                            },
                            prefixIcon: new Icon({
                                 style: {
                                    marginRight: '10px'
                                },
                                icon: "fa-solid fa-envelope"
                            }),
                            placeholder: "Digite o teu email de recuperacao da senha",
                            name: "email",
                            required: true,
                            props: {
                                'autocomplete': 'email'
                            }
                        }),

                        new Button({
                            style: {
                                width: '100%',
                                height: '4rem',
                            },
                            prefixIcon: new Icon({
                                style: {
                                    marginRight: '10px'
                                },
                                icon: "fa-solid fa-paper-plane"
                            }),
                            label: "Enviar email",
                            onPressed: () => {
                                console.log("recover")
                            }
                        }),
                        new Button({
                            style: {
                                width: '100%',
                                height: '4rem',

                            },
                            prefixIcon: new Icon({
                                 style: {
                                    marginRight: '10px'
                                },
                                icon: "fa-solid fa-user"
                            }),

                            label: "Login",
                            onPressed: () => {
                                App.instance.to('/auth')
                            }
                        }),

                    ]
                })
            ]
        })

    }

    render() {

        this.children = [
            this._createRecoverPasswordForm()
        ]

        return super.render()
    }
}