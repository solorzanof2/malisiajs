# MalisiaJS - CHANGELOG

## Versions
**1.1.1**
- implemented binded event to store mapped from mutations methods;
- implemented observable document click event;

**1.2.1**
- implemented new element attribute `mrn` instead of traditionals attributes. `ng-id`, `ng-group`, `ng-wizard`, `ng-model`, `ng-bind`;
- added `selector` and `selectorAll` to `Malisia.prototype`;
- fixed `debug` command for `npm run`;
- added data and custom event to `Malisia.prototype.emit`;
- fixed bug in dom handler object;
- moved to object About Malisia Info;
- added `NotifyPropertyChange` as registered event in `Store.prototype.initialize` method;
- fixed bug in SubjectEvent, moved the subscriptors collection as a single attribute;
- added new extension called `functions`;
- added `debounce` method to `functions` extension;
- added an state verificator on `store.dispatch` invokation, for prevent updating the state if some dispatching is not returning an state;
- added `eventArgs` arguments for `store.dispatch` event invokation in order to get the original data that is dispatching the event;
- added method `getStateValue` to `store` object, for retrieve a specific property value from state object;


