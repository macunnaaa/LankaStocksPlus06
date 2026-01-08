import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Portfolio = () => {
    const [portfolio, setPortfolio] = useState(null);

    // 1.  (Fetch Portfolio & Pending Orders)
    const fetchPortfolio = () => {
        axios.get('http://127.0.0.1:8000/api/portfolio-details/')
            .then(res => {
                setPortfolio(res.data);
                console.log("Live Portfolio Update:", new Date().toLocaleTimeString());
            })
            .catch(err => console.error("Error fetching portfolio:", err));
    };

    // 2.  (Cancel Order)
    const handleCancelOrder = (orderId) => {
        if (window.confirm("Are you sure you want to cancel this order?")) {
            axios.post('http://127.0.0.1:8000/api/cancel-order/', { order_id: orderId })
                .then(res => {
                    alert(res.data.message);
                    fetchPortfolio(); //  Refresh the table after cancellation
                })
                .catch(err => alert("Failed to cancel order"));
        }
    };

    // 3.Auto-refresh logic (10-second interval)
    useEffect(() => {
        fetchPortfolio();
        const interval = setInterval(fetchPortfolio, 10000); 
        return () => clearInterval(interval);
    }, []);

    if (!portfolio) return (
        <div style={styles.loadingContainer}>
            <h2 style={{ color: '#f0b90b' }}>Connecting to Live Market...</h2>
            <p style={{ color: '#848e9c' }}>Fetching your S&P SL20 holdings.</p>
        </div>
    );

    return (
        <div style={styles.container}>
            <div style={styles.headerSection}>
                <h2 style={{ margin: 0, color: '#fff' }}>My Portfolio</h2>
                <span style={styles.refreshBadge}>Live Refresh: 10s</span>
            </div>

            {/* --- BALANCE CARDS --- */}
            <div style={styles.cardContainer}>
                <div style={styles.card}>
                    <p style={styles.cardLabel}>Available Cash</p>
                    <h2 style={{ color: '#0ecb81', margin: 0 }}>Rs. {parseFloat(portfolio.balance).toLocaleString()}</h2>
                </div>
                <div style={styles.card}>
                    <p style={styles.cardLabel}>Total Stock Value</p>
                    <h2 style={{ color: '#fff', margin: 0 }}>Rs. {portfolio.total_stock_value.toLocaleString()}</h2>
                </div>
                <div style={styles.card}>
                    <p style={styles.cardLabel}>Portfolio Net Value</p>
                    <h2 style={{ color: '#f0b90b', margin: 0 }}>Rs. {portfolio.total_portfolio_value.toLocaleString()}</h2>
                </div>
            </div>

            {/* --- CURRENT HOLDINGS TABLE --- */}
            <div style={styles.sectionHeader}>
                <h3 style={{ color: '#fff', margin: '0 0 15px 0' }}>Current Holdings</h3>
            </div>
            <div style={styles.tableWrapper}>
                <table style={styles.table}>
                    <thead>
                        <tr style={styles.thRow}>
                            <th style={styles.th}>Symbol</th>
                            <th style={styles.th}>Qty</th>
                            <th style={styles.th}>Avg. Price</th>
                            <th style={styles.th}>Market Price</th>
                            <th style={styles.th}>TP / SL Status</th>
                            <th style={styles.th}>PnL (LKR)</th>
                        </tr>
                    </thead>
                    <tbody>
                        {portfolio.holdings.length > 0 ? (
                            portfolio.holdings.map(h => (
                                <tr key={h.symbol} style={styles.tr}>
                                    <td style={styles.td}><strong style={{color: '#f0b90b'}}>{h.symbol}</strong></td>
                                    <td style={styles.td}>{h.quantity}</td>
                                    <td style={styles.td}>Rs. {h.avg_price}</td>
                                    <td style={styles.td}>Rs. {h.current_price}</td>
                                    <td style={{...styles.td, fontSize: '11px', color: '#848e9c'}}>
                                        <span style={{color: h.tp ? '#0ecb81' : '#848e9c'}}>TP: {h.tp || '-'}</span> | 
                                        <span style={{color: h.sl ? '#f6465d' : '#848e9c'}}> SL: {h.sl || '-'}</span>
                                    </td>
                                    <td style={{ ...styles.td, color: h.pnl >= 0 ? '#0ecb81' : '#f6465d', fontWeight: 'bold' }}>
                                        {h.pnl >= 0 ? '+' : ''}{h.pnl.toLocaleString()}
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr><td colSpan="6" style={styles.emptyTd}>No active holdings found.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* --- PENDING ORDERS TABLE (BUY/SELL LIMITS) --- */}
            <div style={{...styles.sectionHeader, marginTop: '40px'}}>
                <h3 style={{ color: '#fff', margin: '0 0 15px 0' }}>Open Orders (Pending Limits)</h3>
            </div>
            <div style={styles.tableWrapper}>
                <table style={styles.table}>
                    <thead>
                        <tr style={styles.thRow}>
                            <th style={styles.th}>Order Type</th>
                            <th style={styles.th}>Symbol</th>
                            <th style={styles.th}>Qty</th>
                            <th style={styles.th}>Target Price</th>
                            <th style={styles.th}>Current Market</th>
                            <th style={styles.th}>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {portfolio.pending_orders && portfolio.pending_orders.length > 0 ? (
                            portfolio.pending_orders.map(order => (
                                <tr key={order.id} style={styles.tr}>
                                    <td style={{ ...styles.td }}>
                                        <span style={{
                                            color: order.type === 'BUY' ? '#0ecb81' : '#f6465d',
                                            backgroundColor: order.type === 'BUY' ? 'rgba(14, 203, 129, 0.1)' : 'rgba(246, 70, 93, 0.1)',
                                            padding: '4px 8px',
                                            borderRadius: '4px',
                                            fontSize: '11px',
                                            fontWeight: 'bold'
                                        }}>
                                            {order.order_type} {order.type}
                                        </span>
                                    </td>
                                    <td style={styles.td}>{order.symbol}</td>
                                    <td style={styles.td}>{order.quantity}</td>
                                    <td style={{ ...styles.td, color: '#f0b90b', fontWeight: 'bold' }}>Rs. {order.price}</td>
                                    <td style={styles.td}>Rs. {order.market_price}</td>
                                    <td style={styles.td}>
                                        <button onClick={() => handleCancelOrder(order.id)} style={styles.cancelBtn}>Cancel</button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr><td colSpan="6" style={styles.emptyTd}>No pending limit or stop orders.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

// --- BITGET INSPIRED DARK STYLES ---
const styles = {
    container: { padding: '30px', backgroundColor: '#0b0e11', minHeight: '100vh', fontFamily: 'Inter, sans-serif' },
    loadingContainer: { backgroundColor: '#0b0e11', minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' },
    headerSection: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' },
    refreshBadge: { fontSize: '11px', color: '#848e9c', backgroundColor: '#1e2329', padding: '5px 12px', borderRadius: '4px', border: '1px solid #2b3139' },
    cardContainer: { display: 'flex', gap: '20px', marginBottom: '30px' },
    card: { flex: 1, backgroundColor: '#181a20', padding: '25px', borderRadius: '12px', border: '1px solid #2b3139' },
    cardLabel: { fontSize: '12px', color: '#848e9c', marginBottom: '10px', textTransform: 'uppercase' },
    sectionHeader: { borderLeft: '4px solid #f0b90b', paddingLeft: '15px' },
    tableWrapper: { backgroundColor: '#181a20', borderRadius: '12px', border: '1px solid #2b3139', overflow: 'hidden' },
    table: { width: '100%', borderCollapse: 'collapse', textAlign: 'left' },
    thRow: { backgroundColor: '#1e2329' },
    th: { padding: '15px 20px', color: '#848e9c', fontWeight: '600', fontSize: '13px', borderBottom: '1px solid #2b3139' },
    tr: { borderBottom: '1px solid #1e2329', transition: '0.3s' },
    td: { padding: '15px 20px', color: '#eaecef', fontSize: '13px' },
    emptyTd: { padding: '40px', textAlign: 'center', color: '#848e9c', fontSize: '13px' },
    cancelBtn: { backgroundColor: 'transparent', border: '1px solid #f6465d', color: '#f6465d', padding: '4px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '11px', fontWeight: 'bold', transition: '0.3s' }
};

export default Portfolio;