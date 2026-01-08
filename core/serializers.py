from rest_framework import serializers
from .models import Stock, Portfolio, Holding, Transaction

class StockSerializer(serializers.ModelSerializer):
    """
    Serializer that updates stock details.
    now includes the newly added tradingview_symbol.
    """
    class Meta:
        model = Stock
        fields = '__all__'

class PortfolioSerializer(serializers.ModelSerializer):
    """
    Serializer that updates the user's portfolio details
    """
    class Meta:
        model = Portfolio
        fields = '__all__'

class HoldingSerializer(serializers.ModelSerializer):
    """
    Serializer that updates the details of the user's holdings.
    Also displays information such as the stock symbol.
    """
    stock_symbol = serializers.ReadOnlyField(source='stock.symbol')
    stock_name = serializers.ReadOnlyField(source='stock.company_name')

    class Meta:
        model = Holding
        fields = '__all__'

class TransactionSerializer(serializers.ModelSerializer):
    """
    Serializer that updates the transaction history
    """
    stock_symbol = serializers.ReadOnlyField(source='stock.symbol')

    class Meta:
        model = Transaction
        fields = '__all__'