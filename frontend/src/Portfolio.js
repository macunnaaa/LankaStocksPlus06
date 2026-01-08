import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Wallet, TrendingUp, Clock, XCircle, PieChart, ArrowUpRight, ArrowDownRight, Repeat, Activity, History, CreditCard } from "lucide-react";

const Portfolio = () => {
    const [portfolio, setPortfolio] = useState(null);
    
    // பாப்-அப் விண்டோ ஸ்டேட்ஸ்
    const [showTradeLog, setShowTradeLog] = useState(false);
    const [showWalletLog, setShowWalletLog] = useState(false);

    const fetchPortfolio = () => {
        axios.get('http://127.0.0.1:8000/api/portfolio-details/')
            .then(res => {
                setPortfolio(res.data);
            })
            .catch(err => console.error("Error fetching portfolio:", err));
    };

    const handleCancelOrder = (orderId) => {
        if (window.confirm("Are you sure you want to cancel this pending order?")) {
            axios.post('http://127.0.0.1:8000/api/cancel-order/', { order_id: orderId })
                .then(res => {
                    alert(res.data.message);
                    fetchPortfolio();
                })
                .catch(err => alert("Failed to cancel order"));
        }
    };

    useEffect(() => {
        fetchPortfolio();
        const interval = setInterval(fetchPortfolio, 10000); 
        return () => clearInterval(interval);
    }, []);

    if (!portfolio) return (
        <div style={styles.loadingContainer}>
            <div className="animate-spin" style={styles.spinner}></div>
            <h2 style={{ color: '#00ff7f', marginTop: '20px' }}>Analyzing Portfolio Assets...</h2>
        </div>
    );

    // லாப நஷ்டத்தை கணக்கிடுதல்
    const totalPnL = portfolio.holdings.reduce((acc, h) => acc + h.pnl, 0);
    const pnlColor = totalPnL >= 0 ? '#00ff7f' : '#f6465d';

    // அட்வான்ஸ் கிராப் லாஜிக் (Cash vs Stocks Weight)
    const stockWeight = (portfolio.total_stock_value / portfolio.total_portfolio_value) * 100;
    const cashWeight = 100 - stockWeight;

    return (
        <div style={styles.container}>
            <div style={styles.headerSection}>
                <div>
                    <h2 style={styles.mainTitle}>Asset Management</h2>
                    <p style={styles.subTitle}>Live tracking of your CSE holdings and equity</p>
                </div>
                <div style={styles.liveStatus}>
                    <div className="animate-pulse" style={styles.pulseDot}></div>
                    LIVE SYNC: 10S
                </div>
            </div>

            {/* --- ADVANCED ANALYTICS SECTION (Cash vs Stocks Graph) --- */}
            <div style={styles.analyticsRow}>
                <div style={styles.mainAnalyticsCard} className="asset-card">
                    <div style={styles.chartFlex}>
                        <div style={styles.textData}>
                            <p style={styles.cardLabel}>Net Portfolio Value</p>
                            <h1 style={{...styles.heroValue, color: '#f0b90b'}}>LKR {portfolio.total_portfolio_value.toLocaleString()}</h1>
                            <div style={{display: 'flex', gap: '15px', marginTop: '10px'}}>
                                <span style={{color: '#00ff7f', fontSize: '11px', fontWeight: 'bold'}}>● STOCKS: {stockWeight.toFixed(1)}%</span>
                                <span style={{color: '#64748b', fontSize: '11px', fontWeight: 'bold'}}>○ CASH: {cashWeight.toFixed(1)}%</span>
                            </div>
                        </div>
                        <div style={styles.circularGraphContainer}>
                             <div style={{...styles.circularGraph, background: `conic-gradient(#00ff7f ${stockWeight}%, #1e293b 0)`}}>
                                <div style={styles.circularInner}>
                                    <PieChart size={20} color="#f0b90b" />
                                </div>
                             </div>
                        </div>
                    </div>
                </div>
                <div style={{...styles.card, border: `1px solid ${pnlColor}33`, flex: 0.5 }} className="asset-card">
                    <TrendingUp size={20} color={pnlColor} />
                    <p style={styles.cardLabel}>Total Net Profit/Loss</p>
                    <h2 style={{...styles.cardValue, color: pnlColor}}>
                        {totalPnL >= 0 ? <ArrowUpRight size={20} /> : <ArrowDownRight size={20} />}
                        LKR {Math.abs(totalPnL).toLocaleString()}
                    </h2>
                </div>
            </div>

            {/* --- BALANCE CARDS --- */}
            <div style={styles.cardGrid}>
                <div style={styles.card} className="asset-card">
                    <Wallet size={20} color="#00ff7f" />
                    <p style={styles.cardLabel}>Available Cash</p>
                    <h2 style={styles.cardValue}>LKR {parseFloat(portfolio.balance).toLocaleString()}</h2>
                </div>
                <div style={styles.card} className="asset-card">
                    <PieChart size={20} color="#f0b90b" />
                    <p style={styles.cardLabel}>Total Equity Value</p>
                    <h2 style={styles.cardValue}>LKR {portfolio.total_stock_value.toLocaleString()}</h2>
                </div>
            </div>

            {/* --- MAIN CONTENT AREA --- */}
            <div style={styles.contentGrid}>
                {/* Left Side: Current Holdings */}
                <div style={styles.leftColumn}>
                    <div style={styles.sectionTitle}>
                        <TrendingUp size={16} color="#00ff7f" />
                        <span>Active Holdings</span>
                    </div>
                    <div style={styles.tableBox}>
                        <table style={styles.table}>
                            <thead>
                                <tr style={styles.thRow}>
                                    <th style={styles.th}>SYMBOL</th>
                                    <th style={styles.th}>QTY</th>
                                    <th style={styles.th}>AVG COST</th>
                                    <th style={styles.th}>MARKET</th>
                                    <th style={styles.th}>PROFIT/LOSS</th>
                                </tr>
                            </thead>
                            <tbody>
                                {portfolio.holdings.length > 0 ? (
                                    portfolio.holdings.map(h => (
                                        <tr key={h.symbol} style={styles.tr} className="table-row">
                                            <td style={{...styles.td, color: '#00ff7f', fontWeight: '900'}}>{h.symbol}</td>
                                            <td style={styles.td}>{h.quantity}</td>
                                            <td style={styles.td}>{h.avg_price}</td>
                                            <td style={styles.td}>{h.current_price}</td>
                                            <td style={{...styles.td, color: h.pnl >= 0 ? '#00ff7f' : '#f6465d', fontWeight: '900'}}>
                                                {h.pnl >= 0 ? '+' : '-'}{Math.abs(h.pnl).toLocaleString()}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr><td colSpan="5" style={styles.emptyTd}>No assets in your portfolio yet.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Right Side: Open Orders & Pop-up Buttons */}
                <div style={styles.rightColumn}>
                    <div style={{...styles.sectionTitle, justifyContent: 'space-between'}}>
                        <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                            <Clock size={16} color="#f0b90b" />
                            <span>Open Orders</span>
                        </div>
                        <div style={{display: 'flex', gap: '8px'}}>
                            <button onClick={() => setShowTradeLog(true)} title="Recent Activity" style={styles.logBtn}><History size={14}/></button>
                            <button onClick={() => setShowWalletLog(true)} title="Wallet History" style={styles.logBtn}><CreditCard size={14}/></button>
                        </div>
                    </div>
                    <div style={styles.orderContainer}>
                        {portfolio.pending_orders && portfolio.pending_orders.length > 0 ? (
                            portfolio.pending_orders.map(order => (
                                <div key={order.id} style={styles.orderCard} className="asset-card">
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                                        <span style={{...styles.orderBadge, color: order.type === 'BUY' ? '#00ff7f' : '#f6465d'}}>
                                            {order.order_type} {order.type}
                                        </span>
                                        <button onClick={() => handleCancelOrder(order.id)} style={styles.cancelIcon}>
                                            <XCircle size={18} />
                                        </button>
                                    </div>
                                    <div style={styles.orderDetail}>
                                        <span style={{fontWeight: '900', color: '#fff'}}>{order.symbol}</span>
                                        <span style={{color: '#94a3b8'}}>{order.quantity} Shares</span>
                                    </div>
                                    <div style={styles.orderPrice}>Target: LKR {order.price}</div>
                                </div>
                            ))
                        ) : (
                            <p style={styles.emptyText}>No pending limit orders.</p>
                        )}
                    </div>
                </div>
            </div>

            {/* --- RECENT TRANSACTIONS POP-UP (TRADING LOG WITH QUANTITY) --- */}
            {showTradeLog && (
                <div style={styles.modalOverlay}>
                    <div style={styles.modalContent}>
                        <div style={styles.modalHeader}>
                            <h3 style={{margin:0, color:'#00ff7f'}}><Repeat size={18} style={{marginRight:8}}/> Trade Execution Log</h3>
                            <XCircle style={{cursor:'pointer'}} onClick={() => setShowTradeLog(false)} />
                        </div>
                        <div style={styles.modalBody}>
                            <table style={styles.table}>
                                <thead style={styles.thRow}>
                                    <tr>
                                        <th style={styles.th}>DATE</th>
                                        <th style={styles.th}>TYPE</th>
                                        <th style={styles.th}>ASSET</th>
                                        <th style={styles.th}>QTY</th> {/* New Column Added */}
                                        <th style={styles.th}>EXEC. PRICE</th>
                                        <th style={styles.th}>STATUS</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {portfolio.recent_transactions && portfolio.recent_transactions.map(tx => (
                                        <tr key={tx.id} style={styles.tr}>
                                            <td style={styles.td}>{tx.date}</td>
                                            <td style={{...styles.td, color: tx.type === 'BUY' ? '#00ff7f' : '#f6465d', fontWeight:'bold'}}>{tx.type}</td>
                                            <td style={styles.td}>{tx.symbol}</td>
                                            <td style={{...styles.td, fontWeight: 'bold'}}>{tx.quantity}</td> {/* Quantity Shown Here */}
                                            <td style={styles.td}>LKR {tx.price}</td>
                                            <td style={styles.td}><span style={{...styles.orderBadge, color:'#00ff7f'}}>{tx.status}</span></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* --- WALLET ACTIVITY POP-UP (DEPOSIT/WITHDRAW LOG) --- */}
            {showWalletLog && (
                <div style={styles.modalOverlay}>
                    <div style={styles.modalContent}>
                        <div style={styles.modalHeader}>
                            <h3 style={{margin:0, color:'#f0b90b'}}><Wallet size={18} style={{marginRight:8}}/> Wallet Transaction History</h3>
                            <XCircle style={{cursor:'pointer'}} onClick={() => setShowWalletLog(false)} />
                        </div>
                        <div style={styles.modalBody}>
                           <p style={{color:'#64748b', textAlign:'center', padding:40}}>Recent Deposit & Withdrawal history logs are syncing...</p>
                        </div>
                    </div>
                </div>
            )}

            <style>
                {`
                    .asset-card { transition: all 0.3s ease; }
                    .asset-card:hover { transform: translateY(-5px); border-color: #00ff7f; box-shadow: 0 10px 20px rgba(0,0,0,0.4); cursor: default; }
                    .table-row:hover { background-color: rgba(0, 255, 127, 0.05) !important; cursor: pointer; }
                    @keyframes spin { to { transform: rotate(360deg); } }
                `}
            </style>
        </div>
    );
};

// --- PREMIUM NEON DARK THEME STYLES (WITH MODALS) ---
const styles = {
    container: { padding: '50px 40px', backgroundColor: '#020804', minHeight: '100vh', fontFamily: "'Inter', sans-serif" },
    loadingContainer: { backgroundColor: '#020804', minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' },
    spinner: { width: '40px', height: '40px', border: '4px solid rgba(0,255,127,0.1)', borderTopColor: '#00ff7f', borderRadius: '50%', animation: 'spin 1s linear infinite' },
    headerSection: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '40px' },
    mainTitle: { color: '#fff', fontSize: '32px', fontWeight: '900', margin: 0, textTransform: 'uppercase', letterSpacing: '1px' },
    subTitle: { color: '#64748b', fontSize: '14px', margin: '5px 0 0 0' },
    liveStatus: { display: 'flex', alignItems: 'center', gap: '10px', backgroundColor: 'rgba(0,255,127,0.05)', padding: '8px 15px', borderRadius: '10px', border: '1px solid rgba(0,255,127,0.1)', color: '#00ff7f', fontSize: '11px', fontWeight: '900' },
    pulseDot: { width: '8px', height: '8px', backgroundColor: '#00ff7f', borderRadius: '50%', boxShadow: '0 0 10px #00ff7f' },
    analyticsRow: { display: 'flex', gap: '25px', marginBottom: '30px' },
    mainAnalyticsCard: { flex: 1, backgroundColor: '#0a120b', padding: '30px', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)' },
    chartFlex: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
    heroValue: { fontSize: '36px', fontWeight: '900', margin: '10px 0' },
    circularGraphContainer: { width: '80px', height: '80px' },
    circularGraph: { width: '100%', height: '100%', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' },
    circularInner: { width: '70%', height: '70%', backgroundColor: '#0a120b', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' },
    cardGrid: { display: 'flex', gap: '25px', marginBottom: '50px' },
    card: { flex: 1, backgroundColor: '#0a120b', padding: '30px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', gap: '10px' },
    cardLabel: { fontSize: '12px', color: '#64748b', textTransform: 'uppercase', fontWeight: '700', letterSpacing: '0.5px' },
    cardValue: { fontSize: '24px', color: '#fff', fontWeight: '900', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' },
    contentGrid: { display: 'flex', gap: '40px' },
    leftColumn: { flex: 2 },
    rightColumn: { flex: 1 },
    sectionTitle: { display: 'flex', alignItems: 'center', gap: '10px', color: '#fff', fontSize: '14px', fontWeight: '900', textTransform: 'uppercase', marginBottom: '20px', letterSpacing: '1px' },
    tableBox: { backgroundColor: '#0a120b', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.05)', overflow: 'hidden' },
    table: { width: '100%', borderCollapse: 'collapse', textAlign: 'left' },
    thRow: { backgroundColor: 'rgba(255,255,255,0.02)' },
    th: { padding: '18px 25px', color: '#64748b', fontSize: '11px', fontWeight: '800', letterSpacing: '1px', borderBottom: '1px solid rgba(255,255,255,0.05)' },
    tr: { borderBottom: '1px solid rgba(255,255,255,0.02)', transition: '0.3s' },
    td: { padding: '18px 25px', color: '#eaecef', fontSize: '13px' },
    emptyTd: { padding: '60px', textAlign: 'center', color: '#475569', fontSize: '13px' },
    orderContainer: { display: 'flex', flexDirection: 'column', gap: '15px' },
    orderCard: { backgroundColor: '#0a120b', padding: '20px', borderRadius: '18px', border: '1px solid rgba(255,255,255,0.05)' },
    orderBadge: { fontSize: '10px', fontWeight: '900', backgroundColor: 'rgba(255,255,255,0.03)', padding: '4px 10px', borderRadius: '6px' },
    cancelIcon: { background: 'none', border: 'none', color: '#f6465d', cursor: 'pointer', opacity: 0.6, transition: '0.3s' },
    orderDetail: { display: 'flex', justifyContent: 'space-between', fontSize: '14px', marginBottom: '5px' },
    orderPrice: { fontSize: '11px', color: '#f0b90b', fontWeight: '700' },
    emptyText: { color: '#475569', fontSize: '13px', textAlign: 'center', padding: '20px' },
    
    // பாப்-அப் ஸ்டைல்கள்
    logBtn: { backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '6px', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', transition: '0.3s' },
    modalOverlay: { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.85)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 2000, backdropFilter: 'blur(8px)' },
    modalContent: { backgroundColor: '#0a120b', width: '80%', maxHeight: '80%', borderRadius: '24px', border: '1px solid #00ff7f44', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 0 50px rgba(0,255,127,0.1)' },
    modalHeader: { padding: '25px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
    modalBody: { padding: '20px', overflowY: 'auto', flex: 1 }
};

export default Portfolio;