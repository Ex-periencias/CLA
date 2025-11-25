# 🚀 Implementación Fase 1: Períodos con Radio Buttons

## 🎯 Objetivo Fase 1
Agregar selección de períodos (P1, P2, P3) para filtrar datos por alumno + período.

## 📋 Cambios Necesarios

### 1️⃣ **HTML (index.html)**
```html
<!-- NUEVO: Selector de períodos -->
<div class="periodo-selector">
    <label>Seleccionar Período:</label>
    <div class="radio-group">
        <input type="radio" name="periodo" value="P1" id="periodo1" checked>
        <label for="periodo1">Período 1</label>
        
        <input type="radio" name="periodo" value="P2" id="periodo2">
        <label for="periodo2">Período 2</label>
        
        <input type="radio" name="periodo" value="P3" id="periodo3">
        <label for="periodo3">Período 3</label>
    </div>
</div>
```

### 2️⃣ **CSS (styles.css)**
```css
/* Estilos para selector de períodos */
.periodo-selector {
    background: white;
    border-radius: 15px;
    padding: 20px 25px;
    margin-bottom: 20px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.periodo-selector label {
    font-weight: 600;
    color: #555;
    margin-bottom: 10px;
    display: block;
}

.radio-group {
    display: flex;
    gap: 15px;
    flex-wrap: wrap;
}

.radio-group input[type="radio"] {
    margin-right: 8px;
}

.radio-group label {
    font-weight: 500;
    color: #4a5568;
    cursor: pointer;
    padding: 8px 12px;
    border-radius: 6px;
    transition: all 0.3s ease;
}

.radio-group input[type="radio"]:checked + label {
    background: #667eea;
    color: white;
}

/* Responsive para móviles */
@media (max-width: 768px) {
    .radio-group {
        flex-direction: column;
        gap: 8px;
    }
    
    .radio-group label {
        padding: 10px 12px;
    }
}
```

### 3️⃣ **JavaScript (script.js)**
```javascript
// Variable para período seleccionado
let selectedPeriodo = 'P1';

// Event listener para cambios en radio buttons
document.addEventListener('DOMContentLoaded', function() {
    // Agregar listeners a radio buttons
    document.querySelectorAll('input[name="periodo"]').forEach(radio => {
        radio.addEventListener('change', function() {
            selectedPeriodo = this.value;
            console.log('Período seleccionado:', selectedPeriodo);
        });
    });
});

// Modificar función de carga de datos
async function loadStudentData() {
    const studentSelect = document.getElementById('studentSelect');
    const selectedStudent = studentSelect.value;
    const selectedPeriodo = getSelectedPeriodo(); // NUEVA FUNCIÓN
    
    if (!selectedStudent) {
        showError('Por favor selecciona un estudiante');
        return;
    }
    
    try {
        showLoading(`Cargando datos de ${selectedStudent} para ${selectedPeriodo}...`);
        
        const response = await fetch(`${SCRIPT_URL}?action=getStudentData&student=${encodeURIComponent(selectedStudent)}&periodo=${selectedPeriodo}`);
        
        // Procesar datos filtrados por período
        const data = await response.json();
        displayStudentResults(data);
        
    } catch (error) {
        hideLoading();
        showError('Error al cargar datos: ' + error.message);
    }
}

// Función para obtener período seleccionado
function getSelectedPeriodo() {
    const radio = document.querySelector('input[name="periodo"]:checked');
    return radio ? radio.value : 'P1';
}
```

### 4️⃣ **Google Apps Script**
```javascript
// En Google Apps Script
function doGet(e) {
    const action = e.parameter.action;
    const student = e.parameter.student;
    const periodo = e.parameter.periodo || 'P1'; // NUEVO PARÁMETRO
    
    try {
        if (action === 'getStudents') {
            // Devolver estudiantes (sin cambios)
            const students = getStudentsList();
            return ContentService.createTextOutput(JSON.stringify({students}))
                .setMimeType(ContentService.MimeType.JSON);
                
        } else if (action === 'getStudentData') {
            // FILTRAR POR PERÍODO
            const allData = getStudentData(student);
            const filteredData = filterDataByPeriodo(allData, periodo);
            return ContentService.createTextOutput(JSON.stringify({data: filteredData}))
                .setMimeType(ContentService.MimeType.JSON);
        }
    } catch (error) {
        return ContentService.createTextOutput(JSON.stringify({error: error.toString()}))
            .setMimeType(ContentService.MimeType.JSON);
    }
}

// Nueva función para filtrar por período
function filterDataByPeriodo(data, periodo) {
    const filteredData = {};
    
    // Buscar pestañas que contengan el período
    const sheets = SpreadsheetApp.getActiveSpreadsheet().getSheets();
    
    sheets.forEach(sheet => {
        const sheetName = sheet.getName();
        
        // Si el nombre de la pestaña contiene el período
        if (sheetName.includes(periodo)) {
            // Agregar datos de esta pestaña al resultado
            const materiaName = sheetName.replace(' ' + periodo, '');
            filteredData[materiaName + ' ' + periodo] = processSheetData(sheet);
        }
    });
    
    return filteredData;
}
```

## 📊 Estructura de Datos Esperada

### Pestañas en Google Sheets
```
Tutoría P1
Lengua Materna P1
Inglés P1
Matemáticas P1
... (14 materias × 3 períodos = 42 pestañas)

Tutoría P2
Lengua Materna P2
Inglés P2
Matemáticas P2
... (siguientes 14 materias)

Tutoría P3
Lengua Materna P3
Inglés P3
Matemáticas P3
... (últimas 14 materias)
```

### Datos Filtrados
```javascript
// Resultado cuando se selecciona "Ana García" + "P2"
{
    "Tutoría P2": { /* datos de tutorías período 2 */ },
    "Lengua Materna P2": { /* datos de lengua período 2 */ },
    "Inglés P2": { /* datos de inglés período 2 */ },
    // ... solo materias del período 2
}
```

## 🎯 Beneficios de Esta Fase

✅ **Fácil de implementar** - Solo cambios menores en frontend  
✅ **Compatible con sistema actual** - No rompe funcionalidad existente  
✅ **Filtro efectivo** - Solo muestra datos del período seleccionado  
✅ **Interfaz intuitiva** - Radio buttons claros y familiares  
✅ **Responsive** - Funciona en móvil y desktop  

## 📱 Diseño Final Esperado

```
Consulta Rápida de Evaluaciones
├── Seleccionar Alumno: [dropdown]
├── Seleccionar Período: ○ P1  ○ P2  ○ P3  
└── [Consultar Calificaciones]

Resultado: "Ana García - Período 2"
├── Tutoría P2
├── Lengua Materna P2  
├── Inglés P2
└── ...
```

## 🚀 ¿Listo para implementar?
Esta Fase 1 es perfecta para validar el concepto antes de expandir a múltiples grados.