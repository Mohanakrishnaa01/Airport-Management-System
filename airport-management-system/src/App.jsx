import './App.css'
import './components/login.css'
import './components/navBar.css'
import './components/admin.css'
import { Login } from './components/login'
import { Admin } from './components/admin'
import { NavBar } from './components/navBar'

function App() {
  return (
    // <Login />
    <div className='Container'>
      <NavBar />
      <Admin />
    </div>
  )
}

export default App
