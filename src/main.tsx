import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux';
import store from './store';
import './index.css'
import App from './App.tsx'
import logger from './utils/logging/logger.ts'

logger.info("App is starting...");

createRoot(document.getElementById('root')!).render(
  <Provider store={store}>
    <App />
  </Provider>
)
