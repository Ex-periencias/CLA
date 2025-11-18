// Configuración - Reemplaza con la URL de tu Google Apps Script
const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzvmrVI_Pe4n9fqJSpGRzbJiEvIEuwVCeTdgoMnlqFHIJf5W9brXYB6-MYYnfihE0oCQg/exec';

// Estado global de la aplicación
let students = [];
let currentStudent = null;

// Inicialización cuando se carga la página
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

// Función principal de inicialización
async function initializeApp() {
    try {
        showLoading();
        await loadStudents();
        hideLoading();
    } catch (error) {
        hideLoading();
        showError('Error al cargar la lista de estudiantes: ' + error.message);
    }
}

/**
 * Carga la lista de estudiantes desde Google Apps Script
 */
async function loadStudents() {
    try {
        const response = await fetch(`${SCRIPT_URL}?action=getStudents`);
        
        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.error) {
            throw new Error(data.error);
        }
        
        students = data.students || [];
        populateStudentDropdown();
        
    } catch (error) {
        console.error('Error al cargar estudiantes:', error);
        throw error;
    }
}

/**
 * Llena el dropdown con la lista de estudiantes
 */
function populateStudentDropdown() {
    const select = document.getElementById('studentSelect');
    select.innerHTML = '<option value="">-- Selecciona un alumno --</option>';
    
    students.forEach(student => {
        const option = document.createElement('option');
        option.value = student.nombre;
        option.textContent = `${student.numeroLista} - ${student.nombre}`;
        select.appendChild(option);
    });
    
    // Agregar event listener
    select.addEventListener('change', handleStudentSelection);
}

/**
 * Maneja la selección de un estudiante
 */
function handleStudentSelection(event) {
    const selectedStudent = event.target.value;
    const consultButton = document.getElementById('consultButton');
    
    if (selectedStudent) {
        consultButton.disabled = false;
        consultButton.addEventListener('click', loadStudentData);
    } else {
        consultButton.disabled = true;
        consultButton.removeEventListener('click', loadStudentData);
    }
}

/**
 * Carga los datos de un estudiante específico
 */
async function loadStudentData() {
    const studentSelect = document.getElementById('studentSelect');
    const selectedStudent = studentSelect.value;
    
    if (!selectedStudent) {
        showError('Por favor selecciona un estudiante');
        return;
    }
    
    try {
        showLoading();
        hideError();
        hideNoData();
        
        const response = await fetch(`${SCRIPT_URL}?action=getStudentData&student=${encodeURIComponent(selectedStudent)}`);
        
        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.error) {
            throw new Error(data.error);
        }
        
        if (!data.data || Object.keys(data.data).length === 0) {
            showNoData();
            return;
        }
        
        currentStudent = data;
        displayStudentResults(data);
        
    } catch (error) {
        hideLoading();
        showError('Error al cargar datos del estudiante: ' + error.message);
    }
}

/**
 * Muestra los resultados del estudiante en la interfaz
 */
function displayStudentResults(data) {
    // Actualizar nombre del estudiante
    const studentNameElement = document.getElementById('studentName');
    studentNameElement.textContent = `Resultados para el Alumno: ${data.student}`;
    
    // Mostrar contenedor de resultados
    const resultsContainer = document.getElementById('results');
    resultsContainer.style.display = 'block';
    
    // Renderizar materias
    renderMaterias(data.data);
    
    hideLoading();
}

/**
 * Renderiza todas las materias del estudiante
 */
function renderMaterias(studentData) {
    const container = document.getElementById('materiasContainer');
    container.innerHTML = '';
    
    Object.keys(studentData).forEach(materiaName => {
        const materiaData = studentData[materiaName];
        const materiaCard = createMateriaCard(materiaName, materiaData);
        container.appendChild(materiaCard);
    });
}

/**
 * Crea una card para una materia específica
 */
