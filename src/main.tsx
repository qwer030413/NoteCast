import { createRoot } from 'react-dom/client'
import {BrowserRouter } from "react-router-dom";
import { Amplify } from 'aws-amplify'

import './index.css'
import App from './App.tsx'

Amplify.configure({
  Auth: {
    Cognito: {
      userPoolClientId: '1ok7cgcfgmmeg2n8tnkt4rlj6e',
      userPoolId: 'us-east-2_oHdmf5rj9',
      loginWith: {
        oauth: {
          domain: 'us-east-2ohdmf5rj9.auth.us-east-2.amazoncognito.com',
          scopes: ['email', 'openid', 'phone'],
          redirectSignIn: ['http://localhost:5173/NoteCast/'],
          redirectSignOut: ['http://localhost:5173/NoteCast/Login/'],
          responseType: 'code',
        },
      },
    },
  },
})
createRoot(document.getElementById('root')!).render(
  <BrowserRouter basename="/NoteCast">
      <App />
  </BrowserRouter>
)
