import axios from "axios";

const API_URL = "http://localhost:3000/weather/data";
const cities = ["Lyon", "Paris"];

function randomDate2025() {
    const start = new Date("2025-01-01T00:00:00Z").getTime();
    const end = new Date("2025-12-31T23:59:59Z").getTime();
    return new Date(start + Math.random() * (end - start)).toISOString();
}

function randomTemperature(city) {

    const base = city === "Lyon" ? 5 : 3;
    const seasonalVariation = Math.random() * 25; // -5 à +20
    return Math.round(base + seasonalVariation);
}

function randomHumidity() {
    return Math.round(30 + Math.random() * 50); // 30 à 80%
}

async function sendData() {
    const payload = [];

    for (let i = 0; i < 100; i++) {
        const city = cities[Math.floor(Math.random() * cities.length)];
        payload.push({
            location: city,
            date: randomDate2025(),
            temperature: randomTemperature(city),
            humidity: randomHumidity(),
        });
    }

    console.log("Envoi de 100 objets météo...");

    try {
        payload.forEach(async (data, index) => {
            await axios.post(API_URL, data)
            console.log(`Data n°${index} chargée`);
            
        });
    } catch (err) {
        console.error("Erreur lors de l'envoi :", err);
    }
}

sendData();
