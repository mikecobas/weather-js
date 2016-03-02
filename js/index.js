(function(){
	var API_WORLDTIME_KEY = "0f19af2c16d85b502472fdf6de046";
	var API_WORLDTIME = "https://api.worldweatheronline.com/free/v2/tz.ashx?format=json&key=" + API_WORLDTIME_KEY + "&q=";
	var API_WEATHER_KEY = "a2e6e2e9007417d2339baf71e425c356"; /*SE USA COMO CONSTANTE EN MAYUSCULAS LA VARIABLE */
	var API_WEATHER_URL = "http://api.openweathermap.org/data/2.5/weather?&lang=es&APPID="+ API_WEATHER_KEY + "&";
	var IMG_URL = "http://openweathermap.org/img/w/";
	var IMG_LOCAL = "img/icon/";

	var today = new Date();
	var timeNow = today.toLocaleTimeString();

	var $body = $("body");
	var $loader = $(".loader");
	var $loaderNewCity = $(".loaderNewCity");
	var nombreNuevaCiudad = $("[data-input='cityAdd'] ");
	var buttonAdd = $("[data-button='add']");
	var buttonLoad = $("[data-saved-cities]");


	var cities =[];
	var cityWeather = {};
	cityWeather.zone;
	cityWeather.icon;
	cityWeather.temp;
	cityWeather.temp_max;
	cityWeather.temp_min;
	cityWeather.main;
	cityWeather.description;

 $( buttonAdd).on("click",addNewCity);
 $(nombreNuevaCiudad).on("keypress", function(event){

 	if (event.which ==13) {
 		addNewCity();
 	}
  });
$(buttonLoad).on("click", loadSavedCities);

/*
Verificamos que el navegador soporte Geolocation 
*/
if(navigator.geolocation){
	navigator.geolocation.getCurrentPosition(getCoords, errorFound);



}else{
	alert ("Por favor actualiza tu navegador");
}

function errorFound(err){
	alert ("Ocurrión un error: "+ err);
	// 0: Error Desconocido
	// 1: Permiso denegado
	// 2: Posición no disponible
	// 3: Timeout
}

function getCoords(position){
	var lat = position.coords.latitude;
	var lon = position.coords.longitude;
	console.log("Tu posición es: " + lat+","+lon);
	$.getJSON(API_WEATHER_URL + "lat=" + lat + "&lon=" + lon, getCurrentWeather); /* getCurrentWeather es el nombre de la funcion callback */

};

function getCurrentWeather(data){
	cityWeather.zone = data.name;
	/*cityWeather.icon = IMG_URL + data.weather[0].icon + ".png";*/
	cityWeather.icon = IMG_LOCAL + data.weather[0].main + ".png";
	cityWeather.temp = data.main.temp - 273.15;
	cityWeather.temp_max = data.main.temp_max -273.15;
	cityWeather.temp_min = data.main.temp_min -273.15;
	cityWeather.main = data.weather[0].main;
	cityWeather.description = data.weather[0].description;

	// render
	renderTemplate(cityWeather);
};
function activateTemplate(id){
	var t = document.querySelector(id);
	return document.importNode(t.content, true);
};

function renderTemplate(cityWeather, localTime){

	var clone = activateTemplate("#template--city");
	/* Agregamos el toFixed(1) para acortar los decimales a 1 */
	var timeToShow;
	if (localTime) {
		timeToShow = localTime.split(" ")[1];
	}else{
		timeToShow = timeNow;
	}
	clone.querySelector("[data-time]").innerHTML = timeToShow;
	clone.querySelector("[data-city]").innerHTML = cityWeather.zone;
	clone.querySelector("[data-main]").innerHTML = cityWeather.description;
	clone.querySelector("[data-temp='current']").innerHTML = cityWeather.temp.toFixed(1);
	clone.querySelector("[data-temp='max']").innerHTML = cityWeather.temp_max.toFixed(1);
	clone.querySelector("[data-temp='min']").innerHTML = cityWeather.temp_min.toFixed(1) ;
	clone.querySelector("[data-icon]").src = cityWeather.icon;


	$( $loader ).hide();
	$( $body ).append(clone);

};
 function addNewCity(event){
 	event.preventDefault();
 	$.getJSON(API_WEATHER_URL + "q="+ $( nombreNuevaCiudad).val(), getWeatherNewCity);
 }
function getWeatherNewCity(data){

	$.getJSON(API_WORLDTIME + $( nombreNuevaCiudad).val(), function(response){
		$( nombreNuevaCiudad).val("");
		cityWeather={};
		cityWeather.zone = data.name;
		/*cityWeather.icon = IMG_URL + data.weather[0].icon + ".png";*/
		cityWeather.icon = IMG_LOCAL + data.weather[0].main + ".png";
		cityWeather.temp = data.main.temp - 273.15;
		cityWeather.temp_max = data.main.temp_max -273.15;
		cityWeather.temp_min = data.main.temp_min -273.15;
		cityWeather.main = data.weather[0].main;
		cityWeather.description = data.weather[0].description;
		renderTemplate(cityWeather, response.data.time_zone[0].localtime);
		/*$loaderNewCity.hide();*/
		cities.push(cityWeather);
		localStorage.setItem("cities", JSON.stringify(cities));
	});	
}
function loadSavedCities(event){
	event.preventDefault();

	function renderCities(cities){
		cities.forEach(function(city){
			renderTemplate(city);
		});
	};
	var cities = JSON.parse( localStorage.getItem("cities"));
	renderCities(cities);
}



})();