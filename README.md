# Necxis Web App

This is the web application for the Necxis project.

## Features

- Google Sign-Up / Sign-In
- Responsive UI with Material UI
- Firebase Authentication
- WebView integration with Expo mobile app
- Communication between web and mobile app

## Getting Started

### Prerequisites

- Node.js 16.8 or later
- npm or yarn
- Firebase project

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd necxis-project/web-app
```

2. Install dependencies:
```bash
npm install
# or
yarn
```

3. Set up environment variables:
   - Copy `.env.local.example` to `.env.local`
   - Fill in your Firebase configuration values

4. Run the development server:
```bash
npm run dev
# or
yarn dev
```

5. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### Building for Production

```bash
npm run build
# or
yarn build
```

The build output will be in the `out` directory, which can be used in the Expo WebView.

## Deployment

The web application is deployed at: [https://necxisweb.netlify.app](https://necxisweb.netlify.app)

## Local Development

To run the project locally:

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

## Mobile Integration

When integrating with the mobile app, use the hosted URL:

```javascript
// In your React Native code:
<WebView 
  source={{ uri: 'https://necxisweb.netlify.app' }}
  // other WebView props
/>
```

## Firebase Setup

1. Create a new Firebase project at [Firebase Console](https://console.firebase.google.com/)
2. Enable Authentication and the Google sign-in method
3. Create a web app and copy your configuration
4. Add the configuration to your `.env.local` file

## License

This project is licensed under the MIT License. 