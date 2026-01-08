from django.db import models
from django.contrib.auth.models import User

# 1. CSE Stocks list
class Stock(models.Model):
    symbol = models.CharField(max_length=20, unique=True) # E.g: ABAN.N0000
    company_name = models.CharField(max_length=200)
    current_price = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    
    # TradingView-Sympls (E.g: CSELK:ABAN.N0000)
    tradingview_symbol = models.CharField(max_length=50, blank=True, null=True)
    
    # AI Sniping Tool Signals
    ai_signal = models.CharField(max_length=20, default="NEUTRAL") # BUY, SELL, NEUTRAL
    signal_message = models.TextField(blank=True, null=True)
    
    last_updated = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.symbol} - {self.company_name}"

# 2. Userser Potfolio (cash and stocks)
class Portfolio(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    balance = models.DecimalField(max_digits=15, decimal_places=2, default=1000000.00)
    
    # Deposit Counts
    deposit_count = models.IntegerField(default=0) 

    def __str__(self):
        return f"{self.user.username}'s Portfolio"

# 3. Users Buyed Stocks Details (Holdings)
class Holding(models.Model):
    portfolio = models.ForeignKey(Portfolio, on_delete=models.CASCADE, related_name='holdings')
    stock = models.ForeignKey(Stock, on_delete=models.CASCADE)
    quantity = models.IntegerField(default=0)
    average_price = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    
    # Take Profit and Stop Loss feutures
    target_price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    stoploss_price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)

    def __str__(self):
        return f"{self.portfolio.user.username} - {self.stock.symbol} ({self.quantity})"

# 4.    (Transaction History - Updated for Advance Orders)
class Transaction(models.Model):
    TRANSACTION_TYPES = (
        ('BUY', 'Buy'),
        ('SELL', 'Sell'),
    )
    
    # New  Order Types (Market, Limit, Stop)
    ORDER_TYPES = (
        ('MARKET', 'Market'),
        ('LIMIT', 'Limit'),
        ('STOP', 'Stop'),
    )
    
    # order Status
    STATUS_CHOICES = (
        ('PENDING', 'Pending'),
        ('COMPLETED', 'Completed'),
        ('CANCELLED', 'Cancelled'),
    )

    user = models.ForeignKey(User, on_delete=models.CASCADE)
    stock = models.ForeignKey(Stock, on_delete=models.CASCADE)
    transaction_type = models.CharField(max_length=4, choices=TRANSACTION_TYPES)
    
    # Advance Order Details
    order_type = models.CharField(max_length=10, choices=ORDER_TYPES, default='MARKET')
    status = models.CharField(max_length=15, choices=STATUS_CHOICES, default='COMPLETED')
    
    quantity = models.IntegerField()
    price = models.DecimalField(max_digits=10, decimal_places=2) #  Limit/Stop  system
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.transaction_type} {self.order_type} - {self.stock.symbol} ({self.status})"