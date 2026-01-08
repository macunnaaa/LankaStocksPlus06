import os
import sys
import django
import requests
import time
from decimal import Decimal

# 1. Django setup
current_dir = os.path.dirname(os.path.abspath(__file__))
parent_dir = os.path.dirname(current_dir)
sys.path.append(parent_dir)
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

#  Imported models (including newly added ones)
from core.models import Stock, Transaction, Holding, Portfolio

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
                            # Verify orders once the price has been saved
                            # Can be called here or once outside the loop

                    # 2. Add new shares provided by the API to the database
                    stock, created = Stock.objects.update_or_create(
                        symbol=api_symbol,
                        defaults={
                            'current_price': float(price),
                            'company_name': name
                        }
                    )
            
            # Verify orders after all prices have been updateds
            process_pending_orders()
            check_tp_sl()
            
            print(f"Success: {len(api_data)} Stocks processed and Trading Logic Checked!")
        else:
            print(f"API Error: {response.status_code}")
    except Exception as e:
        print(f"Scraper Error: {e}")

if __name__ == "__main__":
    print("Starting Deep Sync Scraper with Advanced Trading... Waiting for price changes.")
    while True:
        force_sync_stocks()
        time.sleep(10)