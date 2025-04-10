"use client"

import { get5DaysForcast, getFromLocalStorage, saveToLocalStorage, removeFromLocalStorage } from './WeatherLogic'
import DATA from './data.json'
import { APIkey } from './environment'
import { useEffect, useState } from 'react'
import staricon from '@/app/Assets/star-regular (1).svg'
import MagnifyingGlass from '@/app/Assets/magnifying-glass-solid (1).svg'
import Ellipsis from '@/app/Assets/ellipsis-solid.svg'

const WeatherApp = () => {

    interface ForecastEntry {
        day: string;
        temp: number;
        temp_min: number;
        temp_max: number;
        description: string;
    }

    const [forecast, setForecast] = useState<ForecastEntry[]>([]);
    const [cityName, setCityName] = useState('');
    const [usersInput, setUsersInput] = useState('');
    const [savedCities, setSavedCities] = useState<string[]>(getFromLocalStorage());
    const isFavorite = savedCities.includes(cityName);  // Check if city is saved


    const key: string = APIkey;

    async function getWeatherData(city: string) {
        const response = await fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${key}&units=imperial`);
        const data = await response.json();
        console.log(data);

        if (data.city) {
            setCityName(`${data.city.name}, ${data.city.country}`);
            return data;
        } else {
            console.log('Error fetching weather data:', data);
            return null;
        }
    }

    async function handleSearch() {
        if (!usersInput.trim()) {
            alert('Please enter a city name');
            return;
        }

        const newData = await getWeatherData(usersInput);
        if (newData) {
            setForecast(get5DaysForcast(newData));
        }
    }

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };


    async function handleSave() {
        const data = await getWeatherData(cityName);
        const city = data?.city.name + ', ' + data?.city.country;

        if (!city) return;

        const currentSavedCities = getFromLocalStorage();

        if (currentSavedCities.includes(city)) {
            removeFromLocalStorage(city);
            setSavedCities(currentSavedCities.filter((savedCity: string) => savedCity !== city));
        } else {
            saveToLocalStorage(city);
            setSavedCities([...currentSavedCities, city]);
        }
    }

    const handleGo = async (city: string) => {
        setUsersInput(city);
        const newData = await getWeatherData(city);
        if (newData) {
            setForecast(get5DaysForcast(newData));
        }
    };

    const handleRemove = (city: string) => {
        removeFromLocalStorage(city);
        setSavedCities(savedCities.filter((savedCity) => savedCity !== city));
    };

    const starColor = isFavorite
        ? 'invert(40%) sepia(100%) saturate(500%) hue-rotate(20deg)'
        : 'invert(60%) sepia(20%) saturate(100%) hue-rotate(200deg)';


    useEffect(() => {
        const cities = getFromLocalStorage();
        setSavedCities(cities);
    }, [cityName]);




    useEffect(() => {
        alert(`stop burining my api key`);
        navigator.geolocation.getCurrentPosition(success, error);

        function success(position: GeolocationPosition) {
            const lon = position.coords.longitude;
            const lat = position.coords.latitude;
            console.log(`Longitude: ${lon} | Latitude: ${lat}`);
            GetUsersLocation(lon, lat);
        }


        function error() {
            console.log(`Error fetching location: getting dummy data`);
            console.log(DATA);
            setForecast(get5DaysForcast(DATA));
            setCityName(`${DATA.city.name}, ${DATA.city.country}`);
        }

        async function GetUsersLocation(lon: number, lat: number) {
            const response = await fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${key}&units=imperial`);
            const data = await response.json();

            if (data.city) {
                setCityName(`${data.city.name}, ${data.city.country}`);
                setForecast(get5DaysForcast(data));
                console.log(data)
                console.log(get5DaysForcast(data));
            } else {
                console.log('Error fetching weather data:', data);
            }
        }
    }, []);


    return (
        <div className='w-[100%] md:h-screen bg-[#0E1323] text-[white] flex flex-col items-center justify-center'>
            <br className='block md:hidden' />
            <div className='w-[90%] md:w-[80%]  md:h-[100px] p-7 rounded-[15px] flex flex-col md:flex-row justify-between bg-[#1C204B]'>
                <div className='flex items-center justify-between w-[100%] mr-4'>
                    <div className='text-[32px]'>{cityName}</div>
                    {/* STAR ICON */}
                    <img
                        className="w-[41px]"
                        style={{ filter: starColor }}
                        src={staricon.src}
                        alt="Star"
                        onClick={handleSave}
                    />
                </div>
                <div className='flex md:flex-row flex-col items-center mt-2 md:mt-0'>
                    <div className='flex items-center overflow-hidden bg-white border-[3px] border-[#5747EA] mb-3 md:mb-0 px-[10px] w-[100%] md:w-[330px] h-[50px] rounded-[15px]'>
                        <img className='w-[25px] md:w-[30px]' src={MagnifyingGlass.src} alt="Magnifying Glass" />
                        <input
                            className="text-[18px] md:w-[330px] w-auto border-none text-[#7078C9] focus:outline-none focus:ring-0"
                            type="text"
                            placeholder="Search Location"
                            value={usersInput}
                            onKeyDown={handleKeyDown}
                            onChange={(e) => setUsersInput(e.target.value)}
                        />
                    </div>
                    <button onClick={handleSearch} className='bg-[#0D6EFD] w-[100%] md:w-auto text-white hover:bg-blue-700 px-7 py-3 md:ml-4 rounded-[10px]'>Search</button>
                </div>
            </div>
            <br />

            <div className='w-[90%] md:w-[80%] flex justify-between'>
                <div className="w-[100%] flex flex-wrap justify-between">
                    {forecast.map((day, index) => (
                        <div
                            key={index}
                            className="w-full md:w-[19%] bg-[#1C204B] rounded-[15px] pt-[30px] pb-[25px] px-[30px] md:mb-0 mb-3"
                        >
                            <div className="flex justify-between items-center">
                                <div>{day.day}</div>
                                <img src={Ellipsis.src} className="w-[16px]" alt="3 dot" style={{ filter: 'invert(75%) sepia(20%) saturate(500%) hue-rotate(220deg)' }} onClick={() => alert(`yay you pressed me`)} />
                            </div>
                            <div className="flex flex-col items-center mb-[15px]">
                                <div className="text-[40px] pb-[20px]">{day.temp}°F</div>
                                <div>High - {day.temp_max}°F</div>
                                <div>Low - {day.temp_min}°F</div>
                            </div>
                            <div className="flex justify-center items-center">{day.description}</div>
                        </div>
                    ))}
                </div>

            </div>

            {/* saved locations */}
            <div className='w-[90%] md:w-[80%] mt-[20px] bg-[#1C204B] rounded-[15px] p-7 '>
                {getFromLocalStorage().map((city: string, index: number) => (
                    <div key={index}>
                        <div className='flex flex-col md:flex-row md:justify-between items-center'>
                            <div className='w-[100%] md:w-auto text-center'>{city}</div>
                            <div className='w-[100%] md:w-auto flex md:justify-end'>
                                <button onClick={() => handleRemove(city)} className='bg-[#D9534F] w-[50%] md:w-auto text-white mr-1 hover:bg-red-700 px-2 md:px-4 py-2 rounded-[10px]'>
                                    Remove
                                </button>
                                <button onClick={() => handleGo(city)} className='bg-[#009925] w-[50%] md:w-auto text-white hover:bg-green-700 px-3 md:px-7 py-2 rounded-[10px]'>
                                    Go
                                </button>
                            </div>
                        </div>
                        <br />
                    </div>
                ))}
            </div>

        </div>
    )
}

export default WeatherApp;
