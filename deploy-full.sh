#!/bin/bash
set -e

# =====================================================
# FAMILIA - Script de déploiement complet v2
# Usage: bash deploy-full.sh
# Aucune action manuelle requise.
# =====================================================

RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; BLUE='\033[0;34m'; NC='\033[0m'
log()  { echo -e "${GREEN}[✓]${NC} $1"; }
info() { echo -e "${BLUE}[→]${NC} $1"; }
warn() { echo -e "${YELLOW}[!]${NC} $1"; }
die()  { echo -e "${RED}[✗]${NC} $1"; exit 1; }

echo ""
echo -e "${BLUE}╔══════════════════════════════════════╗${NC}"
echo -e "${BLUE}║     FAMILIA - Déploiement v2         ║${NC}"
echo -e "${BLUE}╚══════════════════════════════════════╝${NC}"
echo ""

# ── 1. Node.js ──────────────────────────────────────
info "Vérification de Node.js..."
if ! command -v node &>/dev/null; then
  warn "Node.js non trouvé, installation..."
  curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash - 2>/dev/null
  sudo apt-get install -y nodejs 2>/dev/null
fi
NODE_VERSION=$(node -v)
log "Node.js $NODE_VERSION"

# ── 2. PM2 ──────────────────────────────────────────
info "Vérification de PM2..."
if ! command -v pm2 &>/dev/null; then
  sudo npm install -g pm2 2>/dev/null
fi
log "PM2 OK"

# ── 3. Clone / mise à jour ──────────────────────────
APP_DIR="/opt/familleorga"
REPO_URL="https://github.com/antitic/familleorga.git"
BRANCH="claude/great-hawking-ga5fhw"

info "Déploiement du code dans $APP_DIR..."
if [ -d "$APP_DIR/.git" ]; then
  cd "$APP_DIR"
  git fetch origin 2>/dev/null
  git checkout "$BRANCH" 2>/dev/null
  git pull origin "$BRANCH" 2>/dev/null
else
  sudo git clone "$REPO_URL" "$APP_DIR" 2>/dev/null
  cd "$APP_DIR"
  git checkout "$BRANCH" 2>/dev/null
fi
sudo chown -R "$USER":"$USER" "$APP_DIR"
log "Code à jour (branche $BRANCH)"

# ── 4. Dépendances npm ──────────────────────────────
info "Installation des dépendances npm..."
npm install --production=false 2>/dev/null
log "Dépendances installées"

# ── 5. Fichier .env ─────────────────────────────────
info "Configuration de l'environnement..."
if [ ! -f "$APP_DIR/.env" ]; then
  SECRET=$(openssl rand -hex 32)
  cat > "$APP_DIR/.env" << EOF
DATABASE_URL="file:./prisma/prod.db"
NEXTAUTH_SECRET="$SECRET"
NEXTAUTH_URL="https://oltrelestelle.fr/familia"
EOF
  log ".env créé avec secret aléatoire"
else
  log ".env existant conservé"
fi

# ── 6. Base de données ──────────────────────────────
info "Initialisation de la base de données..."
npx prisma db push 2>/dev/null
log "Schéma appliqué"

USER_COUNT=$(sqlite3 "$APP_DIR/prisma/prod.db" "SELECT COUNT(*) FROM User;" 2>/dev/null || echo "0")
if [ "$USER_COUNT" = "0" ]; then
  info "Seed initial (premier déploiement)..."
  npx tsx prisma/seed.ts 2>/dev/null
  log "Compte admin créé : admin@familia.fr / admin123"
else
  log "Base de données existante conservée ($USER_COUNT utilisateur(s))"
fi

# ── 7. Build Next.js ────────────────────────────────
info "Build production Next.js..."
npm run build 2>/dev/null
log "Build terminé"

# ── 8. PM2 ──────────────────────────────────────────
info "Démarrage de l'application..."
pm2 delete familia 2>/dev/null || true
cd "$APP_DIR"
PORT=3001 pm2 start npm --name "familia" -- start 2>/dev/null
pm2 save 2>/dev/null

# Auto-démarrage PM2 au boot
PM2_STARTUP=$(pm2 startup 2>/dev/null | grep "sudo" || true)
if [ -n "$PM2_STARTUP" ]; then
  eval "$PM2_STARTUP" 2>/dev/null || true
