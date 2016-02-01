angular.module('mockingProviders',[])
  .provider('sample', function(){
    var registeredVals=[];
    this.register = function(val){
      registeredVals.push(val);
    };

    this.$get = function(){
      function getRegisteredVals(){
        return registeredVals;
      }

      return {
        getRegisteredVals:getRegisteredVals
      };
    };
  });
