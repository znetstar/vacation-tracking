var app = angular.module("vacationTracking", ['ngRoute', 'ngMaterial']);

app.config(($routeProvider, $locationProvider) => {
	$locationProvider.html5Mode(true);
});

$(document).on('ready', () => {
	angular.bootstrap(document, 'vacationTracking');
});