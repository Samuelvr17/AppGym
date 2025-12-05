# 📱 PWA Setup - Gym Routine Tracker

## Quick Start

### Development Mode
```bash
npm install
npm run dev -- --host
```

The `--host` flag exposes the server to your local network for mobile testing.

### Production Build
```bash
npm run build
npm run preview -- --host
```

## Testing on Mobile Devices

### Android (Chrome/Edge)
1. Connect to the same WiFi network as your development machine
2. Open Chrome/Edge on your Android device
3. Navigate to `http://YOUR_LOCAL_IP:5173`
4. Tap "Install app" when prompted
5. App will be added to your home screen

### iPhone (Safari)
1. Connect to the same WiFi network
2. Open Safari on your iPhone
3. Navigate to `http://YOUR_LOCAL_IP:5173`
4. Tap Share → "Add to Home Screen"
5. App will be added to your home screen

## PWA Features

✅ **Offline Support** - Works without internet after first load  
✅ **Installable** - Add to home screen on any device  
✅ **App-like Experience** - Runs in standalone mode  
✅ **Fast Loading** - Service Worker caches assets  
✅ **Mobile Optimized** - Touch-friendly, safe area support  

## Deployment

For production, deploy to any HTTPS-enabled hosting:

**Vercel (Recommended):**
```bash
npm install -g vercel
vercel
```

**Netlify:**
- Drag & drop the `dist` folder to Netlify

**Other Options:**
- GitHub Pages
- Firebase Hosting
- Cloudflare Pages

> **Note:** PWAs require HTTPS in production (except localhost)

## Branch Information

This PWA implementation is on the `pwa-implementation` branch.

To merge to main after testing:
```bash
git checkout main
git merge pwa-implementation
git push origin main
```

## Troubleshooting

**Install prompt doesn't appear:**
- Make sure you're using HTTPS (or localhost)
- Check that manifest.json loads correctly
- Verify Service Worker is registered (DevTools → Application)

**App doesn't work offline:**
- Visit the app at least once while online
- Check Service Worker status in DevTools
- Clear cache and reload if needed

**iOS issues:**
- Ensure all apple-mobile-web-app meta tags are present
- Verify apple-touch-icon is accessible
- Check that viewport meta tag includes user-scalable=no

## Tech Stack

- **React 18** - UI framework
- **Vite** - Build tool
- **vite-plugin-pwa** - PWA plugin
- **Workbox** - Service Worker library
- **Tailwind CSS** - Styling

## File Structure

```
project/
├── public/
│   ├── icons/              # App icons (192x192, 512x512)
│   └── manifest.json       # PWA manifest
├── src/
│   ├── components/         # React components
│   ├── index.css          # Global styles + PWA optimizations
│   └── main.tsx           # App entry point
├── vite.config.ts         # Vite + PWA configuration
└── index.html             # HTML with PWA meta tags
```

## Support

For issues or questions, check:
- [Vite PWA Plugin Docs](https://vite-pwa-org.netlify.app/)
- [Web.dev PWA Guide](https://web.dev/progressive-web-apps/)
