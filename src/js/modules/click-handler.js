

var ClickHandler = (function() {

    const clickEvent = 'click';
    const documentEvent = 'ng-document-event';

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

            const [eventButton, button] = String(target.getAttribute(documentEvent)).split('::');

            if (eventButton !== clickEvent) return;
            
            if (button && collection[button]) {
                collection[button].map(callback => callback(event));
            }
        });

        return this;
    }

    return ClickHandler;
})();

export default ClickHandler;