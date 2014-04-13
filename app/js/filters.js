'use strict';

/* Filters */

angular.module('myApp.filters', []).
  filter('eventFilter', ['$routeParams', function($routeParams) {
    return function(input, complete) {
      var filtered = {};
      var list = $routeParams["list"];
      angular.forEach(input, function(event, id){
        if (event == null){
          return;
        }
      	if (complete){
      		if (event.complete && (list=="All" || event.category == list)){
      			filtered[id] = event;
      		}
      	}
      	else{
      		if (!event.complete && (list=="All" || event.category == list)){
      			filtered[id] = event;
      		}
      	}
      });
      return filtered;
    }
  }]);


