import { selector, selectorAll } from './modules/selectors.js';


var ControlsList = (function() {

    const PrefixGroup = 'ng-group';
    
    function ControlsList(group, core) {
        this.core = core;
        this.groupName = group;
        this.collection = selectorAll(`[${PrefixGroup}="${group}"]`);
        this.registeredEventsCollection = {};
    }
    
    ControlsList.prototype.hasRegisteredEvents = function() {
        return !!(Object.keys(this.registeredEventsCollection).length);
    }
    
    ControlsList.prototype.on = function(eventName, onEvent) {
        if (!this.registeredEventsCollection.hasOwnProperty(eventName)) {
            this.registeredEventsCollection[eventName] = { event: eventName, onEvent };
        }
    
        for (let control of this.collection) {
            control[eventName] = onEvent;
        }
    }
    
    ControlsList.prototype.add = function(id) {
        if (this.collection.some(element => element.id === id)) {
            return;
        }
    
        if (!String(id).startsWith('#')) {
            id = `#${id}`;
        }
        
        this.collection.push(selector(id));
    
        if (hasRegisteredEvents()) {
            for (const property of Object.keys(this.registeredEventsCollection)) {
                this.on(property, this.registeredEventsCollection[property].onEvent);
            }
        }
    }
    
    ControlsList.prototype.dispose = function(id) {
        const index = this.collection.findIndex(element => element.id === id);
        if (!this.collection[index]) {
            return;
        }
    
        this.collection[index].parentNode.removeChild(this.collection[index]);
        this.collection.splice(index, 1);
    }
    
    ControlsList.prototype.change = function(onEvent) {
        this.on('onchange', onEvent);
    }
    
    ControlsList.prototype.click = function(onEvent) {
        this.on('onclick', onEvent);
    }
    
    ControlsList.prototype.mouseover = function(onEvent) {
        this.on(`onmouseover`, onEvent);
    }
    
    ControlsList.prototype.mouseout = function(onEvent) {
        this.on(`onmouseout`, onEvent);
    }
    
    ControlsList.prototype.keydown = function(onEvent) {
        this.on(`onkeydown`, onEvent);
    }
    
    ControlsList.prototype.load = function(onEvent) {
        this.on(`onload`, onEvent);
    }

    return ControlsList;
})();


export default ControlsList;