

const Malisia = (function () {
    'use strict';

    const methods = {};

    const datasetName = 'data-mls'

    const storesCollection = [];
    
    methods.extends = function (name, func) {
        methods[name] = func;
    }

    methods.props = {
        notifyPropertyChanged: 'notify.property.changed'
    };
    
    const getAll = (query) => {
        return Array.from(document.querySelectorAll(query));
    }
    
    const scanDom = () => {
        const elementsCollection = getAll(`[${datasetName}-id]`);
        for (let element of elementsCollection) {
            element['emit'] = function (eventRef) {
                methods.emit({ component: this, event: eventRef });
            }
            methods.extends(element.dataset.mlsId, element);
        }

        const controlGroups = getAll(`[${datasetName}-group]`);
        const groupsCollection = [];
        for (const group of controlGroups) {
            const groupName = group.dataset.mlsGroup;
            if (groupsCollection.includes(groupName)) {
                continue;
            }
            groupsCollection.push(groupName);
            methods[groupName] = new ControlsList({ group: groupName });
        }

        let models = getAll(`[mls-model]`);
        if (models.length) {
            methods.models = new ControlsModelList(models);
        }

        let binds = getAll(`[mls-bind]`);
        if (binds.length) {
            methods.binds = new ControlsBindingList(binds);
        }
    }

    methods.createStore = (name, { initialState, mutations }) => {

        storesCollection.push(name);
        
        const actions = {};
        Object.keys(mutations).map(property => actions[property] = property);
        
        function Store() {
    
            const events = [];

            let state = {};
    
            state = new Proxy(initialState, {
                set: (target, property, value) => {
                    target[property] = value;

                    render(property, value);
                    methods.events.dispatch(methods.props.notifyPropertyChanged, { property, value });

                    return true;
                }
            });

            const render = (property, value) => {
                if (methods.models) {
                    methods.models.set(property, value);
                }

                if (methods.binds) {
                    methods.binds.set(property, value);
                }
            }
            
            const dispatch = (event, value) => {
                // if (typeHelper(mutations[event]).isNotFunction()) {
                if (typeof mutations[event] !== 'function') {
                    console.warn(`[Store] The event ${event} has no registered method.`);
                    return;
                }
    
                state = mutations[event](state, value);
                commit(event);
            }
    
            const commit = (event) => {
                if (events[event]) {
                    events[event].map(callback => callback(state));
                }
            }
    
            const subscribe = (event, callback) => {
                if (!events[event]) {
                    events[event] = [];
                }
                events[event].push(callback);
            }
    
            const getState = () => {
                return state;
            }
    
            const getActions = () => {
                return actions;
            }

            Object.keys(initialState).forEach(property => {
                if (typeof property !== 'object') {
                    render(property, initialState[property]);
                }
            });
    
            return {
                dispatch,
                subscribe,
                getState,
                getActions
            };
        }
        
        methods.extends(name, new Store());
    }

    methods.events = new EventHandler();
    
    function EventHandler() {

        const collection = [];
    
        this.subscribe = (eventName, callback) => {
            if (!collection[eventName]) {
                collection[eventName] = [];
            }
            collection[eventName].push(callback);
        }
    
        this.dispatch = (eventName, event) => {
            if (collection[eventName]) {
                collection[eventName].map(callback => callback(event));
            }
        }
    
    }

    function ControlsList ({ group }) {
        const $group = group;
        const collection = Array.from(document.querySelectorAll(`[${datasetName}-group="${group}"]`));
        const registeredEventsCollection = {};

        this.on = (eventName, onEvent) => {
            if (!registeredEventsCollection.hasOwnProperty(eventName)) {
                registeredEventsCollection[eventName] = { event: eventName, onEvent };
            }

            for (let control of collection) {
                methods.listen(eventName, { component: control, onEvent });
            }
        }
        
        this.add = ({ id }) => {
            collection.push(useElement(`#${id}`).dom);

            if (Object.keys(registeredEventsCollection).length) {
                for (const property of Object.keys(registeredEventsCollection)) {
                    this.on(registeredEventsCollection[property].event, registeredEventsCollection[property].onEvent);
                }
            }
        }
    }

    function ControlsModelList (collection = []) {
        const rawCollection = collection;

        const $collection = {};
        for (const control of collection) {
            const model = control.getAttribute('mls-model');
            if (model) {
                if (!$collection.hasOwnProperty(model)) {
                    $collection[model] = [];
                }
                
                if (control.type === 'checkbox' || control.type === 'radio') {
                    control.onchange = function() {
                        for (const store of storesCollection) {
                            if (methods.hasOwnProperty(store)) {
                                methods[store] = (this.value === value);
                            }
                        }
                    }
                }
                else {
                    control.oninput = function () {
                        for (const store of storesCollection) {
                            if (methods.hasOwnProperty(store)) {
                                methods[store].getState()[model] = this.value;
                            }
                        }
                    }
                }
                $collection[model].push(control);
            }
        }

        this.set = (name, value) => {
            if ($collection[name]) {
                for (const control of $collection[name]) {
                    if (control.type === 'checkbox' || control.type === 'radio') {
                        control.checked = (control.value === value);
                    }
                    else {
                        control.value = value;
                    }
                }
            }
        }
    }

    function ControlsBindingList (collection = []) {
        const $rawCollection = collection;

        const $collection = {};
        for (const control of collection) {
            if (/{\w+}/g.test(control.textContent)) {
                const bind = control.textContent.replace(/(^{+|}+$)/g, '');
                if (bind) {
                    if (!$collection.hasOwnProperty(bind)) {
                        $collection[bind] = [];
                    }
                    $collection[bind].push(control);
                }
            }
        }

        this.set = (name, value) => {
            if ($collection[name]) {
                for (const control of $collection[name]) {
                    control.textContent = value;
                }
            }
        }
    }

    methods.listen = (eventName, { component, onEvent, beforeEvent, afterEvent }) => {
        const DATA_SIGNATURE = `mls-listening-${eventName}`;
        
        if (component.hasAttribute(DATA_SIGNATURE)) {
            return;
        }
    
        component.addEventListener(eventName, function (event) {
            try {
                // if (beforeEvent && typeHelper(beforeEvent).isFunction()) {
                if (beforeEvent && (typeof beforeEvent === 'function')) {
                    if (beforeDispatch(event)) {
                        onEvent(event);
                    }
                }
                else {
                    onEvent(event);
                }
            }
            finally {
                // if (afterEvent && (typeHelper(afterEvent).isFunction())) {
                if (afterEvent && (typeof afterEvent === 'function')) {
                    afterEvent();
                }
            }
        });
    
        component.setAttribute(DATA_SIGNATURE, '');
    }

    methods.emit = ({ component, event }) => {
        if (!event || !component) {
            return;
        }

        component.dispatchEvent(new Event(event, { bubbles: true, cancelable: true }));
    }
    
    methods.refresh = () => {
        scanDom();
    }
    
    scanDom();
    
    return methods;
})();

const useMalisia = () => {
    return Malisia;
}