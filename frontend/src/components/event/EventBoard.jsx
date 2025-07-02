import {useState} from 'react'

export default function EventBoard(event){
    const [name, setName] = useState(event.name)
    const [description, setDescription] = useState(event.description)
    const [poster, setPoster] = useState(event.poster)
    const [locationName, setLocationName] = useState(event)
}