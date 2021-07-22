

var ControlsModelList = (function() {

    const isCheckbox = function(control) {
        return (control.type === 'checkbox');
    }

    const isRadio = function(control) {
        return (control.type === 'radio');
    }

    const PrefixModel = 'mrn';
    
    function ControlsModelList(core, collection = []) {
        this.rawCollection = collection;
        this.core = core;
        this.collection = {};
        this.initialize();
    }
    
    ControlsModelList.prototype.initialize = function() {
        this.bind(this.rawCollection);
    }
    
    ControlsModelList.prototype.bind = function(collection) {
        for (const control of collection) {
            const [key, model] = control.getAttribute(PrefixModel).split(':').filter(Boolean);
            if (!model) {
                continue;
            }
    
            if (!this.collection.hasOwnProperty(model)) {
                this.collection[model] = [];
            }
            
            const thiz = this;
            if (isCheckbox(control) || isRadio(control)) {
                control.onchange = function() {
                    for (const store of thiz.core.getStoresCollection()) {
                        if (thiz.core.hasOwnProperty(store)) {
                            thiz.core[store] = (this.value === value);
                        }
                    }
                }
            }
            else {
                control.oninput = function () {
                    for (const store of thiz.core.getStoresCollection()) {
                        if (thiz.core.hasOwnProperty(store)) {
                            thiz.core[store].getState()[model] = this.value;
                        }
                    }
                }
            }
            this.collection[model].push(control);
        }
    }
    
    ControlsModelList.prototype.set = function(name, value) {
        if (this.collection[name]) {
            for (const control of this.collection[name]) {
                if (isCheckbox(control) || isRadio(control)) {
                    control.checked = (control.value === value);
                }
                else {
                    control.value = value;
                }
            }
        }
    }

    return ControlsModelList;
})();


export default ControlsModelList;