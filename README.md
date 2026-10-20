# AdGuard Home Remote Web (Clon Mobile-First para iPhone / PWA)

Clon web progresivo (**PWA**) de la aplicación nativa de iOS [AdGuard Home Remote](https://apps.apple.com/us/app/adguard-home-remote/id1543143740), diseñado para emular la estética Cupertino (iOS Human Interface Guidelines) y ofrecer una experiencia nativa sin barras de navegador en iPhone.

---

## 🔒 Seguridad y Secretos

> [!IMPORTANT]
> **Nunca subas contraseñas a GitHub**. Esta aplicación utiliza variables de entorno para las credenciales por defecto y almacena instancias adicionales de forma privada en el almacenamiento local (`localStorage`) de tu dispositivo.

1. Copia el archivo de ejemplo para configurar tus credenciales locales:
   ```bash
   cp .env.example .env.local
   ```
2. Edita `.env.local` con la IP y contraseña de tu AdGuard Home. El archivo `.env.local` está ignorado en `.gitignore` y **no se subirá a Git**.

---

## 🐳 Despliegue con Docker

### Con Docker Compose (Recomendado)
```bash
docker compose up -d --build
```

### Con la Imagen Publicada en GitHub Packages (GHCR)
```bash
docker run -d \
  --name adguard-home-remote \
  --restart unless-stopped \
  -p 3000:3000 \
  -e ADGUARD_URL=http://TU_IP_ADGUARD:80 \
  -e ADGUARD_USERNAME=admin \
  -e ADGUARD_PASSWORD=tu_contraseña \
  ghcr.io/TU_USUARIO/adguardhomeremoteclon:latest
```

---

## 💻 Ejecución Local (Node.js)

```bash
# 1. Instalar dependencias
npm install

# 2. Compilar producción
npm run build

# 3. Iniciar servidor
npm start
```
- Acceso local: `http://localhost:3000`
- Acceso en tu red Wi-Fi: `http://<IP-DE-TU-PC>:3000`

---

## 📲 Instalación en tu iPhone (PWA Nativa)

1. Abre **Safari** en tu iPhone estando conectado a tu red Wi-Fi.
2. Ingresa a la dirección IP de tu servidor (ej. `http://192.168.1.X:3000`).
3. Toca el botón **Compartir** en la barra inferior de Safari.
4. Selecciona **"Añadir a pantalla de inicio"** (*Add to Home Screen*).
5. Abre el icono creado en tu iPhone: funcionará a pantalla completa en modo **standalone**, con soporte para OLED negro puro, Dynamic Island y navegación táctil por pestañas.
