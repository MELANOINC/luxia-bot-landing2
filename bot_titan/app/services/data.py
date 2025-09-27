import ccxt
import pandas as pd
import numpy as np
from datetime import datetime, timedelta, timezone
from ..config import settings


def fetch_ohlcv(symbol: str | None = None, timeframe: str | None = None, lookback_hours: int | None = None) -> pd.DataFrame:
    exch_id = settings.exchange
    symbol = symbol or settings.symbol
    timeframe = timeframe or settings.timeframe
    lookback_hours = lookback_hours or settings.lookback_hours

    exchange = getattr(ccxt, exch_id)()
    since_ms = int((datetime.now(timezone.utc) - timedelta(hours=lookback_hours)).timestamp() * 1000)

    data = []
    limit = 500
    since = since_ms
    while True:
        batch = exchange.fetch_ohlcv(symbol, timeframe=timeframe, since=since, limit=limit)
        if not batch:
            break
        data.extend(batch)
        if len(batch) < limit:
            break
        since = batch[-1][0] + 1
        if len(data) > 5000:
            break

    df = pd.DataFrame(data, columns=["timestamp", "open", "high", "low", "close", "volume"])
    df["datetime"] = pd.to_datetime(df["timestamp"], unit="ms", utc=True)
    df.set_index("datetime", inplace=True)
    return df


def add_features(df: pd.DataFrame) -> pd.DataFrame:
    df = df.copy()
    df["return"] = df["close"].pct_change().fillna(0.0)
    df["sma_fast"] = df["close"].rolling(10).mean().bfill()
    df["sma_slow"] = df["close"].rolling(30).mean().bfill()
    df["rsi"] = compute_rsi(df["close"], period=14)
    df = df.dropna()
    return df


def compute_rsi(series: pd.Series, period: int = 14) -> pd.Series:
    delta = series.diff()
    up = delta.clip(lower=0)
    down = -1 * delta.clip(upper=0)
    ma_up = up.ewm(com=period - 1, adjust=False).mean()
    ma_down = down.ewm(com=period - 1, adjust=False).mean()
    rs = ma_up / (ma_down + 1e-8)
    rsi = 100 - (100 / (1 + rs))
    return rsi


def to_sequences(df: pd.DataFrame, seq_len: int = 30):
    features = df[["return", "sma_fast", "sma_slow", "rsi", "volume"]].values.astype(np.float32)
    targets = np.sign(df["return"].shift(-1)).fillna(0.0).values.astype(np.float32)
    X, y = [], []
    for i in range(len(df) - seq_len - 1):
        X.append(features[i:i + seq_len])
        y.append(1.0 if targets[i + seq_len] > 0 else 0.0)
    return np.array(X), np.array(y)