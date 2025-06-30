import { useState, useEffect } from "react";
import {
  Input,
  Select,
  Button,
  Typography,
  Spin
} from "antd";
import EventCard from "../components/event/EventCard";
import NavBar from "../components/NavBar";
import { Navigate } from "react-router-dom";
import { frontendBase } from "../utils/homeUrl";

const { Option } = Select;
const { Title } = Typography;

const currentYear = new Date().getFullYear();
const yearOptions = Array.from({ length: 6 }, (_, i) => currentYear - i);

export default function Home({ events, curUser, handleLogout }) {
    const [presentEvents, setPresentEvents] = useState(events);
    const [search, setSearch]               = useState("");
    const [term, setTerm]                   = useState("All");
    const [year, setYear]                   = useState("All");
    const [sort, setSort]                   = useState("Latest");
    const [filter, setFilter]               = useState("All");
    const [loading, setLoading]             = useState(false);

    useEffect(() => {
        setLoading(true);

        const timeout = setTimeout(() => {
        let filteredEvents = [...events];

        // Filter by search
        if (search.trim()) {
            filteredEvents = filteredEvents.filter((event) =>
            event.name.toLowerCase().includes(search.toLowerCase())
            );
        }

        // Filter by colloquium
        if (filter === "Colloquium") {
            filteredEvents = filteredEvents.filter((event) => event.is_colloquium);
        } else if (filter === "NoColloquium") {
            filteredEvents = filteredEvents.filter((event) => !event.is_colloquium);
        }

        // Filter by year
        if (year !== "All") {
            filteredEvents = filteredEvents.filter(
            (event) =>
                new Date(event.start_time).getFullYear().toString() === year.toString()
            );
        }

        // Filter by term (Spring/Fall)
        if (term === "Spring") {
            filteredEvents = filteredEvents.filter((event) => {
            const month = new Date(event.start_time).getMonth() + 1;
            return month >= 1 && month <= 6;
            });
        } else if (term === "Fall") {
            filteredEvents = filteredEvents.filter((event) => {
            const month = new Date(event.start_time).getMonth() + 1;
            return month >= 7 && month <= 12;
            });
        }

        // Sort
        filteredEvents.sort((a, b) => {
            const aTime = new Date(a.start_time).getTime();
            const bTime = new Date(b.start_time).getTime();
            return sort === "Latest" ? bTime - aTime : aTime - bTime;
        });

        setPresentEvents(filteredEvents);
        setLoading(false);
        }, 300); // simulate delay

        return () => clearTimeout(timeout);
    }, [events, search, term, year, sort, filter]);

    const handleClickCreateEvent = (e) => {
        console.log("HEllo")
        e.preventDefault()

        window.location.href = `${frontendBase}/create`
    }

    return (
        <div className="bg-light min-vh-100">
        <NavBar curUser={curUser} handleLogout={handleLogout}/>
        <div className="container py-4">
            {/* Filters */}
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
            <Select
                value={term}
                onChange={(value) => setTerm(value)}
                style={{ width: 100, borderRadius: "20px" }}
            >
                <Option value="All">All</Option>
                <Option value="Spring">Spring</Option>
                <Option value="Fall">Fall</Option>
            </Select>
            <Select
                value={year}
                onChange={(value) => setYear(value)}
                style={{ width: 120 }}
            >
                <Option value="All">All</Option>
                {yearOptions.map((yearOption) => (
                <Option key={yearOption} value={yearOption}>
                    {yearOption}
                </Option>
                ))}
            </Select>
            <Select
                value={sort}
                onChange={(value) => setSort(value)}
                style={{ width: 120 }}
            >
                <Option value="Latest">Latest</Option>
                <Option value="Earliest">Earliest</Option>
            </Select>
            <Select
                value={filter}
                onChange={(value) => setFilter(value)}
                style={{ width: 140 }}
            >
                <Option value="All">--All--</Option>
                <Option value="Colloquium">Colloquium</Option>
                <Option value="NoColloquium">No Colloquium</Option>
            </Select>
            <Button
                type="primary"
                style={{ borderRadius: "20px", background: "#5890F1" }}
                onClick={handleClickCreateEvent}
            >
                New Event
            </Button>
            </div>

            {/* Event List with Spinner */}
            <Spin spinning={loading} tip="Loading events..." size="large">
            {presentEvents.map((event) => (
                <EventCard key={event.event_id} event={event} />
            ))}
            </Spin>
        </div>
        </div>
    );
}
