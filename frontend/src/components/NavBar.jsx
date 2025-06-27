import "./NavBar.css"
import {useState} from 'react'
import 'bootstrap/dist/css/bootstrap.min.css';

const homeUrl = ''

const Logo = () => (
    <div onClick={() => {window.location.href = `${homeUrl}/`}} className="container align-items-center justify-content-center">
        <div className="row align-items-center justify-content-center">
            {/* Logo Section */}
            <div className="col-auto" id="logo-wrapper">
                <img className='logo-img' src={`/cS-mug2.png`} alt="logo" height='100px' width='100px' />
            </div>
        </div>
    </div>
)

export default function NavBar() {
    const [showHamburger, setShowHamburger] = useState(false)
    const toggleMenu = (e) => 
    {   
        // e.preventDefault()
        setShowHamburger(!showHamburger)
    }

    return(
        <div>
            <nav id="desktop-nav">
                <div className="logo">
                    <Logo />
                </div>
                <div>
                    <ul className="nav-links">
                        <li><a href={`${homeUrl}/#about`} >Home</a></li>
                        <li><a href={`${homeUrl}/projects`} >Projects</a></li>
                    </ul>
                </div>
            </nav>
            <nav id="hamburger-nav" className="container" style={{position: 'relative'}}>
                <div className="row">
                    <div className="col logo">
                        <img src={`${homeUrl}/cS-mug2.png`} alt='logo' width='80px' height='80px' />
                    </div>
                    <div className="col hamburger-menu" style={{alignItems: 'center'}}>
                        <div className={`hamburger-icon ${showHamburger ? 'open' : ''}`} onClick={toggleMenu}>
                            <span></span>
                            <span></span>
                            <span></span>
                        </div>
                        <div className={`menu-links ${showHamburger ? 'open' : ''}`}>
                            <li><a href={`${homeUrl}/#about`} onClick={toggleMenu}>Home</a></li>
                            <li><a href={`${homeUrl}/projects`} onClick={toggleMenu}>Projects</a></li>
                        </div>
                    </div>
                </div> 
            </nav>
        </div>
        
    )
}