import os
import sys
import django
import requests
import time
import json
from decimal import Decimal
from bs4 import BeautifulSoup

# 1. Django setup
current_dir = os.path.dirname(os.path.abspath(__file__))
parent_dir = os.path.dirname(current_dir)
sys.path.append(parent_dir)
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

#  Imported models (including newly added ones)
from core.models import Stock, Transaction, Holding, Portfolio, BotPortfolio, BotHolding, BotLog, NewsAlert

# ---  New Logic 1: Handling pending orders (Limit/Stop)
def process_pending_orders():
    """ Execute pending Limit/Stop orders"""
    pending_txs = Transaction.objects.filter(status='PENDING')
    for tx in pending_txs:
        stock = tx.stock
        curr_price = Decimal(stock.current_price)
        target_price = Decimal(tx.price)
        portfolio = Portfolio.objects.get(user=tx.user)

        execute = False
        if tx.order_type == 'LIMIT':
            if tx.transaction_type == 'BUY' and curr_price <= target_price: execute = True
            if tx.transaction_type == 'SELL' and curr_price >= target_price: execute = True
        elif tx.order_type == 'STOP':
            if tx.transaction_type == 'BUY' and curr_price >= target_price: execute = True
            if tx.transaction_type == 'SELL' and curr_price <= target_price: execute = True

        if execute:
            total_cost = curr_price * tx.quantity
            if tx.transaction_type == 'BUY' and portfolio.balance >= total_cost:
                portfolio.balance -= total_cost
                holding, _ = Holding.objects.get_or_create(portfolio=portfolio, stock=stock, defaults={'average_price': curr_price})
                if not _:
                    total_qty = holding.quantity + tx.quantity
                    holding.average_price = ((Decimal(holding.average_price) * holding.quantity) + (curr_price * tx.quantity)) / total_qty
                    holding.quantity = total_qty
                else:
                    holding.quantity = tx.quantity
                holding.save()
                portfolio.save()
                tx.status = 'COMPLETED'
                tx.save()
                print(f"✅ EXECUTED {tx.order_type} BUY for {stock.symbol} at {curr_price}")
            
            elif tx.transaction_type == 'SELL':
                holding = Holding.objects.filter(portfolio=portfolio, stock=stock).first()
                if holding and holding.quantity >= tx.quantity:
                    portfolio.balance += total_cost
                    holding.quantity -= tx.quantity
                    if holding.quantity == 0: holding.delete()
                    else: holding.save()
                    portfolio.save()
                    tx.status = 'COMPLETED'
                    tx.save()
                    print(f"✅ EXECUTED {tx.order_type} SELL for {stock.symbol} at {curr_price}")

# --- New Logic 2: Handling Take Profit & Stop Loss
def check_tp_sl():
    """TP automatically sell once the Stop Loss (SL) price is hit"""
    holdings = Holding.objects.exclude(target_price__isnull=True).exclude(stoploss_price__isnull=True)
    for h in holdings:
        curr_price = Decimal(h.stock.current_price)
        tp = Decimal(h.target_price) if h.target_price else None
        sl = Decimal(h.stoploss_price) if h.stoploss_price else None
        
        sell_now = False
        reason = ""
        if tp and curr_price >= tp: 
            sell_now = True
            reason = "Take Profit"
        if sl and curr_price <= sl: 
            sell_now = True
            reason = "Stop Loss"

        if sell_now:
            portfolio = h.portfolio
            portfolio.balance += (curr_price * h.quantity)
            Transaction.objects.create(
                user=portfolio.user, stock=h.stock, transaction_type='SELL',
                order_type='MARKET', quantity=h.quantity, price=curr_price, status='COMPLETED'
            )
            portfolio.save()
            print(f"🚨 {reason} TRIGGERED: {h.stock.symbol} sold at {curr_price}")
            h.delete()

# --- 🤖 New AI Logic: Simple RSI Calculation
def calculate_rsi(prices, period=14):
    if len(prices) < period + 1: return 50 # Default Neutral
    gains = []
    losses = []
    for i in range(1, len(prices)):
        change = float(prices[i] - prices[i-1])
        gains.append(max(change, 0))
        losses.append(abs(min(change, 0)))
    
    avg_gain = sum(gains[-period:]) / period
    avg_loss = sum(losses[-period:]) / period
    if avg_loss == 0: return 100
    rs = avg_gain / avg_loss
    return 100 - (100 / (1 + rs))

# --- 🤖 New AI Logic: Auto Trading Bot Execution (Updated with Selection Logic)
def run_auto_trading_bot():
    """AI Robot Trading Logic using RSI and Selected Stocks"""
    active_bots = BotPortfolio.objects.filter(is_active=True)
    if not active_bots.exists(): return

    for bot in active_bots:
        # User select stocks
        try:
            allowed_symbols = json.loads(bot.selected_stocks or "[]")
        except:
            allowed_symbols = []

        if not allowed_symbols:
            continue # ivalid symbol didnt select stocks

        stocks_to_trade = Stock.objects.filter(symbol__in=allowed_symbols)

        for stock in stocks_to_trade:
            current_price = Decimal(stock.current_price)
            # RSI Auto trading satergy
            rsi = calculate_rsi([current_price * Decimal('0.98'), current_price * Decimal('1.02'), current_price])

            # 1. Check Custom Stop Loss / Take Profit for Bot Holdings
            holding = BotHolding.objects.filter(bot_portfolio=bot, stock=stock).first()
            if holding:
                change_pct = ((current_price - holding.buy_price) / holding.buy_price) * 100
                
                # user Custom SL/TP 
                if change_pct <= -bot.stop_loss_percent or change_pct >= bot.take_profit_percent or rsi > 70:
                    bot.balance += (current_price * holding.quantity)
                    BotLog.objects.create(
                        bot_portfolio=bot, 
                        message=f"🤖 AI SOLD {stock.symbol} at {current_price} (P&L: {change_pct:.2f}%)", 
                        log_type="SELL"
                    )
                    holding.delete()
                    bot.save()
            
            # 2. BUY Logic (RSI < 30  )
            elif rsi < 30 and bot.balance > (current_price * 1):
                # robot buy one stocks 
                qty = 1 
                total_cost = current_price * qty
                if bot.balance >= total_cost:
                    bot.balance -= total_cost
                    BotHolding.objects.create(bot_portfolio=bot, stock=stock, quantity=qty, buy_price=current_price)
                    BotLog.objects.create(
                        bot_portfolio=bot, 
                        message=f"🤖 AI BOUGHT {qty} of {stock.symbol} at {current_price} (RSI: {rsi:.1f})", 
                        log_type="BUY"
                    )
                    bot.save()

