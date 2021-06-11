import ControlsBindingList from "./controls-bind-list.js";
import ControlsList from "./controls-list.js";
import ControlsModelList from "./controls-model-list.js";
import EventHandler from "./modules/event-handler.js";
import ApiRest from "./modules/api-rest.js";
import ButtonHandler from "./modules/button-handler.js";
import Dialog from "./modules/dialog.js";
import FormHandler from "./modules/form-handler.js";
import HttpClient from "./modules/http-client.js";
import { selectorAll } from "./modules/selectors.js";
import SnackbarApi from "./modules/snackbar.js";
import Store from "./modules/store.js";
import { throwError } from "./modules/throws.js";
import DomHandler from "./modules/dom-handler.js";
import Vue from "./modules/vue.esm.browser.js";
import Tabele from "./modules/tabele.js";
import Wizard from "./modules/wizard.js";
import DropPanel from "./modules/drop-panel.js";
import ClickHandler from "./modules/click-handler.js";


var Malisia = (function() {

    const Prefixes = {
        main: 'ng',
        id: 'ng-id',
        group: 'ng-group',
        model: 'ng-model',
        bind: 'ng-bind',
        wizard: 'ng-wizard',
    };

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
        scanIdentifiers: function(instance, element) {
            let elementsCollection = [];
    
            const query = createQuery(Prefixes.id);
            if (element) {
                elementsCollection = selectorAllFrom(element, query);
            }
            else {
                elementsCollection = selectorAll(query);
            }
            
            for (const element of elementsCollection) {
                const elementName = element.getAttribute(Prefixes.id);
                if (instance[elementName]) {
                    continue;
                }
                element['emit'] = function(event) {
                    instance.emit(instance, event);
                }
                instance[elementName] = element;
            }
        },
        scanGroups: function(instance) {
            const controlGroups = selectorAll(createQuery(Prefixes.group));
            const groupsCollection = [];
        
            for (const group of controlGroups) {
                const groupName = group.getAttribute(Prefixes.group);
                if (groupsCollection.includes(groupName)) {
                    continue;
                }
                groupsCollection.push(groupName);
                instance.createControlGroup(groupName);
            }
        },
        scanModels: function(instance) {
            const modelsCollection = selectorAll(createQuery(Prefixes.model));
            if (modelsCollection.length) {
                instance['models'] = new ControlsModelList(instance, modelsCollection);
            }
        },
        scanBinds: function(instance) {
            const bindsCollection = selectorAll(createQuery(Prefixes.bind));
            if (bindsCollection.length) {
                instance['binds'] = new ControlsBindingList(bindsCollection);
            }
        },
        scanWizards: function(instance) {
            const formsCollection = selectorAll(createQuery(Prefixes.wizard));
            for (const form of formsCollection) {
                const formName = form.getAttribute(Prefixes.wizard);
                instance[formName] = new Wizard({
                    selector: form
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
    };

    const initialize = function(instance) {
        // at first bind events object, since it is necessary
        instance.extends('events', new EventHandler());

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
    
    Malisia.prototype.defaultOptions = {
        appName: 'Malisia',
        appVersion: '1.1.0',
        debug: false,
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
    
    Malisia.prototype.emit = function(component, event) {
        if (!event || !component) {
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