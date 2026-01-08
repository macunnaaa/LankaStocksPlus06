from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    StockViewSet, 
    PortfolioViewSet, 
    place_trade, 
    user_portfolio_details, 
    get_achievements,
    user_login,
    user_register,
    deposit_funds,
    withdraw_funds,
    cancel_order
)

router = DefaultRouter()
router.register(r'stocks', StockViewSet)
router.register(r'portfolios', PortfolioViewSet)

urlpatterns = [
    # Automatic URLs generated via the router
    path('', include(router.urls)),
    
    # Transaction and user details
    path('place-trade/', place_trade),
    path('portfolio-details/', user_portfolio_details),
    path('achievements/', get_achievements),
    
    # Login and Register
    path('login/', user_login),
    path('register/', user_register),

    #  Deposit and Withdrawal
    path('deposit-funds/', deposit_funds),
    path('withdraw-funds/', withdraw_funds),

    #  Option to cancel an order
    path('cancel-order/', cancel_order),
]