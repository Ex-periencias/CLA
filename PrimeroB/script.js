// ========================================
// CONFIGURACIÓN DEL SISTEMA
// ========================================
// ⚠️ IMPORTANTE: Reemplaza esta URL con la de tu Google Apps Script desplegado
// Para obtenerla: Google Apps Script → Deploy → New deployment → Web app → Copy URL
// Esta es para Primero B
const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbz7kd8S5jJLUX9nE3ahjc830iPFxczMP8TrZ9yv9XH2RvqPNYN_Che51c_Z5JtR6r7Z/exec';

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
        
        console.log('=== INICIO CONSULTA ===');
        console.log('Estudiante seleccionado:', selectedStudent);
        console.log('URL:', SCRIPT_URL);
        
        // Solicitud simplificada - sin parámetros de grupo ni período
        const response = await fetch(`${SCRIPT_URL}?action=getStudentData&student=${encodeURIComponent(selectedStudent)}`);
        
        console.log('Response status:', response.status);
        
        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Debug: Mostrar estructura completa de datos recibidos
        console.log('=== DATA RECIBIDA ===');
        console.log('Estudiante:', data.student);
        console.log('Materias:', Object.keys(data.data || {}));
        
        // Mostrar detalle de cada materia
        if (data.data) {
            Object.keys(data.data).forEach(materia => {
                const mData = data.data[materia];
                console.log(`\nMateria: ${materia}`);
                console.log('  - calificacionTotal:', mData.calificacionTotal);
                console.log('  - calificacionReal:', mData.calificacionReal);
                console.log('  - actividades:', mData.actividades);
                console.log('  - variantes:', mData.variantes);
                console.log('  - Tipo actividades:', Array.isArray(mData.actividades) ? 'Array' : typeof mData.actividades);
            });
        }
        
        if (data.error) {
            throw new Error(data.error);
        }
        
        if (!data.data || Object.keys(data.data).length === 0) {
            console.log('No se encontraron datos para el estudiante');
            showNoData();
            hideLoading();
            consultButton.disabled = false;
            return;
        }
        
        console.log('\n=== MATERIAS ENCONTRADAS ===');
        console.log('Total:', Object.keys(data.data).length);
        
        currentStudent = data;
        displayStudentResults(data);
        hideLoading();
        consultButton.disabled = false;
        
        console.log('=== CONSULTA EXITOSA ===');
        
    } catch (error) {
        console.error('Error completo:', error);
        hideLoading();
        showError('Error al cargar datos: ' + error.message + 
                 '<br><br><strong>Verifica:</strong><br>' +
                 '- Que el deployment esté actualizado<br>' +
                 '- Ver detalles en la consola (F12)');
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
 * NOTA: Ahora acepta arrays de objetos {nombre, valor} para mantener el orden
 * También兼容 con estructura anterior de objetos {nombre: valor}
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
    
    // Calificación Final de la materia
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
    
    // Debug: Mostrar estructura de datos recibida
    console.log(`Renderizando materia: ${materiaName}`);
    console.log('Tipo de actividades:', Array.isArray(materiaData.actividades) ? 'Array' : 'Objeto');
    console.log('Actividades:', materiaData.actividades);
    
    // Verificar si hay actividades para mostrar
    let hayActividades = false;
    
    //兼容: NUEVA estructura (arrays) vs ANTIGUA estructura (objetos)
    if (materiaData.actividades && Array.isArray(materiaData.actividades)) {
        // Nueva estructura con arrays
        if (materiaData.actividades.length > 0) {
            hayActividades = true;
            materiaData.actividades.forEach(item => {
                const listItem = createActividadItem(item.nombre, item.valor);
                actividadesList.appendChild(listItem);
            });
        }
        
        // Variantes
        if (materiaData.variantes && Array.isArray(materiaData.variantes) && materiaData.variantes.length > 0) {
            hayActividades = true;
            materiaData.variantes.forEach(item => {
                const listItem = createActividadItem(item.nombre, item.valor);
                actividadesList.appendChild(listItem);
            });
        }
    } else if (materiaData.actividades && typeof materiaData.actividades === 'object') {
        // Antigua estructura con objetos (para compatibilidad)
        Object.keys(materiaData.actividades).forEach(activityName => {
            const value = materiaData.actividades[activityName];
            // Excluir Calificación Total/Final
            if (!isCalificacionTotal(activityName)) {
                hayActividades = true;
                const listItem = createActividadItem(activityName, value);
                actividadesList.appendChild(listItem);
            }
        });
        
        // Variantes
        if (materiaData.variantes && typeof materiaData.variantes === 'object') {
            Object.keys(materiaData.variantes).forEach(variantName => {
                const value = materiaData.variantes[variantName];
                if (!isCalificacionTotal(variantName)) {
                    hayActividades = true;
                    const listItem = createActividadItem(variantName, value);
                    actividadesList.appendChild(listItem);
                }
            });
        }
    }
    
    console.log('Hay actividades:', hayActividades);
    
    actividadesContainer.appendChild(actividadesList);
    card.appendChild(actividadesContainer);
    
    return card;
}

/**
 * Verificar si el nombre es Calificación Total/Final (para compatibilidad)
 */
function isCalificacionTotal(texto) {
    if (!texto) return false;
    const textoLower = texto.toString().trim().toLowerCase();
    return textoLower.includes('calificación total') || 
           textoLower.includes('calificacion total') ||
           textoLower.includes('calificación final') ||
           textoLower.includes('calificacion final');
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
