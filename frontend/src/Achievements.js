import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Achievements = () => {
    const [achievements, setAchievements] = useState([]);

    useEffect(() => {
        //Retrieve 30 records from the backend
        axios.get('http://127.0.0.1:8000/api/achievements/')
            .then(res => setAchievements(res.data.achievements))
            .catch(err => console.error("Error fetching achievements:", err));
    }, []);

    return (
        <div style={styles.container}>
            {/* BACKGROUND GLOW EFFECTS FOR MATCHING THEME */}
            <div style={styles.glowBg1} />
            <div style={styles.glowBg2} />

            <div style={styles.headerSection}>
                <h2 style={styles.mainTitle}>Trading Hall of Fame 🏆</h2>
                <p style={styles.subTitle}>Unlock 30 unique milestones and prove your market expertise!</p>
            </div>

            {/* Grid layout for 30 cards */}
            <div style={styles.grid}>
                {achievements.map(ach => (
                    <div 
                        key={ach.id} 
                        className="achievement-card" // CSS class for hover animation
                        style={{
                            ...styles.card,
                            opacity: ach.is_unlocked ? 1 : 0.5,
                            border: ach.is_unlocked ? '1px solid #00ff7f' : '1px solid #1e293b',
                            boxShadow: ach.is_unlocked ? '0 0 20px rgba(0, 255, 127, 0.15)' : 'none',
                            background: ach.is_unlocked ? 'rgba(10, 18, 11, 0.9)' : 'rgba(15, 23, 42, 0.4)'
                        }}
                    >
                        <div style={{ 
                            fontSize: '50px', 
                            marginBottom: '15px',
                            filter: ach.is_unlocked ? 'drop-shadow(0 0 10px rgba(0, 255, 127, 0.3))' : 'grayscale(100%) opacity(30%)',
                            transition: 'all 0.5s ease'
                        }}>
                            {ach.badge}
                        </div>
                        <h3 style={{ 
                            fontSize: '16px', 
                            margin: '0 0 8px 0', 
                            color: ach.is_unlocked ? '#00ff7f' : '#64748b',
                            fontWeight: '900',
                            letterSpacing: '0.5px'
                        }}>
                            {ach.title}
                        </h3>
                        <p style={{
                            ...styles.descText,
                            color: ach.is_unlocked ? '#94a3b8' : '#475569'
                        }}>
                            {ach.desc}
                        </p>
                        <div style={{ marginTop: 'auto', width: '100%' }}>
                            {ach.is_unlocked ? (
                                <div style={styles.unlockedLabel}>UNLOCKED</div>
                            ) : (
                                <div style={styles.lockedLabel}>LOCKED</div>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* CSS for Achievement Card Zoom and Glow Animation */}
            <style>
                {`
                    .achievement-card {
                        transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1) !important;
                    }
                    .achievement-card:hover {
                        transform: translateY(-10px) scale(1.05);
                        box-shadow: 0 15px 30px rgba(0, 0, 0, 0.5), 0 0 30px rgba(0, 255, 127, 0.2) !important;
                        border-color: #00ff7f !important;
                        z-index: 2;
                        cursor: pointer;
                    }
                    .achievement-card:hover div {
                        filter: drop-shadow(0 0 15px rgba(0, 255, 127, 0.5)) !important;
                    }
                `}
            </style>
        </div>
    );
};

// --- Latest Loding Styles ---
const styles = {
    container: { 
        padding: '80px 30px', 
        backgroundColor: '#020804', 
        minHeight: '100vh', 
        fontFamily: "'Inter', sans-serif",
        position: 'relative',
        overflow: 'hidden'
    },
    glowBg1: {
        position: 'absolute',
        top: '-10%',
        left: '-5%',
        width: '600px',
        height: '600px',
        backgroundColor: '#00ff7f08',
        borderRadius: '50%',
        filter: 'blur(120px)',
        pointerEvents: 'none',
        zIndex: 0
    },
    glowBg2: {
        position: 'absolute',
        bottom: '10%',
        right: '-5%',
        width: '500px',
        height: '500px',
        backgroundColor: '#00ff7f05',
        borderRadius: '50%',
        filter: 'blur(100px)',
        pointerEvents: 'none',
        zIndex: 0
    },
    headerSection: { 
        marginBottom: '60px', 
        textAlign: 'center',
        position: 'relative',
        zIndex: 1
    },
    mainTitle: { 
        margin: 0, 
        color: '#fff', 
        fontSize: '42px', 
        fontWeight: '900',
        letterSpacing: '1px',
        textTransform: 'uppercase'
    },
    subTitle: { 
        color: '#64748b', 
        marginTop: '15px',
        fontSize: '18px',
        fontWeight: '500'
    },
    grid: { 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', 
        gap: '25px',
        maxWidth: '1400px',
        margin: '0 auto',
        position: 'relative',
        zIndex: 1
    },
    card: { 
        backgroundColor: '#0a120b', 
        padding: '30px 20px', 
        borderRadius: '24px', 
        textAlign: 'center', 
        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        minHeight: '240px',
        cursor: 'default',
        backdropFilter: 'blur(10px)',
        position: 'relative'
    },
    descText: { 
        fontSize: '12px', 
        minHeight: '40px', 
        lineHeight: '1.5',
        margin: '0 0 20px 0',
        fontWeight: '500'
    },
    unlockedLabel: { 
        backgroundColor: 'rgba(0, 255, 127, 0.1)', 
        color: '#00ff7f', 
        padding: '8px 0', 
        borderRadius: '12px', 
        fontSize: '11px', 
        fontWeight: '900', 
        width: '100%',
        border: '1px solid rgba(0, 255, 127, 0.2)',
        letterSpacing: '1px'
    },
    lockedLabel: { 
        backgroundColor: '#1e293b', 
        color: '#475569', 
        padding: '8px 0', 
        borderRadius: '12px', 
        fontSize: '11px', 
        fontWeight: '900', 
        width: '100%',
        letterSpacing: '1px'
    }
};

export default Achievements;