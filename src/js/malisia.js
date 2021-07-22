import ControlsBindingList from "./controls-bind-list.js";
import ControlsList from "./controls-list.js";
import ControlsModelList from "./controls-model-list.js";
import EventHandler from "./modules/event-handler.js";
import ApiRest from "./modules/api-rest.js";
import ButtonHandler from "./modules/button-handler.js";
import Dialog from "./modules/dialog.js";
import FormHandler from "./modules/form-handler.js";
import HttpClient from "./modules/http-client.js";
import { selector, selectorAll } from "./modules/selectors.js";
import SnackbarApi from "./modules/snackbar.js";
import Store from "./modules/store.js";
import { throwError } from "./modules/throws.js";
import DomHandler from "./modules/dom-handler.js";
import Vue from "./modules/vue.esm.browser.js";
import Tabele from "./modules/tabele.js";
import Wizard from "./modules/wizard.js";
import DropPanel from "./modules/drop-panel.js";
import ClickHandler from "./modules/click-handler.js";
import debounce from "./modules/debounce";


var Malisia = (function() {

    const Extensions = {
        httpClient: 'httpClient',
        apiRest: 'apiRest',
        dialog: 'dialog',
        snackbar: 'snackbar',
        dom: 'dom',
        form: 'Form',
        button: 'Button',
        tabele: 'Tabele',
        wizard: 'Wizard',
        dropPanel: 'DropPanel',
        doclick: 'doclick',
        dollar: '$',
        dollarAll: '$$',
    };

    const About = {
        appName: 'Malisia',
        appVersion: '1.2.1',
        debug: false,
    };
    
    const composeProperty = function(rawProperty) {
        const cleanProperty = String(rawProperty).replace('#', '');
        const selectorRegexp = /[-_]+/g;
    
        let property = cleanProperty;
        if (String(cleanProperty).match(selectorRegexp)) {
            const [ base, ...complements ] = cleanProperty.split(selectorRegexp);
            
            let builder = '';
            for (const section of complements) {
                builder += `${section.charAt(0).toUpperCase()}${section.slice(1)}`;
            }
            property = `${base}${builder}`;
        }
        return property;
    };

    const createQuery = (query) => `[${query}]`;
    
    const mappers = {
        elementsCollection: {},
        controlGroups: [],
        modelsCollection: [],
        bindsCollection: [],
        formsCollection: {},
        scan: function() {
            const elementsCollection = selectorAll(createQuery('mrn'));
            for (const element of elementsCollection) {
                const mrn = element.getAttribute('mrn');
                const mrnParts = String(mrn).split(':').filter(Boolean);
                if ('docevent' === mrnParts[0]) {
                    continue;
                }

                const [key, value] = mrnParts;
                switch (true) {
                    case 'id' === key:
                        this.elementsCollection[value] = element;
                        break;
                    case 'group' === key:
                        if (this.controlGroups.includes(value)) {
                            continue;
                        }
                        this.controlGroups.push(value);
                        break;
                    case 'model' === key:
                        this.modelsCollection.push(element);
                        break;
                    case 'bind' === key:
                        this.bindsCollection.push(element);
                        break;
                    case 'wizard' === key:
                        this.formsCollection[value] = element;
                        break;
                }
            }
        },
        scanIdentifiers: function(instance, element) {
            let elementsCollection = this.elementsCollection;

            if (element) {
                elementsCollection = selectorAllFrom(element, query);
            }
            
            for (const elementName in elementsCollection) {
                const controlElement = elementsCollection[elementName];
                if (instance[elementName]) {
                    continue;
                }
                controlElement['emit'] = function(event) {
                    instance.emit(this, event);
                }
                instance[elementName] = controlElement;
            }
        },
        scanGroups: function(instance) {
            const controlGroups = this.controlGroups;
            const groupsCollection = [];
        
            for (const groupName of controlGroups) {
                if (groupsCollection.includes(groupName)) {
                    continue;
                }
                groupsCollection.push(groupName);
                instance.createControlGroup(groupName);
            }
        },
        scanModels: function(instance) {

            if (this.modelsCollection.length) {
                instance['models'] = new ControlsModelList(instance, this.modelsCollection);
            }
        },
        scanBinds: function(instance) {
            if (this.bindsCollection.length) {
                instance['binds'] = new ControlsBindingList(this.bindsCollection);
            }
        },
        scanWizards: function(instance) {
            for (const formName in this.formsCollection) {
                instance[formName] = new Wizard({
                    selector: this.formsCollection[formName]
                });
            }
        },
    };

    const bindExtensions = function(instance) {
        instance.extends(Extensions.httpClient, new HttpClient());
        instance.extends(Extensions.apiRest, new ApiRest());
        instance.extends(Extensions.dialog, new Dialog());
        instance.extends(Extensions.snackbar, new SnackbarApi());
        instance.extends(Extensions.dom, new DomHandler());
        instance.extends(Extensions.form, FormHandler);
        instance.extends(Extensions.button, ButtonHandler);
        instance.extends(Extensions.tabele, Tabele);
        instance.extends(Extensions.wizard, Wizard);
        instance.extends(Extensions.dropPanel, DropPanel);
        instance.extends(Extensions.doclick, (new ClickHandler).start());
        instance.extends(Extensions.dollar, selector);
        instance.extends(Extensions.dollarAll, selectorAll);
        instance.extends('functions', {
            debounce
        });
    };

    const initialize = function(instance) {
        // at first bind events object, since it is necessary
        instance.extends('events', new EventHandler());

        // scan for all malisia resources name;
        mappers.scan();
        
        // scan for [ng-id] elements
        mappers.scanIdentifiers(instance);

        // scan for [ng-group] elements
        mappers.scanGroups(instance);

        // scan for [ng-model] elements
        mappers.scanModels(instance);

        // scan for [ng-binds] elements
        mappers.scanBinds(instance);

        // scan for [ng-wizard] elements
        mappers.scanWizards(instance);

        bindExtensions(instance);
    };
    
    const properties = {
        props: {},
        storesCollection: [],
        modules: {},
    };
    
    function Malisia(props = {}) {
        // message-titles;
        properties.props = props;
        initialize(this);
    }
    
    Malisia.prototype.aboutMalisia = function() {
        return About;
    }
    
    Malisia.prototype.getStoresCollection = function() {
        return properties.storesCollection;
    }

    Malisia.prototype.addStore = function(store) {
        properties.storesCollection.push(store);
    }
    
    Malisia.prototype.populateStores = function() {
        if (properties.storesCollection.length) {
            for (const store of properties.storesCollection) {
                this[store].bindState();
            }
        }
    }
    
    Malisia.prototype.extends = function(name, reference) {
        Malisia.prototype[name] = reference;
    }
    
    Malisia.prototype.emit = function(component, event, data) {
        if (!event || !component) {
            return;
        }
        if (data) {
            component.dispatchEvent(new CustomEvent(event, { bubbles: true, cancelable: true, detail: data }));
            return;
        }
        component.dispatchEvent(new Event(event, { bubbles: true, cancelable: true }));
    }
    
    Malisia.prototype.createControlGroup = function(group) {
        if (this[group]) {
            return;
        }
        this[group] = new ControlsList(group, this);
    }
    
    Malisia.prototype.createStore = function({ name, data, methods }) {
        if (this[name]) {
            throwError(`Store ${name} already exists.`);
        }
        this[name] = new Store(name, data, methods, this);
    }
    
    Malisia.prototype.createComponent = function(component) {
        const { selector, data, template, methods, childs } = component;
        if (childs && childs.length) {
            for (const component of childs) {
                Vue.component(component.selector, component.component);
            }
        }
        const name = composeProperty(selector);
        let el = selector;
        if (!el.includes('#')) {
            el = `#${el}`;
        }
        this[name] = new Vue({ el, data, template, methods });
    }

    return Malisia;
})();


const initialize = function(options)  {
    return new Malisia(options);
}

export default initialize;