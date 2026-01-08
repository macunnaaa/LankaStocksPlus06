from rest_framework import viewsets, status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.contrib.auth.models import User
from django.contrib.auth import authenticate, login
from .models import Stock, Portfolio, Holding, Transaction
from .serializers import StockSerializer, PortfolioSerializer
from decimal import Decimal
from datetime import datetime, time
import pytz


# 1. Stocks and Portfolio Management ViewSets
class StockViewSet(viewsets.ModelViewSet):
    queryset = Stock.objects.all()
    serializer_class = StockSerializer


class PortfolioViewSet(viewsets.ModelViewSet):
    queryset = Portfolio.objects.all()
    serializer_class = PortfolioSerializer


# 2. User Authentication API
@api_view(['POST'])
def user_login(request):
    username = request.data.get('username')
    password = request.data.get('password')

    user = authenticate(username=username, password=password)

    if user is not None:
        login(request, user)
        return Response(
            {"message": "Login successful", "user": user.username},
            status=status.HTTP_200_OK
        )

    return Response(
        {"error": "Invalid Username or Password"},
        status=status.HTTP_401_UNAUTHORIZED
    )


@api_view(['POST'])
def user_register(request):
    username = request.data.get('username')
    password = request.data.get('password')

    if not username or not password:
        return Response(
            {"error": "Username and password are required"},
            status=status.HTTP_400_BAD_REQUEST
        )

    if User.objects.filter(username=username).exists():
        return Response(
            {"error": "Username already taken"},
            status=status.HTTP_400_BAD_REQUEST
        )

    user = User.objects.create_user(username=username, password=password)
    Portfolio.objects.create(user=user, balance=Decimal('1000000.00'))

    return Response(
        {"message": "User registered successfully!"},
        status=status.HTTP_201_CREATED
    )


# --- DEPOSIT & WITHDRAWAL (Updated to Custom Amount) ---
@api_view(['POST'])
def deposit_funds(request):
    # Get the currently logged-in user or the first user
    user = request.user if request.user.is_authenticated else User.objects.first()
    portfolio = get_object_or_404(Portfolio, user=user)

    try:
        # Retrieve the amount from the user
        amount_val = request.data.get('amount')
        if amount_val is None:
            return Response({"error": "Amount is required"}, status=status.HTTP_400_BAD_REQUEST)
            
        amount = Decimal(str(amount_val))
        if amount <= 0:
            return Response({"error": "Enter a valid amount greater than 0"}, status=status.HTTP_400_BAD_REQUEST)
    except Exception:
        return Response(
            {"error": "Invalid amount format"},
            status=status.HTTP_400_BAD_REQUEST
        )

    # added the amount directly
    portfolio.balance += amount
    portfolio.save()

    return Response({
        "message": f"Rs. {amount} successfully deposited!",
        "balance": str(portfolio.balance)
    })


@api_view(['POST'])
def withdraw_funds(request):
    user = request.user if request.user.is_authenticated else User.objects.first()
    portfolio = get_object_or_404(Portfolio, user=user)

    try:
        amount = Decimal(str(request.data.get('amount', 0)))
    except Exception:
        return Response(
            {"error": "Invalid amount format"},
            status=status.HTTP_400_BAD_REQUEST
        )

    if amount > portfolio.balance:
        return Response(
            {"error": "Insufficient balance!"},
            status=status.HTTP_400_BAD_REQUEST
        )

    portfolio.balance -= amount
    portfolio.save()

    return Response({
        "message": f"Successfully withdrawn Rs. {amount}!"
    })


