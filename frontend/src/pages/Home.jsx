import { Select, Rate, Switch, Button, Form, Input, Divider, message } from 'antd';
import { useState, useEffect } from "react"
import { Navigate } from "react-router-dom"
import NavBar from "../components/NavBar"

export default function Home({events, curUser, setCurUser}){
    const [presentEvents, setPresentEvents] = useState(events)
    const [term, setTerm]                   = useState("")
    const [loading, setLoading]             = useState(false)

    const handleOnChange = (e) => {
        e.preventDefault()
        value  = e.target.value
        setTerm(value)
        setPresentEvents(presentEvents.filter(event => event.name.includes(value)))
    }

    return(
        <div>
            <NavBar />

            <div>
                <div>
                    <input value={term} onChange={handleOnChange}/>
                </div>

                {presentEvents.map(event => 
                    <EventCard event={event} />
                )}
            </div>
        </div>
    )
}