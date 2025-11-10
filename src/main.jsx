import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { Auth0Provider } from '@auth0/auth0-react'


createRoot(document.getElementById('root')).render(
  <Auth0Provider
      domain="dev-c5cya7ea1phr4j8p.us.auth0.com"
      clientId="qjbNYZujMhqauNgx8pgHhKvgIWliJWnP"
      authorizationParams={{
        audience: "https://dev-c5cya7ea1phr4j8p.us.auth0.com/api/v2/",
        redirect_uri: window.location.origin
      }}
    >
    <App />
  </Auth0Provider>,
)