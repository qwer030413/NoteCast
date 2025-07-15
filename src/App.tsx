import Login from './Pages/Login';
import './App.css'
import { Route,Routes } from 'react-router-dom';
import SignUp from './Pages/SignUp';
import Home from './Pages/Home';
import { AuthRoute } from './components/UserAuth/AuthRoute';
import { Toaster } from 'react-hot-toast';
import ForgotPassword from './Pages/ForgotPassword';
import ResetPassword from './Pages/ResetPassword';
import Layout from './Pages/Layout';
import Notes from './Pages/Notes';
import Podcasts from './Pages/Podcasts';
import Summerize from './Pages/Summerize';
import Settings from './Pages/Settings';

function App() {
  return (
    <>
    <Toaster/>
    <Routes>
      <Route path = "/Login" element = {<Login />} />
      <Route path = "/SignUp" element = {<SignUp />} />
      <Route path = "/ForgotPassword" element = {<ForgotPassword />} />
      <Route path = "/ResetPassword" element = {<ResetPassword />} />
      <Route path = "/"
        element = {
          <AuthRoute>
          <Layout>
            <Home /> 
          </Layout>            
          </AuthRoute>
        } 
      />
      <Route path = "/Notes"
        element = {
          <AuthRoute>
          <Layout>
            <Notes /> 
          </Layout>            
          </AuthRoute>
        } 
      />
      <Route path = "/Podcasts"
        element = {
          <AuthRoute>
          <Layout>
            <Podcasts /> 
          </Layout>            
          </AuthRoute>
        } 
      />
      <Route path = "/Summerize"
        element = {
          <AuthRoute>
          <Layout>
            <Summerize /> 
          </Layout>            
          </AuthRoute>
        } 
      />
      <Route path = "/Settings"
        element = {
          <AuthRoute>
          <Layout>
            <Settings /> 
          </Layout>            
          </AuthRoute>
        } 
      />
      
    </Routes>
    </>
  )
}

export default App
