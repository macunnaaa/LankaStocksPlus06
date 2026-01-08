import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import logo from '../assets/logo.png'; // my new logo

const Navbar = () => {
    const location = useLocation();

    //Highlight the currently active page
    const isActive = (path) => location.pathname === path;

    return (
        <nav style={styles.navbar}>
            <div style={styles.leftSection}>
                {/* Logo and brand name section*/}
                <Link to="/market" style={styles.logoContainer}>
                    <div style={styles.logoWrapper}>
                        <img src={logo} alt="Lanka Stocks Plus Logo" style={styles.logoImg} />
                    </div>
                    <div style={styles.brandTextWrapper}>
                        <span style={styles.brandMainText}>LANKA STOCKS</span>
                        <span style={styles.brandSubText}>PLUS+</span>
                    </div>
                </Link>
                
                <div style={styles.navLinks}>
                    <Link to="/market" style={{...styles.navLink, ...(isActive('/market') ? styles.activeLink : {})}}>
                        Market Watch
                    </Link>
                    <Link to="/portfolio" style={{...styles.navLink, ...(isActive('/portfolio') ? styles.activeLink : {})}}>
                        My Portfolio
                    </Link>
                    <Link to="/achievements" style={{...styles.navLink, ...(isActive('/achievements') ? styles.activeLink : {})}}>
                        Achievements 🏆
                    </Link>
                </div>
            </div>

            <div style={styles.rightSection}>
                <button style={styles.logoutBtn} onClick={() => {
                    localStorage.removeItem('token');
                    window.location.href = '/login';
                }}>
                    Logout
                </button>
            </div>
        </nav>
    );
};

// ---  Modern Pickett Dark theme styles ---
const styles = {
    navbar: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '12px 30px',
        backgroundColor: '#0b0e11', // Deep black color
        borderBottom: '1px solid #1e2329',
        position: 'sticky',
        top: 0,
        zIndex: 1000,
        boxShadow: '0 4px 12px rgba(0,0,0,0.5)'
    },
    leftSection: { display: 'flex', alignItems: 'center', gap: '50px' },
    logoContainer: { 
        display: 'flex', 
        alignItems: 'center', 
        gap: '12px', 
        textDecoration: 'none',
        transition: 'transform 0.2s'
    },
    logoWrapper: {
        backgroundColor: '#1e2329',
        padding: '5px',
        borderRadius: '8px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
    },
    logoImg: { 
        height: '38px', 
        width: 'auto',
    },
    brandTextWrapper: {
        display: 'flex',
        flexDirection: 'column',
        lineHeight: '1.1'
    },
    brandMainText: { 
        color: '#fff', 
        fontSize: '18px', 
        fontWeight: '900', 
        letterSpacing: '1.5px',
        fontFamily: 'Orbitron, sans-serif' // Would look better with a modern font
    },
    brandSubText: { 
        color: '#f0b90b', 
        fontSize: '14px', 
        fontWeight: 'bold',
        letterSpacing: '2px'
    },
    navLinks: { display: 'flex', gap: '30px' },
    navLink: { 
        color: '#848e9c', 
        textDecoration: 'none', 
        fontSize: '15px', 
        fontWeight: '600',
        transition: 'color 0.3s'
    },
    activeLink: { 
        color: '#f0b90b', 
        borderBottom: '2px solid #f0b90b', 
        paddingBottom: '22px', // Adjusted according to the navbar height
        marginBottom: '-22px'
    },
    rightSection: { display: 'flex', alignItems: 'center' },
    logoutBtn: { 
        backgroundColor: 'transparent', 
        color: '#f6465d', 
        border: '1.5px solid #f6465d', 
        padding: '8px 20px', 
        borderRadius: '6px', 
        fontSize: '13px', 
        fontWeight: 'bold', 
        cursor: 'pointer',
        transition: 'all 0.3s',
        '&:hover': {
            backgroundColor: '#f6465d',
            color: '#fff'
        }
    }
};

export default Navbar;