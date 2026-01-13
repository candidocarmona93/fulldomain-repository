import { App } from "./src/core/App";
import '@fortawesome/fontawesome-free/css/all.min.css';

import { Default } from "./public/Pages/Default";
import { Index as PropertySearchGuide } from "./public/Pages/guide/Index";
import { Index as HomePage } from "./public/Pages/home/Index";
import { Index as PropertyListingPage } from "./public/Pages/properties/Index";
import { Index as InvestimentListingPage } from "./public/Pages/investiments/Index";
import { Show as SinglePropertyPage } from "./public/Pages/properties/Show";
import { Index as ContactPage } from "./public/Pages/contact/Index";
import { APIEndpoints } from "./public/Services/APIEndpoints";
import { HttpClient } from "./public/services/HttpClient";
import { Example } from "./public/Pages/Example";
import { OpenGraphHelper } from "./public/utils/OpenGraphHelper";
import { realEstateKeywordsPT_MZ } from "./public/constants/KeyWords";

const app = new App("#app");

new HttpClient({
    baseURL: APIEndpoints.API_ENV,
    timeout: 15000,
    defaultHeaders: {
        'Content-Type': 'application/json',
    },
    responseInterceptor: (data, response) => {
        return { result: data, status: response.status };
    },
    requestInterceptor: async (config) => {
        return config;
    },
});

new OpenGraphHelper({});

app.use(() => OpenGraphHelper.instance.update({
    title: 'Casa Coimbra Maputo - Excelência em Gestão Patrimonial',
    description: 'Maximizamos o valor do seu património imobiliário através de estratégias de investimento inteligentes e uma gestão rigorosa e transparente.',
    image: 'https://casacoimbramaputo.com/assets/images/logo.png',
    url: 'https://casacoimbramaputo.com/',
    siteName: 'Casa Coimbra Maputo',
    twitterHandle: 'mywebsite',
    facebookAppId: '1234567890',
    robots: 'index, follow, max-snippet:-1, max-image-preview:large',
    keywords: realEstateKeywordsPT_MZ,
    author: 'Full Domain, lda'
}));

app.layout(Default, () => {
    app.routes("/", HomePage);
    app.routes("/centro-de-apoio", PropertySearchGuide);

    app.group("/imoveis", () => {
        app.routes("/", PropertyListingPage);
        app.routes("/:slug", SinglePropertyPage);
    })
    app.routes("/investimentos", InvestimentListingPage);
    app.routes("/contacte-nos", ContactPage);
});

app.render();