# --- 🔔 New AI Logic: News Scraper & AI Sentiment Analysis (Enhanced for CSE)
def fetch_cse_news_and_analyze():
    """Scrape CSE market news and provide AI Buy/Sell alerts"""
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    }
    url = "https://www.lankabusinessonline.com/category/market/"
    
    try:
        response = requests.get(url, headers=headers, timeout=15)
        if response.status_code == 200:
            soup = BeautifulSoup(response.text, 'html.parser')
            
            # header patten selection
            articles = soup.find_all(['h3', 'h2'], class_='entry-title')[:10] 
            
            if not articles:
                articles = soup.select('.entry-title a')[:10]

            for item in articles:
                link_tag = item.find('a') if item.name != 'a' else item
                if not link_tag: continue

                title = link_tag.text.strip()
                link = link_tag.get('href')
                
                if not title or not link: continue

                # // Save only if the message does not already exist in the database
                if not NewsAlert.objects.filter(title=title).exists():
                    # --- AI SENTIMENT ANALYSIS (Keywords) ---
                    ai_signal = "NEUTRAL"
                    title_up = title.upper()
                    
                    buy_keywords = ["PROFIT", "GROWTH", "DIVIDEND", "RISE", "UP", "SURGE", "BUY", "GAIN", "ACQUIRE", "EXPAND"]
                    sell_keywords = ["LOSS", "DOWN", "FALL", "DEBT", "CRASH", "SLUMP", "SELL", "DECLINE", "REDUCE"]
                    
                    if any(word in title_up for word in buy_keywords):
                        ai_signal = "BUY"
                    elif any(word in title_up for word in sell_keywords):
                        ai_signal = "SELL"

                    #// Find the given stock name (e.g., JKH, ABANS)
                    found_stock = None
                    all_symbols = Stock.objects.values_list('symbol', flat=True)
                    for sym in all_symbols:
                        clean_sym = sym.split('.')[0] # E.g: ABAN
                        if clean_sym in title_up:
                            found_stock = sym
                            break

                    NewsAlert.objects.create(
                        title=title,
                        ai_signal=ai_signal,
                        source_link=link,
                        stock_symbol=found_stock,
                        is_read=False
                    )
                    print(f"🔔 NEW AI NEWS: {ai_signal} -> {title[:50]}...")
                    
                    # // Find the given stock name (e.g., JKH, ABANS)
                    if NewsAlert.objects.count() > 20:
                        oldest = NewsAlert.objects.all().order_by('timestamp').first()
                        if oldest: oldest.delete()
                        
    except Exception as e:
        print(f"❌ News Scraper Error: {e}")

# --- original Scraper function (modified)
def force_sync_stocks():
    """Directly load and update all shares from the API into the database"""
    url = "https://www.cse.lk/api/todaySharePrice"
    headers = {'User-Agent': 'Mozilla/5.0'}

    try:
        print(f"\n[{time.strftime('%H:%M:%S')}] Market Syncing for Live Prices...")
        response = requests.post(url, headers=headers, json={}, timeout=15)
        
        if response.status_code == 200:
            api_data = response.json()
            existing_stocks = Stock.objects.all()

            for item in api_data:
                api_symbol = item.get('symbol')
                price = item.get('lastTradedPrice', 0.0)
                name = item.get('companyName', api_symbol)

                if api_symbol and price and float(price) > 0:
                    # 1. // Compare with the shares in the admin panel
                    for s in existing_stocks:
                        if s.symbol in api_symbol or api_symbol in s.symbol:
                            s.current_price = float(price)
                            s.save()

                    # 2. Add new shares provided by the API to the database
                    stock, created = Stock.objects.update_or_create(
                        symbol=api_symbol,
                        defaults={
                            'current_price': float(price),
                            'company_name': name
                        }
                    )
            
            # Verify orders and run Bot after all prices have been updated
            process_pending_orders()
            check_tp_sl()
            run_auto_trading_bot() # 🤖 Robot Action
            fetch_cse_news_and_analyze() # 🔔 News Alarm Action
            
            print(f"Success: {len(api_data)} Stocks processed and Trading Logic Checked!")
        else:
            print(f"API Error: {response.status_code}")
    except Exception as e:
        print(f"Scraper Error: {e}")

if __name__ == "__main__":
    print("Starting Deep Sync Scraper with AI Bot & News Alarm... Waiting for changes.")
    while True:
        force_sync_stocks()
        time.sleep(10)