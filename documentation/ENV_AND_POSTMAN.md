# Environment Variables and Postman Collection

This document explains how to use the .env file and Postman collection for the Hackertab.dev project.

## Environment Variables (.env file)

The `.env` file contains configuration variables needed to run the Hackertab.dev application. Here's what each variable does:

### Required Variables

- `VITE_API_URL`: The base URL for the API endpoints (required)
- `VITE_BUILD_TARGET`: The build target, either 'web' or 'extension' (required)

### Optional Variables

- `VITE_FIREBASE_API_KEY`: Firebase API key for authentication features
- `VITE_AMPLITUDE_URL`: Amplitude analytics endpoint
- `VITE_AMPLITUDE_KEY`: Amplitude analytics key
- `VITE_SENTRY_DSN`: Sentry DSN for error tracking
- `VITE_SENTRY_TOKEN`: Sentry authentication token
- `VITE_BUILD_PLATFORM`: For extension builds, either 'chrome' or 'firefox'

### Usage

1. Copy the `.env` file to your project root
2. Update the values according to your environment
3. For local development, you might use:
   ```
   VITE_API_URL=http://localhost:3001
   VITE_BUILD_TARGET=web
   ```

## Postman Collection

The `Hackertab_API.postman_collection.json` file contains a collection of API endpoints used by the Hackertab.dev application.

### Importing the Collection

1. Open Postman
2. Click on "Import" in the top left
3. Select the `Hackertab_API.postman_collection.json` file
4. The collection will be imported with all API endpoints

### Using the Collection

The collection includes requests for:

- Hacker News articles
- GitHub repositories (by tag and date range)
- Product Hunt products
- Dev.to articles (by tag)
- Hashnode articles (by tag)
- Conferences (by tag)
- Medium articles (by tag)
- Reddit articles (by tag)

Each request uses the `{{base_url}}` variable, which is set to `https://api.devare.dev` by default. You can modify this variable in Postman to point to your local development server or a different environment.

### Example Usage

1. Select a request from the collection (e.g., "Hacker News Articles")
2. Click "Send" to make the request
3. View the response in the lower panel

For parameterized requests (like GitHub repositories), you can modify the path variables:

1. Click on the request
2. Modify the URL path variables in the address bar
3. Click "Send" to make the request with your parameters