# 3. Advanced Trading Facility (Limit, Stop, Market)
@api_view(['POST'])
def place_trade(request):
    sri_lanka_tz = pytz.timezone('Asia/Colombo')
    now = datetime.now(sri_lanka_tz)

    is_weekend = now.weekday() >= 5
    is_market_open = time(9, 30) <= now.time() <= time(14, 30)

    if is_weekend or not is_market_open:
        return Response(
            {"error": "Market Closed. Mon-Fri, 9:30 AM to 2:30 PM."},
            status=status.HTTP_400_BAD_REQUEST
        )

    user = request.user if request.user.is_authenticated else User.objects.first()
    symbol = request.data.get('symbol')
    quantity = int(request.data.get('quantity', 0))
    trade_type = request.data.get('type')
    order_type = request.data.get('order_type', 'MARKET')

    stock = get_object_or_404(Stock, symbol=symbol)
    curr_price = Decimal(str(stock.current_price))
    target_price = Decimal(str(request.data.get('price', stock.current_price)))

    portfolio, _ = Portfolio.objects.get_or_create(user=user)

    is_pending = False

    if order_type == 'LIMIT':
        if trade_type == 'BUY' and target_price < curr_price:
            is_pending = True
        if trade_type == 'SELL' and target_price > curr_price:
            is_pending = True

    elif order_type == 'STOP':
        if trade_type == 'BUY' and target_price > curr_price:
            is_pending = True
        if trade_type == 'SELL' and target_price < curr_price:
            is_pending = True

    if is_pending:
        Transaction.objects.create(
            user=user,
            stock=stock,
            transaction_type=trade_type,
            order_type=order_type,
            quantity=quantity,
            price=target_price,
            status='PENDING'
        )
        return Response({
            "message": f"{order_type} Order Placed at Rs.{target_price} (PENDING)"
        })

    total_value = curr_price * quantity

    if trade_type == 'BUY':
        if portfolio.balance >= total_value:
            portfolio.balance -= total_value
            portfolio.save()

            holding, created = Holding.objects.get_or_create(
                portfolio=portfolio,
                stock=stock,
                defaults={'average_price': curr_price, 'quantity': 0}
            )

            total_qty = holding.quantity + quantity
            holding.average_price = (
                (Decimal(str(holding.average_price)) * holding.quantity) +
                (curr_price * quantity)
            ) / total_qty
            holding.quantity = total_qty

            holding.target_price = request.data.get('tp_price')
            holding.stoploss_price = request.data.get('sl_price')
            holding.save()

            Transaction.objects.create(
                user=user,
                stock=stock,
                transaction_type='BUY',
                order_type=order_type,
                quantity=quantity,
                price=curr_price,
                status='COMPLETED'
            )

            return Response({
                "message": f"Successfully bought {quantity} shares at market price!"
            })

        return Response(
            {"error": "Insufficient balance"},
            status=status.HTTP_400_BAD_REQUEST
        )

    elif trade_type == 'SELL':
        holding = get_object_or_404(
            Holding,
            portfolio=portfolio,
            stock=stock
        )

        if holding.quantity >= quantity:
            portfolio.balance += total_value
            portfolio.save()

            holding.quantity -= quantity
            if holding.quantity == 0:
                holding.delete()
            else:
                holding.save()

            Transaction.objects.create(
                user=user,
                stock=stock,
                transaction_type='SELL',
                order_type=order_type,
                quantity=quantity,
                price=curr_price,
                status='COMPLETED'
            )

            return Response({
                "message": f"Successfully sold {quantity} shares!"
            })

        return Response(
            {"error": "Not enough shares"},
            status=status.HTTP_400_BAD_REQUEST
        )


# --- CANCEL PENDING ORDER ---
@api_view(['POST'])
def cancel_order(request):
    order_id = request.data.get('order_id')
    user = request.user if request.user.is_authenticated else User.objects.first()

    order = get_object_or_404(
        Transaction,
        id=order_id,
        user=user,
        status='PENDING'
    )

    order.status = 'CANCELLED'
    order.save()

    return Response({"message": "Order cancelled successfully!"})


