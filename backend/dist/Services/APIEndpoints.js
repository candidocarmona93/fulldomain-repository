export class APIEndpoints {
   // static IS_PROD = false;
        static IS_PROD = true;

    
    static ASSETS_SANDBOX = "http://localhost/casacoimbra/public/"; 
    static URL_SANDBOX = "http://localhost/casacoimbra/api/v1/";

    static ASSETS_PROD = "https://backend.casacoimbramaputo.com/public/"; 
    static URL_PROD = "https://backend.casacoimbramaputo.com/api/v1/"; 

    static API_ENV = APIEndpoints.IS_PROD ? APIEndpoints.URL_PROD : APIEndpoints.URL_SANDBOX;
    static ASSETS_ENV = APIEndpoints.IS_PROD ? APIEndpoints.ASSETS_PROD : APIEndpoints.ASSETS_SANDBOX;
}