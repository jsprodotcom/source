angular.module('first', ['second', 'third'])
    //util and storage are defined in second and third respectively
    .service('sampleSvc', function(utilSvc, storageSvc){
        //Service implementation
    });
