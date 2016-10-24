var legoApp = angular.module("legoApp", ['ngRoute', 'ngCookies', 'angularUtils.directives.dirPagination']);
var apiPath = "http://localhost:3000";
legoApp.controller('mainController', function($scope, $http, $location, $cookies){
	
	var rebrickableURL = 'https://rebrickable.com/api/search?key=wqq5lDBA3N&format=json&type=S&query=';
	$scope.imagePath = 'http://rebrickable.com/img/sets-s/';

	$scope.getLegoSearch = function(){
		$http({
		method: 'GET',
		url: rebrickableURL + $scope.queryString
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
				$location.path('/search');
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

	$scope.addToCollection = function(set_id){
		console.log(set_id);
		$http.post(apiPath + '/addToCollection', {
			set_id: set_id,
			token: $cookies.get('token')
		}).then(function successCallback(response){
			$location.path('/search');
		}, function errorCallback(response){
			console.log(response.data);
		});
	};

	$scope.removeFromCollection = function(set_id){
		console.log(set_id);
		$http.post(apiPath + '/removeFromCollection', {
			set_id: set_id,
			token: $cookies.get('token')
		}).then(function successCallback(response){
			$location.path('/search');
		}, function errorCallback(response){
			console.log(response.data);
		});
	};

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
});