import Login from './Pages/Login';
import './App.css'
import { Route,Routes } from 'react-router-dom';
import SignUp from './Pages/SignUp';
import Home from './Pages/Home';
import { AuthRoute } from './components/UserAuth/AuthRoute';
import { Toaster } from "@/components/ui/sonner"
import ForgotPassword from './Pages/ForgotPassword';
import ResetPassword from './Pages/ResetPassword';
import Layout from './Pages/Layout';
import Notes from './Pages/Notes';
import Podcasts from './Pages/Podcasts';
import Summerize from './Pages/Summerize';
import Settings from './Pages/Settings';
import Account from './Pages/Account';
import { AwsClientProvider } from './aws/ClientProvider';
import { AuthProvider } from './aws/AuthProvider';
function App() {
  return (
   <>
      <Toaster position="top-center" richColors expand={true} />
      <AuthProvider>
        <AwsClientProvider>
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="SignUp" element={<SignUp />} />
            <Route path="ForgotPassword" element={<ForgotPassword />} />
            <Route path="ResetPassword" element={<ResetPassword />} />

            <Route
              element={
                <AuthRoute>
                  <Layout />
                </AuthRoute>
              }
            >
              <Route path="Home" element={<Home />} />
              <Route path="Notes" element={<Notes />} />
              <Route path="Podcasts" element={<Podcasts />} />
              <Route path="Summerize" element={<Summerize />} />
              <Route path="Settings" element={<Settings />} />
              <Route path="Account" element={<Account />} />
            </Route>
          </Routes>
        </AwsClientProvider>
      </AuthProvider>
    </>
  )
}

export default App
