var todoApp=angular.module('todoApp',[]);

todoApp.controller('TodoController', function($scope,notesFactory) {
      
	 $scope.notes=notesFactory.get();
	
	 $scope.$on("newNote", function(event) {
	  $scope.notes=notesFactory.get();
	 });

	
	 $scope.createNote=function(){
		  notesFactory.put($scope.note);
		  $scope.note="";
	 }
});
 
todoApp.directive('customColor', function () {
  return {
    restrict: 'A',
    link: function (scope, elem, attrs) {
      elem.css({"background-color":attrs.customColor});
    }
  }
});
 
todoApp.filter('truncate',function(){
	return function(input,length){
		return (input.length>length?input.substring(0,length):input);
	};
}); 
 
todoApp.factory('notesFactory',function($rootScope){
       return {
              put:function(note){
                localStorage.setItem('todo'+(Object.keys(localStorage).length+1),note);
				$rootScope.$broadcast("newNote");
              },
              get:function(){
					var notes=[];
                    var keys=Object.keys(localStorage);
					for(var i=0;i<keys.length;i++){
						notes.push(localStorage.getItem(keys[i]));
					}
                    return notes;
              }
       }
});  