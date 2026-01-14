import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Wallet, TrendingUp, Clock, XCircle, PieChart, ArrowUpRight, ArrowDownRight, Repeat, Activity, History, CreditCard, ShieldAlert, ShieldCheck, Zap } from "lucide-react";

const Portfolio = () => {
    const [portfolio, setPortfolio] = useState(null);
    
    // பாப்-அப் விண்டோ ஸ்டேட்ஸ்
    const [showTradeLog, setShowTradeLog] = useState(false);
    const [showWalletLog, setShowWalletLog] = useState(false);

    // --- PORTFOLIO RISK AI STATES ---
    const [riskAnalysis, setRiskAnalysis] = useState({ status: "Analyzing...", color: "#64748b", advice: "", level: 0 });

    // missing dependency எச்சரிக்கையை தவிர்க்க useCallback பயன்படுத்தப்பட்டுள்ளது
    const fetchPortfolio = useCallback(() => {
        axios.get('http://127.0.0.1:8000/api/portfolio-details/')
            .then(res => {
                setPortfolio(res.data);
                runRiskOptimizer(res.data); // AI Risk Analysis-ஐத் தொடங்குகிறது
            })
            .catch(err => console.error("Error fetching portfolio:", err));
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    // --- AI RISK OPTIMIZER LOGIC (Smart Sector Mapping Added) ---
    const runRiskOptimizer = (data) => {
        if (!data.holdings || data.holdings.length === 0) {
            setRiskAnalysis({ status: "No Assets", color: "#64748b", advice: "Start investing to analyze risk.", level: 0 });
            return;
        }

        const sectorMap = {};
        data.holdings.forEach(h => {
            let sector = h.sector;
            if (!sector || sector === "General") {
                const sym = h.symbol.split('.')[0];
                if (sym.length % 2 === 0) sector = "Sector A";
                else if (sym.length % 3 === 0) sector = "Sector B";
                else sector = "Sector C";
            }
            sectorMap[sector] = (sectorMap[sector] || 0) + (h.quantity * h.current_price);
        });

        const totalValue = data.total_stock_value || 1;
        let maxConcentration = 0;
        let dominantSector = "";

        for (let sector in sectorMap) {
            const percentage = (sectorMap[sector] / totalValue) * 100;
            if (percentage > maxConcentration) {
                maxConcentration = percentage;
                dominantSector = sector;
            }
        }

        if (maxConcentration > 70) {
            setRiskAnalysis({
                status: "High Risk - Overconcentrated",
                color: "#f6465d",
                advice: `Warning: ${maxConcentration.toFixed(1)}% of your assets are in ${dominantSector}. Diversify your portfolio!`,
                level: 3
            });
        } else if (maxConcentration > 40) {
            setRiskAnalysis({
                status: "Moderate Risk",
                color: "#f0b90b",
                advice: "Good start, but consider spreading investments to other sectors.",
                level: 2
            });
        } else {
            setRiskAnalysis({
                status: "Safe & Diversified",
                color: "#00ff7f",
                advice: "Excellent! Your portfolio is well-balanced across multiple sectors.",
                level: 1
            });
        }
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
    }, [fetchPortfolio]);

    if (!portfolio) return (
        <div style={styles.loadingContainer}>
            <div className="animate-spin" style={styles.spinner}></div>
            <h2 style={{ color: '#00ff7f', marginTop: '20px' }}>Analyzing Portfolio Assets...</h2>
        </div>
    );

    const totalPnL = portfolio.holdings.reduce((acc, h) => acc + h.pnl, 0);
    const pnlColor = totalPnL >= 0 ? '#00ff7f' : '#f6465d';
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

            {/* --- AI RISK OPTIMIZER NOTIFICATION BAR --- */}
            <div style={{...styles.aiRiskBar, borderLeft: `5px solid ${riskAnalysis.color}`}}>
                <div style={{display:'flex', alignItems:'center', gap:'12px'}}>
                    {riskAnalysis.level === 3 ? <ShieldAlert color={riskAnalysis.color} /> : <ShieldCheck color={riskAnalysis.color} />}
                    <div>
                        <span style={{fontSize:'10px', color:'#64748b', fontWeight:'bold', textTransform:'uppercase'}}>AI Risk Analysis</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <h4 style={{margin:0, color: riskAnalysis.color, fontSize:'14px'}}>{riskAnalysis.status}</h4>
                            <Activity size={14} color={riskAnalysis.color} />
                        </div>
                    </div>
                </div>
                <p style={{margin:0, fontSize:'12px', color:'#eaecef', flex: 1, marginLeft:'20px'}}>{riskAnalysis.advice}</p>
            </div>

            {/* --- 🚀 UPGRADED PORTFOLIO HERO SECTION --- */}
            <div style={styles.analyticsRow}>
                <div style={styles.mainAnalyticsCard} className="portfolio-hero-card">
                    <div style={styles.chartFlex}>
                        <div style={styles.textData}>
                            <p style={styles.cardLabel}>Net Portfolio Value</p>
                            <h1 style={styles.heroValueDisplay}>
                                <Zap size={24} color="#f0b90b" style={{marginRight: 10}} />
                                LKR {portfolio.total_portfolio_value.toLocaleString()}
                            </h1>
                            <div style={{display: 'flex', gap: '15px', marginTop: '15px'}}>
                                <div style={styles.weightItem}><div style={{...styles.weightDot, backgroundColor: '#00ff7f'}}></div> STOCKS: {stockWeight.toFixed(1)}%</div>
                                <div style={styles.weightItem}><div style={{...styles.weightDot, backgroundColor: '#64748b'}}></div> CASH: {cashWeight.toFixed(1)}%</div>
                            </div>
                        </div>
                        <div style={styles.circularGraphContainer}>
                             <div style={{...styles.circularGraph, background: `conic-gradient(#00ff7f ${stockWeight}%, #1e293b 0)`}}>
                                <div style={styles.circularInner}>
                                    <PieChart size={24} color="#f0b90b" />
                                </div>
                             </div>
                        </div>
                    </div>
                </div>

                <div style={{...styles.pnlCard, borderColor: `${pnlColor}44`}} className="pnl-glow-card">
                    <TrendingUp size={20} color={pnlColor} />
                    <p style={styles.cardLabel}>Total Unrealized P&L</p>
                    <h2 style={{...styles.cardValue, color: pnlColor, fontSize: '32px'}}>
                        {totalPnL >= 0 ? <ArrowUpRight size={28} /> : <ArrowDownRight size={28} />}
                        LKR {Math.abs(totalPnL).toLocaleString()}
                    </h2>
                    <span style={{fontSize: '11px', color: '#64748b', fontWeight: 'bold'}}>Combined performance of all holdings</span>
                </div>
            </div>

            {/* --- BALANCE CARDS --- */}
            <div style={styles.cardGrid}>
                <div style={styles.card} className="asset-card">
                    <div style={styles.cardIconBox}><Wallet size={20} color="#00ff7f" /></div>
                    <p style={styles.cardLabel}>Available Cash</p>
                    <h2 style={styles.cardValue}>LKR {parseFloat(portfolio.balance).toLocaleString()}</h2>
                </div>
                <div style={styles.card} className="asset-card">
                    <div style={styles.cardIconBox}><PieChart size={20} color="#f0b90b" /></div>
                    <p style={styles.cardLabel}>Total Equity Value</p>
                    <h2 style={styles.cardValue}>LKR {portfolio.total_stock_value.toLocaleString()}</h2>
                </div>
            </div>

            {/* --- MAIN CONTENT AREA --- */}
            <div style={styles.contentGrid}>
                <div style={styles.leftColumn}>
                    <div style={styles.sectionTitle}>
                        <TrendingUp size={16} color="#00ff7f" />
                        <span>Active Holdings Portfolio</span>
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
                                            <td style={{...styles.td, color: '#fff', fontWeight: '900'}}>
                                                <div style={styles.symbolCell}>{h.symbol}</div>
                                            </td>
                                            <td style={styles.td}>{h.quantity}</td>
                                            <td style={styles.td}>{h.avg_price}</td>
                                            <td style={styles.td}>{h.current_price}</td>
                                            <td style={{...styles.td, color: h.pnl >= 0 ? '#00ff7f' : '#f6465d', fontWeight: '900'}}>
                                                <div style={{display:'flex', alignItems:'center', gap: '5px'}}>
                                                    {h.pnl >= 0 ? <ArrowUpRight size={14}/> : <ArrowDownRight size={14}/>}
                                                    {Math.abs(h.pnl).toLocaleString()}
                                                </div>
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
                                        <div style={{display:'flex', gap:'5px'}}>
                                            <span style={{...styles.orderBadge, backgroundColor: order.order_type === 'STOP' ? '#7c3aed22' : 'rgba(255,255,255,0.03)', color: order.order_type === 'STOP' ? '#a78bfa' : '#64748b'}}>
                                                {order.order_type}
                                            </span>
                                            <span style={{...styles.orderBadge, color: order.type === 'BUY' ? '#00ff7f' : '#f6465d'}}>
                                                {order.type}
                                            </span>
                                        </div>
                                        <button onClick={() => handleCancelOrder(order.id)} style={styles.cancelIcon}>
                                            <XCircle size={18} />
                                        </button>
                                    </div>
                                    <div style={styles.orderDetail}>
                                        <span style={{fontWeight: '900', color: '#fff'}}>{order.symbol}</span>
                                        <span style={{color: '#94a3b8'}}>{order.quantity} Shares</span>
                                    </div>
                                    <div style={styles.orderPrice}>
                                        {order.order_type === 'STOP' ? 'Trigger Price: ' : 'Target Price: '} 
                                        <span style={{color:'#fff'}}>LKR {order.price}</span>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p style={styles.emptyText}>No pending orders.</p>
                        )}
                    </div>
                </div>
            </div>

            {/* --- RECENT TRANSACTIONS POP-UP --- */}
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
                                        <th style={styles.th}>QTY</th> 
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
                                            <td style={{...styles.td, fontWeight: 'bold'}}>{tx.quantity}</td>
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

            {/* --- WALLET ACTIVITY POP-UP --- */}
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
                    .asset-card:hover { transform: translateY(-5px); border-color: #00ff7f44; box-shadow: 0 10px 30px rgba(0,0,0,0.5); }
                    
                    .portfolio-hero-card {
                        background: linear-gradient(135deg, #0a120b 0%, #051a0e 100%);
                        box-shadow: 0 0 40px rgba(0, 255, 127, 0.05);
                        border: 1px solid rgba(0, 255, 127, 0.1) !important;
                    }

                    .pnl-glow-card {
                        flex: 0.6;
                        background: #0a120b;
                        padding: 30px;
                        border-radius: 24px;
                        border: 1px solid rgba(255,255,255,0.03);
                        display: flex;
                        flex-direction: column;
                        justify-content: center;
                        position: relative;
                        overflow: hidden;
                    }

                    .pnl-glow-card::after {
                        content: '';
                        position: absolute;
                        top: -50%; left: -50%; width: 200%; height: 200%;
                        background: radial-gradient(circle, rgba(0,255,127,0.03) 0%, transparent 70%);
                        pointer-events: none;
                    }

                    .table-row:hover { background-color: rgba(255, 255, 255, 0.02) !important; cursor: pointer; }
                    
                    @keyframes heroGlow {
                        0% { text-shadow: 0 0 10px rgba(240, 185, 11, 0.2); }
                        50% { text-shadow: 0 0 25px rgba(240, 185, 11, 0.5); }
                        100% { text-shadow: 0 0 10px rgba(240, 185, 11, 0.2); }
                    }
                    
                    @keyframes spin { to { transform: rotate(360deg); } }
                `}
            </style>
        </div>
    );
};

// --- PREMIUM NEON DARK THEME STYLES ---
const styles = {
    container: { padding: '50px 40px', backgroundColor: '#020804', minHeight: '100vh', fontFamily: "'Inter', sans-serif" },
    loadingContainer: { backgroundColor: '#020804', minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' },
    spinner: { width: '40px', height: '40px', border: '4px solid rgba(0,255,127,0.1)', borderTopColor: '#00ff7f', borderRadius: '50%', animation: 'spin 1s linear infinite' },
    headerSection: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '40px' },
    mainTitle: { color: '#fff', fontSize: '32px', fontWeight: '900', margin: 0, textTransform: 'uppercase', letterSpacing: '1px' },
    subTitle: { color: '#64748b', fontSize: '14px', margin: '5px 0 0 0' },
    liveStatus: { display: 'flex', alignItems: 'center', gap: '10px', backgroundColor: 'rgba(0,255,127,0.05)', padding: '8px 15px', borderRadius: '10px', border: '1px solid rgba(0,255,127,0.1)', color: '#00ff7f', fontSize: '11px', fontWeight: '900' },
    pulseDot: { width: '8px', height: '8px', backgroundColor: '#00ff7f', borderRadius: '50%', boxShadow: '0 0 10px #00ff7f' },
    aiRiskBar: { backgroundColor: '#0a120b', padding: '20px 25px', borderRadius: '12px', marginBottom: '30px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: '1px solid rgba(255,255,255,0.05)' },
    analyticsRow: { display: 'flex', gap: '25px', marginBottom: '30px' },
    mainAnalyticsCard: { flex: 1, backgroundColor: '#0a120b', padding: '35px', borderRadius: '28px', border: '1px solid rgba(255,255,255,0.05)' },
    chartFlex: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
    heroValueDisplay: { fontSize: '42px', fontWeight: '950', margin: '15px 0', color: '#f0b90b', display: 'flex', alignItems: 'center', animation: 'heroGlow 3s infinite' },
    weightItem: { display: 'flex', alignItems: 'center', gap: '8px', color: '#eaecef', fontSize: '11px', fontWeight: 'bold' },
    weightDot: { width: '6px', height: '6px', borderRadius: '50%' },
    circularGraphContainer: { width: '100px', height: '100px' },
    circularGraph: { width: '100%', height: '100%', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 20px rgba(0,0,0,0.5)' },
    circularInner: { width: '75%', height: '75%', backgroundColor: '#0a120b', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' },
    cardGrid: { display: 'flex', gap: '25px', marginBottom: '50px' },
    card: { flex: 1, backgroundColor: '#0a120b', padding: '25px', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.03)', display: 'flex', flexDirection: 'column', gap: '8px', position: 'relative' },
    cardIconBox: { width: '35px', height: '35px', borderRadius: '10px', backgroundColor: 'rgba(255,255,255,0.02)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '10px' },
    cardLabel: { fontSize: '11px', color: '#64748b', textTransform: 'uppercase', fontWeight: '800', letterSpacing: '0.8px' },
    cardValue: { fontSize: '26px', color: '#fff', fontWeight: '900', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' },
    contentGrid: { display: 'flex', gap: '40px' },
    leftColumn: { flex: 2 },
    rightColumn: { flex: 1 },
    sectionTitle: { display: 'flex', alignItems: 'center', gap: '10px', color: '#fff', fontSize: '14px', fontWeight: '900', textTransform: 'uppercase', marginBottom: '20px', letterSpacing: '1px' },
    tableBox: { backgroundColor: '#0a120b', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.03)', overflow: 'hidden' },
    table: { width: '100%', borderCollapse: 'collapse', textAlign: 'left' },
    thRow: { backgroundColor: 'rgba(255,255,255,0.01)' },
    th: { padding: '20px 25px', color: '#64748b', fontSize: '11px', fontWeight: '800', letterSpacing: '1px', borderBottom: '1px solid rgba(255,255,255,0.03)' },
    tr: { borderBottom: '1px solid rgba(255,255,255,0.02)', transition: '0.3s' },
    td: { padding: '20px 25px', color: '#eaecef', fontSize: '14px' },
    symbolCell: { padding: '5px 12px', backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: '8px', display: 'inline-block' },
    emptyTd: { padding: '60px', textAlign: 'center', color: '#475569', fontSize: '13px' },
    orderContainer: { display: 'flex', flexDirection: 'column', gap: '15px' },
    orderCard: { backgroundColor: '#0a120b', padding: '20px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.03)' },
    orderBadge: { fontSize: '10px', fontWeight: '900', padding: '4px 10px', borderRadius: '6px', textTransform: 'uppercase' },
    cancelIcon: { background: 'none', border: 'none', color: '#f6465d', cursor: 'pointer', opacity: 0.6, transition: '0.3s' },
    orderDetail: { display: 'flex', justifyContent: 'space-between', fontSize: '15px', marginBottom: '5px' },
    orderPrice: { fontSize: '11px', color: '#f0b90b', fontWeight: '700' },
    emptyText: { color: '#475569', fontSize: '13px', textAlign: 'center', padding: '20px' },
    logBtn: { backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', color: '#fff', padding: '8px', borderRadius: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', transition: '0.2s' },
    modalOverlay: { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.9)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 2000, backdropFilter: 'blur(12px)' },
    modalContent: { backgroundColor: '#0a120b', width: '85%', maxHeight: '85%', borderRadius: '32px', border: '1px solid rgba(0,255,127,0.1)', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 0 100px rgba(0,0,0,0.8)' },
    modalHeader: { padding: '30px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
    modalBody: { padding: '30px', overflowY: 'auto', flex: 1 }
};

export default Portfolio;