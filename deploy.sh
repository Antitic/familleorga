#!/bin/bash
set -e

echo "=== Déploiement Familia ==="

# Clone
cd /opt
if [ -d "familleorga" ]; then
  echo "Dossier existant, mise à jour..."
  cd familleorga
  git fetch origin
  git checkout claude/great-hawking-ga5fhw
  git pull origin claude/great-hawking-ga5fhw
else
  sudo git clone https://github.com/antitic/familleorga.git
  cd familleorga
  git checkout claude/great-hawking-ga5fhw
fi

sudo chown -R $USER:$USER /opt/familleorga

# Dépendances
npm install

# Environnement
if [ ! -f .env ]; then
  cat > .env << 'EOF'
DATABASE_URL="file:./prisma/prod.db"
NEXTAUTH_SECRET="fam1l1a-s3cr3t-k3y-pr0d-2024-xyz"
NEXTAUTH_URL="https://oltrelestelle.fr/familia"
EOF
  echo ".env créé"
fi

# Base de données
npx prisma db push
if [ ! -f prisma/prod.db ] || [ "$(npx prisma db execute --stdin <<< 'SELECT COUNT(*) FROM User;' 2>/dev/null)" = "0" ]; then
  npx tsx prisma/seed.ts
fi

# Build
npm run build

# PM2
if ! command -v pm2 &> /dev/null; then
  sudo npm install -g pm2
fi

pm2 delete familia 2>/dev/null || true
PORT=3001 pm2 start npm --name "familia" -- start
pm2 save

echo ""
echo "=== FAIT ==="
echo "Ajoute ce bloc dans ta config Nginx pour oltrelestelle.fr :"
echo ""
echo "  location /familia {"
echo "      proxy_pass http://127.0.0.1:3001/familia;"
echo "      proxy_http_version 1.1;"
echo "      proxy_set_header Upgrade \$http_upgrade;"
echo "      proxy_set_header Connection 'upgrade';"
echo "      proxy_set_header Host \$host;"
echo "      proxy_set_header X-Real-IP \$remote_addr;"
echo "      proxy_cache_bypass \$http_upgrade;"
echo "  }"
echo ""
echo "Puis: sudo nginx -t && sudo systemctl reload nginx"
echo ""
echo "URL: https://oltrelestelle.fr/familia"
echo "Admin: admin@familia.fr / admin123"
