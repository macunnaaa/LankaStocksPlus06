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
    cancel_order,
    # --- 🤖 NEW BOT VIEWS ---
    get_bot_status,
    transfer_to_bot,
    toggle_bot,
    # --- 🤖 ADVANCED BOT CONTROL ---
    withdraw_from_bot,
    update_bot_settings,
    # --- 🔔 NEW NEWS ALARM VIEWS ---
    get_news_alerts,
    mark_news_as_read,
    # ---  NEW TARGETS UPDATE VIEW ---
    update_targets,
    # ---  NEW PENDING ORDER TARGETS UPDATE VIEW ---
    update_order_targets
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

    # ---  AI BOT ROUTES ---
    path('bot-status/', get_bot_status),
    path('transfer-to-bot/', transfer_to_bot),
    path('toggle-bot/', toggle_bot),
    
    # ---  ADVANCED BOT ROUTES ---
    path('bot-withdraw/', withdraw_from_bot),
    path('update-bot-settings/', update_bot_settings),

    # ---  AI NEWS ALARM ROUTES (Added Below) ---
    path('news-alerts/', get_news_alerts),
    path('mark-news-read/', mark_news_as_read),

    # ---  NEW TARGETS UPDATE ROUTE (For Adjusting TP/SL) ---
    path('update-targets/', update_targets),

    # ---  NEW PENDING ORDER TARGETS UPDATE ROUTE ---
    path('update-order-targets/', update_order_targets),
]