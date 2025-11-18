# 📊 Sistema de Control de Actividades y Seguimiento de Alumnos

Sistema web para visualizar el seguimiento de actividades y calificaciones de estudiantes por materias, integrado con Google Sheets mediante Google Apps Script.

## 🚀 Características

- ✅ **Interfaz moderna y responsiva**
- ✅ **Menú desplegable dinámico** para selección de alumnos
- ✅ **Visualización por materia** con grids específicos
- ✅ **Sistema de variantes y totales** para cada materia
- ✅ **Integración con Google Sheets** via Google Apps Script
- ✅ **Optimizado para GitHub Pages**
- ✅ **Diseño adaptable** para móviles y tablets

## 📁 Archivos del Proyecto

```
/workspace/
├── google-apps-script.js  # Script de Google Apps Script
├── index.html             # Página principal
├── styles.css             # Estilos CSS
├── script.js             # Lógica JavaScript
└── README.md             # Este archivo
```

## 🔧 Configuración

### 1. Google Sheets

#### Estructura requerida:
```
📋 Lista Alumnos (Primera pestaña)
├── Columna A: Número de lista
└── Columna B: Nombre completo del alumno

📚 Materia 1 (Segunda pestaña)
├── Celda A1: Nombre de la materia
├── Fila 2: Encabezados de actividades (columnas C-AL)
└── Fila 3: Número de lista (A) y nombre (B) del alumno

📚 Materia 2 (Tercera pestaña)
└── [Misma estructura que Materia 1]

... (hasta 14 materias)
```

### 2. Google Apps Script

1. **Abrir Google Apps Script:**
   - Ve a [script.google.com](https://script.google.com)
   - Crea un nuevo proyecto

2. **Copiar el código:**
   - Copia el contenido de `google-apps-script.js`
   - Pégalo en el editor de Apps Script

3. **Configurar ID de Sheet:**
   ```javascript
   const SHEET_ID = 'TU_GOOGLE_SHEET_ID_AQUI';
   ```
   - Reemplaza con el ID de tu Google Sheet
   - El ID está en la URL: `https://docs.google.com/spreadsheets/d/[SHEET_ID]/edit`

4. **Desplegar como Web App:**
   - Haz clic en "Deploy" > "New deployment"
   - Tipo: "Web app"
   - Execute as: "Me"
   - Who has access: "Anyone" (para acceso público) o "Anyone with Google account"
   - Haz clic en "Deploy"

5. **Obtener URL:**
   - Copia la URL del Web App
   - Se verá algo como: `https://script.google.com/macros/s/[SCRIPT_ID]/exec`

### 3. Sitio Web

1. **Configurar URL del Script:**
   ```javascript
   // En script.js
   const SCRIPT_URL = 'TU_GOOGLE_APPS_SCRIPT_URL_AQUI';
   ```
   - Reemplaza con la URL de tu Web App

2. **Subir archivos a GitHub:**
   - Crea un repositorio nuevo
   - Sube los archivos: `index.html`, `styles.css`, `script.js`
   - Activa GitHub Pages en Settings > Pages

## 🎯 Uso del Sistema

### Para estudiantes/profesores:

1. **Seleccionar Alumno:**
   - Usa el menú desplegable para elegir un alumno
   - Haz clic en "Consultar Calificaciones"

2. **Visualizar Resultados:**
   - Se mostrarán todas las materias del alumno
   - Cada materia tiene su propio grid con:
     - Actividades individuales
     - Sistema de variantes
     - Calificación total

3. **Actualizar Datos:**
   - Usa el botón "Actualizar Datos" para refrescar
   - Los datos se toman directamente del Google Sheet

## 🔍 Funciones de Debug

El sistema incluye funciones de debugging:

```javascript
// En la consola del navegador
debugConnection(); // Prueba la conexión con Apps Script
```

## 🛠️ Personalización

### Estilos CSS
- Modifica `styles.css` para cambiar colores, fuentes, etc.
- Variables CSS principales:
  ```css
  --primary-color: #667eea;
  --secondary-color: #764ba2;
  --success-color: #48bb78;
  --error-color: #e53e3e;
  ```

### Lógica JavaScript
- Modifica `script.js` para:
  - Cambiar formato de datos
  - Agregar validaciones
  - Modificar presentación de resultados

### Google Apps Script
- Modifica `google-apps-script.js` para:
  - Cambiar estructura de datos
  - Agregar validaciones
  - Implementar cache

## 📱 Responsividad

El sistema se adapta automáticamente a:
- 💻 **Desktop** (1200px+)
- 📱 **Tablet** (768px-1199px)
- 📱 **Mobile** (< 768px)

## 🔒 Seguridad

### Opciones de acceso:
1. **Público:** Cualquiera puede ver los datos
2. **Restringido:** Solo usuarios con cuenta de Google
3. **Autenticación personalizada:** Implementar OAuth2

### Recomendaciones:
- No exponer datos sensibles
- Usar permisos apropiados en GitHub Pages
- Considerar implementar autenticación para producción

## 🐛 Solución de Problemas

### Error: "No se encontraron datos"
- Verifica que el nombre del alumno coincida exactamente
- Asegúrate de que la hoja tenga la estructura correcta
- Revisa los permisos del Google Sheet

### Error de CORS
- Asegúrate de que el Web App tenga permisos de acceso apropiados
- Verifica que la URL del script sea correcta

### Datos no se muestran
- Abre la consola del navegador (F12)
- Revisa los errores en la pestaña "Console"
- Usa `debugConnection()` para probar la conexión

## 🚀 Despliegue en Producción

### GitHub Pages:
1. Sube los archivos a un repositorio
2. Activa Pages en Settings
3. Selecciona la rama principal (main/master)
4. El sitio estará disponible en: `https://tu-usuario.github.io/nombre-repo`

### Dominio Personalizado:
1. Ve a Settings > Pages
2. En "Custom domain" agrega tu dominio
3. Configura DNS para apuntar a GitHub Pages

## 📊 Monitoreo

### Métricas recomendadas:
- Tiempo de carga de datos
- Número de consultas por día
- Errores de conexión
- Uso por dispositivo

### Google Analytics:
```html
<!-- Agregar antes de </head> en index.html -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_TRACKING_ID"></script>
```

## 🤝 Contribuciones

Para mejorar el sistema:
1. Fork el repositorio
2. Crea una rama para tu feature
3. Realiza los cambios
4. Envía un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver `LICENSE` para más detalles.

---

## 🆘 Soporte

Si necesitas ayuda:
1. Revisa la documentación arriba
2. Abre un issue en el repositorio
3. Verifica la consola del navegador para errores

**¡Tu sistema de control de actividades está listo para usar!** 🎉