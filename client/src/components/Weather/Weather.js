import React, {useEffect, useState, useCallback} from 'react';
import './Weather.css';
import Forecast from '../forecast/Forecast';
import Snow from '../assets/images/snow.png';
import Clouds from '../assets/images/cloudy.png';
import Rain from '../assets/images/raining.png';
import Sun from '../assets/images/sunny.png';
import Clear from '../assets/images/clear.png';
import Haze from '../assets/images/haze.png';
import { saveLocation } from '../../service/libraryService';
import { getCurrent, getForecast, geocodingService } from '../../service/weatherService';

export default function Weather() {
  const [forecastData, setForecastData] = useState(null);
  const [weatherData, setWeatherData] = useState(null);
  const [location, setLocation] = useState('');
  const [searched, setSearched] = useState('');

  const weatherConditions = {
    "Snow": Snow,
    "Clouds": Clouds,
    "Rain": Rain,
    "Sun": Sun,
    "Clear": Clear,
    "Haze": Haze
  };

  const getLocation = useCallback(async () => {
    await navigator.geolocation.getCurrentPosition(successCallback, 
     errorCallback, {
       timeout: 10_000
   });
  }, []);

  useEffect(() => {
    if (!location) {
      getLocation();
    } else {
      fetchWeatherData(location);
    };
  }, [location, getLocation]);

  const fetchWeatherData = async (location) => {
    const [current, forecast] = await Promise.all([getCurrent(location), getForecast(location)]);

    setForecastData(forecast.data.list);
    setWeatherData(current.data);
  };

  const successCallback = async (position) => {
    const foundLocData = await geocodingService(position);
    const foundLoc = foundLocData.data[0].name;
    setLocation(foundLoc);
  };

  const errorCallback = (error) => {
    const fallbackLoc = 'Vancouver';
    if (error.code === error.PERMISSION_DENIED) {
      setLocation(fallbackLoc);
    };
  };

  const onSubmit = (event) => {
    event.preventDefault();
    if (searched) {
      setLocation(searched);
    };
    event.target.reset();
  };

  const handleSave = () => {
    saveLocation(location);
  };

  return (
    <>
      {weatherData ? <div className='container'>
        <div className='weather-header_elements'>
          <div className='search'>
            <form onSubmit={onSubmit}>
              <input
                  type="text"
                  placeholder="Enter location"
                  onChange={(e) =>{
                    setSearched(e.target.value);
                  }}
              />
              <button type="submit">Submit</button>
            </form>
          </div>
          <button className='add-loc_btn' onClick={handleSave}>+</button>
        </div>
        <div>
          <div className='top'>
            <div className='location'>
              <h1>{weatherData.name}</h1>
            </div>
            <div className='temp'>
              <p>{weatherData.main.temp.toFixed()}°C</p>
              <img src={weatherConditions[weatherData.weather[0].main]} className='weather-img' alt='weather-img' />
            </div>
            <div className='description'>
              <p>{weatherData.weather.main}</p>
            </div>
          </div>
          <div className='center'>
            <div className='feels'>
              <p>{weatherData.main.feels_like.toFixed()}°C</p>
              <p>Feels like</p>
            </div>
            <div className='humidity'>
              <p>{weatherData.main.humidity}%</p>
              <p>Humidity</p>
            </div>
            <div className='winds'>
              <p>{weatherData.wind.speed} MPH</p>
              <p>Winds</p>
            </div>
          </div>
          {forecastData && <Forecast forecastData={forecastData}/>}
        </div> 
      </div> : null}
    </>
  );
};