import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { frontendBase } from './utils/homeUrl'
import customStorage from './utils/customStorage';
import eventService from './services/event'

// import pages
import Authentication from './pages/Authentication'
import Home from './pages/Home'
import NotFound from './pages/NotFound';
import Admin from './pages/Admin'
import CreateEventForm from './pages/CreateEventForm';
import EventRegister from './pages/EventRegister';
import SignupNoti from './pages/SignupNoti';
import StudentsManage from './pages/StudentsManage';

function App() {
  const [events, setEvents] = useState([])
  const [curUser, setCurUser] = useState(null)

  useEffect(() => {
    eventService.getAll().then(fetchedEvents => {
        const data = fetchedEvents
        // console.log('events in database: ' + JSON.stringify(data))
        setEvents(data)
    })

    const loggedUser = customStorage.getItem('localUser')
    if(loggedUser){
      const lUser = JSON.parse(loggedUser)

      // console.log('cur user is ' + lUser)
      setCurUser(lUser)
    }

    // console.log("current user is: " + curUser)
  }, [])

  const handleLogout = (event) => {
    event.preventDefault()
    console.log("Hello World")
    window.localStorage.removeItem("localUser")
    setCurUser(null)
    window.location.href = frontendBase
  }
  return (
    <BrowserRouter basename='/eventHub'>
      <Routes>
        <Route path='/' element={<Home events={ events } setEvents={setEvents} curUser={ curUser } setCurUser={setCurUser} handleLogout={handleLogout}/>} />
        <Route path='/authen' element={<Authentication events={ events } curUser={ curUser } setCurUser={setCurUser}/>}/>
        <Route path='/create' element={<CreateEventForm curUser={curUser}/>} />
        <Route path='/admin' element={<Admin curUser={curUser} handleLogout={handleLogout}/>} />
        <Route path='/register' element={<EventRegister/>}/>
        <Route path='/signupNoti' element={<SignupNoti/>}/>
        <Route path='/studentsManage' element={<StudentsManage curUser={curUser} handleLogout={handleLogout}/>}/>
        <Route path='*' element={<NotFound/>}/>
      </Routes>
    </BrowserRouter>
  )
  
}

export default App