# Checklist de Verificación - GitHub Pages

## ✅ Verificaciones Básicas

### Repositorio
- [ ] ¿El repositorio es **PÚBLICO**?
- [ ] ¿Los archivos están en la **raíz del repositorio**?
- [ ] ¿Tienes `index.html` en la raíz?
- [ ] ¿El nombre del repositorio no tiene espacios ni caracteres especiales?

### GitHub Pages
- [ ] ¿GitHub Pages está activado en Settings > Pages?
- [ ] ¿Source está configurado como "Deploy from a branch"?
- [ ] ¿Branch seleccionado: main (o master)?
- [ ] ¿Folder seleccionado: / (root)?
- [ ] ¿Aparece una URL verde con el sitio publicado?

### URL del Sitio
- [ ] ¿La URL sigue el formato: `https://tu-usuario.github.io/nombre-repo/`?
- [ ] ¿Puedes acceder al sitio directamente?
- [ ] ¿La URL no tiene espacios o caracteres especiales?

### Google Apps Script
- [ ] ¿Tienes el Google Apps Script desplegado como Web App?
- [ ] ¿El Web App tiene acceso público?
- [ ] ¿La URL del script está configurada en `script.js`?
- [ ] ¿Puedes acceder a la URL del script directamente?

### Archivos Web
- [ ] ¿Todos los archivos están subidos? (index.html, styles.css, script.js)
- [ ] ¿Los nombres de archivos son exactamente correctos?
- [ ] ¿No hay archivos corruptos o vacíos?

## 🧪 Pruebas de Diagnóstico

### Prueba 1: Demo Básica
- [ ] ¿Tu sitio carga alguna interfaz?
- [ ] ¿Aparece el título "Consulta Rápida de Evaluaciones"?
- [ ] ¿El dropdown de estudiantes se muestra?

### Prueba 2: Google Apps Script
- [ ] ¿Puedes acceder a tu URL de Apps Script directamente?
- [ ] ¿El Apps Script devuelve datos JSON válidos?
- [ ] ¿No hay errores 403/404 en el Apps Script?

### Prueba 3: Consola del Navegador
- [ ] ¿Hay errores en la consola (F12)?
- [ ] ¿Los archivos CSS/JS cargan correctamente?
- [ ] ¿No hay errores de CORS?

## 🚨 Errores Comunes y Soluciones

### Error: "404 - Page not found"
**Solución**: Verificar que GitHub Pages esté activado correctamente

### Error: "Network Error" o CORS
**Solución**: Verificar permisos y URL del Google Apps Script

### Error: "Script Error"
**Solución**: Revisar la configuración de URLs en script.js

### Página en blanco
**Solución**: Verificar que index.html existe y los archivos CSS/JS cargan

### Dropdown vacío
**Solución**: Verificar conectividad con Google Apps Script

## 📞 Información para Soporte

Si sigues teniendo problemas, proporciona:

1. **URL del repositorio**: `https://github.com/tu-usuario/nombre-repo`
2. **URL del sitio**: `https://tu-usuario.github.io/nombre-repo/`
3. **Captura de pantalla** de Settings > Pages en GitHub
4. **Errores de consola** (F12 en el navegador)
5. **URL del Google Apps Script** (si la tienes configurada)

---
**💡 Tip**: Comienza siempre verificando lo más básico primero: ¿GitHub Pages está activado? ¿El repositorio es público? ¿Los archivos están en el lugar correcto?