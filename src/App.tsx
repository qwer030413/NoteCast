import Login from './Pages/Login';
import './App.css'
import { Route,Routes } from 'react-router-dom';
import SignUp from './Pages/SignUp';
import Home from './Pages/Home';
import { AuthRoute } from './components/UserAuth/AuthRoute';
import { Toaster } from 'react-hot-toast';
import ForgotPassword from './Pages/ForgotPassword';
import ResetPassword from './Pages/ResetPassword';

function App() {
  return (
    <>
    <Toaster/>
    <Routes>
      <Route path = "/Login" element = {<Login />} />
      <Route path = "/SignUp" element = {<SignUp />} />
      <Route path = "/ForgotPassword" element = {<ForgotPassword />} />
      <Route path = "/ResetPassword" element = {<ResetPassword />} />
      <Route 
        path = "/"
        element = {
          <AuthRoute>
            <Home /> 
          </AuthRoute>
        } 
      />
      
    </Routes>
    </>
  )
}

export default App
