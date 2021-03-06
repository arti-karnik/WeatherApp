//======  Variable declaration ====//
var apiKey = "662057d093b416978d68fd9b93c95087";
var todayTempEl = $("#todayTemperature");
var todayHumidityEl = $('#todayHumidity');
var todayUVEl = $('#todayUV');
var todayWindEl = $('#todayWind');
var searchTextEl = $('#search-text');
var descriptionEl = $('#description');
var todayEl = $('#todayDate');
var cityTitleEl = $('#city');
var todayWeatherIcon = $('#todayweathericon');
var frontside = $('#frontside');
var cities = [];
var weatherInfo = {
  temperature: "",
  humidity: "",
  wind: "",
  UVIndex: "",
  city: "",
  ico: "",
  date: "",
  description: ""
};
var coord = {
  lat: "",
  lon: ""
}
var list = $('.search-city');
var saveCity = false;
var forecast = [];
var defaultCity = "Austin";

//======  Page load method ====//
$( document ).ready(function() {
  showSearchCities();
  showLastSearchCity();
  //====== click on city  ====//

  $(".search-city").on("click","li", function(){
  //$("li").click(function() {
    $(this).parent().find( "li" ).removeClass();
    $(this).addClass('selected');

    let name = $(this).text();
    searchTextEl.val(name);
    callWeatherInfo(name);
  });
  
  //====== Search button clicked  ====//
  $( "#search-btn" ).click(function() {
    let searchtext = searchTextEl.val();
    
    if (validateCityName(searchtext)) {
      saveCity = true;
      callWeatherInfo(searchtext);
    }
  });
});
function showCitySelected(cityName) {
  $('ul li').each(function(){
    $(this).removeClass()
    if($(this).text() == cityName){
      $(this).addClass('selected');
    } 
});
}

function showLastSearchCity() {
  var cityName = localStorage.getItem("lastSearch");
  if (cityName == null) {
    cityName = defaultCity;
  } else {
    showCitySelected(cityName);
  }  
  searchTextEl.val(cityName);
  callWeatherInfo(cityName);
}

