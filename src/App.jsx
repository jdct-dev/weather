import { useState, useEffect } from "react";
import "./App.css";

const bootstrapIconMap = {
  "01d": "bi-sun-fill",
  "01n": "bi-moon-stars-fill",
  "02d": "bi-cloud-sun-fill",
  "02n": "bi-cloud-moon-fill",
  "03d": "bi-cloud-fill",
  "03n": "bi-cloud-fill",
  "04d": "bi-clouds-fill",
  "04n": "bi-clouds-fill",
  "09d": "bi-cloud-drizzle-fill",
  "09n": "bi-cloud-drizzle-fill",
  "10d": "bi-cloud-rain-fill",
  "10n": "bi-cloud-rain-fill",
  "11d": "bi-cloud-lightning-rain-fill",
  "11n": "bi-cloud-lightning-rain-fill",
  "13d": "bi-snow",
  "13n": "bi-snow",
  "50d": "bi-cloud-haze2-fill",
  "50n": "bi-cloud-haze2-fill",
};

function App() {
  const [weather, setWeather] = useState(null);
  const [coords, setCoords] = useState({
    latitude: 0,
    longitude: 0,
  });
  const [city, setCity] = useState("");

  const API_KEY = import.meta.env.VITE_API_KEY;

  const handleSearch = () => {
    if (!city.trim()) return alert("Vui lòng nhập tên thành phố.");

    fetch(
      `https://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=1&appid=${API_KEY}`
    )
      .then((res) => res.json())
      .then((data) => {
        if (data.length === 0) {
          alert("Không tìm thấy thành phố.");
          return;
        }
        const { lat, lon } = data[0];
        setCoords({ latitude: lat, longitude: lon });
      })
      .catch(console.error);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const getHere = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCoords({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (error) => {
          console.error("Không thể lấy vị trí:", error);
          alert("Vui lòng bật định vị để xem thời tiết.");
        }
      );
    } else {
      alert("Trình duyệt không hỗ trợ định vị.");
    }
  };

  // 1️⃣ Lấy vị trí người dùng
  useEffect(getHere, []);

  // 2️⃣ Khi đã có tọa độ, gọi API
  useEffect(() => {
    if (!coords) return;

    const getWeatherData = () => {
      fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${coords.latitude}&lon=${coords.longitude}&appid=${API_KEY}&units=metric`
      )
        .then((res) => res.json())
        .then((data) => setWeather(data))
        .catch(console.error);
    };

    const intervalId = setInterval(getWeatherData, 60000); // Cập nhật mỗi 60 giây

    // Gọi ngay lần đầu tiên
    getWeatherData();

    return () => clearInterval(intervalId); // Dọn dẹp khi component unmount hoặc coords thay đổi
  }, [coords]);

  // 3️⃣ Hiển thị
  if (!weather) return <p>Fetching weather data...</p>;
  return (
    <div className="weather-card">
      <div className="search-box mb-4 d-flex">
        <input
          type="text"
          className="form-control"
          placeholder="Enter city name..."
          value={city}
          onChange={(e) => setCity(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <button className="btn btn-primary" onClick={handleSearch}>
          <i className="bi bi-search"></i>
        </button>
      </div>

      <div className="weather-info">
        <i
          className={`bi ${
            bootstrapIconMap[weather.weather[0].icon] || "bi-cloud-sun"
          } weather-icon`}
        ></i>
        <h2 className="city mt-3">
          {weather?.name ?? city}
          <button className="btn btn-secondary ms-2" onClick={getHere}>
            <i className="bi bi-geo-alt-fill"></i>
          </button>
        </h2>
        <div className="temp mt-2">{weather?.main?.temp ?? "—"}°C</div>
        <p className="text-muted mb-0">
          {weather?.weather?.[0]?.description
            .split(" ")
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" ") ?? "—"}
        </p>
        <hr />
        <div className="row text-center mt-3">
          <div className="col">
            <i className="bi bi-wind"></i>
            <p className="mb-0">{weather?.wind?.speed ?? "-"} m/s</p>
            <small>Wind</small>
          </div>
          <div className="col">
            <i className="bi bi-droplet"></i>
            <p className="mb-0">{weather?.main?.humidity ?? "-"}%</p>
            <small>Humidity</small>
          </div>
          <div className="col">
            <i className="bi bi-thermometer-half"></i>
            <p className="mb-0">{weather?.main?.feels_like ?? "-"}°C</p>
            <small>Feels Like</small>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
