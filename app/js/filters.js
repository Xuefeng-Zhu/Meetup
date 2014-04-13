'use strict';

/* Filters */

angular.module('myApp.filters', [])
.filter('eventFilter', ['$routeParams', function($routeParams) {
  return function(input, complete) {
    var filtered = {};
    var list = $routeParams["list"];
    var search = $routeParams["search"];
    angular.forEach(input, function(event, id){
      if (event == null){
        return;
      }
      if (complete){
        if (event.complete && (list=="All" || event.category == list)){

          if (search){
            if (event.concise.indexOf(search) != -1){
              filtered[id] = event;
            }
          }
          else{
            filtered[id] = event;
          }
        }
      }
      else{
        if (!event.complete && (list=="All" || event.category == list)){
          if (search){
            if (event.concise.indexOf(search) != -1){
              filtered[id] = event;
            }
          }
          else{
            filtered[id] = event;
          }
        }
      }
    });
    return filtered;
  }
}])
.filter('publicFilter', ['$routeParams', function($routeParams) {
  return function(input) {
    var filtered = {};
    var search = $routeParams["search"];
    angular.forEach(input, function(event, id){
      if (event == null){
        return;
      }

      if (event.concise){
        if (search){
          if (event.concise.toLowerCase().indexOf(search.toLowerCase()) != -1){
            filtered[id] = event;
          }
        }
        else{
          filtered[id] = event;
        }
      }

    });
    return filtered;
  }
}]);


