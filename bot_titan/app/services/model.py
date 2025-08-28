import os
import torch
import torch.nn as nn
from torch.utils.data import DataLoader, TensorDataset
from ..config import settings

MODEL_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "models")
MODEL_PATH = os.path.abspath(os.path.join(MODEL_DIR, "titan_lstm.pt"))


class TitanLSTM(nn.Module):
    def __init__(self, input_dim: int = 5, hidden_dim: int = 64, num_layers: int = 2):
        super().__init__()
        self.lstm = nn.LSTM(input_dim, hidden_dim, num_layers=num_layers, batch_first=True, dropout=0.1)
        self.head = nn.Sequential(
            nn.Linear(hidden_dim, 32),
            nn.ReLU(),
            nn.Linear(32, 1),
            nn.Sigmoid(),
        )

    def forward(self, x):
        out, _ = self.lstm(x)
        out = out[:, -1, :]
        return self.head(out)


def train_lstm(X, y, epochs: int | None = None, batch_size: int | None = None, lr: float | None = None):
    device = torch.device("cpu")
    epochs = epochs or settings.train_epochs
    batch_size = batch_size or settings.train_batch_size
    lr = lr or settings.learning_rate

    X_t = torch.tensor(X, dtype=torch.float32)
    y_t = torch.tensor(y, dtype=torch.float32).unsqueeze(1)
    ds = TensorDataset(X_t, y_t)
    dl = DataLoader(ds, batch_size=batch_size, shuffle=True)

    model = TitanLSTM(input_dim=X.shape[-1])
    model.to(device)
    optim = torch.optim.Adam(model.parameters(), lr=lr)
    loss_fn = nn.BCELoss()

    for epoch in range(epochs):
        model.train()
        total_loss = 0.0
        for xb, yb in dl:
            xb = xb.to(device)
            yb = yb.to(device)
            optim.zero_grad()
            preds = model(xb)
            loss = loss_fn(preds, yb)
            loss.backward()
            nn.utils.clip_grad_norm_(model.parameters(), 1.0)
            optim.step()
            total_loss += loss.item() * xb.size(0)
        avg_loss = total_loss / len(ds)

    return model, {"loss": avg_loss}


def save_model(model: TitanLSTM):
    os.makedirs(MODEL_DIR, exist_ok=True)
    torch.save(model.state_dict(), MODEL_PATH)
    return MODEL_PATH


def load_model() -> TitanLSTM | None:
    if not os.path.exists(MODEL_PATH):
        return None
    model = TitanLSTM()
    state = torch.load(MODEL_PATH, map_location="cpu")
    model.load_state_dict(state)
    model.eval()
    return model