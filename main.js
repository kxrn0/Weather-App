const searchButton = document.querySelector(".search-button");
const searchInput = document.querySelector(".search-bar input[type='search']");
const units = document.querySelector(".units-toggle input[type='checkbox']");

searchButton.addEventListener("click", async () => {
    let value;

    value = searchInput.value.trim();

    if (!value)
        return;

    let latLonReg, cityStateReg, zipReg, data, latLong, location;

    latLonReg = /-?[0-9]{1,2},-?[0-9]{1,3}/;
    cityStateReg = /^([a-z]|\s)+(,([a-z]|\s)+)?(,([a-z]|\s)+)?$/i;
    zipReg = /^[0-9]{5}(,([a-z]|\s)+)?$/i;

    try {
        if (latLonReg.test(value)) {
            value = clean_input(value);
            latLong = value.split(',');
        }
        else if (cityStateReg.test(value)) {
            value = clean_input(value);
            latLong = await fetch(`http://api.openweathermap.org/geo/1.0/direct?q=${value}&limit=1&appid=e3b892de614d5d5524562f921655485e`);
        }
        else if (zipReg.test(value)) {
            value = clean_input(value);
            latLong = await fetch(`http://api.openweathermap.org/geo/1.0/zip?zip=${value}&appid=e3b892de614d5d5524562f921655485e`);
        }
        else {
            //...
            throw new Error("バカバカバカ！");
        }
        if (latLong.json) {
            latLong = await latLong.json();
            if (latLong.zip) {
                location = `${latLong.name},${latLong.country}`;
                latLong = [Math.round(Number(latLong.lat)), Math.round(Number(latLong.lon))];
            }
            else {
                location = `${latLong[0].name},${latLong[0].country}`;
                latLong = `${Math.round(Number(latLong[0].lat))},${Math.round(Number(latLong[0].lon))}`.split(',');
            }
        }
        data = await fetch(`https://api.openweathermap.org/data/2.5/onecall?lat=${latLong[0]}&lon=${latLong[1]}&exclude=minutely,alerts&units=${units.checked ? "imperial" : "metric" }&appid=e3b892de614d5d5524562f921655485e`, { method: "GET" });
        data = await data.json();
        console.log(data);
        console.log(location);
    }
    catch (error) {
        console.log(error);
    }
});

function clean_input(value) {
    return value.split(',').map(str => str.trim().split(' ').join('+')).join(',');
}

function run_clock() {
    const date = document.querySelector(".date");
    const time = document.querySelector(".time");
    const today = new Date();
}

function populate_main_section() {
    const absoluteState = document.querySelector(".the-absolute-state");
    const temperature = document.querySelector(".temperature");
    const location = document.querySelector(".location");
}

function populate_hourly_section() {

}

function populate_daily_section() {

}