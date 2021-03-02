import { selector, selectorAll } from "./selectors";
import { throwError } from "./throws"


var ButtonHandler = (function() {

    const clickEvent = 'click';
    
    function ButtonHandler(element, debounceMillis) {
        if (!element) {
            throwError("Provide an element using '#' or an element collection using '.'");
        }

        this.selector = element;
        this.elements = [];
        this.useDebounce = (debounceMillis) ? true : false;
        this.debounceMillis = debounceMillis;
        
        this.initialize();
    }

    ButtonHandler.prototype.hasElements = function() {
        return (this.elements.length > 0)
    }

    ButtonHandler.prototype.initialize = function() {
        if (String(this.selector).startsWith('.')) {
            this.elements = selectorAll(this.selector);
        }
    
        if (!this.hasElements()) {
            if (!String(this.selector).startsWith('#')) {
                this.selector = `#${this.selector}`;
            }
            this.elements.push(selector(this.selector));
        }

        if (!this.hasElements()) {
            throwError(`No elements found with name ${this.selector}`);
        }
    }
    
    ButtonHandler.prototype.debounce = function(method, applyInmediatly) {
        var timeout;
        return function() {
            const context = this, args = arguments;
    
            clearTimeout(timeout);
    
            timeout = setTimeout(() => {
                timeout = null;
                if (!applyInmediatly) {
                    method.apply(context, args);
                }
            }, this.debounceMillis);
    
            if (applyInmediatly && !timeout) {
                method.apply(context, args);
            }
        }
    }
    
    ButtonHandler.prototype.click = function(callback) {
        if (!this.hasElements()) {
            return;
        }

        for (const button of this.elements) {
            this.addClickEvent(button, callback);
        }
    }
    
    ButtonHandler.prototype.addClickEvent = function(button, method) {
        if (this.useDebounce) {
            button.addEventListener(clickEvent, this.debounce(method));
        }
        else {
            button.addEventListener(clickEvent, method);
        }
    }

    return ButtonHandler;
})();


export default ButtonHandler;