# PondiFarm Web (desktop)

The PondiFarm app for the browser. It is the same code as the iOS app (Expo / React Native), with a desktop layout on top:

- **Desktop version:** sign in and create an account, a sidebar with Home, Herd, Analytics and Settings, a herd list with the animal sheet beside it, and the profile with the organization and team.
- **Mobile version:** the iOS app layout inside a phone frame. The desktop icon next to the profile asks *Switch to mobile version?* and animates into it; *Switch to desktop* goes back.
- On a narrow screen (a real phone) the app opens full screen, like the iOS app.
- **No scanning on the web.** 3D capture uses the iPhone LiDAR sensor; scans appear here once they sync.

## Run

```bash
npm ci
npm start            # dev server (web)
npm run build        # static site in dist/
```

Set `EXPO_PUBLIC_API_URL` (see `.env.example`) to point the build at a demo or local backend. The backend must allow the site's origin in `CORS_ORIGINS`.

## Where things are

- `App.web.tsx`: web entry (the iOS app keeps `App.tsx`).
- `src/web/`: desktop shell, sign-in page, device switch and transition.
- `modules/lidar-scanner/index.web.ts`: web stand-in for the native LiDAR module.

© Euro Union Consult, Lda.
