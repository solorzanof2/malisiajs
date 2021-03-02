

var ControlsBindingList = (function() {

    function ControlsBindingList(collection = []) {
        this.rawCollection = collection;
        this.collection = {};
        this.initialize();
    }
    
    ControlsBindingList.prototype.initialize = function() {
        this.bind(this.rawCollection);
    }
    
    ControlsBindingList.prototype.bind = function(collection) {
        for (const control of collection) {
            if (/{\w+}/g.test(control.textContent)) {
                const bind = control.textContent.replace(/(^{+|}+$)/g, '');
                if (bind) {
                    if (!this.collection.hasOwnProperty(bind)) {
                        this.collection[bind] = [];
                    }
                    this.collection[bind].push(control);
                }
            }
        }
    }
    
    ControlsBindingList.prototype.set = function(name, value) {
        if (this.collection[name]) {
            for (const control of this.collection[name]) {
                control.textContent = value;
            }
        }
    }

    return ControlsBindingList;
})();


export default ControlsBindingList;