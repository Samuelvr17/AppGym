# 🚀 Guía de Testing PWA en Vercel Preview

## ✅ Rama Subida Exitosamente

La rama `pwa-implementation` ha sido subida a GitHub. Vercel creará automáticamente un **Preview Deployment** separado de producción.

## 📱 Cómo Acceder al Preview Deployment

### Opción 1: Desde el Dashboard de Vercel (Más Fácil)

1. **Ve a tu dashboard de Vercel**: https://vercel.com/dashboard
2. **Selecciona tu proyecto** AppGym
3. **Ve a la pestaña "Deployments"**
4. **Busca el deployment** con el nombre de la rama `pwa-implementation`
   - Aparecerá con un badge que dice "Preview"
   - Tendrá una URL única como: `appgym-git-pwa-implementation-tuusuario.vercel.app`
5. **Haz clic en el deployment** para ver los detalles
6. **Copia la URL del preview**

### Opción 2: Desde GitHub (Si tienes integración)

1. Ve a tu repositorio en GitHub
2. Haz clic en la pestaña "Pull Requests"
3. Crea un Pull Request de `pwa-implementation` → `main` (NO lo merges aún)
4. Vercel comentará automáticamente con el link del preview
5. Haz clic en "Visit Preview"

### Opción 3: Desde el Email de Vercel

Vercel te enviará un email con el link del preview deployment.

## 📱 Testing en Dispositivos Móviles

Una vez que tengas la URL del preview (ejemplo: `https://appgym-git-pwa-implementation-usuario.vercel.app`):

### En Android (Chrome/Edge)

1. **Abre Chrome o Edge** en tu Android
2. **Navega a la URL del preview** de Vercel
3. **Espera unos segundos** - debería aparecer un banner o botón que dice:
   - "Instalar app" o
   - "Agregar a pantalla de inicio"
4. **Toca el botón de instalación**
5. **Confirma** la instalación
6. **Abre la app** desde tu pantalla de inicio

**Si no aparece el prompt de instalación:**
- Toca el menú (⋮) en Chrome
- Selecciona "Instalar app" o "Agregar a pantalla de inicio"

### En iPhone (Safari)

1. **Abre Safari** en tu iPhone
2. **Navega a la URL del preview** de Vercel
3. **Toca el botón Compartir** (cuadrado con flecha hacia arriba)
4. **Desplázate hacia abajo** y toca "Agregar a pantalla de inicio"
5. **Personaliza el nombre** si deseas (o deja "GymTracker")
6. **Toca "Agregar"**
7. **Abre la app** desde tu pantalla de inicio

## ✅ Checklist de Testing

### Instalación
- [ ] El prompt de instalación aparece (Android)
- [ ] Se puede agregar a pantalla de inicio (iOS)
- [ ] El icono se ve correctamente en el launcher/home screen
- [ ] El nombre "GymTracker" aparece debajo del icono

### Funcionalidad Standalone
- [ ] La app se abre sin la barra de navegación del navegador
- [ ] La barra de estado se ve correcta (iOS: black-translucent)
- [ ] No hay problemas con el notch/safe areas (iPhone X+)
- [ ] El color del tema (#6366f1 - morado) se aplica correctamente

### Funcionalidad Offline
- [ ] Crea una rutina mientras estás online
- [ ] Activa el modo avión o desconecta WiFi/datos
- [ ] Cierra y vuelve a abrir la app
- [ ] La app sigue funcionando
- [ ] Puedes ver las rutinas creadas
- [ ] Puedes crear nuevas rutinas offline
- [ ] Los datos persisten

### Experiencia de Usuario
- [ ] No hay zoom no deseado al tocar inputs
- [ ] Los botones responden bien al toque
- [ ] El scroll es suave
- [ ] No hay pull-to-refresh accidental
- [ ] Las transiciones son fluidas

## 🔍 Debugging en Dispositivos

### Android (Chrome DevTools Remoto)

1. **En tu PC:**
   - Abre Chrome
   - Ve a `chrome://inspect`
   - Conecta tu Android por USB
   - Habilita "USB Debugging" en tu Android

2. **Verás tu dispositivo** en la lista
3. **Haz clic en "Inspect"** debajo de tu app
4. **Usa DevTools** para ver:
   - Console logs
   - Network requests
   - Application → Manifest
   - Application → Service Workers

### iPhone (Safari Web Inspector)

1. **En iPhone:**
   - Ve a Ajustes → Safari → Avanzado
   - Activa "Inspector Web"

2. **En Mac:**
   - Abre Safari
   - Ve a Develop → [Tu iPhone] → [Tu App]
   - Usa el inspector web

## 🎯 Verificación de PWA Score

1. **Abre la URL del preview en Chrome desktop**
2. **Abre DevTools** (F12)
3. **Ve a la pestaña "Lighthouse"**
4. **Selecciona:**
   - ✅ Progressive Web App
   - ✅ Performance (opcional)
5. **Haz clic en "Analyze page load"**
6. **Verifica que el PWA score sea 100** o muy cercano

## 📊 Comparación Preview vs Producción

| Aspecto | Preview (pwa-implementation) | Producción (main) |
|---------|------------------------------|-------------------|
| **URL** | `*-git-pwa-implementation-*.vercel.app` | Tu dominio principal |
| **PWA** | ✅ Habilitado | ❌ No habilitado |
| **Instalable** | ✅ Sí | ❌ No |
| **Offline** | ✅ Funciona | ❌ No funciona |
| **Service Worker** | ✅ Activo | ❌ No existe |
| **Datos** | Separados (localStorage diferente) | Separados |

## 🚨 Importante

> **Los datos NO se comparten entre preview y producción**
> 
> Cada URL tiene su propio localStorage, así que las rutinas que crees en el preview NO aparecerán en producción y viceversa.

## 🎉 Después del Testing

### Si todo funciona bien:

```bash
# Crear Pull Request en GitHub
# O hacer merge directamente:
git checkout main
git merge pwa-implementation
git push origin main
```

Vercel automáticamente desplegará la versión PWA a producción.

### Si encuentras problemas:

1. Anota los problemas específicos
2. Vuelve a la rama `pwa-implementation`
3. Haz los ajustes necesarios
4. Haz commit y push
5. Vercel actualizará automáticamente el preview

## 📞 Comandos Útiles

```bash
# Ver en qué rama estás
git branch

# Ver el estado actual
git status

# Ver los últimos commits
git log --oneline -5

# Cambiar a la rama PWA para hacer ajustes
git checkout pwa-implementation

# Volver a main
git checkout main
```

## 🌐 URLs de Referencia

- **Dashboard Vercel**: https://vercel.com/dashboard
- **Documentación PWA**: https://web.dev/progressive-web-apps/
- **Vite PWA Plugin**: https://vite-pwa-org.netlify.app/

---

> [!TIP]
> **Consejo Pro**: Guarda la URL del preview en tus marcadores para acceder rápidamente desde tus dispositivos móviles.

> [!NOTE]
> El preview deployment se mantiene activo mientras la rama exista. Puedes probarlo tantas veces como quieras.
