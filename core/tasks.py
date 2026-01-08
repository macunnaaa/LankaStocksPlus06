from decimal import Decimal
from .models import Stock, Transaction, Holding, Portfolio

def process_pending_orders():
    """Execute pending Limit/Stop orders"""
    pending_transactions = Transaction.objects.filter(status='PENDING')

    for tx in pending_transactions:
        stock = tx.stock
        curr_price = Decimal(stock.current_price)
        target_price = Decimal(tx.price)
        portfolio = Portfolio.objects.get(user=tx.user)

        execute = False
        # Limit/Stop Conditons
        if tx.order_type == 'LIMIT':
            if tx.transaction_type == 'BUY' and curr_price <= target_price: execute = True
            if tx.transaction_type == 'SELL' and curr_price >= target_price: execute = True
        elif tx.order_type == 'STOP':
            if tx.transaction_type == 'BUY' and curr_price >= target_price: execute = True
            if tx.transaction_type == 'SELL' and curr_price <= target_price: execute = True

        if execute:
            #  Logic to execute orders (same BUY/SELL logic we previously implemented in views)
            if tx.transaction_type == 'BUY' and portfolio.balance >= (curr_price * tx.quantity):
                portfolio.balance -= (curr_price * tx.quantity)
                holding, _ = Holding.objects.get_or_create(portfolio=portfolio, stock=stock)
                holding.quantity += tx.quantity
                holding.save()
                portfolio.save()
                tx.status = 'COMPLETED'
                tx.save()
            elif tx.transaction_type == 'SELL':
                holding = Holding.objects.filter(portfolio=portfolio, stock=stock).first()
                if holding and holding.quantity >= tx.quantity:
                    portfolio.balance += (curr_price * tx.quantity)
                    holding.quantity -= tx.quantity
                    holding.save()
                    portfolio.save()
                    tx.status = 'COMPLETED'
                    tx.save()

def check_tp_sl():
    """Check the Take Profit and Stop Loss prices"""
    all_holdings = Holding.objects.exclude(target_price__isnull=True, stoploss_price__isnull=True)

    for h in all_holdings:
        curr_price = Decimal(h.stock.current_price)
        tp = Decimal(h.target_price) if h.target_price else None
        sl = Decimal(h.stoploss_price) if h.stoploss_price else None
        
        sell_it = False
        if tp and curr_price >= tp: sell_it = True # Target profit reached
        if sl and curr_price <= sl: sell_it = True # Prevent loss

        if sell_it:
            portfolio = h.portfolio
            portfolio.balance += (curr_price * h.quantity)
            Transaction.objects.create(
                user=portfolio.user, stock=h.stock, transaction_type='SELL',
                order_type='MARKET', quantity=h.quantity, price=curr_price, status='COMPLETED'
            )
            portfolio.save()
            h.delete() # Sell the stocks