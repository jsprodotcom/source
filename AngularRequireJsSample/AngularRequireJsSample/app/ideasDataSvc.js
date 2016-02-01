define([], function(app){
    'use strict';

    function factoryFunc($http, $resource){
        var Ideas;

        Ideas=$resource('/api/ideas/:id',{id:'@id'});

        var svc= {
            allIdeas: allIdeas,
            ideaDetails: ideaDetails
        };

        return svc;

        function allIdeas(){
            return Ideas.query().$promise;
        }

        function ideaDetails(id){
            return Ideas.get({id:id}).$promise;
        }
    }

    factoryFunc.$inject=['$http','$resource'];

    return factoryFunc;
});