fi
log "Application démarrée sur le port 3001"

# ── 9. Nginx ────────────────────────────────────────
info "Configuration de Nginx..."

NGINX_BLOCK='
    # === FAMILIA APP ===
    location /familia {
        proxy_pass http://127.0.0.1:3001/familia;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection '"'"'upgrade'"'"';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
    # === FIN FAMILIA APP ==='

# Trouver le fichier nginx qui gère oltrelestelle.fr
NGINX_CONF=""
for f in /etc/nginx/sites-enabled/* /etc/nginx/sites-available/* /etc/nginx/conf.d/*.conf /etc/nginx/nginx.conf; do
  if [ -f "$f" ] && grep -q "oltrelestelle.fr" "$f" 2>/dev/null; then
    NGINX_CONF="$f"
    break
  fi
done

if [ -z "$NGINX_CONF" ]; then
  # Pas trouvé, on crée un fichier dédié
  warn "Config Nginx pour oltrelestelle.fr non trouvée — création d'un fichier dédié"
  NGINX_CONF="/etc/nginx/sites-available/oltrelestelle.fr"
  sudo tee "$NGINX_CONF" > /dev/null << 'EOF'
server {
    listen 80;
    server_name oltrelestelle.fr www.oltrelestelle.fr;

    # === FAMILIA APP ===
    location /familia {
        proxy_pass http://127.0.0.1:3001/familia;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
    # === FIN FAMILIA APP ===
}
EOF
  sudo ln -sf "$NGINX_CONF" /etc/nginx/sites-enabled/ 2>/dev/null || true
  log "Fichier Nginx créé : $NGINX_CONF"
else
  # Vérifier si le bloc est déjà présent
  if grep -q "FAMILIA APP" "$NGINX_CONF" 2>/dev/null; then
    log "Bloc Nginx Familia déjà présent dans $NGINX_CONF"
  else
    # Injecter avant la dernière accolade fermante du bloc server
    sudo cp "$NGINX_CONF" "${NGINX_CONF}.bak"
    sudo python3 - "$NGINX_CONF" << 'PYEOF'
import sys, re

with open(sys.argv[1], 'r') as f:
    content = f.read()

block = """
    # === FAMILIA APP ===
    location /familia {
        proxy_pass http://127.0.0.1:3001/familia;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
    # === FIN FAMILIA APP ===
"""

# Insert before the last closing brace of the server block
last_brace = content.rfind('}')
new_content = content[:last_brace] + block + content[last_brace:]

with open(sys.argv[1], 'w') as f:
    f.write(new_content)

print("OK")
PYEOF
    log "Bloc Familia ajouté dans $NGINX_CONF (backup: ${NGINX_CONF}.bak)"
  fi
fi

# Test et rechargement Nginx
if sudo nginx -t 2>/dev/null; then
  sudo systemctl reload nginx 2>/dev/null
  log "Nginx rechargé avec succès"
else
  warn "Erreur dans la config Nginx — restauration du backup..."
  [ -f "${NGINX_CONF}.bak" ] && sudo cp "${NGINX_CONF}.bak" "$NGINX_CONF"
  sudo nginx -t 2>&1 || true
fi

# ── 10. Résumé ──────────────────────────────────────
echo ""
echo -e "${GREEN}╔══════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║         DÉPLOIEMENT TERMINÉ ✓                ║${NC}"
echo -e "${GREEN}╚══════════════════════════════════════════════╝${NC}"
echo ""
echo -e "  🌐 URL        : ${BLUE}https://oltrelestelle.fr/familia${NC}"
echo -e "  👤 Admin      : ${YELLOW}admin@familia.fr${NC}"
echo -e "  🔑 Mot de passe: ${YELLOW}admin123${NC}"
echo -e "  📁 App dir    : $APP_DIR"
echo -e "  📋 PM2 status : $(pm2 list | grep familia | awk '{print $18}' || echo 'voir: pm2 list')"
echo ""
echo -e "  Commandes utiles :"
echo -e "  - Logs   : ${BLUE}pm2 logs familia${NC}"
echo -e "  - Status : ${BLUE}pm2 status${NC}"
echo -e "  - Restart: ${BLUE}pm2 restart familia${NC}"
echo ""
