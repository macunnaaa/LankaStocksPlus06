import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import html2canvas from 'html2canvas';

const MarketWatch = () => {
    const [stocks, setStocks] = useState([]);
    const [portfolioHoldings, setPortfolioHoldings] = useState([]); 
    const [selectedStock, setSelectedStock] = useState(null);
    const [quantity, setQuantity] = useState(1);
    
    // Advanced Order States
    const [orderType, setOrderType] = useState('MARKET'); 
    const [executionPrice, setExecutionPrice] = useState(0);
    const [tpPrice, setTpPrice] = useState("");
    const [slPrice, setSlPrice] = useState("");

    // Button Hover States
    const [buyHover, setBuyHover] = useState(false);
    const [sellHover, setSellHover] = useState(false);

    // AI SNIPER STATES
    const [isSniping, setIsSniping] = useState(false);
    const [aiSignal, setAiSignal] = useState("AI Offline");
    const chartRef = useRef(null);

    // Roboflow Configuration
    const ROBOFLOW_API_KEY = "Zpbfxr5IRHIcqGPSdcDO";
    const MODEL_ID = "bullish_breakout_finder/3"; 

    // --- MANUAL SELECTION STATES ---
    const [isSelecting, setIsSelecting] = useState(false);
    const [selectionRect, setSelectionRect] = useState({ startX: 0, startY: 0, width: 0, height: 0 });
    const [showOverlay, setShowOverlay] = useState(false);
    const [snipedResult, setSnipedResult] = useState(null); 

    // ---  AI AUTO-TRADING ROBOT STATES ---
    const [showBotModal, setShowBotModal] = useState(false);
    const [botData, setBotData] = useState({ balance: 0, is_active: false, logs: [], holdings: [], selected_stocks: [], sl: 2, tp: 5 });
    const [transferAmount, setTransferAmount] = useState("");
    const [withdrawAmount, setWithdrawAmount] = useState("");
    const [botSL, setBotSL] = useState(2);
    const [botTP, setBotTP] = useState(5);

    // ---  NEW AI NEWS ALARM STATES ---
    const [showNewsModal, setShowNewsModal] = useState(false);
    const [newsAlerts, setNewsAlerts] = useState([]);
    const [hasNewAlert, setHasNewAlert] = useState(false);

    // ---  MODERN NOTIFICATION STATE ---
    const [notification, setNotification] = useState({ show: false, message: "", type: "info" });

    const showNotify = (msg, type = "info") => {
        setNotification({ show: true, message: msg, type: type });
        setTimeout(() => setNotification({ show: false, message: "", type: "info" }), 4000);
    };

    // 1. Fetch Stocks & Portfolio Logic
    useEffect(() => {
        const fetchMarketAndPortfolio = async () => {
            try {
                const [stocksRes, portfolioRes] = await Promise.all([
                    axios.get('http://127.0.0.1:8000/api/stocks/'),
                    axios.get('http://127.0.0.1:8000/api/portfolio-details/')
                ]);

                setStocks(stocksRes.data);
                setPortfolioHoldings(portfolioRes.data.holdings || []);

                if (!selectedStock && stocksRes.data.length > 0) {
                    const firstStock = stocksRes.data[0];
                    setSelectedStock(firstStock);
                    setExecutionPrice(firstStock.current_price);
                }
            } catch (err) {
                console.error("Error fetching data:", err);
            }
        };

        fetchMarketAndPortfolio();
        const interval = setInterval(fetchMarketAndPortfolio, 10000); 
        return () => clearInterval(interval);
    }, [selectedStock]);

    // ---  FETCH NEWS LOGIC ---
    useEffect(() => {
        const fetchNews = async () => {
            try {
                const res = await axios.get('http://127.0.0.1:8000/api/news-alerts/');
                const latest10 = res.data.slice(0, 10);
                setNewsAlerts(latest10);
                if (latest10.some(n => !n.is_read)) setHasNewAlert(true);
            } catch (err) { console.error("News Error:", err); }
        };
        fetchNews();
        const newsInterval = setInterval(fetchNews, 30000); 
        return () => clearInterval(newsInterval);
    }, []);

    const getCurrentHolding = () => {
        if (!selectedStock || !portfolioHoldings) return 0;
        const found = portfolioHoldings.find(h => h.symbol === selectedStock.symbol);
        return found ? found.quantity : 0;
    };

    // ---  AI BOT FUNCTIONS ---
    const fetchBotStatus = () => {
        axios.get('http://127.0.0.1:8000/api/bot-status/')
            .then(res => {
                setBotData(res.data);
                setBotSL(res.data.sl);
                setBotTP(res.data.tp);
            })
            .catch(err => console.error("Bot Error:", err));
    };

    const toggleBot = () => {
        const now = new Date();
        const sriLankaTime = new Date(now.toLocaleString("en-US", {timeZone: "Asia/Colombo"}));
        const hours = sriLankaTime.getHours();
        const mins = sriLankaTime.getMinutes();
        const day = sriLankaTime.getDay(); 

        const currentTimeInMins = hours * 60 + mins;
        const marketStart = 9 * 60 + 30; 
        const marketEnd = 14 * 60 + 30; 

        const isWeekend = day === 0 || day === 6;
        const isMarketOpen = !isWeekend && (currentTimeInMins >= marketStart && currentTimeInMins <= marketEnd);

        if (!botData.is_active) {
            if (!isMarketOpen) {
                showNotify("❌ Market Closed! Robot operates during CSE hours (9:30 AM - 2:30 PM).", "error");
                return;
            }
            if (!botData.selected_stocks || botData.selected_stocks.length === 0) {
                showNotify("⚠️ Please select at least one stock to monitor.", "info");
                return;
            }
        }

        axios.post('http://127.0.0.1:8000/api/toggle-bot/')
            .then(res => {
                showNotify(res.data.message, "success");
                fetchBotStatus();
            });
    };

    const transferToBot = () => {
        if (!transferAmount || transferAmount <= 0) return;
        axios.post('http://127.0.0.1:8000/api/transfer-to-bot/', { amount: transferAmount })
            .then(res => {
                showNotify(res.data.message, "success");
                setTransferAmount("");
                fetchBotStatus();
            })
            .catch(err => showNotify(err.response.data.error, "error"));
    };

    const withdrawFromBot = () => {
        if (!withdrawAmount || withdrawAmount <= 0) return;
        axios.post('http://127.0.0.1:8000/api/bot-withdraw/', { amount: withdrawAmount })
            .then(res => {
                showNotify(res.data.message, "success");
                setWithdrawAmount("");
                fetchBotStatus();
            })
            .catch(err => showNotify(err.response.data.error, "error"));
    };

    const updateBotSettings = (updatedStocks) => {
        axios.post('http://127.0.0.1:8000/api/update-bot-settings/', {
            stocks: updatedStocks || botData.selected_stocks,
            sl: botSL,
            tp: botTP
        }).then(() => fetchBotStatus());
    };

    const handleStockToggle = (symbol) => {
        let newList = [...botData.selected_stocks];
        if (newList.includes(symbol)) {
            newList = newList.filter(s => s !== symbol);
        } else {
            if (newList.length >= 10) { showNotify("Maximum 10 stocks allowed!", "error"); return; }
            newList.push(symbol);
        }
        updateBotSettings(newList);
    };

    // ---  AI SNIPPER TOOL LOGIC ---
    const startSniperMode = () => {
        setSnipedResult(null); 
        setShowOverlay(true);
        setAiSignal("🖱️ Select BREAKOUT area...");
    };

    const handleContextMenu = (e) => {
        e.preventDefault();
        setShowOverlay(false);
        setSnipedResult(null);
        setAiSignal("AI Offline");
    };

    const handleMouseDown = (e) => {
        if (e.button === 2) return; 
        setIsSelecting(true);
        setSnipedResult(null);
        setSelectionRect({ startX: e.clientX, startY: e.clientY, width: 0, height: 0 });
    };

    const handleMouseMove = (e) => {
        if (!isSelecting) return;
        setSelectionRect(prev => ({
            ...prev,
            width: e.clientX - prev.startX,
            height: e.clientY - prev.startY
        }));
    };

    const handleMouseUp = async (e) => {
        if (e.button === 2 || !isSelecting) return;
        setIsSelecting(false);
        if (Math.abs(selectionRect.width) < 15 || Math.abs(selectionRect.height) < 15) return;
        await handleAiSnip(); 
    };

    const handleAiSnip = async () => {
        setIsSniping(true);
        setAiSignal("📡 AI SCANNING FOR BREAKOUTS...");
        
        try {
            const x = selectionRect.width > 0 ? selectionRect.startX : selectionRect.startX + selectionRect.width;
            const y = selectionRect.height > 0 ? selectionRect.startY : selectionRect.startY + selectionRect.height;
            const w = Math.abs(selectionRect.width);
            const h = Math.abs(selectionRect.height);
            
            const canvas = await html2canvas(document.body, { useCORS: true, allowTaint: true, x: x, y: y, width: w, height: h });
            const imageData = canvas.toDataURL("image/jpeg").split(",")[1];

            const response = await axios({
                method: 'post',
                url: `https://detect.roboflow.com/${MODEL_ID}`, 
                params: {
                    api_key: ROBOFLOW_API_KEY
                },
                data: imageData,
                headers: { "Content-Type": "application/x-www-form-urlencoded" }
            });

            const predictions = response.data.predictions;

            if (predictions.length > 0) {
                const breakoutMatch = predictions.find(p => p.class === "BULLISH" && p.confidence > 0.10);
                
                if (breakoutMatch) {
                    setAiSignal("🚀 BULLISH BREAKOUT DETECTED!");
                    setSnipedResult({ 
                        text: "BULLISH BREAKOUT", 
                        x, y, w, h, 
                        color: '#0ecb81' 
                    });
                    showNotify("🚀 AI Detected a Bullish Breakout!", "success");
                } else {
                    setAiSignal("❌ NO BULLISH BREAKOUT");
                }
            } else {
                setAiSignal("❌ NO PATTERN FOUND");
            }
        } catch (error) {
            console.error("AI Error:", error);
            setAiSignal("❌ AI ERROR");
        }
        setIsSniping(false);
    };

    // 3. Trade Execution Logic
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
                showNotify(`✅ ${type} Order Placed Successfully!`, "success");
                setQuantity(1);
                setTpPrice("");
                setSlPrice("");
            })
            .catch(err => { showNotify(err.response?.data?.error || "Trade failed.", "error"); });
    };

    const handleStockSelect = (stock) => {
        setSelectedStock(stock);
        if (orderType === 'MARKET') setExecutionPrice(stock.current_price);
    };

    if (stocks.length === 0) return <div style={{color: 'white', padding: '20px'}}>Loading Market Data...</div>;

    return (
        <div style={styles.dashboard}>

            {/* --- 🚀 MODERN CENTRAL NOTIFICATION --- */}
            {notification.show && (
                <div style={{...styles.notifyContainer, backgroundColor: notification.type === 'error' ? '#f6465d' : notification.type === 'success' ? '#0ecb81' : '#4285f4'}}>
                    <span style={styles.notifyMsg}>{notification.message}</span>
                </div>
            )}
            
            {showOverlay && (
                <div style={styles.sniperOverlay} onMouseDown={handleMouseDown} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} onContextMenu={handleContextMenu}>
                    {isSelecting && ( <div style={{ ...styles.selectionBox, left: selectionRect.width > 0 ? selectionRect.startX : selectionRect.startX + selectionRect.width, top: selectionRect.height > 0 ? selectionRect.startY : selectionRect.startY + selectionRect.height, width: Math.abs(selectionRect.width), height: Math.abs(selectionRect.height) }} /> )}
                    {snipedResult && ( <div style={{ ...styles.snipedAreaResult, left: snipedResult.x, top: snipedResult.y, width: snipedResult.w, height: snipedResult.h, borderColor: snipedResult.color }}> <div style={{...styles.resultBadge, backgroundColor: snipedResult.color}}> ↑ {snipedResult.text} </div> </div> )}
                </div>
            )}

            {/* ---  AI ROBOT MODAL --- */}
            {showBotModal && (
                <div style={styles.modalOverlay}>
                    <div style={styles.botModal}>
                        <div style={styles.modalHeader}>
                            <h2 style={{color: '#f0b90b', margin: 0, fontSize: '18px'}}>🤖 AI AUTO-TRADING ROBOT</h2>
                            <button onClick={() => setShowBotModal(false)} style={styles.closeBtn}>✕</button>
                        </div>
                        <div style={styles.modalBody}>
                            <div style={styles.botStatsRow}>
                                <div style={styles.statBox}>
                                    <span style={styles.statLabel}>BOT BALANCE</span>
                                    <span style={styles.statValue}>LKR {parseFloat(botData.balance).toLocaleString()}</span>
                                </div>
                                <div style={styles.statBox}>
                                    <span style={styles.statLabel}>STATUS</span>
                                    <span style={{...styles.statValue, color: botData.is_active ? '#0ecb81' : '#f6465d'}}> {botData.is_active ? '● RUNNING' : '○ STANDBY'} </span>
                                </div>
                            </div>

                            <div style={styles.botActionGrid}>
                                <div style={styles.actionColumn}>
                                    <span style={styles.smallLabel}>Transfer Funds (To Bot)</span>
                                    <div style={styles.flexInput}>
                                        <input type="number" placeholder="Amt" value={transferAmount} onChange={(e) => setTransferAmount(e.target.value)} style={styles.modalInput}/>
                                        <button onClick={transferToBot} style={styles.transferBtn}>Add</button>
                                    </div>
                                </div>
                                <div style={styles.actionColumn}>
                                    <span style={styles.smallLabel}>Withdraw (To Main)</span>
                                    <div style={styles.flexInput}>
                                        <input type="number" placeholder="Amt" value={withdrawAmount} onChange={(e) => setWithdrawAmount(e.target.value)} style={styles.modalInput}/>
                                        <button onClick={withdrawFromBot} style={{...styles.transferBtn, backgroundColor:'#f6465d'}}>Out</button>
                                    </div>
                                </div>
                            </div>

                            <div style={styles.botSettingsSection}>
                                <div style={styles.settingsHeader}>Trading Configuration (Max 10 Stocks)</div>
                                <div style={styles.stockChecklist}>
                                    {stocks.slice(0, 20).map(s => (
                                        <label key={s.symbol} style={styles.checkLabel}>
                                            <input type="checkbox" checked={botData.selected_stocks.includes(s.symbol)} onChange={() => handleStockToggle(s.symbol)} />
                                            {s.symbol.split('.')[0]}
                                        </label>
                                    ))}
                                </div>
                                <div style={styles.settingsRow}>
                                    <div style={styles.inputBox}>
                                        <label style={styles.label}>Stop Loss %</label>
                                        <input type="number" value={botSL} onChange={(e) => setBotSL(e.target.value)} onBlur={() => updateBotSettings()} style={styles.smallInput} />
                                    </div>
                                    <div style={styles.inputBox}>
                                        <label style={styles.label}>Take Profit %</label>
                                        <input type="number" value={botTP} onChange={(e) => setBotTP(e.target.value)} onBlur={() => updateBotSettings()} style={styles.smallInput} />
                                    </div>
                                </div>
                            </div>

                            <div style={styles.botPortfolioTable}>
                                <div style={styles.logHeader}>Active Robot Holdings</div>
                                <table style={styles.miniTable}>
                                    <thead><tr><th>Stock</th><th>Qty</th><th>Buy Price</th></tr></thead>
                                    <tbody>
                                        {botData.holdings && botData.holdings.map((h, i) => (
                                            <tr key={i}><td>{h.symbol}</td><td>{h.qty}</td><td>{h.buy_price}</td></tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            <div style={styles.logContainer}>
                                <div style={styles.logHeader}>Live Execution Log</div>
                                <div style={styles.logBody}>
                                    {botData.logs && botData.logs.length > 0 ? botData.logs.map((log, i) => (
                                        <div key={i} style={styles.logEntry}>
                                            <span style={styles.logTime}>{log.time}</span>
                                            <span style={{color: log.type === 'BUY' ? '#0ecb81' : log.type === 'SELL' ? '#f6465d' : '#848e9c'}}> {log.message} </span>
                                        </div>
                                    )) : <p style={{color: '#474d57', textAlign: 'center'}}>No recent activity.</p>}
                                </div>
                            </div>

                            <button onClick={toggleBot} style={{...styles.startBotBtn, backgroundColor: botData.is_active ? '#f6465d' : '#0ecb81'}}>
                                {botData.is_active ? 'STOP AUTO-TRADING' : 'START AI ROBOT'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ---  NEWS ALARM MODAL --- */}
            {showNewsModal && (
                <div style={styles.modalOverlay}>
                    <div style={styles.botModal}>
                        <div style={styles.modalHeader}>
                            <h2 style={{color: '#f0b90b', margin: 0, fontSize: '18px'}}>🔔 AI NEWS ALERTS</h2>
                            <button onClick={() => { setShowNewsModal(false); setHasNewAlert(false); axios.post('http://127.0.0.1:8000/api/mark-news-read/'); }} style={styles.closeBtn}>✕</button>
                        </div>
                        <div style={styles.newsListBody}>
                            {newsAlerts.length > 0 ? newsAlerts.map((n, i) => (
                                <div key={i} style={{...styles.newsItemBox, borderLeftColor: n.ai_signal === 'BUY' ? '#0ecb81' : n.ai_signal === 'SELL' ? '#f6465d' : '#848e9c'}}>
                                    <div style={styles.newsMeta}>
                                        <span style={styles.newsStockTag}>{n.stock_symbol || "CSE MARKET"}</span>
                                        <span style={{...styles.newsSignalTag, backgroundColor: n.ai_signal === 'BUY' ? '#0ecb81' : n.ai_signal === 'SELL' ? '#f6465d' : '#2b3139'}}>
                                            {n.ai_signal} SIGNAL
                                        </span>
                                        <span style={styles.newsTimeText}>{new Date(n.timestamp).toLocaleTimeString()}</span>
                                    </div>
                                    <div style={styles.newsTitleText}>{n.title}</div>
                                    <a href={n.source_link} target="_blank" rel="noreferrer" style={styles.newsLink}>Read Official Source →</a>
                                </div>
                            )) : <div style={{textAlign: 'center', color: '#848e9c', padding: '20px'}}>No recent news found...</div>}
                        </div>
                    </div>
                </div>
            )}

            {/* --- LEFT SIDEBAR: WATCHLIST --- */}
            <div style={styles.leftSidebar}>
                <div style={styles.sidebarHeader}>Markets</div>
                <div style={styles.stockList}>
                    {stocks.map(stock => (
                        <div key={stock.symbol} onClick={() => handleStockSelect(stock)} className="stock-item-zoom" style={{ ...styles.stockItem, backgroundColor: selectedStock?.symbol === stock.symbol ? '#2b3139' : 'transparent' }} >
                            <div style={styles.symbolInfo}> <span style={styles.symbolText}>{stock.symbol}</span> <span style={styles.companyName}>{stock.company_name?.substring(0, 15)}</span> </div>
                            <div style={styles.priceInfo}> <span style={{ ...styles.priceText, color: parseFloat(stock.current_price) > 0 ? '#0ecb81' : '#f6465d' }}>{parseFloat(stock.current_price).toFixed(2)}</span> </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* --- CENTER: TRADING CHART --- */}
            <div style={styles.mainChart}>
                <div style={styles.chartHeader}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}> <h2 style={styles.activeSymbol}>{selectedStock?.symbol}</h2> <span style={styles.headerPrice}>Rs. {selectedStock?.current_price}</span> </div>
                        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                            <button onClick={() => { setShowNewsModal(true); setHasNewAlert(false); }} style={{...styles.snipBtn, backgroundColor: hasNewAlert ? '#f6465d' : '#2b3139', position: 'relative'}}>
                                🔔 {hasNewAlert && <span style={styles.redBadge}></span>}
                            </button>
                            {/* 🚀 GEMINI STYLE SNIPER BUTTON */}
                            <button onClick={startSniperMode} disabled={isSniping} className="gemini-sniper-btn" style={styles.geminiSniperBtn}> 
                                {isSniping ? '🔍 Scanning...' : '✨ AI Sniper'} 
                            </button>
                        </div>
                    </div>
                </div>
                <div ref={chartRef} style={styles.tvContainer}>
                    {selectedStock?.tradingview_symbol ? ( <iframe title="TradingView" src={`https://s.tradingview.com/widgetembed/?symbol=${selectedStock.tradingview_symbol}&interval=D&theme=dark&style=1&timezone=Etc%2FUTC&studies=[]&hidesidetoolbar=0`} style={{ width: '100%', height: '100%', border: 'none' }} /> ) : ( <div style={styles.noChart}>Select a stock to view Live Chart</div> )}
                </div>
            </div>

            {/* --- RIGHT SIDEBAR --- */}
            <div style={styles.rightPanel}>
                <div style={styles.tradeTabs}> {['MARKET', 'LIMIT', 'STOP'].map(t => ( <button key={t} onClick={() => setOrderType(t)} style={orderType === t ? styles.activeTab : styles.inactiveTab} > {t} </button> ))} </div>
                <div style={styles.tradeForm}>
                    <div style={styles.holdingInfoBox}> <span style={styles.holdingLabel}>Holding Balance:</span> <span style={styles.holdingValue}>{getCurrentHolding()} Shares</span> </div>
                    <div style={styles.inputBox}> <label style={styles.label}>{orderType === 'MARKET' ? 'Market Price' : 'Target Price'}</label> <input type="number" value={orderType === 'MARKET' ? selectedStock?.current_price : executionPrice} onChange={(e) => setExecutionPrice(e.target.value)} style={styles.input} readOnly={orderType === 'MARKET'} /> </div>
                    <div style={styles.inputBox}> <label style={styles.label}>Amount (Qty)</label> <input type="number" value={quantity} onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))} style={styles.input} /> </div>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <div style={styles.inputBox}> <label style={{...styles.label, color: '#0ecb81'}}>Take Profit</label> <input type="number" placeholder="TP" value={tpPrice} onChange={(e)=>setTpPrice(e.target.value)} style={styles.smallInput} /> </div>
                        <div style={styles.inputBox}> <label style={{...styles.label, color: '#f6465d'}}>Stop Loss</label> <input type="number" placeholder="SL" value={slPrice} onChange={(e)=>setSlPrice(e.target.value)} style={styles.smallInput} /> </div>
                    </div>
                    <div style={styles.totalInfo}> <span>Est. Total:</span> <span>Rs. {((orderType === 'MARKET' ? selectedStock?.current_price : executionPrice) * quantity).toLocaleString()}</span> </div>
                    
                    <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px'}}>
                        <button onMouseEnter={() => setBuyHover(true)} onMouseLeave={() => setBuyHover(false)} onClick={() => handleTrade('BUY')} style={{ ...styles.buyButton, boxShadow: buyHover ? '0 0 15px #0ecb81' : 'none' }} > Buy </button>
                        <button onMouseEnter={() => setSellHover(true)} onMouseLeave={() => setSellHover(false)} onClick={() => handleTrade('SELL')} style={{ ...styles.sellButton, boxShadow: sellHover ? '0 0 15px #f6465d' : 'none' }} > Sell </button>
                    </div>

                    {/* 🚀 UPGRADED ROUND GEMINI STYLE AI ROBOT BUTTON */}
                    <button onClick={() => { setShowBotModal(true); fetchBotStatus(); }} className="gemini-robot-btn" style={styles.geminiRobotBtn}> 
                        🤖 LAUNCH AI AUTO-ROBOT 
                    </button>
                </div>
                <div style={{...styles.aiAlertSection, borderColor: aiSignal.includes('BULL') ? '#8ab4f8' : '#2b3139'}}>
                    <p style={{ color: '#8ab4f8', fontSize: '11px', fontWeight: 'bold' }}>✨ AI SNIPER STATUS</p>
                    <div style={{...styles.aiMessage, color: aiSignal.includes('BULL') ? '#8ab4f8' : '#eaecef'}}> {aiSignal} </div>
                </div>
            </div>

            {/* 💎 MODERN ANIMATIONS CSS */}
            <style> {` 
                .stock-item-zoom { transition: all 0.2s; } 
                .stock-item-zoom:hover { transform: scale(1.03); z-index: 10; background-color: #2b3139 !important; } 

                @keyframes geminiGradient {
                    0% { background-position: 0% 50%; }
                    50% { background-position: 100% 50%; }
                    100% { background-position: 0% 50%; }
                }

                @keyframes geminiGlow {
                    0% { box-shadow: 0 0 8px rgba(138, 180, 248, 0.3); }
                    50% { box-shadow: 0 0 25px rgba(138, 180, 248, 0.7), 0 0 10px rgba(66, 133, 244, 0.4); }
                    100% { box-shadow: 0 0 8px rgba(138, 180, 248, 0.3); }
                }

                @keyframes slideInUp {
                    from { transform: translate(-50%, 20px); opacity: 0; }
                    to { transform: translate(-50%, 0); opacity: 1; }
                }

                .gemini-robot-btn {
                    background: linear-gradient(-45deg, #4285f4, #9b72f3, #0ecb81, #4285f4);
                    background-size: 400% 400%;
                    animation: geminiGradient 4s ease infinite, geminiGlow 2s ease-in-out infinite;
                    border: none !important;
                    color: white !important;
                    transition: 0.3s;
                    border-radius: 30px !important; 
                    font-weight: 800 !important;
                    padding: 15px !important;
                    cursor: pointer;
                    text-transform: uppercase;
                }

                .gemini-robot-btn:hover { 
                    transform: scale(1.05);
                    filter: brightness(1.1);
                }

                .gemini-sniper-btn {
                    background: linear-gradient(-45deg, #f0b90b, #ffe082, #f0b90b);
                    background-size: 200% 200%;
                    animation: geminiGradient 2s ease infinite;
                    border-radius: 20px !important;
                    padding: 6px 15px !important;
                    color: #000 !important;
                    font-weight: bold !important;
                    border: none !important;
                    cursor: pointer;
                    box-shadow: 0 4px 10px rgba(0,0,0,0.3);
                }
            `} </style>
        </div>
    );
};

// --- STYLES OBJECT ---
const styles = {
    dashboard: { display: 'flex', height: '100vh', backgroundColor: '#0b0e11', color: '#eaecef', overflow: 'hidden', fontFamily: 'Inter, sans-serif', position: 'relative' },
    
    // --- Modern Notify UI ---
    notifyContainer: { position: 'fixed', bottom: '30px', left: '50%', transform: 'translateX(-50%)', padding: '12px 30px', borderRadius: '12px', zIndex: 99999, boxShadow: '0 10px 30px rgba(0,0,0,0.5)', animation: 'slideInUp 0.4s ease-out', display: 'flex', alignItems: 'center' },
    notifyMsg: { color: '#fff', fontWeight: '600', fontSize: '14px' },

    sniperOverlay: { position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 9999, cursor: 'crosshair' },
    selectionBox: { position: 'absolute', border: '2px solid #8ab4f8', backgroundColor: 'rgba(138, 180, 248, 0.1)', boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.5)' },
    snipedAreaResult: { position: 'absolute', border: '2px solid', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', pointerEvents: 'none' },
    resultBadge: { padding: '4px 10px', color: '#000', fontWeight: 'bold', fontSize: '12px', borderRadius: '0 0 4px 4px', textTransform: 'uppercase' },
    leftSidebar: { width: '280px', borderRight: '1px solid #2b3139', display: 'flex', flexDirection: 'column' },
    sidebarHeader: { padding: '15px', fontSize: '14px', fontWeight: '600', color: '#848e9c', borderBottom: '1px solid #2b3139' },
    stockList: { overflowY: 'auto', flex: 1 },
    stockItem: { display: 'flex', justifyContent: 'space-between', padding: '10px 15px', cursor: 'pointer', borderBottom: '1px solid #1e2329' },
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
    holdingInfoBox: { display: 'flex', justifyContent: 'space-between', backgroundColor: '#1e2329', padding: '8px 12px', borderRadius: '4px', border: '1px solid #2b3139', marginBottom: '5px' },
    holdingLabel: { fontSize: '12px', color: '#848e9c' },
    holdingValue: { fontSize: '12px', color: '#f0b90b', fontWeight: 'bold' },
    input: { backgroundColor: '#2b3139', border: '1px solid #474d57', borderRadius: '4px', padding: '10px', color: '#fff', fontSize: '13px', outline: 'none' },
    smallInput: { backgroundColor: '#1e2329', border: '1px solid #2b3139', borderRadius: '4px', padding: '8px', color: '#fff', fontSize: '12px', width: '100%' },
    totalInfo: { display: 'flex', justifyContent: 'space-between', fontSize: '12px', margin: '5px 0', color: '#848e9c' },
    buyButton: { backgroundColor: '#0ecb81', color: '#fff', border: 'none', padding: '12px', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.3s' },
    sellButton: { backgroundColor: '#f6465d', color: '#fff', border: 'none', padding: '12px', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.3s' },
    geminiRobotBtn: { marginTop: '10px', width: '100%' },
    geminiSniperBtn: { },
    aiAlertSection: { marginTop: 'auto', padding: '12px', backgroundColor: '#1e2329', borderRadius: '6px', border: '1px solid #2b3139' },
    aiMessage: { fontSize: '12px', color: '#eaecef', marginTop: '5px' },
    snipBtn: { width: '35px', height: '35px', borderRadius: '50%', border: 'none', fontWeight: 'bold', cursor: 'pointer', color: '#fff', fontSize: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' },
    
    modalOverlay: { position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.4)', zIndex: 10000, display: 'flex', justifyContent: 'center', alignItems: 'center', backdropFilter: 'blur(3px)' },
    botModal: { width: '580px', maxHeight: '92vh', backgroundColor: 'rgba(22, 26, 30, 0.95)', borderRadius: '15px', border: '1px solid #2b3139', padding: '25px', overflowY: 'auto', boxShadow: '0 10px 40px rgba(0,0,0,0.5)' },
    modalHeader: { display: 'flex', justifyContent: 'space-between', marginBottom: '20px' },
    closeBtn: { background: 'none', border: 'none', color: '#848e9c', cursor: 'pointer', fontSize: '20px' },
    botStatsRow: { display: 'flex', gap: '12px', marginBottom: '20px' },
    statBox: { flex: 1, backgroundColor: '#0b0e11', padding: '12px', borderRadius: '10px', border: '1px solid #2b3139' },
    statLabel: { fontSize: '10px', color: '#848e9c', display: 'block', textTransform: 'uppercase' },
    statValue: { fontSize: '18px', fontWeight: 'bold', marginTop: '3px', display: 'block' },
    botActionGrid: { display: 'flex', gap: '12px', marginBottom: '20px' },
    actionColumn: { flex: 1, backgroundColor: '#1c2127', padding: '12px', borderRadius: '10px', border: '1px solid #2b3139' },
    smallLabel: { fontSize: '10px', color: '#f0b90b', marginBottom: '8px', display: 'block', fontWeight: 'bold' },
    flexInput: { display: 'flex', gap: '6px' },
    modalInput: { flex: 1, backgroundColor: '#0b0e11', border: '1px solid #474d57', borderRadius: '4px', padding: '6px 10px', color: '#fff', fontSize: '12px' },
    transferBtn: { backgroundColor: '#f0b90b', border: 'none', padding: '0 12px', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer', color: '#000', fontSize: '11px' },
    botSettingsSection: { backgroundColor: '#0b0e11', padding: '15px', borderRadius: '10px', marginBottom: '20px', border: '1px solid #2b3139' },
    settingsHeader: { fontSize: '11px', fontWeight: 'bold', color: '#f0b90b', marginBottom: '12px', textTransform: 'uppercase' },
    stockChecklist: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', maxHeight: '110px', overflowY: 'auto', marginBottom: '15px', paddingRight: '10px' },
    checkLabel: { fontSize: '11px', display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer', color: '#eaecef' },
    settingsRow: { display: 'flex', gap: '15px' },
    botPortfolioTable: { marginBottom: '20px', backgroundColor: '#0b0e11', borderRadius: '8px', padding: '12px', border: '1px solid #2b3139' },
    miniTable: { width: '100%', borderCollapse: 'collapse', fontSize: '12px', textAlign: 'left', color: '#eaecef' },
    logContainer: { height: '140px', backgroundColor: '#0b0e11', border: '1px solid #2b3139', borderRadius: '5px', display: 'column', marginBottom: '20px' },
    logHeader: { padding: '8px 12px', borderBottom: '1px solid #2b3139', fontSize: '11px', color: '#848e9c', fontWeight: 'bold', textTransform: 'uppercase' },
    logBody: { flex: 1, overflowY: 'auto', padding: '10px' },
    logEntry: { fontSize: '10px', marginBottom: '5px', fontFamily: 'monospace' },
    logTime: { color: '#474d57', marginRight: '10px' },
    startBotBtn: { width: '100%', padding: '14px', borderRadius: '10px', border: 'none', fontWeight: 'bold', fontSize: '16px', cursor: 'pointer', marginTop: '5px' },
    
    newsListBody: { display: 'flex', flexDirection: 'column', gap: '12px', padding: '10px 0' },
    newsItemBox: { backgroundColor: '#0b0e11', padding: '12px', borderRadius: '8px', borderLeft: '4px solid', borderBottom: '1px solid #2b3139' },
    newsMeta: { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' },
    newsStockTag: { fontSize: '10px', fontWeight: 'bold', color: '#f0b90b', textTransform: 'uppercase' },
    newsSignalTag: { fontSize: '9px', fontWeight: 'bold', color: '#000', padding: '2px 6px', borderRadius: '3px' },
    newsTimeText: { fontSize: '9px', color: '#848e9c', marginLeft: 'auto' },
    newsTitleText: { fontSize: '13px', color: '#fff', lineHeight: '1.4', marginBottom: '8px' },
    newsLink: { fontSize: '11px', color: '#f0b90b', textDecoration: 'none' },
    redBadge: { position: 'absolute', top: '0', right: '0', width: '8px', height: '8px', backgroundColor: 'red', borderRadius: '50%', border: '1px solid white' }
};

export default MarketWatch;