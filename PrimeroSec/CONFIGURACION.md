# Configuración Rápida del Sistema

## 🔧 Pasos para Configurar tu Sistema

### 1. Google Sheets
**Obtener el ID de tu Google Sheet:**
1. Abre tu Google Sheet
2. Mira la URL: `https://docs.google.com/spreadsheets/d/[ESTE_ES_EL_ID]/edit`
3. Copia el ID y reemplázalo en `google-apps-script.js`

### 2. Google Apps Script
**Crear y desplegar el script:**
1. Ve a [script.google.com](https://script.google.com)
2. Nuevo proyecto
3. Copia todo el contenido de `google-apps-script.js`
4. Reemplaza `TU_GOOGLE_SHEET_ID_AQUI` con tu ID real
5. Deploy > New deployment > Web app
6. Copia la URL del deployment

### 3. Sitio Web
**Configurar la conexión:**
1. Abre `script.js`
2. Reemplaza `TU_GOOGLE_APPS_SCRIPT_URL_AQUI` con tu URL real
3. ¡Listo para subir a GitHub Pages!

## 📋 Lista de Verificación

- [ ] Google Sheet configurado con la estructura correcta
- [ ] Google Apps Script desplegado como Web App
- [ ] URL del script copiada en `script.js`
- [ ] Archivos subidos a GitHub
- [ ] GitHub Pages activado
- [ ] Prueba de funcionamiento realizada

## 🔍 URL de Ejemplo

Tu Google Apps Script URL se verá así:
```
https://script.google.com/macros/s/AKfycYz[LARGO_ID]/exec
```

## ⚡ Prueba Rápida

1. Abre `index.html` en tu navegador
2. Selecciona un alumno
3. Haz clic en "Consultar"
4. Deberías ver los datos cargarse

## 🆘 Si algo no funciona

1. **Revisa la consola del navegador** (F12)
2. **Verifica las URLs** estén correctas
3. **Confirma los permisos** del Google Sheet
4. **Usa la función debug:** `debugConnection()` en la consola

---
**¡Tu sistema estará funcionando en menos de 10 minutos!**