const config = {
  // In the browser, use the window location to determine the API URL
  // In server-side rendering or during build, use the environment variable or default
  apiUrl: typeof window !== 'undefined' 
    ? (process.env.VUE_APP_API_URL || window.location.origin.replace(/:8080$/, ':6060'))
    : (process.env.VUE_APP_API_URL || 'http://avocadoair-api:3000'),
  nodeEnv: process.env.NODE_ENV || 'development',
  appPort: process.env.PORT || 8080
};

export default config; 