import yfinance as yf
import mplfinance as mpf
import os
import pandas as pd
from tqdm import tqdm

# 1. படங்களைச் சேமிக்க ஃபோல்டரை உருவாக்குதல்
folder_name = 'dataset'
os.makedirs(folder_name, exist_ok=True)

# 2. முக்கியமான சொத்துக்கள்
tickers = ['AAPL', 'TSLA', 'MSFT', 'BTC-USD', 'ETH-USD', 'EURUSD=X', 'GBPUSD=X', 'GC=F', 'GOOGL', 'AMZN']

print("--- 5 வருட டேட்டா டவுன்லோட் தொடங்குகிறது (Fix Applied) ---")

for ticker in tickers:
    try:
        # டேட்டாவை டவுன்லோட் செய்தல்
        df = yf.download(ticker, period='5y', interval='1d')
        
        if df.empty:
            continue

        # எரரைத் தவிர்க்க தரவுகளைச் சுத்தம் செய்தல் (Fixing Multi-index issue)
        df.columns = df.columns.get_level_values(0) if isinstance(df.columns, pd.MultiIndex) else df.columns
        df = df[['Open', 'High', 'Low', 'Close', 'Volume']].apply(pd.to_numeric, errors='coerce')
        df = df.dropna()

        window = 30 
        # 10 நாட்கள் இடைவெளியில் படங்களை உருவாக்குவோம் (வேகத்திற்காக)
        for i in tqdm(range(0, len(df) - window, 10), desc=f"Processing {ticker}"):
            chunk = df.iloc[i:i+window]
            
            filename = os.path.join(folder_name, f"{ticker.replace('=X', '')}_{i}.jpg")
            
            # Chart-ஐச் சேமித்தல்
            mpf.plot(chunk, type='candle', style='charles', 
                     savefig=dict(fname=filename, dpi=60, bbox_inches='tight'),
                     axisoff=True)
                     
    except Exception as e:
        print(f"\nError processing {ticker}: {e}")

print("\n--- இப்போது செக் பண்ணிப் பாருங்கள்! படங்கள் dataset ஃபோல்டரில் இருக்கும்! ---")