// Configuración - Reemplaza con la URL de tu Google Apps Script
const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzWS8w7cI6hGS5Gq3goiaLKHqz1hADJXCA39T9W8Ib0mcmftFHGhGsOV5DywytcmBq2fQ/exec';

// Estado global de la aplicación
let students = [];
let currentStudent = null;
let selectedPeriodo = 'P1'; // NUEVO: Período seleccionado por defecto

// Inicialización cuando se carga la página
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

// Función principal de inicialización
async function initializeApp() {
    try {
        showLoading();
        await loadStudents();
        initializePeriodoSelector(); // NUEVO: Inicializar selector de períodos
        hideLoading();
    } catch (error) {
        hideLoading();
        showError('Error al cargar la lista de estudiantes: ' + error.message);
    }
}

/**
 * NUEVO: Inicializar selector de períodos
 */
function initializePeriodoSelector() {
    // Agregar listeners a radio buttons
    document.querySelectorAll('input[name="periodo"]').forEach(radio => {
        radio.addEventListener('change', function() {
            selectedPeriodo = this.value;
            console.log('Período seleccionado:', selectedPeriodo);
        });
    });
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
    const consultButton = document.getElementById('consultButton');
    const currentPeriodo = getSelectedPeriodo(); // NUEVO: Obtener período seleccionado
    
    if (!selectedStudent) {
        showError('Por favor selecciona un estudiante');
        return;
    }
    
    try {
        // Deshabilitar botón y mostrar loading
        consultButton.disabled = true;
        showLoading(`Cargando datos de ${selectedStudent} para ${currentPeriodo}...`);
        hideError();
        hideNoData();
        
        const response = await fetch(`${SCRIPT_URL}?action=getStudentData&student=${encodeURIComponent(selectedStudent)}&periodo=${currentPeriodo}`);
        
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
        hideLoading();
        // Re-habilitar botón después de cargar exitosamente
        document.getElementById('consultButton').disabled = false;
        
    } catch (error) {
        hideLoading();
        showError('Error al cargar datos del estudiante: ' + error.message);
        // Re-habilitar botón en caso de error
        document.getElementById('consultButton').disabled = false;
    }
}

/**
 * Muestra los resultados del estudiante en la interfaz
 */
function displayStudentResults(data) {
    // Actualizar nombre del estudiante
    const studentNameElement = document.getElementById('studentName');
    const studentMetaElement = document.getElementById('studentMeta');
    const currentPeriodo = getSelectedPeriodo();
    
    studentNameElement.textContent = data.student;
    studentMetaElement.textContent = `Período seleccionado: ${currentPeriodo}`;
    
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
 * Crea una tarjeta profesional para una materia específica
 */
function createMateriaCard(materiaName, materiaData) {
    const card = document.createElement('div');
    card.className = 'materia-card fade-in';
    
    // Header de la materia
    const header = document.createElement('div');
    header.className = 'materia-header';
    
    // Título de la materia
    const title = document.createElement('h3');
    title.className = 'materia-title';
    title.textContent = materiaName.replace(/\s+P[1-3]$/, ''); // Quitar período del nombre
    
    header.appendChild(title);
    
    // Calificación promedio
    if (materiaData.calificacionTotal !== undefined) {
        const promedioElement = document.createElement('div');
        promedioElement.className = 'materia-promedio';
        promedioElement.textContent = formatValue(materiaData.calificacionTotal);
        
        // Clasificar calificación por color
        const promedio = materiaData.calificacionTotal;
        if (promedio >= 7) {
            promedioElement.classList.add('aprobado');
        } else if (promedio >= 6) {
            promedioElement.classList.add('alerta');
        } else {
            promedioElement.classList.add('reprobado');
        }
        
        header.appendChild(promedioElement);
        
        // Estado de la materia
        const statusElement = document.createElement('div');
        statusElement.className = 'materia-status';
        statusElement.textContent = promedio >= 7 ? 'Aprobado' : promedio >= 6 ? 'En Riesgo' : 'Reprobado';
        header.appendChild(statusElement);
    }
    
    card.appendChild(header);
    
    // Lista de actividades
    const actividadesContainer = document.createElement('div');
    actividadesContainer.className = 'materia-actividades';
    
    const actividadesList = document.createElement('ul');
    actividadesList.className = 'actividades-list';
    
    // Agregar actividades regulares
    if (materiaData.actividades) {
        Object.keys(materiaData.actividades).forEach(activityName => {
            const value = materiaData.actividades[activityName];
            const listItem = createActividadItem(activityName, value);
            actividadesList.appendChild(listItem);
        });
    }
    
    // Agregar actividades variantes
    if (materiaData.variantes) {
        Object.keys(materiaData.variantes).forEach(variantName => {
            const value = materiaData.variantes[variantName];
            const listItem = createActividadItem(variantName, value);
            actividadesList.appendChild(listItem);
        });
    }
    
    actividadesContainer.appendChild(actividadesList);
    card.appendChild(actividadesContainer);
    
    return card;
}

/**
 * Crea un elemento de lista para una actividad específica
 */
function createActividadItem(activityName, value) {
    const listItem = document.createElement('li');
    listItem.className = 'actividad-item';
    
    const nombreElement = document.createElement('span');
    nombreElement.className = 'actividad-nombre';
    nombreElement.textContent = activityName;
    
    const calificacionElement = document.createElement('span');
    calificacionElement.className = 'actividad-calificacion';
    calificacionElement.textContent = formatValue(value);
    
    listItem.appendChild(nombreElement);
    listItem.appendChild(calificacionElement);
    
    return listItem;
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
function showLoading(message) {
    const loadingElement = document.getElementById('loading');
    const loadingText = loadingElement.querySelector('p');
    
    if (message) {
        loadingText.textContent = message;
    } else {
        loadingText.textContent = 'Cargando datos...';
    }
    
    loadingElement.style.display = 'block';
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
 * NUEVO: Función para obtener el período seleccionado
 */
function getSelectedPeriodo() {
    const radio = document.querySelector('input[name="periodo"]:checked');
    return radio ? radio.value : 'P1';
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
    if (SCRIPT_URL === 'TU_GOOGLE_APPS_SCRIPT_URL_AQUI') {
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
