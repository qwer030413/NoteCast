import { createRoot } from 'react-dom/client'
import {BrowserRouter } from "react-router-dom";
import { Amplify } from 'aws-amplify'
import { HashRouter } from "react-router-dom";

import './index.css'
import App from './App.tsx'

Amplify.configure({
  Auth: {
    Cognito: {
      userPoolClientId: '1ok7cgcfgmmeg2n8tnkt4rlj6e',
      userPoolId: 'us-east-2_oHdmf5rj9',
      identityPoolId: 'us-east-2:d542bf4a-fbe1-4f43-a49c-1528208f711c',
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
  Storage: {
    S3: {
      bucket: 'note-cast-user',
      region: 'us-east-2',
    }
  }
})
createRoot(document.getElementById('root')!).render(
  // <BrowserRouter basename="/NoteCast">
  //     <App />
  // </BrowserRouter>
  <HashRouter>
    <App />
  </HashRouter>
)
