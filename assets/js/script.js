//
var apiKey = "662057d093b416978d68fd9b93c95087";
var cityNameEl = $('#city');
var todayEl = $('#today');
var todayTempEl = $("#todayTemperature");
var todayHumidityEl = $('#todayHumidity');
var todayUVEl = $('#todayUV');
var todayWindEl = $('#todayWind');
var imgtodayIcon = $('#todayweathericon');
var  CityName = "Los Angeles";

var weatherInfo = {
  temperature: "",
  humidity: "",
  wind: "",
  UVIndex: "",
  city: "",
  ico: ""
};
var coord = {
  lat: "",
  lon: ""
}
var forecast = [];

$( document ).ready(function() {
   callWeatherInfo( "Los angeles" );
});
function callWeatherInfo( cityName ) {
  let url = 'https://api.openweathermap.org/data/2.5/weather?q=' + cityName + '&appid=' + apiKey;

  fetch(url)  
  .then(function(resp) { return resp.json() }) // Convert data to json
  .then(function(data) {
    console.log(data);
    getCoord(data.coord.lat, data.coord.lon);
  })
  .catch(function() {
      alert("Something went wrong445 , please try again!")
  });
}
function getCoord( latitude, longitude ) {
  var url = "https://api.openweathermap.org/data/2.5/onecall?lat=" + latitude+ "&lon=" + longitude +"&units=metric&appid=" + apiKey;
  console.log(url);

  fetch(url)  
  .then(function(resp) { return resp.json() }) // Convert data to json
  .then(function(data) {
    console.log(data);
    drawWeather(data); 
  })
  .catch(function() {
    // catch any errors
  });
}

function basicUI(info) {
  todayTempEl.text(info.temperature);
  todayHumidityEl.text(info.humidity + "%");
  todayUVEl.text(info.UVIndex);
  todayWindEl.text(info.wind);

  var iconurl = "http://openweathermap.org/img/wn/" + weatherInfo.ico + "@2x.png";
  imgtodayIcon.attr('src', iconurl);

  for (var i=1; i<=5; i++) {
    //forecast-temp-1
    var forecastTemp = $('#forecast-temp-' + i);
    forecastTemp.text(forecast[i].temperature);

    var forecastHumidity = $('#forecast-humidity-' + i);
    forecastHumidity.text(forecast[i].humidity + "%");

    var iconurl = "http://openweathermap.org/img/wn/" + forecast[i].ico + "@2x.png";
    console.log(iconurl);

    var imgicon = $('#weather-icon-' + i);
    imgicon.attr("src", iconurl);
  }
}
  function getTempInCelsius(temp) {
    var celcius = Math.round(parseFloat(temp)-273.15);
    return celcius;
  }
  function getAverageTemp(temp1, temp2, temp3, temp4) {
    return ((temp1 + temp2 + temp3 + temp4) /4).toFixed(2);
  }
  function drawWeather( d ) {
    console.log("corod: " + d.current.temp);
    weatherInfo.temperature = getTempInCelsius(d.current.temp);
    weatherInfo.humidity = d.current.humidity
    weatherInfo.wind = d.current.wind_speed;
    weatherInfo.UVIndex = d.current.uvi;
    weatherInfo.city = cityNameEl.text();
    weatherInfo.ico = d.current.weather[0].icon;
    console.log("got : " + weatherInfo.ico);

    var daily = d.daily;
    console.log(daily);

    for (var i=0; i<daily.length; i++) {
    //  var forecast =  new weatherInfo();
      var avg = getAverageTemp(daily[i].feels_like.day, daily[i].feels_like.night ,daily[i].feels_like.morn ,daily[i].feels_like.eve);

      var weather = Object.create(weatherInfo);
      weather.temperature = avg;
      weather.humidity = daily[i].humidity;
      weather.wind = daily[i].wind_speed;
      weather.UVIndex = daily[i].uvi;
      weather.ico = daily[i].weather[0].icon;
      forecast.push(weather);
    }

    console.log(forecast);
    basicUI(weatherInfo);



  }

