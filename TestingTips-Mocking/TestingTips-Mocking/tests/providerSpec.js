describe('mocking provider', function(){
  var mockUtilProvider, sampleProvider;

  beforeEach(function () {
    module('mockingProviders');

    module(function ($provide) {
      $provide.provider('sample', function(){
        this.register = jasmine.createSpy('register');

        this.$get = function() {
          var getRegisteredVals = jasmine.createSpy('getRegisteredVals');

          return{
            getRegisteredVals: getRegisteredVals
          };
        };
      });
    });

    module(function (sampleProvider) {
      sampleProviderObj=sampleProvider;
    });

    inject();
  });

  it('should have mocked sampleProvider', function(){
    expect(sampleProviderObj.register).toBeDefined();
    expect(sampleProviderObj.register.calls).toBeDefined();
  });
});
