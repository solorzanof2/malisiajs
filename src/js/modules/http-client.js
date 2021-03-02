import axios from "axios";


var HttpClient = (function() {

    const HttpErrors = {
        500: 'Something went wrong with your request, please try later.',
        401: 'Your session is expired.',
        403: 'You have no permissions to the requested resource.',
    };

    const resolve = function(response) {
        return Promise.resolve(response);
    }

    const reject = function(message) {
        return Promise.reject(new Error(message));
    }

    const errorInterpreter = function({ status, data }) {
        return HttpErrors[status] || data.message;
    }
    
    function HttpClient() { }
    
    HttpClient.prototype.post = async function(url, data, headers = {}) {
        try {
            if (!data) {
                return reject('Request body cannot be null;');
            }
    
            return resolve((await axios.post(url, data, headers)).data);
        }
        catch (error) {
            return reject(errorInterpreter(error.response));
        }
    }
    
    HttpClient.prototype.get = async function(url, headers = {}) {
        try {
            return resolve((await axios.get(url, headers)).data);
        }
        catch (error) {
            return reject(errorInterpreter(error.response));
        }
    }

    return HttpClient;
})();


export default HttpClient;