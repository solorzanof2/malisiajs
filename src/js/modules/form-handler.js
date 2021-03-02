import ApiRest from './api-rest.js';
import { selector } from './selectors.js';
import { throwError } from './throws.js';


var FormHandler = (function() {

    const SubmitEventSigner = 'ng-listening-submit';
    const IdSymbol = '#';
    const EventSubmit = 'submit';
    
    const formIsSigned = function(form) {
        return (form.hasAttribute(SubmitEventSigner));
    }

    const signForm = function(form) {
        form.setAttribute(SubmitEventSigner, '');
    }

    const isFunction = function(reference) {
        return (typeof reference === 'function');
    }
    
    function FormHandler(formid) {
        if (!formid) {
            throwError('Please provide a form id property name.');
        }

        this.selector = formid;
        this.form = {};
        this.apiRest = {};

        this.initialize();
    }

    FormHandler.prototype.initialize = function() {
        if (typeof this.selector === 'string') {
            if (!String(this.selector).startsWith(IdSymbol)) {
                this.selector = `${IdSymbol}${this.selector}`;
            }
        
            this.form = selector(this.selector);
        }

        if (this.selector instanceof HTMLFormElement) {
            this.form = this.selector;
        }
    
        if (!this.form) {
            throwError('Please provide a valid form reference.');
        }
        this.apiRest = new ApiRest();
    }
    
    FormHandler.prototype.subscribe = function({ onSuccess, onError, beforeSubmit }) {
        if (formIsSigned(this.form)) {
            return;
        }
    
        const thiss = this;
        
        this.form.addEventListener(EventSubmit, function(event) {
            event.preventDefault();
            event.stopPropagation();
    
            if (isFunction(beforeSubmit)) {
                beforeSubmit();
            }
    
            try {
                // TODO: finish the validation method
                thiss.validate();
            }
            catch (error) {
                onError(error.message);
                return;
            }
    
            thiss.apiRest.post({ 
                url: thiss.form.action,
                data: thiss.serialize(),
                onSuccess: (response) => {
                    thiss.reset();
                    if (isFunction(onSuccess)) {
                        onSuccess(response);
                    }
                },
                onError: (message) => {
                    if (isFunction(onError)) {
                        onError(message);
                    }
                },
            });
        });
    
        signForm(this.form);
    }
    
    FormHandler.prototype.multipartSubscribe = function({ onSuccess, onError, beforeSubmit, files }) {
        if (formIsSigned(this.form)) {
            return;
        }
    
        const thiss = this;
        
        this.form.addEventListener(EventSubmit, function(event) {
            event.preventDefault();
            event.stopPropagation();
    
            if (isFunction(beforeSubmit)) {
                beforeSubmit();
            }
    
            const formData = new FormData();
            if (files.length == 1) {
                formData.append('file', files[0], files[0].name);
            }
            else {
                // TODO: this line has to be sanitized
            }
    
            thiss.apiRest.post({
                url: thiss.form.action,
                data: formData,
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                onSuccess: (response) => {
                    thiss.reset();
                    if (isFunction(onSuccess)) {
                        onSuccess(response);
                    }
                },
                onError: (message) => {
                    if (isFunction(onError)) {
                        onError(message);
                    }
                }
            });
        });
    
        signForm(this.form);
    }
    
    FormHandler.prototype.serialize = function() {
        const values = {};
        const data = new FormData(this.form);
        for (let [key, value] of data) {
            if (values[key]) {
                if (!Array.isArray(values[key])) {
                    values[key] = [values[key]];
                }
                values[key].push(value);
            }
            else {
                values[key] = value;
            }
        }
        return values;
    }
    
    FormHandler.prototype.validate = function() { }
    
    FormHandler.prototype.reset = function() {
        this.form.reset();
    }
    
    FormHandler.prototype.getAction = function() {
        return this.form.action;
    }

    return FormHandler;
})();


export default FormHandler;