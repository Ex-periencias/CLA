# ✅ Checklist de Verificación - Fase 1

## 🔍 **Verificaciones Antes de Probar**

### **📋 Frontend (Website)**

#### ✅ **Archivos actualizados**
- [ ] `index.html` descargado y subido a GitHub
- [ ] `styles.css` descargado y subido a GitHub  
- [ ] `script.js` descargado y subido a GitHub

#### ✅ **URL de Google Apps Script**
- [ ] En `script.js` línea 2: URL configurada correctamente
- [ ] URL apunta al proyecto actualizado de Google Apps Script

### **📊 Google Sheets**

#### ✅ **Estructura de Pestañas**
- [ ] Pestaña "Lista de Alumnos" existe y tiene datos
- [ ] Pestañas de materias siguen el formato: "Materia P1/P2/P3"
- [ ] Ejemplos correctos:
  - ✅ "Tutoría P1", "Lengua Materna P2", "Inglés P3"
  - ❌ "P1-Tutoría", "Lengua-Materia-P1" (formato incorrecto)

#### ✅ **Datos en Pestañas**
- [ ] Cada pestaña de materia tiene datos de estudiantes
- [ ] Estructura de datos: Actividad en columna 1, Calificación en columna 2
- [ ] Headers en fila 1, datos desde fila 2

### **🔧 Google Apps Script**

#### ✅ **Código Actualizado**
- [ ] Google Apps Script reemplazado con `google-apps-script-fase1.js`
- [ ] Script desplegado como aplicación web
- [ ] URL de despliegue actualizada en `script.js`

#### ✅ **Permisos**
- [ ] Permisos de lectura de Google Sheets otorgados
- [ ] Permisos de ejecución como usuario web

## 🧪 **Pruebas Recomendadas**

### **1️⃣ Prueba Básica**
```
1. Abrir website en navegador
2. Seleccionar cualquier alumno
3. Seleccionar "Período 1"
4. Hacer clic en "Consultar Calificaciones"
5. ✅ RESULTADO ESPERADO: Solo materias con "P1" en el nombre
```

### **2️⃣ Prueba de Cambio de Período**
```
1. Con resultados de P1 visible
2. Cambiar a "Período 2" 
3. Hacer clic en "Consultar Calificaciones"
4. ✅ RESULTADO ESPERADO: Solo materias con "P2" en el nombre
5. ✅ RESULTADO ESPERADO: Título muestra "Alumno - P2"
```

### **3️⃣ Prueba de Responsive**
```
1. Abrir website en móvil
2. Verificar que radio buttons estén en columna
3. Seleccionar alumno y período
4. ✅ RESULTADO ESPERADO: Todo se ve bien y funcional
```

## 🚨 **Posibles Problemas y Soluciones**

### **❌ No cargan datos**
**Causa:** URL de Google Apps Script incorrecta
**Solución:** Verificar URL en `script.js` línea 2

### **❌ Muestra todas las materias (sin filtrar)**
**Causa:** Google Apps Script no actualizado
**Solución:** Reemplazar código en Google Apps Script

### **❌ Error "Cannot read property of undefined"**
**Causa:** Nombre de pestaña no sigue formato esperado
**Solución:** Verificar nombres de pestañas: "Materia P1", "Materia P2", etc.

### **❌ Radio buttons no funcionan**
**Causa:** JavaScript no actualizado
**Solución:** Asegurar que `script.js` es la versión actualizada

### **❌ Diseño roto en móvil**
**Causa:** CSS no actualizado
**Solución:** Asegurar que `styles.css` es la versión actualizada

## 📱 **Pruebas por Dispositivo**

### **🖥️ Desktop (Chrome/Firefox/Safari)**
- [ ] Radio buttons en línea horizontal
- [ ] Hover effects funcionan
- [ ] Carga rápida de datos

### **📱 Móvil (iOS/Android)**
- [ ] Radio buttons en columna vertical  
- [ ] Texto legible sin scroll horizontal
- [ ] Botón de consulta accesible

### **📋 Lista de Alumnos Completada (14 materias)**

1. [ ] Igualdad
2. [ ] Música
3. [ ] FCE
4. [ ] Matemáticas
5. [ ] Historia
6. [ ] Inglés
7. [ ] Tecnología
8. [ ] Educación Física
9. [ ] Danza
10. [ ] Español
11. [ ] Tutoría
12. [ ] Biología
13. [ ] Geografía
14. [ ] Lista de Alumnos (hoja especial)

## 🎯 **Criterios de Éxito**

### ✅ **Funcionalidad Completa**
- [ ] Seleccionar alumno + período muestra solo materias relevantes
- [ ] Cambio de período actualiza resultados correctamente
- [ ] No hay errores en consola del navegador
- [ ] Loading states muestran período actual

### ✅ **Experiencia de Usuario**
- [ ] Interfaz intuitiva y clara
- [ ] Responsive en todos los dispositivos
- [ ] Mensajes de estado apropiados
- [ ] Rendimiento aceptable (<3 segundos carga)

## 📞 **Soporte**

Si algo no funciona:

1. **Verificar** que todos los archivos están actualizados
2. **Comprobar** la consola del navegador para errores
3. **Revisar** que las pestañas de Sheets siguen el formato correcto
4. **Confirmar** que la URL de Google Apps Script es correcta

## 🎉 **¡Después de verificar todo esto, el sistema estará 100% funcional!**

¿Todo listo para la verificación?