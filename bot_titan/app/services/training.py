from __future__ import annotations
import numpy as np
from datetime import datetime, timezone
from .data import fetch_ohlcv, add_features, to_sequences
from .model import train_lstm, save_model, load_model
from .quantum import optimize_threshold
from .embeddings import embed_texts, upsert_embeddings
from ..config import settings


def train_pipeline():
    df = fetch_ohlcv()
    df = add_features(df)
    X, y = to_sequences(df, seq_len=30)
    if len(X) < 100:
        return {"error": "not_enough_data", "n": len(X)}

    model, metrics = train_lstm(X, y)
    path = save_model(model)

    # Quantum-inspired optimization of decision threshold
    def loss_fn(thr: float) -> float:
        # simple validation proxy: misclassification with threshold
        preds = predict_proba(model, X)
        pred_labels = (preds >= thr).astype(np.float32)
        return float((pred_labels.flatten() != y[: len(pred_labels)]).mean())

    best_thr = optimize_threshold(0.5, loss_fn, steps=40)

    # Embeddings of recent context window for retrieval
    last = df.tail(64)
    text = f"Symbol={settings.symbol} tf={settings.timeframe} close_tail={last['close'].round(2).tolist()} rsi_tail={last['rsi'].round(2).tolist()}"
    vec = embed_texts([text])[0]
    upsert_embeddings([
        {
            "symbol": settings.symbol,
            "timeframe": settings.timeframe,
            "text": text,
            "embedding": vec,
        }
    ])

    return {"loss": metrics.get("loss"), "model_path": path, "threshold": best_thr}


def predict_proba(model, X) -> np.ndarray:
    import torch
    with torch.no_grad():
        t = torch.tensor(X, dtype=torch.float32)
        p = model(t).numpy()
    return p


def generate_live_signal(symbol: str | None = None, timeframe: str | None = None):
    model = load_model()
    if model is None:
        return "hold", {"reason": "model_unavailable"}
    df = fetch_ohlcv(symbol=symbol, timeframe=timeframe)
    df = add_features(df)
    X, y = to_sequences(df, seq_len=30)
    if len(X) == 0:
        return "hold", {"reason": "no_sequences"}
    proba = float(predict_proba(model, X[-1:])[0][0])
    thr = 0.5
    signal = "long" if proba >= thr else "short"
    return signal, {"proba": proba, "threshold": thr}