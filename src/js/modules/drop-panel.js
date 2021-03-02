

var DropPanel = (function() {

    const Attribute = {
        dropPanel: 'drop-panel',
        dropPanelClose: 'drop-panel-close',
        active: 'active',
    };

    const defaultTimeout = 100;
    const dom = document;
    
    const computeStyle = {
        top: function(style) {
            return {
                ...style,
                transform: `translate(0px, -${style.height})`,
                top: 0,
                left: 0,
                // position: 'fixed',
            };
        },
        right: function(style) {
            return {
                ...style,
                transform: `translate(${style.width}, 0px)`,
                right: 0,
                top: 0,
            };
        },
        bottom: function(style) {
            return {
                ...style,
                transform: `translate(0px, ${style.height})`,
                bottom: 0,
                left: 0,
                // position: 'fixed',
            };
        },
        left: function(style) {
            return {
                ...style,
                transform: `translate(-${style.width}, 0px)`,
                left: 0,
                top: 0,
            };
        },
    };

    const buttonCloseTemplate = function(instance) {
        const closeButton = dom.createElement('button');
        closeButton.textContent = '✕';

        closeButton.onclick = function(event) {
            instance.hide();
        }
        
        const divContent = dom.createElement('div');
        divContent.setAttribute(Attribute.dropPanelClose, '');
        divContent.appendChild(closeButton);

        instance.element.appendChild(divContent);
    };
    
    const initialize = function(instance) {
        let querySelector = instance.props.selector;
        if (!String(querySelector).startsWith('#')) {
            querySelector = `#${querySelector}`;
        }
        instance.element = document.querySelector(querySelector);
        
        let style = computeStyle[instance.props.position](instance.props.style);
        Object.keys(style).forEach(property => {
            instance.element.style[property] = style[property];
        });
        
        if (instance.isBottom()) {
            instance.display(false);
        }
        instance.element.setAttribute(Attribute.dropPanel, '');

        if (instance.props.closeButton) {
            buttonCloseTemplate(instance);
        }
    }
    
    function DropPanel(props) {
        this.props = props;
        this.element = {};

        initialize(this);
    }

    DropPanel.prototype.isBottom = function() {
        return (this.props.position === 'bottom');
    }

    DropPanel.prototype.display = function(show = true) {
        this.element.style.display = (show) ? 'block' : ' none';
    }

    DropPanel.prototype.show = function() {
        if (this.isBottom()) {
            this.display();
        }

        setTimeout(() => {
            this.element.setAttribute(Attribute.active, '');
        }, defaultTimeout);
    }

    DropPanel.prototype.hide = function() {
        this.element.removeAttribute(Attribute.active);
        if (this.isBottom()) {
            setTimeout(() => {
                this.display(false);
            }, defaultTimeout + 400);
        }
    }

    return DropPanel;
})();

export default DropPanel;