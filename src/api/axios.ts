import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export const instance = axios.create({
  baseURL: API_BASE_URL || undefined,
  headers: {
    Accept: 'application/json',
  },
});
