import React, { useState, useEffect } from 'react';
import axios from 'axios';
import MarketWatch from './MarketWatch';
import Portfolio from './Portfolio';
import Achievements from './Achievements';
import Login from './Login';
import LandingPage from './components/LandingPage'; // './' என்பதற்குப் பதில் './components/' என மாற்றவும்தி

function App() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [showLogin, setShowLogin] = useState(false); // Loading page to login page
    const [currentView, setCurrentView] = useState('market');
    const [balance, setBalance] = useState("0.00");

    //  New states (for Input Box and Notification)
    const [showActionBox, setShowActionBox] = useState(null); // 'deposit' or 'withdraw'
    const [amountInput, setAmountInput] = useState("");
    const [notification, setNotification] = useState({ show: false, message: "", type: "" });

    // 1. Function that retrieves only the current balance
    const fetchBalance = () => {
        axios.get('http://127.0.0.1:8000/api/portfolio-details/')
            .then(res => setBalance(res.data.balance))
            .catch(err => console.error("Balance fetch error:", err));
    };

    useEffect(() => {
        if (isLoggedIn) {
            fetchBalance();
            const interval = setInterval(fetchBalance, 10000); // evry 10 seconds update potfolio
            return () => clearInterval(interval);
        }
    }, [isLoggedIn]);

    // Beutiful notification fuction
    const triggerNotify = (msg, type) => {
        setNotification({ show: true, message: msg, type: type });
        // Hide after 3 seconds
        setTimeout(() => {
            setNotification(prev => ({ ...prev, show: false }));
        }, 3000);
    };

    // 2 & 3.  New modern function for handling financial transactions
    const handleFinanceAction = async () => {
        if (!amountInput || isNaN(amountInput) || parseFloat(amountInput) <= 0) {
            triggerNotify("Please enter a valid amount!", "error");
            return;
        }

        const url = showActionBox === 'deposit' 
            ? 'http://127.0.0.1:8000/api/deposit-funds/' 
            : 'http://127.0.0.1:8000/api/withdraw-funds/';

        try {
            const res = await axios.post(url, { amount: parseFloat(amountInput) });
            
            // Beautiful notification instead of an alert
            triggerNotify(res.data.message, "success");
            
            setAmountInput(""); // Clear the input
            setShowActionBox(null); // Hide the box
            fetchBalance(); //  Update the balance immediately
        } catch (err) {
            triggerNotify(err.response?.data?.error || "Transaction failed", "error");
        }
    };

    // --- (Routing Logic) ---
    
    // 1.  Show the landing page if the user is not logged in
    if (!isLoggedIn && !showLogin) {
        return <LandingPage onStart={() => setShowLogin(true)} />;
    }

    // 2. Show the login page after pressing the button on the landing page
    if (!isLoggedIn && showLogin) {
        return <Login onLogin={() => setIsLoggedIn(true)} />;
    }

    // 3.  Show the main application after logging in
    return (
        <div className="App" style={{ backgroundColor: '#0b0e11', minHeight: '100vh', overflowX: 'hidden' }}>
            
            {/* ---Modern Success/Error pop-up --- */}
            {notification.show && (
                <div style={{
                    ...styles.toast,
                    backgroundColor: notification.type === 'success' ? '#096927ff' : '#f6465d',
                    animation: 'slideInAndOut 8s ease-in-out forwards'
                }}>
                    <div style={styles.toastContent}>
                        <span style={{ fontSize: '20px' }}>{notification.type === 'success' ? '✅' : '❌'}</span>
                        <span style={styles.toastMessage}>{notification.message}</span>
                    </div>
                </div>
            )}

            <nav style={styles.navbar}>
                <div style={styles.logoSection}>
                    <div style={styles.brandWrapper}>
                        <span style={styles.brandMainText}>
                            LANKA <span style={{ color: '#0ecb81' }}>STOCKS</span>
                        </span>
                        <span style={styles.brandSubText}>PLUS+</span>
                    </div>
                </div>

                <div style={styles.navLinks}>
                    <button onClick={() => setCurrentView('market')} style={currentView === 'market' ? styles.activeNavBtn : styles.navBtn}>
                        Market Watch
                    </button>
                    <button onClick={() => setCurrentView('portfolio')} style={currentView === 'portfolio' ? styles.activeNavBtn : styles.navBtn}>
                        My Portfolio
                    </button>
                    <button onClick={() => setCurrentView('achievements')} style={currentView === 'achievements' ? styles.activeNavBtn : styles.navBtn}>
                        Achievements 🏆
                    </button>
                </div>

                <div style={styles.rightSection}>
                    <div style={styles.balanceBox}>
                        <span style={styles.balanceLabel}>Available</span>
                        <span style={styles.balanceAmount}>Rs. {parseFloat(balance).toLocaleString()}</span>
                    </div>

                    <div style={styles.actionArea}>
                        <div style={styles.btnGroup}>
                            <button onClick={() => setShowActionBox(showActionBox === 'deposit' ? null : 'deposit')} style={styles.depositBtn}>Deposit</button>
                            <button onClick={() => setShowActionBox(showActionBox === 'withdraw' ? null : 'withdraw')} style={styles.withdrawBtn}>Withdraw</button>
                            <button onClick={() => {setIsLoggedIn(false); setShowLogin(false);}} style={styles.logoutBtn}>Logout</button>
                        </div>

                        {/* --- Latest input box--- */}
                        {showActionBox && (
                            <div style={styles.floatingInput}>
                                <input 
                                    type="number" 
                                    placeholder={`Amount to ${showActionBox}...`}
                                    value={amountInput}
                                    onChange={(e) => setAmountInput(e.target.value)}
                                    style={styles.customInput}
                                    autoFocus
                                />
                                <button onClick={handleFinanceAction} style={showActionBox === 'deposit' ? styles.confirmDepBtn : styles.confirmWithBtn}>
                                    Confirm
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </nav>

            <main style={{ backgroundColor: '#0b0e11', minHeight: 'calc(100vh - 65px)' }}>
                {currentView === 'market' && <MarketWatch />}
                {currentView === 'portfolio' && <Portfolio />}
                {currentView === 'achievements' && <Achievements />}
            </main>

            {/* Animation CSS Style Tag */}
            <style>
                {`
                @keyframes slideInAndOut {
                    0% { transform: translate(-50%, -100%); opacity: 0; top: 0; }
                    15% { transform: translate(-50%, 0); opacity: 1; top: 50%; }
                    85% { transform: translate(-50%, 0); opacity: 1; top: 50%; }
                    100% { transform: translate(150%, 0); opacity: 0; top: 50%; }
                }
                `}
            </style>
        </div>
    );
}

const styles = {
    // --- New Toast Styles ---
    toast: {
        position: 'fixed',
        left: '50%',
        top: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 9999,
        padding: '15px 30px',
        borderRadius: '12px',
        color: 'white',
        boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
        minWidth: '300px',
        display: 'flex',
        justifyContent: 'center'
    },
    toastContent: { display: 'flex', alignItems: 'center', gap: '15px' },
    toastMessage: { fontSize: '16px', fontWeight: 'bold' },

    navbar: { 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        padding: '0 25px', 
        backgroundColor: '#181a20', 
        height: 'auto',
        minHeight: '65px', 
        borderBottom: '1px solid #2b3139', 
        position: 'sticky', 
        top: 0, 
        zIndex: 1000,
        boxShadow: '0 4px 10px rgba(0,0,0,0.3)',
        flexWrap: 'wrap'
    },
    logoSection: { display: 'flex', alignItems: 'center' },
    brandWrapper: { display: 'flex', flexDirection: 'column', lineHeight: '1.1' },
    brandMainText: { color: '#fff', fontSize: '18px', fontWeight: '900', letterSpacing: '1px' },
    brandSubText: { color: '#f0b90b', fontSize: '12px', fontWeight: 'bold', letterSpacing: '3px' },
    navLinks: { display: 'flex', gap: '20px', height: '100%', alignItems: 'center' },
    navBtn: { background: 'none', border: 'none', color: '#848e9c', cursor: 'pointer', fontSize: '14px', fontWeight: '500', padding: '18px 5px' },
    activeNavBtn: { background: 'none', border: 'none', borderBottom: '3px solid #f0b90b', color: '#fff', cursor: 'pointer', fontSize: '14px', fontWeight: 'bold', padding: '18px 5px' },
    rightSection: { display: 'flex', alignItems: 'center', gap: '15px', padding: '10px 0' },
    
    balanceBox: {
        backgroundColor: 'rgba(30, 35, 41, 0.8)',
        border: '1px solid #2b3139',
        borderRadius: '12px',
        padding: '5px 15px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end',
        boxShadow: 'inset 0 0 10px rgba(0,0,0,0.2)'
    },
    balanceLabel: { color: '#848e9c', fontSize: '10px', textTransform: 'uppercase', fontWeight: 'bold' },
    balanceAmount: { color: '#0ecb81', fontSize: '14px', fontWeight: '800', fontFamily: 'monospace' },

    actionArea: { position: 'relative', display: 'flex', flexDirection: 'column' },
    btnGroup: { display: 'flex', gap: '10px' },

    floatingInput: {
        position: 'absolute',
        top: '55px',
        right: '0',
        backgroundColor: '#1e2329',
        border: '1px solid #474d57',
        borderRadius: '8px',
        padding: '10px',
        display: 'flex',
        gap: '8px',
        boxShadow: '0 8px 16px rgba(0,0,0,0.4)',
        zIndex: 1001,
        width: '250px'
    },
    customInput: {
        backgroundColor: '#0b0e11',
        border: '1px solid #474d57',
        borderRadius: '4px',
        color: '#fff',
        padding: '6px',
        width: '120px',
        outline: 'none',
        fontSize: '13px'
    },
    confirmDepBtn: { backgroundColor: '#179712ff', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '11px' },
    confirmWithBtn: { backgroundColor: '#f0b90b', color: 'black', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '11px' },

    depositBtn: { backgroundColor: '#0ecb81', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px', transition: '0.3s' },
    withdrawBtn: { backgroundColor: '#f0b90b', color: 'black', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px', transition: '0.3s' },
    logoutBtn: { backgroundColor: 'transparent', color: '#f6465d', border: '1px solid #f6465d', padding: '7px 15px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px' }
};

export default App;