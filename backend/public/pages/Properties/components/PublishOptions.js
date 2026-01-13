import { Column } from "../../../../src/widgets/layouts/Column";
import { BaseWidget } from "../../../../src/core/BaseWidget";
import { ListTile } from "../../../../src/widgets/data-display/ListTile";
import { Button } from "../../../../src/widgets/buttons/Button";
import { PropertyService } from "../../../Services/PropertyService";
import { HttpClient } from "../../../Services/HttpClient";
import { GenerateSlug } from "../../../Utils/GenerateSlug";
import { Icon } from "../../../../src/widgets/elements/Icon";
import { Builder } from "../../../../src/widgets/builders/Builder";

const CHANNELS = [
    {
        key: "publishWebsiteChannel",
        channel: "website",
        title: "Publicar no Website",
        icon: "fa-solid fa-earth",
    },
    {
        key: "publishFacebookChannel",
        channel: "facebook",
        title: "Publicar no Facebook",
        icon: "fa-brands fa-facebook",
    },
    {
        key: "publishLinkedInChannel",
        channel: "linkedin",
        title: "Publicar no LinkedIn",
        icon: "fa-brands fa-linkedin-in",
    },
    {
        key: "publishWhatsappOwnerChannel",
        channel: "whatsapp_owner",
        title: "Publicar no Whatsapp",
        icon: "fa-brands fa-whatsapp",
    },
    {
        key: "publishGoogleSheetChannel",
        channel: "google_sheet",
        title: "Publicar no Google Sheet",
        icon: "fa-brands fa-google-drive",
    },
];

export class PublishOptions extends BaseWidget {
    constructor({ formData }) {
        super();

        this.formData = this.sanitizeFormData(formData);

        const initialState = CHANNELS.reduce((acc, { key, channel }) => {
            const match = formData.publishOptions?.find(p => p.channel === channel);
            acc[key] = match ? [match] : [];
            return acc;
        }, {});

        this.initState(initialState);
    }

    sanitizeFormData(formData) {
        const cleanData = { ...formData };
        ["assets", "galleries", "users", "owners"].forEach(key => {
            delete cleanData[key];
        });
        return cleanData;
    }

    async publishChannel(channelKey, channelName) {
        try {
            const response = await HttpClient.instance.post("/property/publish-channel", {
                property_id: this.formData.id,
                channel: channelName,
            });

            if (response?.result) {
                this.setState(prev => ({
                    ...prev,
                    [channelKey]: response.result,
                }));
            }
        } catch (error) {
            console.error(`Error publishing to ${channelName}:`, error);
        }
    }

    createChannelTile({ key, channel, title, icon }) {
        return new Builder({
            watch: () => {
                const channelData = this.state[key][0];

                const lastUpdate = channelData?.updated_at
                    ? `Última publicação em ${channelData.updated_at}`
                    : "Não publicado";

                return new ListTile({
                    className: ["settings-item-component"],
                    title,
                    subtitle: lastUpdate,
                    leading: new Icon({ icon }),
                    trailing: new Button({
                        style: { height: "1.8rem!important", minWidth: "80px" },
                        label: "Publicar",
                        onPressed: async () => {
                            if (key === "publishWebsiteChannel") {
                                const slug = new GenerateSlug().process(this.formData.title);
                                this.formData = {...this.formData, slug};

                                //A ser removido 
                                console.log('Dados a serem gravados...',this.formData) //Teste de carregamento dados

                                const { result, status } = await PropertyService.saveProperty(this.formData);
                                if (result.status !== "success") {
                                    return;
                                }
                            }
                            this.publishChannel(key, channel)
                        },
                    }),
                });
            },
        });
    }

    render() {
        this.children = [
            new Column({
                style: { height: "100%", width: "100%" },
                children: CHANNELS.map(config => this.createChannelTile(config)),
            }),
        ];

        return super.render();
    }
}