

var Store = (function() {

    const NotifyPropertyChange = 'notify.property.change';
    
    function Store(name, state, mutations, core) {
        this.name = name;
        this.core = core;
        this.core.addStore(name);
        this.actions = {};
        this.events = [];
        this.state = {};
        this.initialState = state;
        this.mutations = mutations;
    
        this.initialize();
    }

    Store.prototype.initialize = function() {
        this.state = new Proxy(this.initialState, {
            set: (target, property, value) => {
                target[property] = value;
                this.render(property, value);
                this.core.events.dispatch(NotifyPropertyChange, { property, value });
                return true;
            },
        });
    
        // if (this.mutations && Object.keys(this.mutations).length) {
        //     Object.keys(this.mutations).map(property => this.actions[property] = property);
        // }
        if (this.mutations && Object.keys(this.mutations).length) {
            for (const property in this.mutations) {
                this.actions[property] = property;
                Store.prototype[property] = new SubjectEvent(this, property);
            }
        }
        this.bindState();
    }

    Store.prototype.bindState = function() {
        Object.keys(this.state).forEach(property => {
            if (typeof property !== 'object') {
                this.render(property, this.state[property]);
            }
        });
    }

    Store.prototype.render = function(property, value) {
        if (this.core.models) {
            this.core.models.set(property, value);
        }
    
        if (this.core.binds) {
            this.core.binds.set(property, value);
        }
    }

    Store.prototype.dispatch = function(event, value) {
        if (typeof this.mutations[event] !== 'function') {
            console.warn(`[Store::${this.name}]: The event ${event} has no registered methods.`);
            return;
        }
    
        this.state = this.mutations[event](this.state, value);
        this.commit(event);
    }

    Store.prototype.dispatchEvent = function(event, value) {
        if (typeof this.mutations[event] !== 'function') {
            console.warn(`[Store::${this.name}]: The event ${event} has no registered methods.`);
            return;
        }

        this.state = this.mutations[event](this.state, value);
        return this.state;
    }

    Store.prototype.commit = function(event) {
        if (this.events[event]) {
            this.events[event].map(callback => callback(this.state));
        }
    }

    Store.prototype.subscribe = function(event, callback) {
        if (!this.events[event]) {
            this.events[event] = [];
        }
        this.events[event].push(callback);
    }

    Store.prototype.getState = function() {
        return this.state;
    }

    Store.prototype.getActions = function() {
        return this.actions;
    }
    
    var SubjectEvent = function(store, name) {
        this.store = store;
        this.name = name;
        this.collection = [];
    }
    
    SubjectEvent.prototype.subscribe = function(callback) {
        if (!this.collection) {
            this.collection = [];
        }
        this.collection.push(callback);
    }
    
    SubjectEvent.prototype.dispatch = function(eventArgs) {
        const state = this.store.dispatchEvent(this.name, eventArgs);
        if (this.collection.length) {
            this.collection.map(callback => callback(state));
        }
    }

    return Store;
})();


export default Store;