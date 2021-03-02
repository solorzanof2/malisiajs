

var Tabele = (function() {

    const defaultPaginationOptions = [5, 10, 25, 50, 100];
    const defaultPaginationPerPage = 10;
    const defaultPlaceholder = 'No registers found.';
    const defaultSelector = '#tabele';
    const typesCollection = {
        label: 'label',
        template: 'template',
    };
    
    const createRow = () => createElement('tr');
    const createColumn = () => createElement('td');
    const createHeadColumn = () => createElement('th');
    const createDiv = () => createElement('div');
    const createElement = (element) => document.createElement(element);
    
    function Tabele(props) {
        this.props = props;
        this.selector = '';
        this.container = '';
        this.data = [];
        this.columns = [];
        this.pagination = {};
        this.placeholder = '';
        this.classList = '';
        this.table = '';
        this.totalPages = 0;
        this.currentPage = 1;
        this.rowLength = 0;
        this.methods = {};
        this.paginationControl = {};
        this.source = [];

        this.initialize();
    }
    
    Tabele.prototype.initialize = function() {
        let selector = defaultSelector;
        if (this.props.selector) {
            if (!String(selector).startsWith('#')) {
                selector = `#${selector}`;
            }
        }
        const childPointer = document.querySelector(selector) || null;
        if (!childPointer) {
            throw new Error('Provide a valid element selector.');
        }
        this.selector = selector;

        this.container = childPointer.parentNode;
        this.container.removeChild(childPointer);

        this.data = this.props.data ?? [];
        this.source = this.props.data ?? [];

        if (!this.props.columns || !this.props.columns.length) {
            throw new Error('Provide columns information.');
        }
        this.columns = this.props.columns;

        this.pagination = {
            perPage: this.props.pagination.perPage ?? defaultPaginationPerPage,
            options: this.props.pagination.options ?? defaultPaginationOptions,
        };

        this.placeholder = this.props.placeholder ?? defaultPlaceholder;

        if (typeof this.props.classList === 'string') {
            this.classList = this.props.classList;
        }

        if (Array.isArray(this.props.classList)) {
            this.classList = this.props.classList.map(clazz => clazz).join(' ');
        }

        this.table = document.createElement('table');
        this.table.classList = this.classList;

        this.wrapper = createDiv();
        this.wrapper.classList = "tabele";
        
        this.calculateTotalPages();
        this.methods = this.props.methods;
        this.paginationControl = new TabelePagination({ 
            totalPages: this.totalPages,
            tabele: this,
            previousButtonText: this.props.navLabels.previous,
            nextButtonText: this.props.navLabels.next,
        });

        this.createHeader();
        this.buildContent(this.currentPage);
        this.render();
    }

    Tabele.prototype.addDataRow = function(data) {
        this.data.push(data);
        this.source = this.data;
    }

    Tabele.prototype.rowIsVisible = function() {
        return (this.data.length < this.pagination.perPage
        || (this.currentPage === this.totalPages
            && this.rowLength < this.pagination.perPage));
    }
    
    Tabele.prototype.calculateTotalPages = function() {
        this.totalPages = Math.ceil(this.source.length / this.pagination.perPage);
    }

    Tabele.prototype.columnsCount = function() {
        return this.columns.length;
    }

    Tabele.prototype.isTemplate = function(column) {
        return (column.type && column.type === typesCollection.template);
    }

    Tabele.prototype.render = function() {
        this.createTopContainer();
        this.createBodyContainer();
        this.createFooterContainer();
        
        this.container.appendChild(this.wrapper);
    }
    
    Tabele.prototype.createHeader = function() {
        const head = this.table.createTHead();
        const headRow = createRow();
        
        // map columns
        for (const column of this.columns) {
            let headColumn = createHeadColumn();
            headColumn.innerText = column.header;
            headColumn.setAttribute('ng-column', column.header);
            headColumn.setAttribute('ng-field', column.field);
            
            if (column.style) {
                Object.keys(column.style).forEach(property => {
                    headColumn.style[property] = column.style[property];
                });
            }

            headRow.appendChild(headColumn);
        }
        head.appendChild(headRow);

        this.body = this.table.createTBody();
    }

    Tabele.prototype.createTopContainer = function() {
        const select = createElement('select');
        select.classList = 'tabele-control';

        for (const value of this.pagination.options) {
            const option = createElement('option');
            option.value = value;
            option.textContent = value;
            select.appendChild(option);
        }

        const thiz = this;
        select.onchange = function() {
            thiz.pagination.perPage = this.value;
            thiz.calculateTotalPages();
            thiz.paginationControl.preRender(thiz.currentPage);
        }

        const perPage = createDiv();
        perPage.classList = 'per-page';
        perPage.appendChild(select);
        
        const input = createElement('input');
        input.type = 'text';
        input.classList = 'tabele-control';
        input.placeholder = 'Insert any value for search.';
        input.required = true;
        input.name = 'filterInput';
        input.oninput = function() {
            thiz.applyFilter(this.value);
        }

        const formGroup = createDiv();
        formGroup.classList = 'form-group';
        formGroup.appendChild(input);
        
        const formWrapper = createDiv();
        formWrapper.classList = 'form-wrapper';
        formWrapper.appendChild(formGroup);

        const topPanel = createDiv();
        topPanel.classList = 'tabele-top-panel';
        topPanel.appendChild(perPage);
        topPanel.appendChild(formWrapper);

        this.wrapper.appendChild(topPanel);
    }

    Tabele.prototype.createBodyContainer = function() {
        this.wrapper.appendChild(this.table);
    }
    
    Tabele.prototype.createFooterContainer = function() {
        const footer = createDiv();
        footer.classList.add('tabele-pagination');

        footer.appendChild(this.paginationControl.render(this.currentPage));

        this.wrapper.appendChild(footer);
    }

    Tabele.prototype.applyFilter = function(needle = '') {
        if (needle) {
            this.source = this.data.filter(item => {
                for(const property of Object.keys(item)) {
                    let lowercase = String(needle).toLowerCase();
                    if (String(item[property]).toLowerCase().includes(lowercase)) {
                        return true;
                    }
                }
                return false;
            });
        }
        else {
            this.source = this.data;
        }
        this.calculateTotalPages();
        this.paginationControl.preRender(1);
    }
    
    Tabele.prototype.buildContent = function(page) {
        const from = (page * this.pagination.perPage) - this.pagination.perPage;
        const to = (page * this.pagination.perPage);

        this.body.innerHTML = '';

        // map data
        if (!this.source.length) {
            let row = createRow();
            row.classList = 'empty-row';
            row.style.cursor = 'pointer';
            
            let rowCell = createColumn();
            rowCell.setAttribute('colspan', this.columnsCount());
            rowCell.innerText = this.placeholder;
            rowCell.style.textAlign = 'center';
            rowCell.style.color = '#888888';

            row.appendChild(rowCell);
            this.body.appendChild(row);
            return;
        }

        let collection = this.source.slice(from, to);
        this.rowLength = collection.length;
        let index = 0;
        for (const data of collection) {
            this.buildRow(data, index);
            index++;
        }
    }

    Tabele.prototype.buildRow = function(data, index) {
        let row = createRow();
        row.id = `row-${data.id || index}`;
        row.dataset.id = data.id || index;
        row.style.cursor = 'pointer';
        row.dataset.index = index;

        let columnIndex = 0;
        for (const column of this.columns) {
            let rowCell = createColumn();
            rowCell.setAttribute('column-name', `${data.id || columnIndex}-${column.field || column.type}`);

            if (this.isTemplate(column)) {
                for (const component of column.templates) {
                    const element = convertToNode(component.template);
                    element.setAttribute('ng-listener-click', '');
                    element.dataset.id = data.id || index;
                    
                    Object.keys(component.methods).forEach(property => {
                        element[property] = component.methods[property];
                    });
                    rowCell.appendChild(element);
                }
            }
            else {
                rowCell.textContent = data[column.field] || '';
            }

            if (column.style) {
                Object.keys(column.style).forEach(property => {
                    rowCell.style[property] = column.style[property];
                });
            }

            row.appendChild(rowCell);
            columnIndex++;
        }

        if (Object.keys(this.methods).length) {
            if (this.methods['rowClick']) {
                this.addRowClick(row, this.methods.rowClick);
            }
        }
        
        this.body.appendChild(row);
    }
    
    Tabele.prototype.addRowClick = function(row, callback) {
        const thiz = this;
        row.onclick = function(event) {
            if (event.target.parentNode.tagName !== 'TR') {
                return;
            }
            const { dataset: { id } } = event.target.parentNode;
            const data = thiz.data.find(item => String(item.id) === id);
            callback({ data, id });
        }
    }

    Tabele.prototype.add = function(data) {
        if (this.rowIsVisible()) {
            this.buildRow(data, this.source.length);
        }
        this.addDataRow(data);
    }

    Tabele.prototype.remove = function(id, beforeDelete) {
        const data = this.data.find(dataRow => dataRow.id === id);
        if (typeof beforeDelete === 'function') {
            const proceed = beforeDelete(data);
            if (!proceed) {
                return;
            }
        }
        if (this.rowIsVisible()) {
            const row = this.body.querySelector(`#row-${id}`);
            row.parentNode.removeChild(row);
            const index = this.data.findIndex(dataRow => dataRow.id === id);
            this.data.splice(index, 1);
            
            const sourceIndex = this.source.findIndex(element => element.id === id);
            if (sourceIndex) {
                this.source.splice(sourceIndex, 1);
            }
        }
    }

    Tabele.prototype.update = function(data) {
        const index = this.data.findIndex(element => element.id === data.id);
        if (index === -1) {
            return;
        }
        this.data[index] = data;
        if (this.rowIsVisible()) {
            const row = this.body.querySelector(`#row-${data.id}`);
            for (const column of this.columns) {
                if (this.isTemplate(column)) {
                    continue;
                }
                const tableColumn = row.querySelector(`[column-name="${data.id}-${column.field}"]`);
                tableColumn.textContent = data[column.field];
            }
        }
    }
    
    /**
     * ### Move this to Malisia dom class
     * @param {*} template 
     */
    const convertToNode = function(template) {
        const div = createElement('div');
        div.innerHTML = template;
        return div.firstElementChild;
    }
    
    function TabelePagination(props) {
        this.tabele = props.tabele;
        this.previousButtonText = props.previousButtonText ?? 'Prev';
        this.nextButtonText = props.nextButtonText ?? 'Next';
        this.container = createElement('ul');
        this.updateList = false;
    }

    TabelePagination.prototype.addToContainer = function(element) {
        this.container.appendChild(element);
    }

    TabelePagination.prototype.clearContainer = function() {
        this.container.innerHTML = '';
    }

    TabelePagination.prototype.preRender = function(page) {
        if (page > this.tabele.totalPages) {
            page = this.tabele.totalPages;
        }
        this.updateList = true;
        this.render(page);
    }

    TabelePagination.prototype.render = function(page) {
        this.clearContainer();

        let before = page - 1;
        let after = page + 1;
        const totalPages = this.tabele.totalPages;

        if (page > 1) {
            this.addToContainer(this.previousButton(page - 1));
        }

        if (page > 2) {
            this.addToContainer(this.pageButton(1));
            if (page > 3) {
                this.addToContainer(this.ellipsis());
            }
        }

        if (page === totalPages) {
            before -= 2;
        }
        else {
            if (page === totalPages - 1) {
                before -= 1;
            }
        }

        if (before <= 0) {
            before = 0;
        }

        if (page === 1) {
            after += 2;
        }
        else {
            if (page === 2) {
                after += 1;
            }
        }

        for (let index = before; index <= after; index++) {
            if (index > totalPages) {
                continue;
            }

            if (index === 0) {
                index += 1;
            }

            this.addToContainer(this.pageButton(index, (page === index)));
        }

        if (page < totalPages - 1) {
            if (page < totalPages - 2) {
                this.addToContainer(this.ellipsis());
            }
            this.addToContainer(this.pageButton(totalPages));
        }

        if (page < totalPages) {
            this.addToContainer(this.nextButton(page + 1));
        }

        if (this.updateList) {
            this.tabele.currentPage = page;
            this.tabele.buildContent(page);
        }
        return this.container;
    }

    TabelePagination.prototype.previousButton = function(page) {
        const buttonTemplate = `
            <li class="bton prev" no-select>
                <span><i class="fas fa-angle-left"></i> ${this.previousButtonText}</span>
            </li>
        `;
        const button = convertToNode(buttonTemplate);
        const thiz = this;
        button.onclick = function() {
            thiz.preRender(page);
        }
        return button;
    }

    TabelePagination.prototype.nextButton = function(page) {
        const buttonTemplate = `
            <li class="bton next" no-select>
                <span>${this.nextButtonText} <i class="fas fa-angle-right"></i></span>
            </li>
        `;
        const button = convertToNode(buttonTemplate);
        const thiz = this;
        button.onclick = function() {
            thiz.preRender(page);
        }
        return button;
    }

    TabelePagination.prototype.ellipsis = function() {
        return convertToNode(`<li class="dots" no-select><span>...</span></li>`);
    }

    TabelePagination.prototype.pageButton = function(page, isActive = false) {
        const template = `<li class="index ${(isActive) ? 'active' : ''}" no-select><span>${page}</span></li>`;
        const button = convertToNode(template);
        if (!isActive) {
            const thiz = this;
            button.onclick = function() {
                thiz.preRender(page);
            }
        }
        return button;
    }
    
    return Tabele;
})();

export default Tabele;