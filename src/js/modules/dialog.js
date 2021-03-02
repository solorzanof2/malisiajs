import Swal from "sweetalert2";


var Dialog = (function() {

    const iconTypes = {
        info: 'info',
        success: 'success',
        error: 'error',
        warn: 'warning',
    };

    const defaultTitle = 'Aviso';

    const properties = {
        title: defaultTitle,
        icon: iconTypes.info,
        text: '',
    }
    
    const mapOptions = function(message, title, icon) {
        const options = properties;
        options.text = message;
        options.title = title || properties.title;
        options.icon = icon || properties.icon;
        return options;
    }

    const dispatch = function(options, getResponse = false) {
        if (getResponse) {
            return Swal.fire(options);
        }
        Swal.fire(options);
    }
    
    function Dialog(title = defaultTitle) {
        properties.title = title;
        properties.icon = iconTypes.info;
    }
    
    Dialog.prototype.show = function(message, title, icon = iconTypes.info) {
        dispatch(mapOptions(message, title, icon));
    }
    
    Dialog.prototype.success = function(message, title, icon = iconTypes.success) {
        this.show(message, title, icon);
    }
    
    Dialog.prototype.error = function(message, title, icon = iconTypes.error) {
        this.show(message, title, icon);
    }
    
    Dialog.prototype.warning = function(message, title, icon = iconTypes.warn) {
        this.show(message, title, icon);
    }
    
    Dialog.prototype.confirm = async function(message, title, icon = iconTypes.warn) {
        let response = (await this.dispatch({
            text: message,
            title: title || properties.title,
            icon,
            showCancelButton: true,
            confirmButtonText: 'Si',
            cancelButtonText: 'No'
        }, true)).isConfirmed;
        return Promise.resolve(response);
    }

    return Dialog;
})();


export default Dialog;