import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route } from "react-router-dom";
import customStorage from './utils/customStorage';
import eventService from './services/event'

// import pages
import Authentication from './pages/Authentication'
import Home from './pages/Home'
import NotFound from './pages/NotFound';
import Admin from './pages/Admin'
import CreateEventForm from './pages/CreateEventForm';

const TestPage = () => {
  return(
    <>
      HELLO WORLD
    </>
  )
}

function App() {
  const [events, setEvents] = useState([])
  const [curUser, setCurUser] = useState(null)

  useEffect(() => {
    eventService.getAll().then(fetchedEvents => {
        const data = fetchedEvents
        console.log('events in database: ' + JSON.stringify(data))
        setEvents(data)
    })

    const loggedUser = customStorage.getItem('localUser')
    if(loggedUser){
      const lUser = JSON.parse(loggedUser)

      console.log('cur user is ' + lUser)
      setCurUser(lUser)
    }

    console.log("current user is: " + curUser)
  }, [])

  const handleLogout = (event) => {
    event.preventDefault()
    window.localStorage.removeItem("localUser")
    setCurUser(null)
  }
  return (
    <BrowserRouter basename='/eventHub'>
      <Routes>
        <Route path='/' element={<Home events={ events } curUser={ curUser } setCurUser={setCurUser} handleLogout={handleLogout}/>} />
        <Route path='/authen' element={<Authentication events={ events } curUser={ curUser } setCurUser={setCurUser}/>}/>
        <Route path='/admin' element={<Admin events={ events } curUser={ curUser } setCurUser={setCurUser}/>} />
        <Route path='/create' element={<CreateEventForm curUser={curUser}/>} />
        <Route path='/test' element={<TestPage />} />
        <Route paht='*' element={<NotFound/>}/>
      </Routes>
    </BrowserRouter>
  )
  
}

export default App