# 4. Portfolio Details (Updated with Recent Transactions & Fixed Quantity)
@api_view(['GET'])
def user_portfolio_details(request):
    try:
        user = request.user if request.user.is_authenticated else User.objects.first()

        if not user:
            return Response({"error": "No user found"}, status=404)

        portfolio, _ = Portfolio.objects.get_or_create(user=user)
        holdings = Holding.objects.filter(portfolio=portfolio)

        holdings_data = []
        total_stock_value = Decimal('0.00')

        for h in holdings:
            current_val = Decimal(str(h.stock.current_price)) * h.quantity
            total_stock_value += current_val

            pnl = (
                Decimal(str(h.stock.current_price)) -
                Decimal(str(h.average_price))
            ) * h.quantity

            holdings_data.append({
                "symbol": h.stock.symbol,
                "quantity": h.quantity,
                "avg_price": str(h.average_price),
                "current_price": str(h.stock.current_price),
                "pnl": float(pnl),
                "tp": str(h.target_price) if h.target_price else None,
                "sl": str(h.stoploss_price) if h.stoploss_price else None
            })

        pending_orders = Transaction.objects.filter(
            user=user,
            status='PENDING'
        )

        pending_data = []
        for o in pending_orders:
            pending_data.append({
                "id": o.id,
                "symbol": o.stock.symbol,
                "type": o.transaction_type,
                "order_type": o.order_type,
                "quantity": o.quantity,
                "price": str(o.price),
                "market_price": str(o.stock.current_price)
            })

        # --- இதோ புதிய லாஜிக்: Recent Transactions Log with Quantity Fixed ---
        recent_transactions = Transaction.objects.filter(user=user).order_by('-timestamp')[:10]
        recent_data = []
        for tx in recent_transactions:
            recent_data.append({
                "id": tx.id,
                "date": tx.timestamp.strftime("%Y-%m-%d %H:%M"),
                "symbol": tx.stock.symbol,
                "type": tx.transaction_type,
                "quantity": tx.quantity, # <--- இப்போ இங்கே Quantity வரும்
                "price": str(tx.price),
                "status": tx.status
            })

        return Response({
            "balance": str(portfolio.balance),
            "total_stock_value": float(total_stock_value),
            "total_portfolio_value": float(portfolio.balance + total_stock_value),
            "holdings": holdings_data,
            "pending_orders": pending_data,
            "recent_transactions": recent_data 
        })

    except Exception as e:
        print(f"Portfolio Error: {str(e)}")
        return Response({"error": str(e)}, status=500)


