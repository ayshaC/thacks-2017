var app = angular.module("myApp", ["ngRoute", "ngAnimate", "ngStorage"]);
app.config(function($routeProvider) {
    $routeProvider
    .when("/", {
        templateUrl : "views/login.html",
        controller: "loginController",
        controllerAs: 'vm'
    })
    .when("/drivers", {
        templateUrl : "views/drivers.html"
    })
    .when("/driver", {
        templateUrl : "views/driver.html"
    })
});

app.factory('AuthenticationService', Service);
 
    function Service($http, $localStorage) {
        var service = {};
 
        service.Login = Login;
        service.Logout = Logout;
 
        return service;
 
        function Login(username, password, callback) {
            $http.post('http://35.183.6.3:443/auth/token', { "username": username, "password": password })
                .success(function (response) {
                    // login successful if there's a token in the response
                    if (response.token) {
                        // store username and token in local storage to keep user logged in between page refreshes
                        $localStorage.currentUser = { username: username, token: response.token };
 
                        // add jwt token to auth header for all requests made by the $http service
                        $http.defaults.headers.common.Authorization = 'Bearer ' + response.token;
 
                        // execute callback with true to indicate successful login
                        callback(true);
                    } else {
                        // execute callback with false to indicate failed login
                        callback(false);
                    }
                });
        }
 
        function Logout() {
            // remove user from local storage and clear http auth header
            delete $localStorage.currentUser;
            $http.defaults.headers.common.Authorization = '';
        }
    }

app.factory('service', function($http) {
    var serviceTest= {

        getEvents : function(){
            return $http({
                method: 'GET',
                url: '/someUrl.json'
            }).then(function successCallback(response) {
                // this callback will be called asynchronously
                // when the response is available
                var data = response.data;
                console.log(data);
                return data;
            }, function errorCallback(response) {
                // called asynchronously if an error occurs
                // or server returns response with an error status.
                var data = [{"eventId": "id", "timestamp": "time", "deviceid": "device", "s3key": "s3"}, 
                            {"eventId": "id2", "timestamp": "time2", "deviceid": "device2", "s3key": "s32"}, 
                            {"eventId": "id3", "timestamp": "time3", "deviceid": "device3", "s3key": "s33"}];
                console.log(data);
                return data;
            });
        }


    };


    return serviceTest;
});

app.controller('loginController', ['$scope', 'AuthenticationService', '$location', function($scope, AuthenticationService, $location) {

        var vm = this;
 
        vm.login = login;
 
        initController();
 
        function initController() {
            // reset login status
            AuthenticationService.Logout();
        };
 
        function login() {
            vm.loading = true;
            AuthenticationService.Login(vm.username, vm.password, function (result) {
                if (result === true) {
                    $location.path('/');
                    console.log("yay");
                } else {
                    vm.error = 'Username or password is incorrect';
                    vm.loading = false;
                    console.log("sad");
                }
            });
        };

}])

app.controller('controller', ['$scope', 'service', '$location', '$timeout', function($scope, service, $location, $timeout) {
    $scope.startDate;
    $scope.endDate;
    $scope.events;
    $scope.selectedEvent;
    $scope.eventSelected = false;

    $scope.bool = false;

    $scope.back = function(){
        $scope.notLoaded = true;
    };

    $scope.getEvents = function() {
        service.getEvents().then(function(myReponseData) {
            $scope.events = myReponseData['info'];
            console.log("data");
            console.log($scope.events);
        });   
    };

    $scope.getEvents();


    $scope.selectEvent = function(event){
        $scope.selectedEvent = event;
        $scope.eventSelected = true;
    };

     $timeout( function(){
            $scope.bool = true;
    }, 2000 );

        //time
        $scope.time = 0;
        
        //timer callback
        var timer = function() {
            if( $scope.time < 5000 ) {
                $scope.time += 1000;
                $timeout(timer, 1000);
            }
        }
        
        //run!!
        $timeout(timer, 1000);    
}]);





