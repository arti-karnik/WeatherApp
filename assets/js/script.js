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
  
  $("li").click(function() {
    $(this).parent().find( "li" ).removeClass();
    $(this).removeClass().addClass('selected');

    let name = $(this).text();
    searchTextEl.val(name);
    callWeatherInfo(name);
  });
  
  
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
  var url = "https://api.openweathermap.org/data/2.5/onecall?lat=" + latitude+ "&lon=" + longitude +"&units=imperial&appid=" + apiKey;
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
  
  todayTempEl.text(info.temperature + " °F");
  todayHumidityEl.text(info.humidity + "%");
  todayUVEl.text(info.UVIndex);
  
  let uvcolor = UvIndexColor(parseInt(info.UVIndex));
  todayUVEl.attr("style","background-color:" + uvcolor + ";");
  
  todayWindEl.text(info.wind + " MPH");
  
  todayEl.text("("+ info.date+ ")");
  
  var todayiconurl = "http://openweathermap.org/img/wn/" + info.ico + "@2x.png";
  todayWeatherIcon.attr("src", todayiconurl);
  cityTitleEl.text(searchTextEl.val());
}
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
function getTempInCelsius(temp) {
  var celcius = Math.round(parseFloat(temp)-273.15);
  return celcius;
}
function getAverageTemp(temp1, temp2, temp3, temp4) {
  return ((temp1 + temp2 + temp3 + temp4) /4).toFixed(2);
}
function convertUNIXTimestamp(unixTimeStamp) {
  var date =  new Date(unixTimeStamp * 1000);
  return ((date.getMonth() + 1) + "/" + date.getDate() + "/" + date.getFullYear());
}

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

