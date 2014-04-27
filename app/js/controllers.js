'use strict';

/* Controllers */

var url = "https://meetup2014.firebaseIO.com";
angular.module('myApp.controllers', ['firebase','ngCookies'])
.controller('userCtrl', ["$scope", "$rootScope", "$firebase", "$firebaseSimpleLogin", "$cookies", function($scope, $rootScope, $firebase,$firebaseSimpleLogin, $cookies) {
	
	var ref = new Firebase(url + "/Users");
	$scope.users = $firebase(ref);
	$rootScope.auth = $firebaseSimpleLogin(ref);

	$rootScope.$watch('auth.user', upload, true);

	$scope.logout = function(){
		$rootScope.auth.$logout();
	}

	function upload(){
		if (!$rootScope.auth.user){
			return;
		}
		var id = $rootScope.auth.user.id;
		if (!$cookies.id){
			var email = $scope.auth.user.email;
			var pic = "https://graph.facebook.com/" + id + "/picture";
			var name = $scope.auth.user.name;
			$scope.users.$child(id).$set({email:email, pic:pic, Username: name});
			ref = new Firebase(url + "/Private/" + id +"/categories");
			ref.child("All").set({name: "All", number: 0});
			$cookies.id = $rootScope.auth.user.id;
		}
	};

}])  
.controller('listCtrl', ["$scope", "$rootScope", "$firebase", "$cookies", function($scope, $rootScope, $firebase, $cookies) {
	

	getCategories();

	$scope.selectLid = null;
	$scope.PrvLflag = false;

	
	$scope.selectList = function(lid){
		$scope.selectLid = lid;
	};

	$scope.addPrvL = function(){
		$scope.PrvLflag = true;
	};

	$scope.cancelPrvL = function(){
		$scope.PrvLflag = false;
		$scope.newList = "";
	};

	$scope.savePrvl = function(e){
		if (e.keyCode != 13 || $scope.newList == ""){
			return;
		}
		$rootScope.prvCs.$child($scope.newList).$set({name: $scope.newList, number: 0});
		$scope.cancelPrvL();
	};


	function getCategories(){
		var ref = new Firebase(url + "/Private/" + $cookies.id + "/categories");
		$rootScope.prvCs = $firebase(ref);
	}
}])  
.controller('PrivateCtrl', ["$scope", "$rootScope", "$firebase", "$cookies", "$routeParams", function($scope, $rootScope, $firebase, $cookies, $routeParams) {

	$scope.concise = "";
	$scope.selectEvent = null;
	$scope.selectID = null;
	var category = $routeParams["list"];
	$scope.search = $routeParams["search"];

	getEvents();

	$scope.picker = new Pikaday(
	{
		field: $('#datepicker')[0],
		firstDay: 1,
		minDate: new Date(),
		maxDate: new Date('2020-12-31'),
		onSelect: function() {
			if (!$scope.concise || $scope.concise == "")
			{
				alert("Please input event information");
				return;
			}

			$scope.events.$add({concise: $scope.concise, date: this.toString(), complete: false, category: category});

			if (category != "All"){
				$rootScope.prvCs[category]["number"]++;
				$rootScope.prvCs.$save(category);
			}
			$rootScope.prvCs["All"]["number"]++;
			$rootScope.prvCs.$save("All");
			$scope.concise = "";
			this.gotoToday();
		}
	});

	$scope.picker2 = new Pikaday(
	{
		field: $('#datepicker2')[0],
		firstDay: 1,
		minDate: new Date(),
		maxDate: new Date('2020-12-31'),
	});

	$scope.toggleCompleted = function(id){
		setTimeout(function() {
			var event = $scope.events[id];
			event.complete = !event.complete;
			$scope.events.$save(id);
			if (event.complete)
			{
				if (category != "All"){
					$rootScope.prvCs[category]["number"]--;
					$rootScope.prvCs.$save(category);
				}
				$rootScope.prvCs["All"]["number"]--;
				$rootScope.prvCs.$save("All");
			}
			else{
				if (category != "All"){
					$rootScope.prvCs[category]["number"]++;
					$rootScope.prvCs.$save(category);
				}
				$rootScope.prvCs["All"]["number"]++;
				$rootScope.prvCs.$save("All");
			}

		}, 200);

	};

	$scope.addEvent = function(){
		var concise = $scope.concise.trim();
		if (concise == "") {
			alert("Please input event information");
			return;
		}
		$scope.events.$add({concise: concise, date: $scope.picker.toString(), complete: false});
		if (category != "All"){
			$rootScope.prvCs[category]["number"]++;
			$rootScope.prvCs.$save(category);
		}
		$rootScope.prvCs["All"]["number"]++;
		$rootScope.prvCs.$save("All");

		$scope.picker.gotoToday();
		$scope.concise = '';
	}

	$scope.removeEvent = function(id){
		$scope.events.$remove(id);
	};

	$scope.showEvent = function(id){
		$scope.selectEvent = $scope.events[id];
		$scope.originalEvent = angular.extend({}, $scope.selectEvent);
		$scope.selectID = id; 
		$scope.picker2.setDate($scope.selectEvent.date);
		$('.overlay.sidebar') .sidebar({
			overlay: true})
		.sidebar('toggle');
	};

	$scope.publishEvent = function(){
		$scope.pCategory = "Category";
		$('.basic.modal')
		.modal('setting', {
			closable  : true,
			onDeny    : function(){

			},
			onApprove : function() {
				if ($scope.pCategory == "Category")
				{
					alert("Please choose the Category to add");
					return false;
				}

				var ref = new Firebase(url + "/Public/events/" + $scope.pCategory);
				$firebase(ref).$child($scope.selectID).$set($scope.selectEvent);
				var ref = new Firebase(url + "/Public/events/New");
				$firebase(ref).$child($scope.selectID).$set($scope.selectEvent);
				var ref = new Firebase(url + "/Collaborating/events");
				$firebase(ref).$child($scope.selectID).$set($scope.selectEvent);

				var ref = new Firebase(url + "/Collaborating/users/" + $cookies.id);
				$firebase(ref).$add($scope.selectID);

			}
		})
		.modal('show')
		;

		$('.ui.dropdown')
		.dropdown('setting',{
			onChange :function(value, text){
				$scope.pCategory = text;
			}
		});
	}

	$scope.saveEvent = function(){
		$scope.events.$save($scope.selectID);
		$scope.selectEvent = null;
		$scope.originalEvent = null;
		$scope.selectID = null; 

		$('.overlay.sidebar') .sidebar({
			overlay: true})
		.sidebar('toggle');
	}

	$scope.cancelEvent = function(){
		$scope.events[$scope.selectID] = $scope.originalEvent;
		$scope.selectEvent = null;
		$scope.originalEvent = null;
		$scope.selectID = null; 

		$('.overlay.sidebar') .sidebar({
			overlay: true})
		.sidebar('toggle');
	}

	function getEvents(){
		var ref = new Firebase(url + "/Private/" + $cookies.id + "/events");
		$scope.events = $firebase(ref);
	}

	//typeahdead
	var substringMatcher = function(strs) {
		return function findMatches(q, cb) {
			var matches, substrRegex;

    // an array that will be populated with substring matches
    matches = [];

    // regex used to determine if a string contains the substring `q`
    substrRegex = new RegExp(q, 'i');

    // iterate through the pool of strings and for any string that
    // contains the substring `q`, add it to the `matches` array
    $.each(strs, function(i, str) {
    	if (substrRegex.test(str)) {
        // the typeahead jQuery plugin expects suggestions to a
        // JavaScript object, refer to typeahead docs for more info
        matches.push({ value: str });
	    }
	});

	    cb(matches);
	};
	};

	var categories = [];
	getCategories();

	function getCategories(){
		var ref = new Firebase(url + "/Public/categories");
		ref.on('value', function(snapshot){
			if(snapshot.val() !== null){
				snapshot.forEach(function(childSnapshot){
					categories.push(childSnapshot.val());
				});
			}
		});
	}

	$('#the-basics .typeahead').typeahead({
		hint: true,
		highlight: true,
		minLength: 1
	},
	{
		name: 'categories',
		displayKey: 'value',
		source: substringMatcher(categories)
	});

}])
.controller('CollabCtrl', ["$scope", "$rootScope", "$firebase", "$cookies", "$routeParams", function($scope, $rootScope, $firebase, $cookies, $routeParams) {

	$scope.selectEvent = null;
	$scope.selectID = null;
	var category = $routeParams["list"];
	$scope.search = $routeParams["search"];

	getEvents();

	$scope.showEvent = function(id){
		$("#meetup").click(TowTruck);
		$scope.selectEvent = $scope.events[id];
		$scope.originalEvent = angular.extend({}, $scope.selectEvent);
		$scope.selectID = id; 
		$('.overlay.sidebar') .sidebar({
			overlay: true})
		.sidebar('toggle');
	};

	$scope.addComment = function(){
		$scope.events.$child($scope.selectID).$child("comments").$add({ author: $rootScope.auth.user.name, pic:"https://graph.facebook.com/" + $cookies.id + "/picture", content: $scope.newComment});
		$scope.selectEvent = $scope.events.$child($scope.selectID);
		$scope.newComment = "";
	};


	$scope.cancelEvent = function(){
		$scope.events[$scope.selectID] = $scope.originalEvent;
		$scope.selectEvent = null;
		$scope.originalEvent = null;
		$scope.selectID = null; 

		$('.overlay.sidebar') .sidebar({
			overlay: true})
		.sidebar('toggle');
	}

	$scope.meetup = function(){

		$scope.pCategory = "Category";
		startdraw();

		$('#draw-modal')
		.modal('setting', {
			closable  : true,
		})
		.modal('show');

	}

	function startdraw() {
    //Set up some globals
    var pixSize = 8, lastPoint = null, currentColor = "000", mouseDown = 0;

    //Create a reference to the pixel data for our drawing.
    var pixelDataRef = new Firebase(url + "/temp");

    // Set up our canvas
    var myCanvas = document.getElementById('drawing-canvas');
    var myContext = myCanvas.getContext ? myCanvas.getContext('2d') : null;
    if (myContext == null) {
    	alert("You must use a browser that supports HTML5 Canvas to run this demo.");
    	return;
    }

    //Setup each color palette & add it to the screen
    var colors = ["fff","000","f00","0f0","00f","88f","f8d","f88","f05","f80","0f8","cf0","08f","408","ff8","8ff"];
    for (var c in colors) {
    	var item = $('<div/>').css("background-color", '#' + colors[c]).addClass("colorbox");
    	item.click((function () {
    		var col = colors[c];
    		return function () {
    			currentColor = col;
    		};
    	})());
    	item.appendTo('#colorholder');
    }

    //Keep track of if the mouse is up or down
    myCanvas.onmousedown = function () {mouseDown = 1;};
    myCanvas.onmouseout = myCanvas.onmouseup = function () {
    	mouseDown = 0; lastPoint = null;
    };

    //Draw a line from the mouse's last position to its current position
    var drawLineOnMouseMove = function(e) {
    	if (!mouseDown) return;

    	e.preventDefault();

      // Bresenham's line algorithm. We use this to ensure smooth lines are drawn
      var offset = $('canvas').offset();
      var x1 = Math.floor((e.pageX - offset.left) / pixSize - 1),
      y1 = Math.floor((e.pageY - offset.top) / pixSize - 1);
      var x0 = (lastPoint == null) ? x1 : lastPoint[0];
      var y0 = (lastPoint == null) ? y1 : lastPoint[1];
      var dx = Math.abs(x1 - x0), dy = Math.abs(y1 - y0);
      var sx = (x0 < x1) ? 1 : -1, sy = (y0 < y1) ? 1 : -1, err = dx - dy;
      while (true) {
        //write the pixel into Firebase, or if we are drawing white, remove the pixel
        pixelDataRef.child(x0 + ":" + y0).set(currentColor === "fff" ? null : currentColor);

        if (x0 == x1 && y0 == y1) break;
        var e2 = 2 * err;
        if (e2 > -dy) {
        	err = err - dy;
        	x0 = x0 + sx;
        }
        if (e2 < dx) {
        	err = err + dx;
        	y0 = y0 + sy;
        }
    }
    lastPoint = [x1, y1];
};
$(myCanvas).mousemove(drawLineOnMouseMove);
$(myCanvas).mousedown(drawLineOnMouseMove);

    // Add callbacks that are fired any time the pixel data changes and adjusts the canvas appropriately.
    // Note that child_added events will be fired for initial pixel data as well.
    var drawPixel = function(snapshot) {
    	var coords = snapshot.name().split(":");
    	myContext.fillStyle = "#" + snapshot.val();
    	myContext.fillRect(parseInt(coords[0]) * pixSize, parseInt(coords[1]) * pixSize, pixSize, pixSize);
    };
    var clearPixel = function(snapshot) {
    	var coords = snapshot.name().split(":");
    	myContext.clearRect(parseInt(coords[0]) * pixSize, parseInt(coords[1]) * pixSize, pixSize, pixSize);
    };
    pixelDataRef.on('child_added', drawPixel);
    pixelDataRef.on('child_changed', drawPixel);
    pixelDataRef.on('child_removed', clearPixel);
}

function getEvents(){
	var ref = new Firebase(url + "/Collaborating/users");
	$scope.eventIDs = $firebase(ref).$child($cookies.id);
	$scope.events = [];
	setTimeout(function(){
		for(var id in $scope.eventIDs){
			if (id.indexOf('$') == -1)
			{		
				ref = new Firebase(url + "/Collaborating/events/" + $scope.eventIDs[id]);
				$scope.events.push($firebase(ref));

			}
		}
	},1000)
}


}])
.controller('PublicCtrl', ["$scope", "$rootScope", "$firebase", "$cookies", "$routeParams", function($scope, $rootScope, $firebase, $cookies, $routeParams) {

	$scope.selectEvent = null;
	$scope.selectID = null;
	var category = $routeParams["list"];
	$scope.search = $routeParams["search"];

	getEvents();


	$scope.showEvent = function(id){
		$scope.selectEvent = $scope.events[id];
		$scope.originalEvent = angular.extend({}, $scope.selectEvent);
		$scope.selectID = id; 
		$('.overlay.sidebar') .sidebar({
			overlay: true})
		.sidebar('toggle');
	};

	$scope.addComment = function(){
		$scope.events.$child($scope.selectID).$child("comments").$add({ author: $rootScope.auth.user.name, pic:"https://graph.facebook.com/" + $cookies.id + "/picture", content: $scope.newComment});
		$scope.selectEvent = $scope.events.$child($scope.selectID);
		$scope.newComment = "";
	};


	$scope.cancelEvent = function(){
		$scope.events[$scope.selectID] = $scope.originalEvent;
		$scope.selectEvent = null;
		$scope.originalEvent = null;
		$scope.selectID = null; 

		$('.overlay.sidebar') .sidebar({
			overlay: true})
		.sidebar('toggle');
	};

	$scope.joinEvent = function(){
		var ref = new Firebase(url + "/Collaborating/users/" + $cookies.id);
		$firebase(ref).$add($scope.selectID);
		alert("Join Successfully")
	};

	function getEvents(){
		var ref = new Firebase(url + "/Public/events/" + category);
		$scope.events = $firebase(ref);
	}

}])
.controller('searchCtrl', ["$scope","$location", function($scope, $location) {

	$scope.search = function(){
		$location.search({search: $scope.searchEvent});

	}
}]);