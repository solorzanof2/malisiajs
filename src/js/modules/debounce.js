

function debounce(func, milliseconds, inmediate) {
    let timeout;
    return function() {
        const context = this, args = arguments;

        clearTimeout(timeout);

        timeout = setTimeout(() => {
            timeout = null;
            if (!inmediate) {
                func.apply(context, args);
            }
        }, milliseconds);

        if (inmediate && !timeout) {
            func.apply(context, args);
        }
    };
};