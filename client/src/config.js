// Single source of truth for the API server URL.
// In production set VITE_API_URL to your deployed backend (e.g. https://api.flixcoach.de)
export const API_URL = import.meta.env.VITE_API_URL || 'https://flixcoach.onrender.com';
