# Calendari Andorra / Espanya

App mòbil (PWA) per controlar en quin país has passat cada franja del dia (Dia/Nit), amb Andorra i Espanya, tiquets i resum de dies equivalents. Basada en el disseny fet a Claude Design.

## Fitxers

- `index.html`, `styles.css`, `app.js` — l'aplicació.
- `manifest.json`, `sw.js`, `icons/` — la fan instal·lable al mòbil (PWA).
- `Calendari.dc.html`, `ios-frame.jsx` — fitxers originals del disseny (no calen per fer funcionar l'app; només com a referència). `support.js` i `Canvas.dc.html` es van perdre per una incidència de sincronització d'iCloud durant la creació d'aquesta carpeta; no calen per a l'app — si els vols recuperar, torna a fer "Send to Claude Code Web" des del projecte a claude.ai/design.

## Provar-la en local

```bash
python3 -m http.server 8080
```

Obre `http://localhost:8080` al mòbil o l'ordinador.

## Publicar-la gratis a internet

Qualsevol allotjament d'arxius estàtics gratuït funciona. Els més senzills:

### Opció A — GitHub Pages (recomanat, gratis per sempre)
1. Crea un repositori nou a GitHub i puja-hi tots els fitxers d'aquesta carpeta.
2. Al repositori: **Settings → Pages → Branch: main → Save**.
3. En uns minuts la app estarà a `https://<el-teu-usuari>.github.io/<nom-repo>/`.

### Opció B — Netlify / Vercel (arrossegar i deixar anar)
1. Crea un compte gratuït a netlify.com o vercel.com.
2. Arrossega aquesta carpeta a la seva pàgina de "deploy".
3. Et donen una URL pública a l'instant (`algunacosa.netlify.app`).

## Com la gent se la descarrega gratis al mòbil

No cal App Store ni Google Play — un cop l'app és a una URL pública:

**iPhone (Safari):** obre l'enllaç → botó Compartir (□↑) → "Afegeix a la pantalla d'inici".

**Android (Chrome):** obre l'enllaç → menú (⋮) → "Instal·la l'aplicació" o "Afegeix a la pantalla d'inici".

Un cop instal·lada, s'obre a pantalla completa com una app normal, amb icona pròpia, i funciona sense connexió gràcies al service worker.
