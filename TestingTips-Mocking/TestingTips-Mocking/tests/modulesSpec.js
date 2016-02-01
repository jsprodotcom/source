describe('mocking module', function(){
    var sampleSvc;

    beforeEach(function(){
        angular.module('second',[]);
        angular.module('third',[]);

        module('first');

        module(function($provide){
            $provide.service('utilSvc', function(){
                //Mocking utilSvc
            });

            $provide.service('storageSvc', function(){
                //Mocking storageSvc
            });
        });

        inject(function(_sampleSvc_){
            sampleSvc=_sampleSvc_;
        });
    });

    it('should load first and its service', function(){
        expect(sampleSvc).toBeDefined();
    });
});