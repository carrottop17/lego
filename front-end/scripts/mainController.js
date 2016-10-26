var legoApp = angular.module("legoApp", ['ngRoute', 'ngCookies', 'angularUtils.directives.dirPagination']);
var apiPath = "http://localhost:3000";
var rebrickableURL = 'https://rebrickable.com/api/search?key=wqq5lDBA3N&format=json&type=S&query=';
var rebrickablePartsURL = 'https://rebrickable.com/api/get_set_parts?key=wqq5lDBA3N&format=json&type=S&set='

legoApp.factory('Data', function(){
	return { Set_id: '' };
});

legoApp.controller('mainController', function($scope, $route, $http, $location, $cookies, $window, Data){
	
	$scope.Data = Data;

	$scope.getSetId = function(set_id){
		console.log(set_id);
	}

	$scope.getLegoSearch = function(){
		$http({
		method: 'GET',
		url: rebrickableURL + $scope.queryString, cache: true
		}).then(function successFunction(searchData){
			$scope.legoArray = searchData.data.results;
			for (var i = 0; i < searchData.data.results.length; i++){
				if (searchData.data.results[i].kit == 1){
					searchData.data.results.splice(i, 1);
				}
			}
			console.log(searchData);
		},function failureFunction(searchData){
			console.log(searchData.data.results);
		}
	);
	}

	$scope.sort = function(keyname){
        $scope.sortKey = keyname;   //set the sortKey to the param passed
        $scope.reverse = !$scope.reverse; //if true make it false and vice versa
    }

	$scope.register = function(){
		$http.post(apiPath + '/register', {
			fullname: $scope.fullname,
			username: $scope.username,
			password: $scope.password,
			password2: $scope.password2,
			email: $scope.email
		}).then(function successCallback(response){
			console.log(response);
			if(response.data.message == 'added'){
				$cookies.put('token', response.data.token);
				$cookies.put('username', $scope.username);
				$location.path('/search');
				console.log(response.data);
			}
		},function errorCallback(response){
			console.log('error');
			console.log(response);
		});
	};

	$scope.login = function(){
		$http.post(apiPath + '/login', {
			username: $scope.username,
			password: $scope.password
		}).then(function successCallback(response){
			console.log(response.data);
			if(response.data.success == 'userfound'){
				$cookies.put('token', response.data.token);
				$cookies.put('username', $scope.username);
				$location.path('/profile');
				$scope.loggedIn = true;
				console.log(response.data.token);
			}
			if(response.data.failure == 'noUser'){
				$scope.wrongUsername = true;
			}
			if(response.data.failure == 'badPass'){
				$scope.wrongPassword = true;
			}
		},function errorCallback(response){
			console.log('error');
			console.log(response);
		});
	};

	$scope.logout = function(){
		$cookies.remove('token');
		$cookies.remove('username');
	}

	$scope.addToCollection = function(results){
		$http.post(apiPath + '/addToCollection', {
			results: results,
			token: $cookies.get('token')
		}).then(function successCallback(response){
			console.log(response);
		}, function errorCallback(response){
			console.log(response.data);
		});
	};

	$scope.removeFromCollection = function(results){
		$http.post(apiPath + '/removeFromCollection', {
			results: results,
			token: $cookies.get('token')
		}).then(function successCallback(response){
			console.log(response);
		}, function errorCallback(response){
			console.log(response.data);
		});
	};

	$scope.getUserData = function(){
		$http.get(apiPath + '/getUserData?token=' + $cookies.get('token'), {cache: true} ).then(function successCallback(response){
			if (response.data.failure == 'noToken' || response.data.failure == 'badToken'){
				$location.path('/login');
				console.log(response.data);
			} else {
				$scope.fullname = response.data.fullname;
				$scope.username = response.data.username;
				$scope.email = response.data.email;
				$scope.sets = response.data.sets;
				console.log(response.data.sets)
			}
		}, function errorCallback(response){
			console.log(response.status);
		});
	};

	$scope.getLegoPartsSearch = function(set_id){
		$http({
		method: 'GET',
		url: rebrickablePartsURL + set_id, cache: true
		}).then(function successFunction(searchData){
			$scope.legoPartsArray = searchData.data.results;
			$scope.addPartsToCollection(searchData.data);
			$scope.partObject = searchData.data;
		},function failureFunction(searchData){
			console.log(searchData.data.results);
		}
	);
	}

	$scope.getLegoPartsSearchRemove = function(set_id){
		$http({
		method: 'GET',
		url: rebrickablePartsURL + set_id, cache: true
		}).then(function successFunction(searchData){
			$scope.legoPartsArray = searchData.data.results;
			$scope.removePartsFromCollection(searchData.data);
			$scope.partObject = searchData.data;
		},function failureFunction(searchData){
			console.log(searchData.data.results);
		}
	);
	}

	$scope.addPartsToCollection = function(parts){
		$http.post(apiPath + '/addPartsToCollection', {
			parts: parts,
			token: $cookies.get('token')
		}).then(function successCallback(response){
			console.log(response);
		}, function errorCallback(response){
			console.log(response.data);
		});
	};

	$scope.removePartsFromCollection = function(parts){
		$http.post(apiPath + '/removePartsFromCollection', {
			parts: parts,
			token: $cookies.get('token')
		}).then(function successCallback(response){
			console.log(response);
		}, function errorCallback(response){
			console.log(response.data);
		});
	};

});

legoApp.controller('piecesController', function($scope, $rootScope, $http, $location, $cookies, Data){
	$scope.Data = Data;

	$scope.getLegoPartsSearch = function(set_id){
		$http({
		method: 'GET',
		url: rebrickablePartsURL + set_id, cache: true
		}).then(function successFunction(searchData){
			$scope.legoPartsArray = searchData.data[0].parts;
			console.log(searchData);
		},function failureFunction(searchData){
			console.log(searchData.data.results);
		}
	);
	}

});

legoApp.config(function($routeProvider){
	$routeProvider.when('/',{
		templateUrl: 'views/main.html',
		controller: 'mainController'
	})
	.when('/login',{
		templateUrl: 'views/login.html',
		controller: 'mainController'
	})
	.when('/register',{
		templateUrl: 'views/register.html',
		controller: 'mainController'
	})
	.when('/search',{
		templateUrl: 'views/search.html',
		controller: 'mainController'
	})
	.when('/profile',{
		templateUrl: 'views/profile.html',
		controller: 'mainController'
	})
	.when('/setparts',{
		templateUrl: 'views/setparts.html',
		controller: 'piecesController'
	})
});