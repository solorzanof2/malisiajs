import { throwError } from './throws.js';


var startsWithHash = function(query) {
    return String(query).startsWith('#');
}

var startsWithDot = function(query) {
    return String(query).startsWith('.');
}

var isBracketsQuery = function(query) {
    return (/[\[\]]/.test(query));
}

var selector = function(query) {
    return selectorFrom(document, query);
}

var selectorFrom = function(element, query) {
    if (!isBracketsQuery(query) && !startsWithHash(query)) {
        query = `#${query}`;
    }
    return element.querySelector(query) || null;
}

var selectorAll = function(query) {
    return selectorAllFrom(document, query);
}

var selectorAllFrom = function(element, query) {
    if (startsWithHash(query)) {
        throwError(`Selector All, for element ${query}, cannot starts with '#'`);
    }
    if (!isBracketsQuery(query) && !startsWithDot(query)) {
        query = `.${query}`;
    }
    return Array.from(element.querySelectorAll(query)) || null;
}

export { selector, selectorAll, selectorFrom, selectorAllFrom }