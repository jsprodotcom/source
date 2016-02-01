describe('mocking service', function(){
    var isNumber, sampleSvcObj, mockedUtilSvc;

    beforeEach(function(){
        spyCheckForNumber = jasmine.createSpy('checkForNumber').andCallFake(
            function(data) {
                return isNumber;
            });

        module('mockingServices');

        module(function($provide){
            $provide.service('util', function(){
                this.isNumber = jasmine.createSpy('isNumber').andCallFake(function(num){
                    //a fake implementation
                });
                this.isDate = jasmine.createSpy('isDate').andCallFake(function(date){
                    //a fake implementation
                });
            });
        });

    });

    beforeEach(inject(function(util){
        mockedUtilSvc=util;
    }));

    it('should have mocked utilSvc', function(){
        expect(mockedUtilSvc.isNumber).not.toBe(undefined);
        expect(mockedUtilSvc.isNumber.calls).not.toBe(undefined);

        expect(mockedUtilSvc.isDate).not.toBe(undefined);
        expect(mockedUtilSvc.isDate.calls).not.toBe(undefined);
    });
});