const searchButton = document.querySelector(".search-button");
const searchInput = document.querySelector(".search-bar input[type='search']");
const units = document.querySelector(".units-toggle input[type='checkbox']");
const warning = document.querySelector(".search-error");
let coordinates, disabled, timeToWait, timeOurs;

coordinates = "35,139";
run_clock()
query_weather_data(coordinates);

function query_weather_data(value = coordinates) {
    if (!timeToWait)
        timeToWait = 60 - new Date().getMinutes();
    else
        timeToWait = 60;
    get_weather_data(value);
    timeOurs = setTimeout(query_weather_data, timeToWait * 6e4);
    timeToWait = 60;
}

searchButton.addEventListener("click", () => {
    let value;

    value = searchInput.value.trim();
    clearTimeout(timeOurs);
    timeToWait = null;
    query_weather_data(value);
});

async function get_weather_data(value) {
    if (!value)
        return;

    let latLonReg, cityStateReg, zipReg, data, latLong, location;

    disabled = false;
    warning.style.display = "none";
    latLonReg = /-?[0-9]{1,2}\s?,\s?-?[0-9]{1,3}/;
    cityStateReg = /^([a-z]|\s)+(,([a-z]|\s)+)?(,([a-z]|\s)+)?$/i;
    zipReg = /^[0-9]{5}(,([a-z]|\s)+)?$/i;

    try {
        if (latLonReg.test(value)) {
            let geoloc;

            value = clean_input(value);
            latLong = value.split(',');
            coordinates = `${latLong[0]},${latLong[1]}`;
            geoloc = await fetch(`https://api.openweathermap.org/geo/1.0/reverse?lat=${latLong[0]}&lon=${latLong[1]}&limit=1&appid=e3b892de614d5d5524562f921655485e`, { method: "GET" });
            geoloc = await geoloc.json();
            location = `${geoloc[0].name}, ${geoloc[0].country}`;
        }
        else if (cityStateReg.test(value)) {
            value = clean_input(value);
            latLong = await fetch(`https://api.openweathermap.org/geo/1.0/direct?q=${value}&limit=1&appid=e3b892de614d5d5524562f921655485e`, { method: "GET" });
        }
        else if (zipReg.test(value)) {
            value = clean_input(value);
            latLong = await fetch(`https://api.openweathermap.org/geo/1.0/zip?zip=${value}&appid=e3b892de614d5d5524562f921655485e`, { method: "GET" });
        }
        else {
            throw new Error("バカバカバカ！");
        }
        if (latLong.json) {
            latLong = await latLong.json();
            if (latLong.zip) {
                location = `${latLong.name}, ${latLong.country}`;
                coordinates = `${latLong.lat},${latLong.lon}`;
                latLong = [latLong.lat, latLong.lon];
            }
            else {
                location = `${latLong[0].name}, ${latLong[0].country}`;
                coordinates = `${latLong[0].lat},${latLong[0].lon}`;
                latLong = `${latLong[0].lat},${latLong[0].lon}`.split(',');
            }
        }
        data = await fetch(`https://api.openweathermap.org/data/2.5/onecall?lat=${latLong[0]}&lon=${latLong[1]}&exclude=minutely,alerts&units=${units.checked ? "imperial" : "metric"}&appid=e3b892de614d5d5524562f921655485e`, { method: "GET" });
        data = await data.json();
        populate_main_section(data.current, location);
        populate_hourly_section(data.hourly);
        populate_daily_section(data.daily);
        searchInput.value = '';
    }
    catch (error) {
        disabled = true;
        warning.style.display = "block";
        if (error == "TypeError: Failed to fetch") {
            warning.innerText = "Error, network disconnected."
            have_fun();
        }
        else
            warning.innerText = "City not found, please try again."
    }
}

