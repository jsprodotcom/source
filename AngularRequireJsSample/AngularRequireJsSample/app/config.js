define([],function(){
    'use strict';

    function config($routeProvider) {
        $routeProvider.when('/home', {templateUrl: 'templates/home.html', controller: 'ideasHomeController'})
            .when('/details/:id',{templateUrl:'templates/ideaDetails.html', controller:'ideaDetailsController'})
            .otherwise({redirectTo: '/home'});
    }

    config.$inject=['$routeProvider'];

    return config;
});