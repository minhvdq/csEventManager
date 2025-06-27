import {useState} from 'useState'

export default function EventCard({event}){
    const [viewMore, setViewMore] = useState(false)
    const canRegister = Date.now() > event.startTime

    const lat = event.location?.lat
    const lng = event.location?.lng
    const address = event.location?.address

    const handleDirect = () => {
        let url = "";
        if (lat && lng) {
          url = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
        } else if (address) {
          url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
        } else {
          alert("No location info available.");
          return;
        }
        window.open(url, "_blank");
      };

    return(
        <div>
            <div>
                <div>
                    <img 
                        src={event.poster}
                        alt="event-poster"
                    />
                </div>
                <div>
                    <div>
                        <h1>{event.name}</h1>
                    </div>

                    {/* Time section */}
                    <div>
                        Start time:
                        <p>{event.start_time}</p>
                        End time:
                        <p>{event.end_time}</p>
                    </div>

                    {/** Location Section */}
                    <div>
                        <div>
                            {event.location.name}
                        </div>
                        <div>
                            {event.location.address}
                        </div>
                        <div>
                            {event.location.room}
                        </div>
                        <button onClick={handleDirect}>Direct me</button>
                    </div>

                    <div>
                        Is Collquium: {event.is_colloquium ? "Yes" : "No"}
                        On Campus: {event.on_campus ? "Yes" : "No"}
                    </div>

                    {/** Buttons */}
                    <div>
                        {user ? <button>Manage</button> : <></>}
                        {canRegister ? <button>Register</button> : <></>}
                        <button>Show more</button>
                    </div>
                </div>
            </div>
            <div
                {/** Show only when viewMore is true */}
            >  
                <span className="fw-bold">Description:</span>
                {event.description}
            </div>
        </div>
    )
}