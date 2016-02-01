describe('mocking promise', function(){
    var passPromise, mockDataSourceSvc, rootScope, dataSvcObj;

    beforeEach(function(){
        module('moduleUsingPromise');

        module(function($provide){
            $provide.factory('dataSourceSvc', function($q){
                var getAllItems=jasmine.createSpy('getAllItems').andCallFake(function() {
                    var items = [];
                    if (passPromise) {
                        return $q.when(items);
                    }
                    else {
                        return $q.reject('something went wrong');
                    }
                });

                return {
                  getAllItems:getAllItems
                };
            });
        });

        inject(function($rootScope, dataSourceSvc, dataSvc){
            rootScope=$rootScope;
            mockDataSourceSvc=dataSourceSvc;
            dataSvcObj=dataSvc;
        });
    });

    it('should resolve promise', function(){
        passPromise=true;

        var items;
        dataSvcObj.getData().then(function(data){
            items=data;
        });
        rootScope.$digest();

        expect(mockDataSourceSvc.getAllItems).toHaveBeenCalled();
        expect(items).toEqual([]);
    });

    it('should reject promise', function(){
        passPromise=false;

        var error;
        dataSvcObj.getData().then(null, function(e){
            error=e;
        });
        rootScope.$digest();

        expect(mockDataSourceSvc.getAllItems).toHaveBeenCalled();
        expect(error).toEqual('something went wrong');
    });
});
