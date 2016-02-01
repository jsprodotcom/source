angular.module('mockingServices',[])
  .service('util', function(){
      this.isNumber = function(num){
        return !isNaN(num);
      };

      this.isDate = function(date){
        return (date instanceof Date);
      };
  });