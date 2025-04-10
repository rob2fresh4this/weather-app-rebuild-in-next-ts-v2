export function getFromLocalStorage() {
    if (typeof window === "undefined") {
        return []; // Return an empty array during SSR
    }

    console.log('Getting from local storage');
    const localStorageData = localStorage.getItem('CityORState');
    if (localStorageData === null) {
        return [];
    }
    return JSON.parse(localStorageData); // Return as array
}

export function saveToLocalStorage(CityORStat: string) {
    if (typeof window === "undefined") {
        return; // Skip saving if running on the server
    }

    console.log(`Saving ${CityORStat} to local storage`);
    const getCityOrState = getFromLocalStorage();
    if (!getCityOrState.includes(CityORStat)) {
        getCityOrState.push(CityORStat);
        localStorage.setItem('CityORState', JSON.stringify(getCityOrState));
    }
}

export function removeFromLocalStorage(CityORStat: string) {
    if (typeof window === "undefined") {
        return; // Skip removing if running on the server
    }

    console.log(`Removing ${CityORStat} from local storage`);
    const getCityOrState = getFromLocalStorage();
    const index = getCityOrState.indexOf(CityORStat);
    if (index > -1) {
        getCityOrState.splice(index, 1); // Remove the item
        localStorage.setItem('CityORState', JSON.stringify(getCityOrState));
    }
}


interface WeatherMain {
    temp: number;
    temp_min: number;
    temp_max: number;
}

interface WeatherDescription {
    description: string;
}

interface ForecastData {
    dt_txt: string;
    main: WeatherMain;
    weather: WeatherDescription[];
}

interface ForecastEntry {
    day: string;
    temp: number;
    temp_min: number;
    temp_max: number;
    description: string;
}

export function get5DaysForcast(data: { list: ForecastData[] }): ForecastEntry[] {
    const forecast: ForecastEntry[] = [];
    const addedDays = new Set();

    for (let i = 0; i < data.list.length; i++) {
        const forecastEntry = data.list[i];
        const entryDate = new Date(forecastEntry.dt_txt);
        const day = entryDate.toLocaleString('en-US', { weekday: 'long' });

        // Ensure we get the first available forecast for today or 12:00 PM for other days
        if (!addedDays.has(day) && (i === 0 || forecastEntry.dt_txt.includes('12:00:00'))) {
            forecast.push({
                day,
                temp: roundCustom(forecastEntry.main.temp),
                temp_min: roundCustom(forecastEntry.main.temp_min),
                temp_max: roundCustom(forecastEntry.main.temp_max),
                description: forecastEntry.weather[0].description,
            });
            addedDays.add(day);
        }
        if (forecast.length === 5) break;
    }

    return forecast;
}

// Custom rounding function
function roundCustom(num: number): number {
    return (num % 1 > 0.4) ? Math.ceil(num) : Math.floor(num);
}



