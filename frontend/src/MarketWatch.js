import React, { useState, useEffect } from 'react';
import axios from 'axios';

const MarketWatch = () => {
    const [stocks, setStocks] = useState([]);
    const [selectedStock, setSelectedStock] = useState(null);
    const [quantity, setQuantity] = useState(1);
    
    // Anvanced Order style
    const [orderType, setOrderType] = useState('MARKET'); // MARKET, LIMIT, STOP
    const [executionPrice, setExecutionPrice] = useState(0);
    const [tpPrice, setTpPrice] = useState("");
    const [slPrice, setSlPrice] = useState("");

    // 1.  (Fetch Stocks)
    useEffect(() => {
        const fetchStocks = () => {
            axios.get('http://127.0.0.1:8000/api/stocks/')
                .then(res => {
                    setStocks(res.data);
                    if (!selectedStock && res.data.length > 0) {
                        const firstStock = res.data[0];
                        setSelectedStock(firstStock);
                        setExecutionPrice(firstStock.current_price);
                    }
                })
                .catch(err => console.error("Error fetching stocks:", err));
        };

        fetchStocks();
        const interval = setInterval(fetchStocks, 10000); 
        return () => clearInterval(interval);
    }, [selectedStock]);

    // 2.  (Advanced Buy/Sell)
    const handleTrade = (type) => {
        if (!selectedStock) return;
        
        const tradeData = {
            symbol: selectedStock.symbol,
            quantity: quantity,
            type: type,
            order_type: orderType,
            price: orderType === 'MARKET' ? selectedStock.current_price : executionPrice,
            tp_price: tpPrice || null,
            sl_price: slPrice || null
        };

        axios.post('http://127.0.0.1:8000/api/place-trade/', tradeData)
            .then(res => {
                alert(res.data.message);
                setQuantity(1);
                setTpPrice("");
                setSlPrice("");
            })
            .catch(err => {
                alert(err.response?.data?.error || "Trade failed. Check Market Hours (9:30-14:30).");
            });
    };

    // Update the price when the stock changes
    const handleStockSelect = (stock) => {
        setSelectedStock(stock);
        if (orderType === 'MARKET') setExecutionPrice(stock.current_price);
    };

    if (stocks.length === 0) return <div style={{color: 'white', padding: '20px'}}>Loading Market Data...</div>;

    return (
        <div style={styles.dashboard}>
            {/* --- LEFT SIDEBAR: WATCHLIST --- */}
            <div style={styles.leftSidebar}>
                <div style={styles.sidebarHeader}>Markets</div>
                <div style={styles.stockList}>
                    {stocks.map(stock => (
                        <div 
                            key={stock.symbol} 
                            onClick={() => handleStockSelect(stock)}
                            style={{
                                ...styles.stockItem, 
                                backgroundColor: selectedStock?.symbol === stock.symbol ? '#2b3139' : 'transparent'
                            }}
                        >
                            <div style={styles.symbolInfo}>
                                <span style={styles.symbolText}>{stock.symbol}</span>
                                <span style={styles.companyName}>{stock.company_name?.substring(0, 15)}</span>
                            </div>
                            <div style={styles.priceInfo}>
                                <span style={{
                                    ...styles.priceText, 
                                    color: parseFloat(stock.current_price) > 0 ? '#0ecb81' : '#f6465d'
                                }}>
                                    {parseFloat(stock.current_price).toFixed(2)}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* --- CENTER: TRADING CHART --- */}
            <div style={styles.mainChart}>
                <div style={styles.chartHeader}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <h2 style={styles.activeSymbol}>{selectedStock?.symbol}</h2>
                        <span style={styles.headerPrice}>Rs. {selectedStock?.current_price}</span>
                    </div>
                </div>
                <div style={styles.tvContainer}>
                    {selectedStock?.tradingview_symbol ? (
                        <iframe
                            title="TradingView"
                            src={`https://s.tradingview.com/widgetembed/?symbol=${selectedStock.tradingview_symbol}&interval=D&theme=dark&style=1&timezone=Etc%2FUTC&studies=[]&hidesidetoolbar=0`}
                            style={{ width: '100%', height: '100%', border: 'none' }}
                        />
                    ) : (
                        <div style={styles.noChart}>Select a stock to view Live Chart</div>
                    )}
                </div>
            </div>

            {/* --- RIGHT SIDEBAR: ADVANCED TRADE PANEL --- */}
            <div style={styles.rightPanel}>
                <div style={styles.tradeTabs}>
                    {['MARKET', 'LIMIT', 'STOP'].map(t => (
                        <button 
                            key={t}
                            onClick={() => setOrderType(t)}
                            style={orderType === t ? styles.activeTab : styles.inactiveTab}
                        >
                            {t}
                        </button>
                    ))}
                </div>
                
                <div style={styles.tradeForm}>
                    {/* Execution Price can only be modified for Limit/Stop orders */}
                    <div style={styles.inputBox}>
                        <label style={styles.label}>{orderType === 'MARKET' ? 'Market Price' : 'Target Price'} (LKR)</label>
                        <input 
                            type="number" 
                            value={orderType === 'MARKET' ? selectedStock?.current_price : executionPrice} 
                            onChange={(e) => setExecutionPrice(e.target.value)}
                            style={styles.input} 
                            readOnly={orderType === 'MARKET'} 
                        />
                    </div>
                    
                    <div style={styles.inputBox}>
                        <label style={styles.label}>Amount (Qty)</label>
                        <input 
                            type="number" 
                            value={quantity} 
                            onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))} 
                            style={styles.input} 
                        />
                    </div>

                    {/* RISK MANAGEMENT: TP & SL */}
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <div style={styles.inputBox}>
                            <label style={{...styles.label, color: '#0ecb81'}}>Take Profit</label>
                            <input type="number" placeholder="TP" value={tpPrice} onChange={(e)=>setTpPrice(e.target.value)} style={styles.smallInput} />
                        </div>
                        <div style={styles.inputBox}>
                            <label style={{...styles.label, color: '#f6465d'}}>Stop Loss</label>
                            <input type="number" placeholder="SL" value={slPrice} onChange={(e)=>setSlPrice(e.target.value)} style={styles.smallInput} />
                        </div>
                    </div>

                    <div style={styles.totalInfo}>
                        <span>Est. Total:</span>
                        <span>Rs. {((orderType === 'MARKET' ? selectedStock?.current_price : executionPrice) * quantity).toLocaleString()}</span>
                    </div>

                    <button onClick={() => handleTrade('BUY')} style={styles.buyButton}>Buy {selectedStock?.symbol.split('.')[0]}</button>
                    <button onClick={() => handleTrade('SELL')} style={styles.sellButton}>Sell {selectedStock?.symbol.split('.')[0]}</button>
                </div>

                {/* AI SNIPER ALERT AREA */}
                <div style={styles.aiAlertSection}>
                    <p style={{ color: '#f0b90b', fontSize: '11px', fontWeight: 'bold' }}>⚡ AI SNIPER STATUS</p>
                    <div style={styles.aiMessage}>
                        {selectedStock?.ai_signal === 'NEUTRAL' ? "Scanning for volatility patterns..." : selectedStock?.ai_signal}
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- STYLES ---
const styles = {
    dashboard: { display: 'flex', height: '100vh', backgroundColor: '#0b0e11', color: '#eaecef', overflow: 'hidden', fontFamily: 'Inter, sans-serif' },
    leftSidebar: { width: '280px', borderRight: '1px solid #2b3139', display: 'flex', flexDirection: 'column' },
    sidebarHeader: { padding: '15px', fontSize: '14px', fontWeight: '600', color: '#848e9c', borderBottom: '1px solid #2b3139' },
    stockList: { overflowY: 'auto', flex: 1 },
    stockItem: { display: 'flex', justifyContent: 'space-between', padding: '10px 15px', cursor: 'pointer', borderBottom: '1px solid #1e2329', transition: '0.2s' },
    symbolInfo: { display: 'flex', flexDirection: 'column' },
    symbolText: { fontSize: '13px', fontWeight: 'bold' },
    companyName: { fontSize: '10px', color: '#848e9c' },
    priceInfo: { textAlign: 'right' },
    priceText: { fontSize: '13px', fontWeight: 'bold' },
    mainChart: { flex: 1, display: 'flex', flexDirection: 'column', borderRight: '1px solid #2b3139' },
    chartHeader: { padding: '10px 20px', backgroundColor: '#161a1e', borderBottom: '1px solid #2b3139' },
    activeSymbol: { fontSize: '18px', margin: 0, color: '#fff' },
    headerPrice: { fontSize: '16px', color: '#0ecb81', fontWeight: 'bold' },
    tvContainer: { flex: 1, backgroundColor: '#000' },
    noChart: { height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#848e9c' },
    rightPanel: { width: '300px', padding: '20px', display: 'flex', flexDirection: 'column' },
    tradeTabs: { display: 'flex', gap: '15px', marginBottom: '20px', borderBottom: '1px solid #2b3139' },
    activeTab: { background: 'none', border: 'none', color: '#f0b90b', borderBottom: '2px solid #f0b90b', paddingBottom: '8px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' },
    inactiveTab: { background: 'none', border: 'none', color: '#848e9c', paddingBottom: '8px', cursor: 'pointer', fontSize: '12px' },
    tradeForm: { display: 'flex', flexDirection: 'column', gap: '15px' },
    inputBox: { display: 'flex', flexDirection: 'column', gap: '5px', flex: 1 },
    label: { fontSize: '11px', color: '#848e9c' },
    input: { backgroundColor: '#2b3139', border: '1px solid #474d57', borderRadius: '4px', padding: '10px', color: '#fff', fontSize: '13px', outline: 'none' },
    smallInput: { backgroundColor: '#1e2329', border: '1px solid #2b3139', borderRadius: '4px', padding: '8px', color: '#fff', fontSize: '12px', width: '100%' },
    totalInfo: { display: 'flex', justifyContent: 'space-between', fontSize: '12px', margin: '5px 0', color: '#848e9c' },
    buyButton: { backgroundColor: '#0ecb81', color: '#fff', border: 'none', padding: '12px', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' },
    sellButton: { backgroundColor: '#f6465d', color: '#fff', border: 'none', padding: '12px', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' },
    aiAlertSection: { marginTop: 'auto', padding: '12px', backgroundColor: '#1e2329', borderRadius: '6px', border: '1px solid #2b3139' },
    aiMessage: { fontSize: '12px', color: '#eaecef', marginTop: '5px' }
};

export default MarketWatch;