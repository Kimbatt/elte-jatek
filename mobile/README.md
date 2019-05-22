# Mobil alkalmazás készítése

1. új mappa létrehozása a cordova projektnek
2. a projekt mappában `cordova create .`
3. `cordova platform add android@latest`
4. az automatikusan generált config.xml fájlt felülírni az itt található config.xml-el
5. a projekt mappán belül a www mappából mindent kitörölni, és a root könyvtárból (ahol az index.html van) be kell másolni ide a www mappába az index.html, a .js fájlokat, valamint az entities és sprites mappát. 
6. `cordova build android` (android sdk szükséges)
7. az apk fájl ide lesz létrehozva: `platforms\android\app\build\outputs\apk\debug\app-debug.apk`

A mobil alkalmazáson belül a képernyő megfelelő részének éríntésével lehet mozogni (jobbra/balra, ugráshoz a képernyő felső részét kell megérinteni), a kard gombbal lehet támadni.