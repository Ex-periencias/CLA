# 📚 Sistema Multigrado - Especificación Técnica

## 🎯 Objetivo
Expandir el sistema de consulta de calificaciones para manejar múltiples grados, grupos y períodos académicos.

## 📋 Estructura de Datos

### Nomenclatura de Materias
```
[Materia] [Grado][Grupo][Período]
Ejemplos:
- "Biología 1AP1" = Biología + 1er grado + Grupo A + Período 1
- "Matemáticas 2BP3" = Matemáticas + 2do grado + Grupo B + Período 3
- "Historia 3CM2" = Historia + 3er grado + Grupo C + Período 2
```

### Códigos de Identificación
- **Grados**: 1°, 2°, 3°
- **Grupos**: A, B, C, D, etc.
- **Períodos**: P1, P2, P3, P4, etc.

## 🗂️ Estructura de Archivos

### Google Sheets (3 archivos separados)
1. **Grado1_Sheet**: `url_primer_grado.appscript`
2. **Grado2_Sheet**: `url_segundo_grado.appsscript`  
3. **Grado3_Sheet**: `url_tercer_grado.appsscript`

### Datos en Sheets
```javascript
// Estructura de datos por sheet
const gradoData = {
    grado: "1", // 1, 2, o 3
    grupo: "A", // A, B, C, etc.
    periodo: "P1", // P1, P2, P3, P4
    materias: {
        "Biología 1AP1": { /* datos de calificaciones */ },
        "Matemáticas 1AP1": { /* datos de calificaciones */ }
    }
}
```

## 🖥️ Interfaz de Usuario

### Selector Principal
```html
<!-- Selector de grado -->
<select id="gradoSelect">
    <option value="1">Primer Grado</option>
    <option value="2">Segundo Grado</option>
    <option value="3">Tercer Grado</option>
</select>

<!-- Selector de grupo -->
<select id="grupoSelect">
    <option value="A">Grupo A</option>
    <option value="B">Grupo B</option>
    <option value="C">Grupo C</option>
</select>

<!-- Selector de período -->
<select id="periodoSelect">
    <option value="P1">Período 1</option>
    <option value="P2">Período 2</option>
    <option value="P3">Período 3</option>
    <option value="P4">Período 4</option>
</select>
```

### Navegación por Pestañas
```html
<!-- Pestañas para cada grado -->
<div class="tabs">
    <button class="tab-btn active" data-grado="1">1° Grado</button>
    <button class="tab-btn" data-grado="2">2° Grado</button>
    <button class="tab-btn" data-grado="3">3° Grado</button>
</div>

<!-- Contenido de cada grado -->
<div class="tab-content" data-grado="1">
    <!-- Selectores específicos del grado -->
</div>
```

## 🔧 Funcionalidades Técnicas

### Configuración de URLs
```javascript
// script.js - Múltiples URLs
const SCRIPT_URLS = {
    '1': 'url_primer_grado.appsscript',
    '2': 'url_segundo_grado.appsscript',
    '3': 'url_tercer_grado.appsscript'
};
```

### Filtrado de Datos
```javascript
// Filtrar por grado, grupo y período
function filterStudentData(data, grado, grupo, periodo) {
    return data.filter(student => {
        return student.grado === grado && 
               student.grupo === grupo && 
               student.periodo === periodo;
    });
}
```

### Mapeo de Materias
```javascript
// Mapear materias a su estructura completa
const materiaStructure = {
    'Biología': {
        grado: '1',
        grupo: 'A',
        periodo: 'P1',
        display: 'Biología 1AP1'
    }
};
```

## 📱 Diseño Responsive

### Layout para Móviles
- **Selección en cascada**: Grado → Grupo → Período
- **Scroll horizontal** para múltiples grupos
- **Compactación** de nombres largos

### Adaptaciones CSS
```css
/* Selector compacto para móviles */
.mobile-selector {
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.materia-compact {
    font-size: 12px;
    padding: 8px;
}
```

## 🔄 Flujo de Usuario

### Proceso de Consulta
1. **Seleccionar Grado** (1°, 2°, o 3°)
2. **Seleccionar Grupo** (A, B, C, etc.)
3. **Seleccionar Período** (P1, P2, P3, P4)
4. **Elegir Estudiante** (de la lista filtrada)
5. **Consultar Calificaciones** (mostrar resultados del período específico)

### Indicador de Contexto
```html
<div class="context-indicator">
    <span class="grado-badge">1°</span>
    <span class="grupo-badge">A</span>
    <span class="periodo-badge">P1</span>
</div>
```

## 📊 Ventajas del Sistema

### ✅ Beneficios
- **Organización clara** por grados académicos
- **Flexibilidad** para múltiples períodos
- **Escalabilidad** para agregar más grados
- **Navegación intuitiva** por pestañas

### 🎯 Funcionalidades
- **Filtros avanzados** por grado/grupo/período
- **Comparación** entre períodos del mismo estudiante
- **Resumen estadístico** por grado y período
- **Exportación** filtrada por criterios

## 🚀 Implementación Faseada

### Fase 1: Estructura Base
- Modificar UI con selectores múltiples
- Configurar URLs múltiples
- Implementar filtrado básico

### Fase 2: Funcionalidades Avanzadas  
- Pestañas por grado
- Comparación entre períodos
- Estadísticas por grado

### Fase 3: Optimizaciones
- Cache por grado
- Pre-carga de datos
- Optimización móvil

## ⚡ Consideraciones Técnicas

### Performance
- **Lazy loading** por grado
- **Cache inteligente** para datos frecuentes
- **Compresión** de respuestas

### Mantenimiento
- **Configuración centralizada** de URLs
- **Logs detallados** por grado
- **Validación** de estructura de datos

### Escalabilidad
- **Configuración fácil** para nuevos grados
- **Estructura flexible** para grupos adicionales
- **Sistema de plugins** para funcionalidades extra