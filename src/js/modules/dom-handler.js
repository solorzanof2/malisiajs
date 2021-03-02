

var DomHandler = (function() {

    const dom = document;
    
    function DomHandler() { }
    
    DomHandler.prototype.createElement = function(name) {
        return dom.createElement(name);
    }
    
    DomHandler.prototype.createDiv = function() {
        return createElement('div');
    }
    
    DomHandler.prototype.toNode = function(template) {
        const div = createDiv();
        div.innerHTML = template;
        return div.firstElementChild;
    }
    
    return DomHandler;
})();

export default DomHandler;