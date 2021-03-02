import HttpClient from "./http-client.js";
import { throwError } from "./throws.js";


var ApiRest = (function() {

    const isError = function(status) {
        return (status === -1);
    }

    const isFunction = function(reference) {
        return (typeof reference === 'function');
    }

    const properties = {
        httpClient: null,
    };
    
    function ApiRest() {
        properties.httpClient = new HttpClient();
    }
    
    ApiRest.prototype.get = async function({ url, headers, onSuccess, onError, onFinally, }) {
        try {
            const { status, message, response } = await properties.httpClient.get(url, headers);
            if (isError(status)) {
                throwError(message);
            }
    
            onSuccess({ message, response });
        }
        catch (error) {
            onError(error.message);
        }
        finally {
            if (isFunction(onFinally)) {
                onFinally();
            }
        }
    }
    
    ApiRest.prototype.post = async function({ url, data, headers, onSuccess, onError, onFinally }) {
        try {
            const { status, message, response } = await properties.httpClient.post(url, data, headers);
            if (isError(status)) {
                throwError(message);
            }
    
            onSuccess({ message, response });
        }
        catch (error) {
            onError(error.message);
        }
        finally {
            if (isFunction(onFinally)) {
                onFinally();
            }
        }
    }

    return ApiRest;
})();

export default ApiRest;