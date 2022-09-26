import axios from 'axios';

// Conecta com a api com a baseURL = http://localhost:3333
export const api = axios.create({
  baseURL: 'http://localhost:3333',
});