function createMateriaCard(materiaName, materiaData) {
    const card = document.createElement('div');
    card.className = 'materia-card';
    
    // Header de la materia
    const header = document.createElement('div');
    header.className = 'materia-header';
    header.textContent = materiaName;
    
    // Tabla de la materia
    const table = document.createElement('table');
    table.className = 'materia-table';
    
    // Crear tbody
    const tbody = document.createElement('tbody');
    
    // Fila de materia
    const materiaRow = createTableRow('Materia', materiaName, 'activity-cell');
    tbody.appendChild(materiaRow);
    
    // Filas de actividades
    if (materiaData.actividades) {
        Object.keys(materiaData.actividades).forEach(activityName => {
            const value = materiaData.actividades[activityName];
            const row = createTableRow(activityName, value, 'activity-cell');
            tbody.appendChild(row);
        });
    }
    
    // Filas de variantes
    if (materiaData.variantes) {
        Object.keys(materiaData.variantes).forEach(variantName => {
            const value = materiaData.variantes[variantName];
            const row = createTableRow(variantName, value, 'variant-cell');
            tbody.appendChild(row);
        });
    }
    
    // Fila de calificación total
    if (materiaData.calificacionTotal !== undefined) {
        const totalRow = createTableRow('Calificación Total', materiaData.calificacionTotal, 'total-cell');
        tbody.appendChild(totalRow);
    }
    
    table.appendChild(tbody);
    card.appendChild(header);
    card.appendChild(table);
    
    return card;
}

/**
 * Crea una fila de tabla
 */
function createTableRow(label, value, cssClass) {
    const row = document.createElement('tr');
    
    const labelCell = document.createElement('td');
    labelCell.textContent = label;
    labelCell.className = cssClass;
    
    const valueCell = document.createElement('td');
    valueCell.textContent = formatValue(value);
    valueCell.className = cssClass;
    
    row.appendChild(labelCell);
    row.appendChild(valueCell);
    
    return row;
}

/**
 * Formatea el valor para mostrarlo correctamente
 */
function formatValue(value) {
    if (value === null || value === undefined || value === '') {
        return '-';
    }
    
    // Si es un número, formatear con decimales apropiados
    if (typeof value === 'number') {
        if (Number.isInteger(value)) {
            return value.toString();
        } else {
            return value.toFixed(2);
        }
    }
    
    return value.toString();
}

/**
 * Funciones de utilidad para mostrar/ocultar elementos
 */
function showLoading() {
    document.getElementById('loading').style.display = 'block';
}

function hideLoading() {
    document.getElementById('loading').style.display = 'none';
}

function showError(message) {
    const errorElement = document.getElementById('error');
    const errorMessageElement = document.getElementById('errorMessage');
    
    errorMessageElement.textContent = message;
    errorElement.style.display = 'block';
}

function hideError() {
    document.getElementById('error').style.display = 'none';
}

function showNoData() {
    document.getElementById('noData').style.display = 'block';
}

function hideNoData() {
    document.getElementById('noData').style.display = 'none';
}

/**
 * Función para actualizar datos (botón refresh)
 */
document.getElementById('refreshButton')?.addEventListener('click', function() {
    if (currentStudent) {
        loadStudentData();
    }
});

/**
 * Función para recargar la página
 */
function reloadPage() {
    window.location.reload();
}

/**
 * Validación de configuración
 */
function validateConfig() {
    if (SCRIPT_URL === 'https://script.google.com/macros/s/AKfycbzvmrVI_Pe4n9fqJSpGRzbJiEvIEuwVCeTdgoMnlqFHIJf5W9brXYB6-MYYnfihE0oCQg/exec') {
        console.warn('⚠️  Recuerda configurar la URL de tu Google Apps Script en script.js');
        return false;
    }
    return true;
}

/**
 * Función de debugging
 */
async function debugConnection() {
    try {
        console.log('🔍 Probando conexión con Google Apps Script...');
        const response = await fetch(`${SCRIPT_URL}?action=getDebugInfo`);
        const data = await response.json();
        console.log('📊 Información de debug:', data);
        return data;
    } catch (error) {
        console.error('❌ Error en debug:', error);
        return null;
    }
}

// Exportar funciones para uso global
window.hideError = hideError;
window.reloadPage = reloadPage;
window.debugConnection = debugConnection;

// Verificar configuración al cargar
document.addEventListener('DOMContentLoaded', function() {
    validateConfig();
});

// Auto-refresh cada 5 minutos (opcional, descomentar si se desea)
// setInterval(() => {
//     if (currentStudent) {
//         loadStudentData();
//     }
// }, 300000); // 5 minutos
