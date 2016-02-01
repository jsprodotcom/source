angular.module('moduleUsingPromise', [])
    .factory('dataSvc', function(dataSourceSvc, $q){
        function getData() {
            var deferred = $q.defer();

            dataSourceSvc.getAllItems().then(function (data) {
                deferred.resolve(data);
            }, function (error) {
                deferred.reject(error);
            });

            return deferred.promise;
        }

        return{
            getData:getData
        };
    });