function have_fun() {
    const mainState = document.querySelector(".the-absolute-state");
    const mainTemp = document.querySelector(".main-content .temperature");
    const mainFeels = document.querySelector(".main-content .feels");
    const mainLocation = document.querySelector(".main-content .location");
    const hours = [...document.querySelectorAll(".hourly-section li")];
    const days = [...document.querySelectorAll(".daily-section tr")];

    mainState.innerText = "---- ----";
    mainTemp.innerText = "--°";
    mainFeels.innerText = "--°";
    mainLocation.innerText = "-----, --";
    hours.forEach(hour => {
        const time = hour.querySelector(".time");
        const img = hour.querySelector("img");
        const temp = hour.querySelector(".temp");

        time.innerText = "--:--";
        img.src = "./images/warning.png";
        temp.innerText = "--°";
    });
    days.forEach((day, index) => {
        if (!index)
            return;
        const daytem = day.querySelector(".day");
        const img = day.querySelector("img");
        const minTemp = day.querySelector(".min-temp");
        const maxTemp = day.querySelector(".max-temp");

        daytem.innerText = "------";
        img.src = "./images/warning.png";
        minTemp.innerText = "--°";
        maxTemp.innerText = "--°";
    });
}

units.addEventListener("click", () => {
    const mainTemp = document.querySelector(".main-content .temperature");
    const mainFeels = document.querySelector(".main-content .feels");
    const hourlyTemps = document.querySelectorAll(".hourly-section .temp");
    const dailtyMins = document.querySelectorAll(".daily-section .min-temp");
    const dailyMaxs = document.querySelectorAll(".daily-section .max-temp");

    change_units(mainTemp, units.checked);
    change_units(mainFeels, units.checked);
    hourlyTemps.forEach(temp => change_units(temp, units.checked));
    dailtyMins.forEach(temp => change_units(temp, units.checked));
    dailyMaxs.forEach(temp => change_units(temp, units.checked));
});

function change_units(element, celsiusToFahrenheit) {
    if (disabled)
        return;

    let tempReg, value;

    tempReg = /(-?\d+)/;
    value = element.innerText;
    value = tempReg.exec(value)[0];
    if (celsiusToFahrenheit)
        value = value * 1.8 + 32;
    else
        value = (value - 32) / 1.8;
    element.innerText = `${Math.round(value)}°`;
}

function clean_input(value) {
    return value.split(',').map(str => str.trim().split(' ').join('+')).join(',');
}

function run_clock() {
    const date = document.querySelector(".date");
    const time = document.querySelector(".time");
    let today, hours, minutes, seconds;

    today = new Date();
    hours = today.getHours();
    minutes = today.getMinutes();
    seconds = today.getSeconds();
    time.innerText = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    today = cap_array(today.toString().split(' '), 4).map((str, index) => !index ? str + ',' : str).join(' ');
    date.innerText = today;
    setTimeout(run_clock, 1e3);
}

function cap_array(array, length) {
    let copy;

    copy = [];
    for (let i = 0; i < length; i++)
        copy.push(array[i]);
    return copy;
}

function populate_main_section(current, city) {
    const absoluteState = document.querySelector(".the-absolute-state");
    const temperature = document.querySelector(".temperature");
    const location = document.querySelector(".location");
    const feels = document.querySelector(".feels");

    absoluteState.innerText = current.weather[0].description;
    temperature.innerText = `${Math.round(current.temp)}°`;
    location.innerText = city;
    feels.innerText = `feels like ${Math.round(current.feels_like)}°`;
}

function populate_hourly_section(hourly) {
    const cards = [...document.querySelectorAll(".hourly-section li")];

    cards.forEach((card, index) => {
        const time = card.querySelector(".time");
        const img = card.querySelector("img");
        const temp = card.querySelector(".temp");
        let today, hour;

        hour = hourly[index + 1];
        today = new Date(hour.dt * 1e3);
        time.innerText = `${String(today.getHours()).padStart(2, '0')}:00`;
        img.src = `https://openweathermap.org/img/wn/${hour.weather[0].icon}@2x.png`
        temp.innerText = `${Math.round(hour.temp)}°`;
    });
}

function populate_daily_section(daily) {
    const rows = [...document.querySelectorAll(".daily-section tr")];
    const days = [
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday"
    ];
 
    rows.forEach((row, index) => {
        if (!index)
            return;
        
        const day = row.querySelector(".day");
        const img = row.querySelector("img");
        const min = row.querySelector(".min-temp");
        const max = row.querySelector(".max-temp");
        let dayItem, thatDay;
        
        dayItem = daily[index];
        thatDay = new Date(dayItem.dt * 1000);
        day.innerText = days[thatDay.getDay()];
        img.src = `https://openweathermap.org/img/wn/${dayItem.weather[0].icon}@2x.png`;
        min.innerText = `${Math.round(dayItem.temp.min)}°`;
        max.innerText = `${Math.floor(dayItem.temp.max)}°`;
    });
}