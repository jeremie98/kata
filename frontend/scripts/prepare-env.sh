#!/bin/bash

echo "# This file has been generated by the prepare-env script." > .env
echo "# You can overwrite the following values at your convenience." >> .env
echo "# Please refer to the .env.example file if needed." >> .env

echo "" >> .env

echo "# GLOBALE APP" >> .env

echo "NODE_ENV=DEV" >> .env
echo "" >> .env

echo "# API BACKEND" >> .env

echo "API_KATA=http://localhost:4071" >> .env

echo "" >> .env

echo "# AUTH JS" >> .env

echo "AUTH_SECRET=nXQr6yPK/AELvtx3V5y17DGEH2qxCZpl8XUzp71yQ3RM" >> .env
echo "AUTH_URL=http://localhost:4079" >> .env
echo "AUTH_DEBUG=true" >> .env