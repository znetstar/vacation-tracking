var app = angular.module("vacationTracking", ['ngRoute', 'ngMaterial']);

app
	.config(function ($routeProvider, $locationProvider) {
		$locationProvider.html5Mode(true);

		$routeProvider
			.when('/summary', {
				templateUrl: '/partials/summary.html',
				controller: 'Summary'
			})
			.when('/add-vacation', {
				templateUrl: '/partials/add-vacation.html',
				controller: "AddVacation"
			})
			.when('/', {
				redirectTo: '/summary'
			});
	})
	.factory('Vacation', () => {
		class Vacation {
			constructor(descripion, startDate, endDate, country) {
				this.description = descripion;
				this._startDate = new Date(startDate);
				this._endDate = new Date(endDate);
				this.country = country;
			}

			get startDate() { this._startDate.setHours(0,0,0,0); return this._startDate; }

			get endDate() {  this._endDate.setHours(0,0,0,0); return this._endDate; }

			get dateString() {
				const date_wo_year = 'MMM Do';
				const date_w_year = 'MMM Do YYYY';
				if (this.startDate >= this.endDate) {
					if (this.startDate.getFullYear() === new Date().getFullYear())
						return moment(this.startDate).format(date_wo_year);
					else
						return moment(this.startDate).format(date_w_year);
				}

				if (this.startDate.getFullYear() === this.endDate.getFullYear())
					return `${moment(this.startDate).format(date_wo_year)} - ${moment(this.endDate).format(date_wo_year)} ${this.startDate.getFullYear()}`;
				else
					return `${moment(this.startDate).format(date_w_year)} - ${moment(this.endDate).format(date_w_year)}`;
			}
		};

		return Vacation;
	})
	.factory('VacationList', () => {
		class VacationList extends Array {
			constructor() {
				super();
			}

			valueOf() {
				return this.sort((a,b) => b.startDate - a.startDate);
			}
		}

		return VacationList;
	})
	.factory('Vacations', (VacationList) => new VacationList())
	.controller('Summary', function ($scope, Vacations, Vacation) {
		Vacations.push(new Vacation('hi', new Date('11/04/2016'), new Date('11/05/2016'), 'United States'));
		Vacations.push(new Vacation('hi', new Date('11/04/2017'), new Date('11/05/2017'), 'Russia'));
		$scope.remove = (vacation_index) => $scope.vacations.splice(vacation_index, 1);

		$scope.vacations = Vacations;
	})
	.controller('AddVacation', ($scope, Vacations, Vacation) => {

	});

$(() => {
	angular.bootstrap(document, ['vacationTracking']);
});