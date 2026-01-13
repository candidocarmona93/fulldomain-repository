export class APIEndpoints {
    static IS_PROD = true;
    
    static URL_SANDBOX = "http://localhost/casacoimbra/public/api/v1/";
    static URL_PROD = "https://backend.casacoimbramaputo.com/public/api/v1/"; 

    static API_ENV = APIEndpoints.IS_PROD ? APIEndpoints.URL_PROD : APIEndpoints.URL_SANDBOX;
}