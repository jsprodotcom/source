describe('mocking global objects', function() {
    var window, localStorageFactoryObj;

    beforeEach(function () {
        module('moduleUsingGlobalObjs');
    });

    describe('mocking localStorage', function () {
        beforeEach(function () {
            inject(function ($window, localStorageFactory) {
                window = $window;
                localStorageFactoryObj = localStorageFactory;

                spyOn(window.localStorage, 'getItem');
                spyOn(window.localStorage, 'setItem');
            });
        });

        it('should have mocked getItem and setItem methods of local storage', function () {
            expect(window.localStorage.getItem.calls).toBeDefined();
            expect(window.localStorage.setItem.calls).toBeDefined();
        });
    });

    describe('mocking toastr', function () {
        var toastrObj;
        beforeEach(function () {
            module(function ($provide) {
                $provide.constant('toastr', {
                    warning: jasmine.createSpy('warning'),
                    error: jasmine.createSpy('error')
                });
            });
        });

        beforeEach(inject(function(toastr){
            toastrObj=toastr;
        }));

        it('toastr methods should have been mocked', function () {
            expect(toastrObj.warning).toBeDefined();
            expect(toastrObj.error).toBeDefined();
            expect(toastrObj.warning.calls).toBeDefined();
            expect(toastrObj.error.calls).toBeDefined();
        });
    });
});
