export const API_BASE_URL = "https://api-gateway-px44.onrender.com/api/";

// export const API_BASE_URL = "http://localhost:8082/api/";

import axios from "axios";

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});
