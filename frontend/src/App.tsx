import Login from './Pages/Login';
import './App.css'
import { Route,Routes } from 'react-router-dom';

function App() {
  return (
    <Routes>
      <Route path = "/" element = {<Login />} />
    </Routes>
  )
}

export default App
