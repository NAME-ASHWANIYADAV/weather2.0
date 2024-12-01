import React from "react";
import apiKeys from "./apiKeys";
import Clock from "react-live-clock";
import Forcast from "./forcast";
import loader from "./images/WeatherIcons.gif";
import ReactAnimatedWeather from "react-animated-weather";

const dateBuilder = (d) => {
  let months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  let days = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];

  let day = days[d.getDay()];
  let date = d.getDate();
  let month = months[d.getMonth()];
  let year = d.getFullYear();

  return `${day}, ${date} ${month} ${year}`;
};

const defaults = {
  color: "white",
  size: 112,
  animate: true,
};

class Weather extends React.Component {
  state = {
    lat: undefined,
    lon: undefined,
    errorMessage: undefined,
    temperatureC: undefined,
    temperatureF: undefined,
    city: undefined,
    country: undefined,
    humidity: undefined,
    description: undefined,
    icon: "CLEAR_DAY",
    sunrise: undefined,
    sunset: undefined,
    errorMsg: undefined,
  };

  componentDidMount() {
    if (navigator.geolocation) {
      this.getPosition()
        // If user allows location service, fetch data & send it to get-weather function.
        .then((position) => {
          this.getWeather(position.coords.latitude, position.coords.longitude);
        })
        .catch((err) => {
          // If user denied location service, show weather based on default coordinates.
          this.getWeather(28.67, 77.22);
          alert(
            "You have disabled location service. Allow 'This APP' to access your location. Your current location will be used for calculating Real-time weather."
          );
        });
    } else {
      alert("Geolocation not available");
    }

    this.timerID = setInterval(
      () => this.getWeather(this.state.lat, this.state.lon),
      600000
    );
  }

  componentWillUnmount() {
    clearInterval(this.timerID);
  }

  // Helper to get geolocation
  getPosition = (options) => {
    return new Promise(function (resolve, reject) {
      navigator.geolocation.getCurrentPosition(resolve, reject, options);
    });
  };

  // Weather API call
  getWeather = async (lat, lon) => {
    try {
      const api_call = await fetch(
        `${apiKeys.base}weather?lat=${lat}&lon=${lon}&units=metric&APPID=${apiKeys.key}`
      );
      const data = await api_call.json();

      if (!api_call.ok) {
        throw new Error(data.message || "Failed to fetch weather data");
      }

      // Check and safely access fields
      const temperatureC = data.main?.temp ? Math.round(data.main.temp) : null;
      const temperatureF = data.main?.temp
        ? Math.round(data.main.temp * 1.8 + 32)
        : null;
      const main = data.weather?.[0]?.main || "Unknown";
      const humidity = data.main?.humidity || "N/A";
      const city = data.name || "Unknown";
      const country = data.sys?.country || "Unknown";

      this.setState({
        lat: lat,
        lon: lon,
        city,
        temperatureC,
        temperatureF,
        humidity,
        main,
        country,
        errorMsg: null, // Clear previous errors
      });

      // Set icon based on weather conditions
      this.setWeatherIcon(main);
    } catch (error) {
      console.error("Error fetching weather data:", error.message);
      this.setState({
        errorMsg: error.message || "Something went wrong",
        temperatureC: null,
      });
    }
  };

  // Function to set weather icon based on conditions
  setWeatherIcon = (main) => {
    const weatherIcons = {
      Haze: "CLEAR_DAY",
      Clouds: "CLOUDY",
      Rain: "RAIN",
      Snow: "SNOW",
      Dust: "WIND",
      Drizzle: "SLEET",
      Fog: "FOG",
      Smoke: "FOG",
      Tornado: "WIND",
      default: "CLEAR_DAY",
    };

    this.setState({ icon: weatherIcons[main] || weatherIcons.default });
  };

  render() {
    if (this.state.errorMsg) {
      return (
        <React.Fragment>
          <h3 style={{ color: "white", fontSize: "22px", fontWeight: "600" }}>
            {this.state.errorMsg}
          </h3>
        </React.Fragment>
      );
    }

    if (this.state.temperatureC) {
      return (
        <React.Fragment>
          <div className="city">
            <div className="title">
              <h2>{this.state.city}</h2>
              <h3>{this.state.country}</h3>
            </div>
            <div className="mb-icon">
              <ReactAnimatedWeather
                icon={this.state.icon}
                color={defaults.color}
                size={defaults.size}
                animate={defaults.animate}
              />
              <p>{this.state.main}</p>
            </div>
            <div className="date-time">
              <div className="dmy">
                <Clock format="HH:mm:ss" interval={1000} ticking={true} />
                <div className="current-date">
                  {dateBuilder(new Date())}
                </div>
              </div>
              <div className="temperature">
                <p>
                  {this.state.temperatureC}°<span>C</span>
                </p>
              </div>
            </div>
          </div>
          <Forcast icon={this.state.icon} weather={this.state.main} />
        </React.Fragment>
      );
    } else {
      return (
        <React.Fragment>
          <img src={loader} style={{ width: "50%", WebkitUserDrag: "none" }} />
          <h3 style={{ color: "white", fontSize: "22px", fontWeight: "600" }}>
            Detecting your location
          </h3>
          <h3 style={{ color: "white", marginTop: "10px" }}>
            Your current location will be displayed on the App <br /> & used
            for calculating Real-time weather.
          </h3>
        </React.Fragment>
      );
    }
  }
}

export default Weather;


