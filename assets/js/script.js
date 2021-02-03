//
var apiKey = "662057d093b416978d68fd9b93c95087";
var todayTempEl = $("#todayTemperature");
var todayHumidityEl = $('#todayHumidity');
var todayUVEl = $('#todayUV');
var todayWindEl = $('#todayWind');
var searchTextEl = $('#search-text');

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
  date: ""
};
var coord = {
  lat: "",
  lon: ""
}
var forecast = [];

$( document ).ready(function() {

  showSearchCities();

   $( "#search-btn" ).click(function() {
     let searchtext = searchTextEl.val();

     if (validateCityName(searchtext)) {
        callWeatherInfo(searchtext);
     }
  });
});
function validateCityName(name) {
  if (name == "") {
    alert("Please enter city name");
    return false;
  } 
  return true;
}
function callWeatherInfo( cityName ) {
  let url = 'https://api.openweathermap.org/data/2.5/weather?q=' + cityName + '&appid=' + apiKey;
  console.log(url);

  fetch(url)  
  .then(function(resp) { return resp.json() }) // Convert data to json
  .then(function(data) {
    getCoord(data.coord.lat, data.coord.lon);
  })
  .catch(function() {
      alert("Something went wrong , please try again!")
  });
}
function getCoord( latitude, longitude ) {
  var url = "https://api.openweathermap.org/data/2.5/onecall?lat=" + latitude+ "&lon=" + longitude +"&units=metric&appid=" + apiKey;
  console.log(url);

  fetch(url)  
  .then(function(resp) { return resp.json() }) // Convert data to json
  .then(function(data) {
    drawWeather(data); 
    toggleFrontside(false);
    saveInLocalStorage(searchTextEl.val());
  })
  .catch(function() {
    // catch any errors
  });
}
function toggleFrontside(toggle) {
  frontside.attr("hidden", toggle);
  }
function saveInLocalStorage(name) {

  let saved = localStorage.getItem("cities");

  if (saved == null) { 
    cities = [name];
  } else {
    cities = JSON.parse(saved);
    console.log(jQuery.inArray(name , cities ));

    if (jQuery.inArray(name , cities ) == -1) {
        cities.push(name);
    }
  }  
  localStorage.setItem('cities', JSON.stringify(cities));
}
function showSearchCities() {

  let saved = localStorage.getItem("cities");
  if (saved == null) {
      return;
  }
  saved = JSON.parse(saved);

    for (var i=0; i<saved.length; i++) {
      $(".search-city").append($("<li>").text(saved[i]));
    }
}

function basicUI(info) {

  todayTempEl.text(info.temperature);
  todayHumidityEl.text(info.humidity + "%");
  todayUVEl.text(info.UVIndex);
  todayWindEl.text(info.wind);
  todayEl.text("("+ info.date+ ")");
  var todayiconurl = "http://openweathermap.org/img/wn/" + info.ico + "@2x.png";

  todayWeatherIcon.attr("src", todayiconurl);
  cityTitleEl.text(searchTextEl.val());
}
function showForecast(info) {

  for (var i=1; i<=5; i++) {
    var forecastTemp = $('#forecast-temp-' + i);
    forecastTemp.text(info[i].temperature);

    var forecastHumidity = $('#forecast-humidity-' + i);
    forecastHumidity.text(info[i].humidity + "%");

    var iconurl = "http://openweathermap.org/img/wn/" + info[i].ico + "@2x.png";

    var imgicon = $('#weather-icon-' + i);
    console.log(imgicon);

    imgicon.attr("src", iconurl);

    var forecastDate = $('#forecast-date-' + i);
    forecastDate.text(info[i].date);

  }
}
  function getTempInCelsius(temp) {
    var celcius = Math.round(parseFloat(temp)-273.15);
    return celcius;
  }
  function getAverageTemp(temp1, temp2, temp3, temp4) {
    return ((temp1 + temp2 + temp3 + temp4) /4).toFixed(2);
  }
  function convertUNIXTimestamp(unixTimeStamp) {
    var date =  new Date(unixTimeStamp * 1000);

    return ((date.getMonth() + 1) + "/" + date.getDay() + "/" + date.getFullYear());
}
function getCurrentDate() {
  var currentDate = moment().format("DD-MM-YYYY");
  return currentDate;
}

  function drawWeather( d ) {

    weatherInfo.temperature = d.current.temp;
    weatherInfo.humidity = d.current.humidity;
    weatherInfo.wind = d.current.wind_speed;
    weatherInfo.UVIndex = d.current.uvi;
    weatherInfo.city =  searchTextEl.val();
    weatherInfo.ico = d.current.weather[0].icon;
    weatherInfo.date = convertUNIXTimestamp(d.current.dt);

    var daily = d.daily;
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
      forecast.push(weather);
    }

    basicUI(weatherInfo);
    showForecast(forecast);
  }

