// ========================================
// CONFIGURACIÓN DEL SISTEMA
// ========================================
// ⚠️ IMPORTANTE: Reemplaza esta URL con la de tu Google Apps Script desplegado
// Para obtenerla: Google Apps Script → Deploy → New deployment → Web app → Copy URL
const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyUw0tDPdwXsLPND5AuY2mcvHLc__peS4gTQYYARuNXNbUIP0Fd8p6JFFQdI3o3zUKeww/exec';

// ========================================
// ESTADO GLOBAL DE LA APLICACIÓN
// ========================================
let students = [];
let currentStudent = null;

// ========================================
// INICIALIZACIÓN
// ========================================
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

// Función principal de inicialización
async function initializeApp() {
    // Validar configuración
    const configCheck = validateConfig();
    if (!configCheck.valid) {
        showError(configCheck.message);
        return;
    }
    
    // Inicializar selector de estudiantes
    initializeStudentSelector();
    
    // Inicializar botón de consulta
    initializeConsultButton();
    
    // Cargar estudiantes al iniciar
    showLoading('Cargando lista de estudiantes...');
    try {
        await loadStudents();
        hideLoading();
    } catch (error) {
        hideLoading();
        showError('Error al cargar estudiantes: ' + error.message + 
                 '<br><br><strong>Verifica:</strong><br>' +
                 '- Que la URL del Google Apps Script sea correcta<br>' +
                 '- Que la hoja se llame "Lista de Alumnos"<br>' +
                 '- Que los nombres estén en la Columna B');
        console.error('Error completo:', error);
    }
}

/**
 * Inicializar selector de estudiantes
 */
function initializeStudentSelector() {
    const studentSelect = document.getElementById('studentSelect');
    studentSelect.addEventListener('change', handleStudentSelection);
}

/**
 * Inicializar botón de consulta
 */
function initializeConsultButton() {
    const consultButton = document.getElementById('consultButton');
    consultButton.addEventListener('click', function() {
        const selectedStudent = document.getElementById('studentSelect').value;
        if (selectedStudent) {
            loadStudentData();
        } else {
            showError('Por favor selecciona un estudiante');
        }
    });
}

/**
 * Maneja la selección de un estudiante
 */
function handleStudentSelection(event) {
    const selectedStudent = event.target.value;
    const consultButton = document.getElementById('consultButton');
    
    // Habilitar o deshabilitar el botón según haya selección
    consultButton.disabled = !selectedStudent;
    
    // Ocultar resultados anteriores al cambiar de estudiante
    if (!selectedStudent) {
        document.getElementById('results').style.display = 'none';
    }
}

/**
 * Carga la lista de estudiantes desde Google Apps Script
 */
