import { useState, useEffect } from "react";
import { Input, Select, Button, Typography, Spin } from "antd";
import EventCard from "../components/event/EventCard";
import EventRegisterPage from "../components/eventAttendance/EventRegisterPage";
import EventManager from "../components/event/EventManager";
import NavBar from "../components/NavBar";
import { frontendBase } from "../utils/homeUrl";

const { Option } = Select;
const { Title } = Typography;

const currentYear = new Date().getFullYear();
const yearOptions = Array.from({ length: 6 }, (_, i) => currentYear - i);

// Parse datetime string - handles both MySQL format (YYYY-MM-DD HH:MM:SS) and ISO 8601 format
// new Date() correctly handles ISO 8601 strings and converts them to local timezone.
// For MySQL format strings without timezone, we parse them as local time (consistent with EventCard.jsx).
const parseMySqlDateTimeAsLocal = (dateTimeString) => {
    if (!dateTimeString) return null;
    // If it's already a Date object, return it
    if (dateTimeString instanceof Date) return dateTimeString;
    
    // new Date() handles ISO 8601 format (with 'T') correctly
    // For MySQL format (YYYY-MM-DD HH:MM:SS), replace space with 'T' to make it ISO-like
    // This ensures consistent parsing behavior across browsers
    const normalized = dateTimeString.slice(0, 19).replace(' ', 'T');
    return new Date(normalized);
};

export default function Home({ events, setEvents, curUser, handleLogout }) {
    const [presentEvents, setPresentEvents] = useState(events);
    const [search, setSearch] = useState("");
    const [term, setTerm] = useState("All");
    const [year, setYear] = useState("All");
    const [sort, setSort] = useState("Latest");
    const [filter, setFilter] = useState("All");
    const [loading, setLoading] = useState(false);

    const [registeringEvent, setRegisteringEvent] = useState(null);
    const [managingEvent, setManagingEvent] = useState(null);

    useEffect(() => {
        setLoading(true);
        const timeout = setTimeout(() => {
            let filteredEvents = [...events];

            if (search.trim()) {
                filteredEvents = filteredEvents.filter((event) =>
                    event.name.toLowerCase().includes(search.toLowerCase())
                );
            }

            if (filter === "Colloquium") {
                filteredEvents = filteredEvents.filter((event) => event.is_colloquium);
            } else if (filter === "NoColloquium") {
                filteredEvents = filteredEvents.filter((event) => !event.is_colloquium);
            }

            if (year !== "All") {
                filteredEvents = filteredEvents.filter(event => {
                    const eventYear = parseMySqlDateTimeAsLocal(event.start_time)?.getFullYear();
                    return eventYear?.toString() === year.toString();
                });
            }

            if (term === "Spring") {
                filteredEvents = filteredEvents.filter((event) => {
                    const month = parseMySqlDateTimeAsLocal(event.start_time)?.getMonth() + 1;
                    return month >= 1 && month <= 6;
                });
            } else if (term === "Fall") {
                filteredEvents = filteredEvents.filter((event) => {
                    const month = parseMySqlDateTimeAsLocal(event.start_time)?.getMonth() + 1;
                    return month >= 7 && month <= 12;
                });
            }

            filteredEvents.sort((a, b) => {
                const aTime = parseMySqlDateTimeAsLocal(a.start_time)?.getTime() || 0;
                const bTime = parseMySqlDateTimeAsLocal(b.start_time)?.getTime() || 0;
                return sort === "Latest" ? bTime - aTime : aTime - bTime;
            });
            console.log("filteredEvents are: " + JSON.stringify(filteredEvents))
            setPresentEvents(filteredEvents);
            setLoading(false);
        }, 300);

        return () => clearTimeout(timeout);
    }, [events, search, term, year, sort, filter]);
    
    const toggleRegisterPage = (event = null) => {
        setRegisteringEvent(event);
    };

    const toggleManagePage = (event = null) => {
        setManagingEvent(event);
    };

    const handleDeleteEventLocal = (eventId) => {
        setEvents(events.filter((event) => event.event_id !== eventId));
    }
    
    const handleClickCreateEvent = (e) => {
        e.preventDefault();
        window.location.href = `${frontendBase}/create`;
    };

    return (
        <div className="bg-light min-vh-100">
            <NavBar curUser={curUser} handleLogout={handleLogout}/>
            <div className="container py-4">
                {managingEvent ? (
                    <EventManager 
                        event={managingEvent}
                        setEvents={setEvents}
                        togglePage={() => toggleManagePage(null)}
                        curUser={curUser}
                        handleDeleteEventLocal={handleDeleteEventLocal}
                    />
                ) : registeringEvent ? (
                    <EventRegisterPage 
                        event={registeringEvent}
                        togglePage={() => toggleRegisterPage(null)}
                    />
                ) : (
                    <>
                        <div className="d-flex flex-wrap align-items-center mb-4 gap-3">
                            <Input
                                placeholder="Search..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                style={{
                                    flex: 1,
                                    minWidth: "250px",
                                    borderRadius: "20px",
                                    paddingLeft: "20px",
                                    height: "40px"
                                }}
                            />
                            <Select value={term} onChange={setTerm} style={{ width: 100, borderRadius: "20px" }}>
                                <Option value="All">All</Option>
                                <Option value="Spring">Spring</Option>
                                <Option value="Fall">Fall</Option>
                            </Select>
                            <Select value={year} onChange={setYear} style={{ width: 120 }}>
                                <Option value="All">All</Option>
                                {yearOptions.map((y) => <Option key={y} value={y}>{y}</Option>)}
                            </Select>
                            <Select value={sort} onChange={setSort} style={{ width: 120 }}>
                                <Option value="Latest">Latest</Option>
                                <Option value="Earliest">Earliest</Option>
                            </Select>
                            <Select value={filter} onChange={setFilter} style={{ width: 140 }}>
                                <Option value="All">--All--</Option>
                                <Option value="Colloquium">Colloquium</Option>
                                <Option value="NoColloquium">No Colloquium</Option>
                            </Select>
                            <Button type="primary" onClick={handleClickCreateEvent} style={{ borderRadius: "20px", background: "#5890F1" }}>
                                New Event
                            </Button>
                        </div>
                        <Spin spinning={loading} tip="Loading events..." size="large">
                            {presentEvents.map((event) => (
                                <EventCard 
                                    key={event.event_id} 
                                    event={event}
                                    curUser={curUser}
                                    onRegisterClick={() => toggleRegisterPage(event)}
                                    onManageClick={() => toggleManagePage(event)}
                                />
                            ))}
                        </Spin>
                    </>
                )}
            </div>
        </div>
    );
}