# 5. Achievement Tracking
@api_view(['GET'])
def get_achievements(request):
    user = request.user if request.user.is_authenticated else User.objects.first()

    if not user:
        return Response({"achievements": []})

    transactions = Transaction.objects.filter(user=user)
    trade_count = transactions.count()

    portfolio, _ = Portfolio.objects.get_or_create(user=user)
    holdings = Holding.objects.filter(portfolio=portfolio)

    unique_stocks = holdings.values('stock').distinct().count()

    total_invested = sum(
        Decimal(str(h.average_price)) * h.quantity
        for h in holdings
    )

    current_stock_value = sum(
        Decimal(str(h.stock.current_price)) * h.quantity
        for h in holdings
    )

    profit_pct = (
        float(((current_stock_value - total_invested) / total_invested) * 100)
        if total_invested > 0 else 0
    )

    total_wealth = float(portfolio.balance + current_stock_value)

    achievements_list = [
        {"id": 1, "title": "First Steps", "desc": "Complete your first ever trade.", "is_unlocked": trade_count >= 1, "badge": "🥉"},
        {"id": 2, "title": "Active Trader", "desc": "Complete 10 successful trades.", "is_unlocked": trade_count >= 10, "badge": "🥈"},
        {"id": 3, "title": "Market Veteran", "desc": "Complete 50 successful trades.", "is_unlocked": trade_count >= 50, "badge": "🥇"},
        {"id": 4, "title": "Centurion", "desc": "Execute 100 trades.", "is_unlocked": trade_count >= 100, "badge": "🎖️"},
        {"id": 5, "title": "Daily Regular", "desc": "Execute trades actively in market.", "is_unlocked": trade_count >= 5, "badge": "📅"},
        {"id": 6, "title": "Diversified", "desc": "Own 5 different types of stocks.", "is_unlocked": unique_stocks >= 5, "badge": "📊"},
        {"id": 7, "title": "Portfolio Master", "desc": "Own 10 different types of stocks.", "is_unlocked": unique_stocks >= 10, "badge": "📁"},
        {"id": 8, "title": "Index Hunter", "desc": "Own 15 stocks from S&P SL20.", "is_unlocked": unique_stocks >= 15, "badge": "🎯"},
        {"id": 9, "title": "Sector Giant", "desc": "Invest in multiple market sectors.", "is_unlocked": unique_stocks >= 7, "badge": "🏢"},
        {"id": 10, "title": "All-Rounder", "desc": "Hold 20 different stocks simultaneously.", "is_unlocked": unique_stocks >= 20, "badge": "🌐"},
        {"id": 11, "title": "Green Streak", "desc": "Achieve a portfolio profit of 10%.", "is_unlocked": profit_pct >= 10, "badge": "📈"},
        {"id": 12, "title": "Bull Runner", "desc": "Achieve a portfolio profit of 25%.", "is_unlocked": profit_pct >= 25, "badge": "🔥"},
        {"id": 13, "title": "Moon Mission", "desc": "Achieve a portfolio profit of 50%.", "is_unlocked": profit_pct >= 50, "badge": "🚀"},
        {"id": 14, "title": "Jackpot", "desc": "Double your initial investment (100% Profit).", "is_unlocked": profit_pct >= 100, "badge": "🎰"},
        {"id": 15, "title": "Risk Taker", "desc": "Profit from high volatility stocks.", "is_unlocked": profit_pct >= 5 and trade_count > 20, "badge": "⚡"},
        {"id": 16, "title": "Millionaire", "desc": "Reach 2 Million LKR total value.", "is_unlocked": total_wealth >= 2000000, "badge": "💰"},
        {"id": 17, "title": "Multi-Millionaire", "desc": "Reach 5 Million LKR total value.", "is_unlocked": total_wealth >= 5000000, "badge": "💎"},
        {"id": 18, "title": "High Net Worth", "desc": "Reach 10 Million LKR total value.", "is_unlocked": total_wealth >= 10000000, "badge": "🏦"},
        {"id": 19, "title": "Deca-Millionaire", "desc": "Reach 50 Million LKR total value.", "is_unlocked": total_wealth >= 50000000, "badge": "👑"},
        {"id": 20, "title": "Lanka Whale", "desc": "Reach 100 Million LKR total value.", "is_unlocked": total_wealth >= 100000000, "badge": "🐋"},
        {"id": 21, "title": "Penny Pincher", "desc": "Buy a stock priced below Rs. 10.", "is_unlocked": any(Decimal(str(h.average_price)) <= 10 for h in holdings), "badge": "🪙"},
        {"id": 22, "title": "Blue Chip Hunter", "desc": "Invest in a stock > Rs. 500.", "is_unlocked": any(Decimal(str(h.average_price)) >= 500 for h in holdings), "badge": "🐋"},
        {"id": 23, "title": "Limit Order King", "desc": "First successful Limit order execute.", "is_unlocked": transactions.filter(order_type='LIMIT').exists(), "badge": "👑"},
        {"id": 24, "title": "Stop-Loss Savior", "desc": "Use a Stop-Loss to prevent loss.", "is_unlocked": holdings.filter(stoploss_price__isnull=False).exists(), "badge": "🛡️"},
        {"id": 25, "title": "Sniper Entry", "desc": "Execute precise market entries.", "is_unlocked": trade_count >= 30, "badge": "🎯"},
        {"id": 26, "title": "Patient Holder", "desc": "Maintain long-term stock positions.", "is_unlocked": trade_count >= 15, "badge": "⏳"},
        {"id": 27, "title": "Market Specialist", "desc": "Execute 500 total trades.", "is_unlocked": trade_count >= 500, "badge": "🎓"},
        {"id": 28, "title": "Capital Guard", "desc": "Successfully manage your portfolio capital.", "is_unlocked": total_wealth > 1000000 and trade_count > 50, "badge": "🔒"},
        {"id": 29, "title": "Top 1% Trader", "desc": "Reach a total profit of 200%.", "is_unlocked": profit_pct >= 200, "badge": "🌟"},
        {"id": 30, "title": "Stock Legend", "desc": "Unlock the status of a Market Legend.", "is_unlocked": trade_count >= 1000 or total_wealth >= 500000000, "badge": "🏆"},
    ]

    return Response({"achievements": achievements_list})