//====== Method to validate City name  ====//
function validateCityName(name) {
  if (name == "") {
    alert("Please enter city name");
    return false;
  } 
  return true;
}
//====== Fetch call - To call weather API with cityname  ====//
function callWeatherInfo( cityName ) {
  let url = 'https://api.openweathermap.org/data/2.5/weather?q=' + cityName + '&appid=' + apiKey;
  console.log(url);
  
  fetch(url)  
  .then(function(resp) { return resp.json() }) // Convert data to json
  .then(function(data) {
    weatherInfo.name = data.name;
    getCoord(data.coord.lat, data.coord.lon);
  })
  .catch(function() {
    alert("Something went wrong , please try again!")
  });
}
//====== Fetch call - To get coordinate weather API  ====//
function getCoord( latitude, longitude ) {
  var url = "https://api.openweathermap.org/data/2.5/onecall?lat=" + latitude+ "&lon=" + longitude +"&units=imperial&appid=" + apiKey;
  console.log(url);
  
  fetch(url)  
  .then(function(resp) { return resp.json() }) // Convert data to json
  .then(function(data) {
    getWeather(data); 
    toggleFrontside(false);
  })
  .catch(function() {
    // catch any errors
  });
}
// Fetch weather details from data
function getWeather( data ) {

  weatherInfo.temperature = data.current.temp;
  weatherInfo.humidity = data.current.humidity;
  weatherInfo.wind = data.current.wind_speed;
  weatherInfo.UVIndex = data.current.uvi;
  weatherInfo.city =  searchTextEl.val();
  weatherInfo.ico = data.current.weather[0].icon;
  weatherInfo.date = convertUNIXTimestamp(data.current.dt);
  weatherInfo.description = data.current.weather[0].description;

  var daily = data.daily;
  forecast = [];
  
  for (var i=0; i<daily.length; i++) {
    var avg = getAverageTemp(daily[i].feels_like.day, daily[i].feels_like.night ,daily[i].feels_like.morn ,daily[i].feels_like.eve);
    
    var weather = Object.create(weatherInfo);
    weather.temperature = avg;
    weather.humidity = daily[i].humidity;
    weather.wind = daily[i].wind_speed;
    weather.UVIndex = daily[i].uvi;
    weather.ico = daily[i].weather[0].icon;
    weather.date = convertUNIXTimestamp(daily[i].dt);
    weather.description = daily[i].weather[0].description;
    forecast.push(weather);
  }
  
  basicUI(weatherInfo);
  showForecast(forecast);
  if (saveCity) {
    saveInLocalStorage(weatherInfo.name);
  }
}
//====== Method to show weather info ====//
function toggleFrontside(toggle) {
  frontside.attr("hidden", toggle);
}
function saveLastSearchCity(name) {
  localStorage.setItem('lastSearch', name);

}
//====== Method to save city name in local storage ====//
function saveInLocalStorage(name) {
  let saved = localStorage.getItem("cities");
  
  if (saved == null) { 
    cities = [name];
    $(".search-city").prepend($("<li></li>").text(name));
    showCitySelected(name);
    saveLastSearchCity(name);
  } else {
    cities = JSON.parse(saved);
    if (jQuery.inArray(name , cities) == -1) {
      cities.push(name);
      saveLastSearchCity(name);
      $(".search-city").prepend($("<li></li>").text(name));
      showCitySelected(name);
    }
  } 
  localStorage.setItem('cities', JSON.stringify(cities));
}
//====== Method to show city name in side bar ====//
function showSearchCities() {

  let saved = localStorage.getItem("cities");
  if (saved == null) {
    return;
  }
  saved = JSON.parse(saved);

  for (var i=0; i<saved.length; i++) {
    $(".search-city").prepend($("<li></li>").text(saved[i]));
  }
}
//====== Method to show Today's weather info ====//
function basicUI(info) {
  
  todayTempEl.text(info.temperature + " °F");
  todayHumidityEl.text(info.humidity + "%");
  todayUVEl.text(info.UVIndex);
  
  let uvcolor = UvIndexColor(parseInt(info.UVIndex));
  todayUVEl.attr("style","background-color:" + uvcolor + ";");
  
  todayWindEl.text(info.wind + " MPH");
  descriptionEl.text(info.description);
  todayEl.text("("+ info.date+ ")");
  
  var todayiconurl = "http://openweathermap.org/img/wn/" + info.ico + "@2x.png";
  todayWeatherIcon.attr("src", todayiconurl);
  cityTitleEl.text(searchTextEl.val());
}
//====== Method to show Forecast weather info ====//
function showForecast(info) {
  
  for (var i=1; i<=5; i++) {
    var forecastTemp = $('#forecast-temp-' + i);
    forecastTemp.text(info[i].temperature + " °F");
    
    var forecastHumidity = $('#forecast-humidity-' + i);
    forecastHumidity.text(info[i].humidity + "%");
    
    var iconurl = "http://openweathermap.org/img/wn/" + info[i].ico + "@2x.png";
    
    var imgicon = $('#weather-icon-' + i);
    
    imgicon.attr("src", iconurl);
    
    var forecastDate = $('#forecast-date-' + i);
    forecastDate.text(info[i].date);
    
    var forecastWind = $('#forecast-wind-' + i);
    forecastWind.text(info[i].wind + " MPH");
    
    var forecastUV = $('#forecast-uv-' + i);
    forecastUV.text(info[i].UVIndex);
    
    let uvcolor = UvIndexColor(parseInt(info[i].UVIndex));
    forecastUV.attr("style","background-color:" + uvcolor + ";");
  }
}
// Helper methods: Get average temp of a day
function getAverageTemp(temp1, temp2, temp3, temp4) {
  return ((temp1 + temp2 + temp3 + temp4) /4).toFixed(2);
}
// Helper methods:Convert UNIX time to local time
function convertUNIXTimestamp(unixTimeStamp) {
  var date =  new Date(unixTimeStamp * 1000);
  var dd = (date.getDate() < 10 ? '0' : '') + date.getDate();
  var MM = ((date.getMonth() + 1) < 10 ? '0' : '') + (date.getMonth() + 1);
  var yyyy = date.getFullYear();
  return (MM + "/" + dd + "/" + yyyy);
}
// Helper methods: Get UV Color code based on color
function UvIndexColor(value) {
  if (value < 3) {
    return "gray";
  } else if (value >=3 && value < 6) {
    return "yellow";
  } else if (value >= 6 && value < 8) {
    return "orange";
  } else if (value >= 8 && value < 11) {
    return "red";
  } 
  return "violet";
}


