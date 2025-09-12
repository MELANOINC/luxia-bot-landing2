# Deploy luxia-bot-landing2 (Express + Docker + Caddy)

## Requisitos
- VPS Ubuntu 22.04
- Dominio apuntando por A/AAAA al VPS (ej. luxia.tudominio.com)
- Secrets en GitHub: VPS_HOST, VPS_USER, VPS_SSH_KEY, VPS_PATH (opcional: VPS_SSH_PASSPHRASE)

## 1) Preparar el VPS (una sola vez)
```bash
ssh ubuntu@IP_DEL_VPS
sudo apt update && sudo apt -y upgrade
curl -fsSL https://get.docker.com | sudo sh
sudo usermod -aG docker $USER
newgrp docker

# (Opcional recomendado) Firewall
sudo apt -y install ufw
sudo ufw allow OpenSSH
sudo ufw allow 80
sudo ufw allow 443
sudo ufw --force enable

# Carpeta de deploy
sudo mkdir -p /var/www/luxia && sudo chown -R $USER:$USER /var/www/luxia
```

## 2) DNS (apuntar dominio)
- Crea un registro A en tu DNS: `DOMAIN -> IP_DEL_VPS`
- Si usas IPv6, agrega AAAA.
- No uses proxy naranja hasta que emita el certificado (si usas Cloudflare, desactiva proxy al inicio).

## 3) Variables y primer arranque manual (opcional)
```bash
cd /var/www/luxia
# Si aún no está el código (solo primer despliegue sin CI)
git clone https://github.com/MELANOINC/luxia-bot-landing2.git .
cp .env.example .env
nano .env  # Edita DOMAIN=tu-dominio.com

# Primer arranque
docker compose up -d
```
Caddy servirá HTTP en :80 automáticamente y activará HTTPS cuando el DNS resuelva el dominio.

## 4) CI/CD (auto-deploy al pushear a main)
En GitHub → Settings → Secrets and variables → Actions, crear:
- VPS_HOST: IP o host del VPS (ej. 203.0.113.10)
- VPS_USER: usuario SSH (ej. ubuntu)
- VPS_PATH: ruta de deploy (ej. /var/www/luxia)
- VPS_SSH_KEY: contenido de tu clave privada (id_ed25519 o id_rsa) con BEGIN/END y saltos de línea.
- (Opcional) VPS_SSH_PASSPHRASE: si tu clave tiene passphrase.

Al pushear a `main`:
1) Sincroniza el repo al VPS (rsync)
2) Construye imágenes y `up -d`
3) Limpia imágenes antiguas

## 5) Verificación y logs
```bash
docker compose ps
docker compose logs -f web
docker compose logs -f caddy
```

## 6) Notas
- Asegúrate de que `server.js` use `process.env.PORT || 3000` y escuche en `0.0.0.0`.
- Caddy usa `DOMAIN` desde `.env` para el TLS automático.