import FormHandler from './form-handler.js';
import { selector, selectorFrom, selectorAllFrom } from './selectors.js';
import { throwError } from './throws.js';


var Wizard = (function() {

    const styles = {
        isActive: 'is-active',
        hasError: 'has-error',
    };

    const createQuery = (query) => `[${query}]`;

    const isFunction = function(reference) {
        return (typeof reference === 'function');
    }

    const submitForm = function(form) {
        form.dispatchEvent(new Event('submit', {
            bubbles: true,
            cancelable: true,
        }));
    }

    const getControlsCollection = function(instance) {
        return Object.keys(instance.controls);
    }

    const Attributes = {
        formPage: 'form-page',
        progressBar: 'progress-bar',
        navBackward: 'nav-backward',
        navForward: 'nav-forward',
        formControl: 'form-control',
    }
    
    function Wizard(props) {
        this.props = {};
        if (typeof props === 'string') {
            this.props = {
                selector: props,
            }
        }
        else {
            this.props = props;
        }
        this.form = {};
        this.pages = {};
        this.controls = {};
        this.navigation = {};
        this.progressBar = {};
        this.subscriptor = undefined;
        this.errorSubscriptor = undefined;

        this.initialize();
    }

    Wizard.prototype.initialize = function() {
        if (typeof this.props.selector === 'string') {
            this.form = selector(this.props.selector);
        }

        if (this.props.selector instanceof HTMLFormElement) {
            this.form = this.props.selector;
        }

        this.progressBar = selectorFrom(this.form, createQuery(Attributes.progressBar), false);

        this.navigation = new Navigation(this, {
            backward: selectorFrom(this.form, createQuery(Attributes.navBackward), false),
            forward: selectorFrom(this.form, createQuery(Attributes.navForward), false),
        });

        this.pages = new Pages(this);
        const pagesCollection = selectorAllFrom(this.form, createQuery(Attributes.formPage), false);
        let pageIndex = 0;
        for (const page of pagesCollection) {
            this.pages.add({
                isFirst: false,
                isLast: false,
                index: pageIndex,
                name: page.getAttribute(Attributes.formPage),
                page
            });
            pageIndex++;
        }
        this.pages.finishMap();
        this.pages.render();
        
        const controlsCollection = selectorAllFrom(this.form, createQuery(Attributes.formControl), false);
        for (const control of controlsCollection) {
            this.controls[control.name] = control;
        }
        
        this.addEvents();
    }

    Wizard.prototype.canNavigate = function() {
        let response = true;

        const collection = this.pages.getControlsFromCurrent();
        for (const control of collection) {
            if (!control.validity.valid) {
                control.classList.add(styles.hasError);
                response = false;
            }
        }
        
        return response;
    }

    
    Wizard.prototype.updateProgressBar = function(percentage = 0) {
        if (!this.progressBar) {
            return;
        }
        this.progressBar.style.transform = `scaleX(${percentage === 0 ? '0.01' : percentage})`;
    }

    Wizard.prototype.addEvents = function() {
        const controlsCollection = getControlsCollection(this);
        for (const name of controlsCollection) {
            const control = this.controls[name];
            control.onkeyup = function() {
                control.classList.remove(styles.hasError);
            };
            control.onchange = function() {
                control.classList.remove(styles.hasError);
            }
        }

        const thiss = this;
        const form = new FormHandler(this.form);
        form.subscribe({
            onSuccess: (response) => {
                thiss.subscriptor(response);
                thiss.reset();
            },
            onError: (message) => {
                thiss.errorSubscriptor(message);
                thiss.reset();
            }
        });
    }

    Wizard.prototype.subscribe = function(subscriptor, errorSubscriptor) {
        if (!isFunction(subscriptor)) {
            throwError(`Subscriptor ${subscriptor} must to be a valid function.`);
        }
        this.subscriptor = subscriptor;

        if (!isFunction(errorSubscriptor)) {
            this.subscriptor = undefined;
            throwError(`Error Subscriptor ${errorSubscriptor} must to be a valid function.`);
        }
        this.errorSubscriptor = errorSubscriptor;
    }

    Wizard.prototype.reset = function() {
        this.pages.setCurrentByIndex(0);
    }
    
    function Pages(core) {
        this.core = core;
        this.collection = [];
        this.length = 0;
        this.first = '';
        this.last = '';
        this.current = {};
        this.progressPercent = 0;
    }

    Pages.prototype.count = function() {
        return this.collection.length;
    }

    Pages.prototype.add = function(page) {
        if (!this.first) {
            this.first = page.name;
            page.isFirst = true;
            this.current = page;
        }
        this.collection.push(page);
        this.last = page.name;
    }

    Pages.prototype.forward = function() {
        const index = this.current.index + 1;

        if (index >= this.length) {
            submitForm(this.core.form);
            return;
        }

        this.setCurrentByIndex(index);
    }

    Pages.prototype.backward = function() {
        const index = this.current.index - 1;
        if (index < 0) {
            return;
        }

        this.setCurrentByIndex(index);
    }

    Pages.prototype.render = function() {
        this.current.page.classList.add(styles.isActive);
        this.core.updateProgressBar(this.progressPercent);
        this.core.navigation.mutateForwardButton(this.current.isLast);

        if (this.current.isFirst) {
            this.core.navigation.hideBackward();
        }
        else {
            this.core.navigation.showBackward();
        }
    }

    Pages.prototype.setCurrentByIndex = function(index) {
        this.current.page.classList.remove(styles.isActive);
        this.current = this.collection.find(page => page.index === index);

        this.progressPercent = this.current.index / this.length;
        
        this.render();
    }

    Pages.prototype.finishMap = function() {
        this.collection.find(page => page.name === this.last).isLast = true;
        this.length = this.collection.length;
    }

    Pages.prototype.getControlsFromCurrent = function() {
        return [...this.current.page.querySelectorAll(createQuery(Attributes.formControl))];
    }
    
    function Navigation(core, controls) {
        this.core = core;
        this.forward = controls.forward;
        this.backward = controls.backward;
        
        this.bindEvents();
    }

    Navigation.prototype.bindEvents = function() {
        const thiss = this;
        this.forward.onclick = function(event) {
            if (thiss.core.canNavigate()) {
                thiss.core.pages.forward();
            }
        }

        this.backward.onclick = function(event) {
            thiss.core.pages.backward();
        }
    }

    Navigation.prototype.hideBackward = function() {
        this.backward.classList.remove(styles.isActive);
    }

    Navigation.prototype.showBackward = function() {
        this.backward.classList.add(styles.isActive);
    }

    Navigation.prototype.mutateForwardButton = function(islast = false) {
        this.forward.textContent = this.forward.getAttribute((islast) ? 'final-label' : 'default-label');
    }
    
    return Wizard;
})();

export default Wizard;