async function loadStudents() {
    try {
        console.log('Cargando estudiantes...');
        console.log('URL del script:', SCRIPT_URL);
        
        const response = await fetch(`${SCRIPT_URL}?action=getStudents`);
        
        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status} - ${response.statusText}`);
        }
        
        const data = await response.json();
        
        if (data.error) {
            throw new Error(data.error);
        }
        
        students = data.students || [];
        populateStudentDropdown();
        console.log('Estudiantes cargados:', students.length);
        
        if (students.length === 0) {
            showError('No se encontraron estudiantes en la hoja "Lista de Alumnos".<br><br>Verifica que:<br>• La hoja exista y se llame exactamente "Lista de Alumnos"<br>• Los nombres estén en la Columna B');
        }
        
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
    
    if (students.length === 0) {
        console.log('No hay estudiantes en la lista');
        return;
    }
    
    students.forEach(student => {
        const option = document.createElement('option');
        option.value = student.nombre;
        option.textContent = `${student.numeroLista} - ${student.nombre}`;
        select.appendChild(option);
    });
}

/**
 * Carga los datos de un estudiante específico
 */
async function loadStudentData() {
    const studentSelect = document.getElementById('studentSelect');
    const selectedStudent = studentSelect.value;
    const consultButton = document.getElementById('consultButton');
    
    if (!selectedStudent) {
        showError('Por favor selecciona un estudiante');
        return;
    }
    
    try {
        // Deshabilitar botón y mostrar loading
        consultButton.disabled = true;
        showLoading(`Cargando datos de ${selectedStudent}...`);
        hideError();
        hideNoData();
        
        // Solicitud simplificada - sin parámetros de grupo ni período
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
            hideLoading();
            consultButton.disabled = false;
            return;
        }
        
        currentStudent = data;
        displayStudentResults(data);
        hideLoading();
        consultButton.disabled = false;
        
    } catch (error) {
        hideLoading();
        showError('Error al cargar datos: ' + error.message + 
                 '<br><br><strong>Verifica:</strong><br>' +
                 '- Que el nombre del estudiante coincida exactamente<br>' +
                 '- Que existan pestañas con las materias<br>' +
                 '- Ver detalles en la consola (F12)');
        console.error('Error completo:', error);
        consultButton.disabled = false;
    }
}

/**
 * Muestra los resultados del estudiante en la interfaz
 */
function displayStudentResults(data) {
    // Actualizar nombre del estudiante
    const studentNameElement = document.getElementById('studentName');
    const studentMetaElement = document.getElementById('studentMeta');
    
    studentNameElement.textContent = data.student;
    studentMetaElement.textContent = 'Calificaciones del Alumno';
    
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
    title.textContent = materiaName;
    
    header.appendChild(title);
    
    // Calificación Real de "Calificación Total"
    if (materiaData.calificacionReal !== undefined && materiaData.calificacionReal !== null) {
        const promedioElement = document.createElement('div');
        promedioElement.className = 'materia-promedio';
        promedioElement.textContent = formatValue(materiaData.calificacionReal);
        header.appendChild(promedioElement);
    } else if (materiaData.calificacionTotal !== undefined) {
        const promedioElement = document.createElement('div');
        promedioElement.className = 'materia-promedio';
        promedioElement.textContent = formatValue(materiaData.calificacionTotal);
        header.appendChild(promedioElement);
    }
    
    card.appendChild(header);
    
    // Lista de actividades
    const actividadesContainer = document.createElement('div');
    actividadesContainer.className = 'materia-actividades';
    
    const actividadesList = document.createElement('ul');
    actividadesList.className = 'actividades-list';
    
    // Agregar actividades regulares (EXCLUYENDO 'Calificación total')
    if (materiaData.actividades) {
        Object.keys(materiaData.actividades).forEach(activityName => {
            const value = materiaData.actividades[activityName];
            
            // EXCLUIR 'Calificación total' de la lista
            if (activityName.toLowerCase().includes('calificación total') || 
                activityName.toLowerCase().includes('calificacion total')) {
                return;
            }
            
            const listItem = createActividadItem(activityName, value);
            actividadesList.appendChild(listItem);
        });
    }
    
    // Agregar actividades variantes (EXCLUYENDO 'Calificación total')
    if (materiaData.variantes) {
        Object.keys(materiaData.variantes).forEach(variantName => {
            const value = materiaData.variantes[variantName];
            
            if (variantName.toLowerCase().includes('calificación total') || 
                variantName.toLowerCase().includes('calificacion total')) {
                return;
            }
            
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
    
    errorMessageElement.innerHTML = message;
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
 * Validación de configuración
 */
function validateConfig() {
    if (SCRIPT_URL === 'TU_GOOGLE_APPS_SCRIPT_URL_AQUI' || 
        SCRIPT_URL === '' || 
        !SCRIPT_URL.includes('script.google.com')) {
        return {
            valid: false,
            message: '⚠️ CONFIGURACIÓN REQUERIDA\n\n' +
                    'La URL del Google Apps Script no está configurada.\n\n' +
                    'Pasos para configurar:\n' +
                    '1. Abre el archivo script.js\n' +
                    '2. En la línea 6, reemplaza "TU_GOOGLE_APPS_SCRIPT_URL_AQUI"\n' +
                    '3. Por la URL de tu deployment (https://script.google.com/macros/s/.../exec)'
        };
    }
    return { valid: true };
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

// Exportar funciones para uso global
window.hideError = hideError;
window.reloadPage = reloadPage;

