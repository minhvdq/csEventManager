import "./NavBar.css";
import {Link} from 'react-router-dom'
import { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { frontendBase } from "../utils/homeUrl";

const homeUrl = frontendBase;

const Logo = () => (
    <div
        onClick={() => {
            window.location.href = `${homeUrl}/`;
        }}
        className="d-flex align-items-center"
        style={{ cursor: "pointer" }}
    >
        <img
            className="logo-img"
            src={`${frontendBase}/cS-mug2.png`}
            alt="logo"
            height="60"
            style={{ borderRadius: "8px" }}
        />
        <span className="ms-2 logo-txt fw-bold">Event Hub</span>
    </div>
);

export default function NavBar({ curUser, handleLogout }) {
  const [showHamburger, setShowHamburger] = useState(false);
  const toggleMenu = () => setShowHamburger(!showHamburger);

    return (
        <header className="shadow-sm bg-white sticky-top">
        {/* Desktop Nav */}
            <nav
                id="desktop-nav"
                className="container py-3 d-flex justify-content-between align-items-center"
            >
                <Logo />
                <ul className="nav-links d-flex gap-4 m-0 align-items-center">
                    <li>
                        <a href={`${homeUrl}`}>Home</a>
                    </li>
                    <li>
                        {curUser ? (
                        <a onClick={handleLogout} style={{ cursor: "pointer" }}>
                            Logout
                        </a>
                        ) : (
                        <Link to='/authen'>Login</Link>
                        )}
                    </li>
                </ul>
            </nav>

            {/* Hamburger Nav */}
            <nav id="hamburger-nav" className="container py-3">
                <div className="d-flex justify-content-between align-items-center">
                    <Logo />
                    <div className="hamburger-menu">
                        <div
                            className={`hamburger-icon ${showHamburger ? "open" : ""}`}
                            onClick={toggleMenu}
                        >
                            <span></span>
                            <span></span>
                            <span></span>
                        </div>
                        <div className={`menu-links ${showHamburger ? "open" : ""}`}>
                            <li>
                                <a href={`${homeUrl}`} onClick={toggleMenu}>
                                    Home
                                </a>
                            </li>
                            <li>
                                {curUser ? (
                                <a onClick={() => { toggleMenu(); handleLogout(); }} style={{ cursor: "pointer" }}>
                                    Logout
                                </a>
                                ) : (
                                <Link to='/authen' onClick={toggleMenu}>
                                    Login
                                </Link>
                                )}
                            </li>
                        </div>
                    </div>
                </div>
            </nav>
        </header>
    );
}
