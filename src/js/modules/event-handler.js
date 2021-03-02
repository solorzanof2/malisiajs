

var EventHandler = (function() {

    var composeProperty = function(value) {
        const cleanProperty = String(value).replace('#', '');
        const selectorRegexp = /[-_\.\s\>\<\/\|\*\+~\\@\(\)\{\}\#]+/g;
    
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
    }

    const assignEvents = function(instance, event) {
        const property = composeProperty(event);
        if (instance[property]) {
            console.warn(`[Malisia]: Event ${event} already exists.`);
            return;
        }
        instance[property] = new SubjectEvent(event, property);
    }
    
    const collection = [];
    
    var EventHandler = function() { }
    
    EventHandler.prototype.subscribe = function(event, callback) {
        if (!collection[event]) {
            collection[event] = [];
        }
        collection[event].push(callback);
    }
    
    EventHandler.prototype.dispatch = function(event, eventArgs) {
        if (collection[event]) {
            collection[event].map(callback => callback(eventArgs));
        }
    }
    
    EventHandler.prototype.register = function(event) {
        if (typeof event === 'string') {
            assignEvents(this, event);
        }
    
        if (Array.isArray(event)) {
            for (const iEvent of event) {
                assignEvents(this, iEvent);
            }
        }
    }
    
    const properties = {
        collection: [],
    };
    
    var SubjectEvent = function(name, propertyName) {
        this.name = name;
        this.propertyName = propertyName;
    }
    
    SubjectEvent.prototype.subscribe = function(callback) {
        if (!properties.collection[this.propertyName]) {
            properties.collection[this.propertyName] = [];
        }
        properties.collection[this.propertyName].push(callback);
    }
    
    SubjectEvent.prototype.dispatch = function(eventArgs) {
        if (properties.collection[this.propertyName].length) {
            properties.collection[this.propertyName].map(callback => callback(eventArgs));
        }
    }

    return EventHandler;
})();


export default EventHandler;