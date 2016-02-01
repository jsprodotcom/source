/*
    Global objects:
        1. Browser objects like alert, localStorage, etc
        2. Third party library objects
*/

angular.module('moduleUsingGlobalObjs',[])
    .factory('localStorageFactory', function($window) {
        function getFromStorage(id) {
            return $window.localStorage.getItem(id);
        }

        function setToStorage(id, value) {
            $window.localStorage.setItem(id, value);
        }

        return{
            getFromStorage:getFromStorage,
            setToStorage:setToStorage
        };
    })
    .constant('toastr',toastr)
    .factory('toastrFactoryWindow', function(toastr){
        function showWarning(message) {
            toastr.warning(message);
        }

        function showError(message) {
            toastr.error(message);
        }

        return{
            showWarning: showWarning,
            showError: showError
        };
    });
