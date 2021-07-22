

var ClickHandler = (function() {

    const clickEvent = 'click';
    const documentEvent = 'mrn';

    const collection = [];
    
    function ClickHandler() { }

    ClickHandler.prototype.subscribe = function(event, callback) {
        if (!collection[event]) {
            collection[event] = [];
        }
        collection[event].push(callback);
    }

    ClickHandler.prototype.start = function() {
        document.addEventListener(clickEvent, function(event) {
            const { target } = event;

            if (!target.hasAttribute(documentEvent)) return;

            const [property, eventButton, button] = String(target.getAttribute(documentEvent)).split(':').filter(Boolean);

            if (eventButton !== clickEvent || property !== 'docevent') return;
            
            if (button && collection[button]) {
                collection[button].map(callback => callback(event));
            }
        });

        return this;
    }

    return ClickHandler;
})();

export default ClickHandler;