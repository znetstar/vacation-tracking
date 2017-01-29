var app = angular.module("vacationTracking", ['ngRoute', 'ngMaterial', 'ngMessages', 'md.data.table']);

app
	.config(function ($routeProvider, $locationProvider, $compileProvider) {
		$locationProvider.html5Mode(true);

		$routeProvider
			.when('/summary', {
				templateUrl: '/partials/summary.html'
			})
			.when('/add-vacation', {
				templateUrl: '/partials/add-vacation.html'	
			})
			.when('/', {
				redirectTo: '/summary'
			});

		$compileProvider.preAssignBindingsEnabled(true);
	})
	.controller('Toolbar', ($scope,	$location) => {
		$scope.current_path = $location.path();
		$scope.$on('$locationChangeStart', () => {
			$scope.current_path = $location.path();
		});

		$scope.go_home = () => $location.path('/');

		$scope.add_click = () => $location.path('/add-vacation');
	})
	.factory('Vacation', () => {
		class Vacation {
			constructor(descripion, startDate, endDate) {
				this.description = descripion;
				this._startDate = new Date(startDate);
				this._startDate.setHours(0,0,0,0);
				this._endDate = (endDate && new Date(endDate)) || null;
				this._countries = [];
			}

			get stillPresent() {
				return this._endDate === null;
			}

			get startDate() { 
				return this._startDate; 
			}

			get endDate() {  
				if (this._endDate instanceof Date)
					this._endDate.setHours(0,0,0,0); 

				if (this._endDate === null) {
					let d = new Date();
					d.setHours(0,0,0,0);
					return d;
				}

				return this._endDate; 
			}

			addCountry(name) {
				(this._countries.indexOf(name) === -1) && this._countries.push(name);
			}

			removeCountry(name) {
				let index = this._countries.indexOf(name);
				(index !== -1) && this._countries.slice(index, 1);
			}

			get countries() {
				return this._countries.slice(0);
			}

			get numberOfDays() {
				return Math.round(Math.abs((this.startDate.getTime() - this.endDate.getTime())/(24*60*60*1000))) || 1;
			}
		};

		return Vacation;
	})
	.factory('VacationList', () => {
		class VacationList extends Array {
			constructor() {
				super();
			}

			summarize() {
				let summary = [];

				for (let vacation of this.valueOf()) {
					var numberOfDays = vacation.numberOfDays;
					let find_existing = (s) => { 
						return vacation.countries.some((c) => s.country === c);
					}
					if (!summary.some(find_existing)) {
						for (let country of vacation.countries) {
							let lastVisited = new Date(vacation.endDate);
							lastVisited.toString = () => moment(lastVisited).format('M/YYYY');
							summary.push({
								country: country,
								lastVisited: vacation.stillPresent ? 'Still Present' : lastVisited.toString(),
								numberOfDays
							});
						}
					}
					else 
						(summary.filter(find_existing)[0]).numberOfDays += numberOfDays;
				}

				return summary.sort((a,b) => b.numberOfDays - a.numberOfDays);
			}

			valueOf() {
				return this.sort((a,b) => b.startDate - a.startDate);
			}
		};

		return VacationList;
	})
	.factory('Countries', () => ["Afghanistan","Albania","Algeria","Andorra","Angola","Antigua and Barbuda","Argentina","Armenia","Australia","Austria","Azerbaijan","Bahamas, The","Bahrain","Bangladesh","Barbados","Belarus","Belgium","Belize","Benin","Bhutan","Bolivia","Bosnia and Herzegovina","Botswana","Brazil","Brunei","Bulgaria","Burkina Faso","Burundi","Cambodia","Cameroon","Canada","Cape Verde","Central African Republic","Chad","Chile","China","Colombia","Comoros","Congo, Democratic Republic of the","Congo, Republic of the","Costa Rica","Croatia","Cuba","Cyprus","Czech Republic","Denmark","Djibouti","Dominica","Dominican Republic","East Timor","Ecuador","Egypt","El Salvador","Equatorial Guinea","Eritrea","Estonia","Ethiopia","Fiji","Finland","France","Gabon","Gambia, The","Georgia","Germany","Ghana","Greece","Grenada","Guatemala","Guinea","Guinea-Bissau","Guyana","Haiti","Honduras","Hungary","Iceland","India","Indonesia","Iran","Iraq","Ireland","Israel","Italy","Ivory Coast","Jamaica","Japan","Jordan","Kazakhstan","Kenya","Kiribati","Korea, North","Korea, South","Kuwait","Kyrgyzstan","Laos","Latvia","Lebanon","Lesotho","Liberia","Libya","Liechtenstein","Lithuania","Luxembourg","Macedonia","Madagascar","Malawi","Malaysia","Maldives","Mali","Malta","Marshall Islands","Mauritania","Mauritius","Mexico","Micronesia","Moldova","Monaco","Mongolia","Montenegro","Morocco","Mozambique","Myanmar","Namibia","Nauru","Nepal","Netherlands","New Zealand","Nicaragua","Niger","Nigeria","Norway","Oman","Pakistan","Palau","Palestine","Panama","Papua New Guinea","Paraguay","Peru","Philippines","Poland","Portugal","Qatar","Romania","Russia","Rwanda","Saint Kitts and Nevis","Saint Lucia","Saint Vincent and the Grenadines","Samoa","San Marino","São Tomé and Príncipe","Saudi Arabia","Senegal","Serbia","Seychelles","Sierra Leone","Singapore","Slovakia","Slovenia","Solomon Islands","Somalia","South Africa","South Sudan","Spain","Sri Lanka","Sudan","Suriname","Swaziland","Sweden","Switzerland","Syria","Tajikistan","Tanzania","Thailand","Togo","Tonga","Trinidad and Tobago","Tunisia","Turkey","Turkmenistan","Tuvalu","Uganda","Ukraine","United Arab Emirates","United Kingdom","United States","Uruguay","Uzbekistan","Vanuatu","Vatican City","Venezuela","Vietnam","Yemen","Zambia","Zimbabwe","Abkhazia","Cook Islands","Kosovo","Nagorno-Karabakh","Niue","Northern Cyprus","Sahrawi Arab Democratic Republic","Somaliland","South Ossetia","Taiwan","Transnistria"].map((c) => ({ display: c, value: c.toLowerCase() })))
	.factory('Vacations', (VacationList) => new VacationList())
	.factory('User', () => new Object())
	.controller('AddVacation', function ($scope, Vacations, Vacation, Countries, $q, $mdToast, $location, User) {
		$scope.states        = Countries.slice(0);
		$scope.selectedItem  = null;
		$scope.searchText    = '';
		$scope.countries = [];
		$scope.vacation = { }
		$scope.user = User;
		$scope.first_submit = Boolean(window.first_submit);

		$scope.querySearch = (text) => {
			return Countries.filter((c) => !$scope.countries.some((cc) => cc.display === c.display)).filter((c) => c.value.match(text.toLowerCase()));
		};

		let checkIfCountriesShouldBeRequired = () => {
			let ele = $('input[type="search"]', '.add-country');
			if ($scope.countries.length)
				ele.removeAttr('required')
			else
				ele.attr('required', 'required');
		};

		$scope.addCountry = (country) => {
			$scope.countries.push(country);
			$scope.searchText = '';
			$scope.countries = $scope.countries.filter(Boolean);
			checkIfCountriesShouldBeRequired();
		};

		$scope.removeCountry = (country) => {
			$scope.countries.splice($scope.countries.indexOf(country), 1);
			$scope.countries = $scope.countries.filter(Boolean);
			checkIfCountriesShouldBeRequired();
		};

		$scope.submitForm = () => {
			if (!$scope.vacation.startDate || !$scope.countries.length)
				return;

			let vacation = new Vacation($scope.vacation.description, $scope.vacation.startDate, $scope.vacation.endDate);
			
			while ($scope.countries.length) 
				vacation.addCountry($scope.countries.shift().display);

			checkIfCountriesShouldBeRequired();

			Vacations.push(vacation);

			$scope.vacation = {};
			$scope.first_submit = window.first_submit = 1;
			$location.path('/');
		};
	})
	.controller('Summary', ($scope, Vacations, Vacation, User) => {
		$scope.user = User;
		$scope.vacations = Vacations.summarize();
	})
	.directive('country', function () {
		return {
			restrict: 'E',
			template: `
				<div class="country">
					<img ng-src="https://flag-api.projects.zacharyboyd.nyc/{{name}}"></img>
					<span>{{name}}</span>
				</div>
			`,
			scope: {
				name: '='
			}
		};
	});

$(() => {
	angular.bootstrap(document, ['vacationTracking']);
});