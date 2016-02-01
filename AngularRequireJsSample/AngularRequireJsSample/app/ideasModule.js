define(['app/config',
        'app/ideasDataSvc',
        'app/ideasHomeController',
        'app/ideaDetailsController'],
    function(config, ideasDataSvc, ideasHomeController, ideaDetailsController){
    'use strict';

    var app = angular.module('ideasApp', ['ngRoute','ngResource','ngGrid']);

    app.config(config);
    app.factory('ideasDataSvc',ideasDataSvc);
    app.controller('ideasHomeController', ideasHomeController);
    app.controller('ideaDetailsController',ideaDetailsController);
});