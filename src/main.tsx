import * as Sentry from "@sentry/react";
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// ─── SENTRY INITIALIZATION ─────────────────────────────────────────────────────
Sentry.init({
  dsn: "https://811b000087257bf8aee6683ea7d5bc35@o4511671336501248.ingest.us.sentry.io/4511671340236801",
  
  // Optional: Configure data collection
  dataCollection: {
    // To disable sending user data and HTTP bodies, uncomment the lines below:
    // userInfo: false,
    // httpBodies: []
  },
  
  // Recommended: Add integrations for better error tracking
  integrations: [
    Sentry.browserTracingIntegration(),
    Sentry.replayIntegration(),
  ],
  
  // Set tracesSampleRate to 1.0 to capture 100% of transactions for performance monitoring
  tracesSampleRate: 1.0,
  
  // Set `tracePropagationTargets` to control for which URLs distributed tracing should be enabled
  tracePropagationTargets: ["localhost", /^https:\/\/yourserver\.io\/api/],
  
  // Capture Replay for 10% of all sessions, plus 100% of sessions with an error
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
});

// ─── REACT ROOT RENDERING ──────────────────────────────────────────────────────
const container = document.getElementById("app");

if (!container) {
  throw new Error('Root element with id "app" not found in DOM');
}

const root = ReactDOM.createRoot(container);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
