import { App } from "./src/core/App";
import '@fortawesome/fontawesome-free/css/all.min.css';

import { Default } from "./public/pages/Default";
import { Index as Dashboard } from "./public/pages/Home/Index";
import { Index as PropertyHomePage } from "./public/pages/Properties/Index";
import { Save as PropertySavePage } from "./public/pages/Properties/Save";
import { Show as PropertyShowPage } from "./public/pages/Properties/Show";
import { Index as Activities } from "./public/pages/Activities/Index";
import { Index as TaskHomePage } from "./public/pages/Activities/Tasks/Index";
import { Save as TaskSavePage } from "./public/pages/Activities/Tasks/Save";
import { Show as TaskShowPage } from "./public/pages/Activities/Tasks/Show";
import { Index as VisitHomePage } from "./public/pages/Activities/Visits/Index";
import { Save as VisitSavePage } from "./public/pages/Activities/Visits/Save";
import { Index as Configurations } from "./public/pages/Settings/Index";
import { Index as RoleHomePage } from "./public/pages/Settings/Roles/Index";
import { Index as UserHomePage } from "./public/pages/Settings/Users/Index";
import { Index as AgentHomePage } from "./public/pages/Settings/Agents/Index";
import { Index as OwnerHomePage } from "./public/pages/Settings/Owners/Index";
import { Index as ClientHomePage } from "./public/pages/Settings/Clients/Index";
import { Index as CategoryHomePage } from "./public/pages/Settings/Categories/Index";
import { Index as PropertyFeatureHomePage } from "./public/pages/Settings/Features/Index";
import { Index as FinalityHomePage } from "./public/pages/Settings/Finalities/Index";
import { Index as NeighborHoodHomePage } from "./public/pages/Settings/NeighborHoods/Index";
import { HttpClient } from "./public/Services/HttpClient";
import { APIEndpoints } from "./public/Services/APIEndpoints";
import { DefaultAuthPage } from "./public/pages/Auth/DefaultAuthPage";
import { SigninPage } from "./public/pages/Auth/SigninPage";
import { AuthenticationMiddleware } from "./public/Middlewares/AuthenticationMiddleware";
import { AuthService } from "./public/Services/AuthService";
import { UnauthorizedPage } from "./public/pages/UnauthorizedPage";
import { UIHelper } from "./public/Utils/UIHelper";
import { FirebaseService } from "./public/Services/FirebaseService";
import { RecoverPasswordPage } from "./public/pages/RecoverPassword/RecoverPasswordPage";

const app = new App("#app");

new HttpClient({
    baseURL: APIEndpoints.API_ENV,
    timeout: 15000,
    defaultHeaders: {
        'Content-Type': 'application/json',
    },
    responseInterceptor: (data, response) => {
        if (response.status === 401) {
            UIHelper.showErrorNotification({ message: "Não tem permissão para se comunicar com nosso endpoint" });
            AuthService.logout();
            app.to("/auth");

            return;
        }

        return { result: data, status: response.status };
    },
    requestInterceptor: async (config) => {
        const token = await AuthService.getValidAccessToken();
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
});

new FirebaseService();

app.use(AuthenticationMiddleware(app));

app.layout(DefaultAuthPage, () => {
    app.routes("/auth", SigninPage);
});

//Recover Password page
app.layout(DefaultAuthPage, () => {
    app.routes("/recover-password", RecoverPasswordPage)
})

app.layout(Default, () => {
    app.routes("/", Dashboard)
    app.routes("/properties", PropertyHomePage)
    app.routes("/properties/save", PropertySavePage)
    app.routes("/properties/:propertyId", PropertyShowPage)
    app.routes("/properties/save/:propertyId", PropertySavePage)
    app.routes("/activities", Activities)
    app.routes("/activities/tasks", TaskHomePage)
    app.routes("/activities/tasks/save/:taskId", TaskSavePage)
    app.routes("/activities/tasks/:taskId", TaskShowPage)
    app.routes("/activities/visits", VisitHomePage)
    app.routes("/activities/visits/save/:visitId", VisitSavePage)
    app.routes("/configurations", Configurations)
    app.routes("/configurations/roles", RoleHomePage)
    app.routes("/configurations/users", UserHomePage)
    app.routes("/configurations/agents", AgentHomePage)
    app.routes("/configurations/owners", OwnerHomePage)
    app.routes("/configurations/clients", ClientHomePage)
    app.routes("/configurations/categories", CategoryHomePage)
    app.routes("/configurations/property-features", PropertyFeatureHomePage)
    app.routes("/configurations/finalities", FinalityHomePage)
    app.routes("/configurations/neighborhoods", NeighborHoodHomePage)
    app.routes("/unauthorized", UnauthorizedPage)
})
app.render();