// ========================================
// CONFIGURACIÓN DEL SISTEMA
// ========================================
// ⚠️ IMPORTANTE: Mantén un solo deployment de Google Apps Script.
// El script ahora usará la Hoja Maestra que configures en su código.
const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxFYdUf7OFn1KUjRqma091iZDNWnzHZx0-nkB_jwATPInu8TlOIilN8kcJOGQRlDWVizw/exec';

// ========================================
// ESTADO GLOBAL DE LA APLICACIÓN
// ========================================
let periods = [];
let students = [];
let currentPeriodSheetId = null;
let currentStudent = null;

// ========================================
// INICIALIZACIÓN
// ========================================
document.addEventListener('DOMContentLoaded', function () {
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

    // Inicializar selectores
    initializeSelectors();

    // Cargar periodos al iniciar
    showLoading('Cargando periodos y grupos...');
    try {
        await loadPeriods();
        hideLoading();
    } catch (error) {
        hideLoading();
        showError('Error al cargar la lista de periodos: ' + error.message);
        console.error('Error completo:', error);
    }
}

/**
 * Inicializar eventos
 */
function initializeSelectors() {
    const periodSelect = document.getElementById('periodSelect');
    periodSelect.addEventListener('change', handlePeriodSelection);

    const studentSelect = document.getElementById('studentSelect');
    studentSelect.addEventListener('change', handleStudentSelection);

    const consultButton = document.getElementById('consultButton');
    consultButton.addEventListener('click', function () {
        const selectedStudent = document.getElementById('studentSelect').value;
        if (selectedStudent && currentPeriodSheetId) {
            loadStudentData();
        }
    });

    document.getElementById('refreshButton')?.addEventListener('click', function () {
        if (currentStudent && currentPeriodSheetId) {
            loadStudentData();
        }
    });
}

/**
 * Carga la lista de periodos (hojas disponibles) desde la Hoja Maestra
 */
async function loadPeriods() {
    try {
        const response = await fetch(`${SCRIPT_URL}?action=getPeriods`, { redirect: 'follow' });
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Error HTTP: ${response.status} - ${errorText.substring(0, 200)}...`);
        }

        const data = await response.json();
        if (data.error) throw new Error(data.error);

        periods = data.periods || [];
        populatePeriodDropdown();

        if (periods.length === 0) {
            showError('No se encontraron periodos configurados en la Hoja Maestra.');
        }
    } catch (error) {
        console.error('Error al cargar periodos:', error);
        throw error;
    }
}

function populatePeriodDropdown() {
    const select = document.getElementById('periodSelect');
    select.innerHTML = '<option value="">-- Selecciona un periodo/grupo --</option>';

    // Obtener la ruta actual (ej: /Escuela/PrimeroA/index.html)
    // Convertimos a minúsculas y decodificamos por si hay espacios (%20)
    const currentPath = decodeURIComponent(window.location.pathname.toLowerCase());

    let periodsConfigurados = 0;

    periods.forEach(period => {
        // Obtenemos el identificador de la columna C (o lo dejamos vacío si no hay)
        const carpetaEsperada = (period.carpeta || '').toLowerCase().trim();

        // La magia de la carpeta: 
        // 1. Si NO configuraron la columna C en este periodo, lo mostramos SIEMPRE.
        // 2. Si SI la configuraron, validamos que la ruta actual (pathname) contenga ese texto.
        // Ej: Si la ruta es ".../PrimeroA/..." y la carpeta es "primeroa" -> Hace match
        if (carpetaEsperada === '' || currentPath.includes(carpetaEsperada)) {
            const option = document.createElement('option');
            option.value = period.sheetId; // Guardamos el ID del documento
            option.textContent = period.nombre; // Mostramos el nombre bonito
            select.appendChild(option);
            periodsConfigurados++;
        }
    });

    if (periodsConfigurados === 0) {
        showError('No hay periodos configurados para esta sección del sitio.');
    }
}

/**
 * Maneja la selección de un Periodo
 */
async function handlePeriodSelection(event) {
    const selectedSheetId = event.target.value;
    const studentSelectionRow = document.getElementById('studentSelectionRow');
    const studentSelect = document.getElementById('studentSelect');
    const consultButton = document.getElementById('consultButton');

    // Esconder resultados anteriores
    document.getElementById('results').style.display = 'none';
    consultButton.disabled = true;
    studentSelect.innerHTML = '<option value="">-- Selecciona un alumno --</option>';

    if (!selectedSheetId) {
        studentSelectionRow.style.display = 'none';
        currentPeriodSheetId = null;
        return;
    }

    currentPeriodSheetId = selectedSheetId;
    studentSelectionRow.style.display = 'block';

    // Cargar alumnos para este periodo en específico
    showLoading('Cargando alumnos de este grupo...');
    try {
        await loadStudentsForPeriod(selectedSheetId);
        hideLoading();
    } catch (error) {
        hideLoading();
        showError('Error al cargar alumnos: ' + error.message);
    }
}

/**
 * Carga la lista de estudiantes para el Periodo (Hoja de Google) seleccionada
 */
async function loadStudentsForPeriod(sheetId) {
    try {
        const response = await fetch(`${SCRIPT_URL}?action=getStudents&sheetId=${encodeURIComponent(sheetId)}`, { redirect: 'follow' });
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Error HTTP: ${response.status} - ${errorText.substring(0, 200)}...`);
        }

        const data = await response.json();
        if (data.error) throw new Error(data.error);

        students = data.students || [];
        populateStudentDropdown();

        if (students.length === 0) {
            showError('No se encontraron estudiantes en la hoja seleccionada.');
        }
    } catch (error) {
        throw error;
    }
}

function populateStudentDropdown() {
    const select = document.getElementById('studentSelect');
    select.innerHTML = '<option value="">-- Selecciona un alumno --</option>';

    students.forEach(student => {
        const option = document.createElement('option');
        option.value = student.nombre;
        option.textContent = `${student.numeroLista} - ${student.nombre}`;
        select.appendChild(option);
    });
}

function handleStudentSelection(event) {
    const selectedStudent = event.target.value;
    const consultButton = document.getElementById('consultButton');
    consultButton.disabled = !selectedStudent;
}

/**
 * Carga los datos de un estudiante utilizando el sheetId actual
 */
async function loadStudentData() {
    const studentSelect = document.getElementById('studentSelect');
    const selectedStudent = studentSelect.value;
    const consultButton = document.getElementById('consultButton');

    if (!selectedStudent || !currentPeriodSheetId) return;

    try {
        consultButton.disabled = true;
        showLoading(`Cargando calificaciones de ${selectedStudent}...`);
        hideError();
        hideNoData();

        // Pasamos accion, sheetId y el nombre del estudiante
        const url = `${SCRIPT_URL}?action=getStudentData&sheetId=${encodeURIComponent(currentPeriodSheetId)}&student=${encodeURIComponent(selectedStudent)}`;
        const response = await fetch(url, { redirect: 'follow' });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Error HTTP: ${response.status} - ${errorText.substring(0, 200)}...`);
        }

        const data = await response.json();
        if (data.error) throw new Error(data.error);

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
        showError('Error al cargar calificaciones: ' + error.message);
        consultButton.disabled = false;
    }
}

/**
 * Muestra los resultados en pantalla
 */
function displayStudentResults(data) {
    const studentNameElement = document.getElementById('studentName');
    const studentMetaElement = document.getElementById('studentMeta');

    // Actualizar nombre del estudiante
    studentNameElement.textContent = data.student;

    // Cambiar "Evaluaciones 1°A" al título del periodo seleccionado
    const periodSelect = document.getElementById('periodSelect');
    const periodName = periodSelect.options[periodSelect.selectedIndex].text;
    studentMetaElement.textContent = `Calificaciones - ${periodName}`;
    document.querySelector('.system-title').textContent = periodName; // Actualizamos también el título general de arriba

    const resultsContainer = document.getElementById('results');
    resultsContainer.style.display = 'block';

    renderMaterias(data.data);
}

function renderMaterias(studentData) {
    const container = document.getElementById('materiasContainer');
    container.innerHTML = '';

    Object.keys(studentData).forEach(materiaName => {
        const materiaData = studentData[materiaName];
        const materiaCard = createMateriaCard(materiaName, materiaData);
        container.appendChild(materiaCard);
    });
}

function createMateriaCard(materiaName, materiaData) {
    const card = document.createElement('div');
    card.className = 'materia-card fade-in';

    const header = document.createElement('div');
    header.className = 'materia-header';

    const title = document.createElement('h3');
    title.className = 'materia-title';
    title.textContent = materiaName;
    header.appendChild(title);

    if (materiaData.calificacionReal !== undefined && materiaData.calificacionReal !== null) {
        const promedioElement = document.createElement('div');
        promedioElement.className = 'materia-promedio';
        promedioElement.textContent = formatValue(materiaData.calificacionReal);
        header.appendChild(promedioElement);
    } else if (materiaData.calificacionTotal !== undefined && materiaData.calificacionTotal !== null) {
        const promedioElement = document.createElement('div');
        promedioElement.className = 'materia-promedio';
        promedioElement.textContent = formatValue(materiaData.calificacionTotal);
        header.appendChild(promedioElement);
    }

    card.appendChild(header);

    const actividadesContainer = document.createElement('div');
    actividadesContainer.className = 'materia-actividades';
    const actividadesList = document.createElement('ul');
    actividadesList.className = 'actividades-list';

    if (materiaData.actividades && Array.isArray(materiaData.actividades)) {
        materiaData.actividades.forEach(item => {
            actividadesList.appendChild(createActividadItem(item.nombre, item.valor));
        });

        if (materiaData.variantes && Array.isArray(materiaData.variantes)) {
            materiaData.variantes.forEach(item => {
                actividadesList.appendChild(createActividadItem(item.nombre, item.valor));
            });
        }
    }

    actividadesContainer.appendChild(actividadesList);
    card.appendChild(actividadesContainer);

    return card;
}

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

function formatValue(value) {
    if (value === null || value === undefined || value === '') return '-';
    if (typeof value === 'number') return Number.isInteger(value) ? value.toString() : value.toFixed(2);
    return value.toString();
}

function showLoading(message) {
    const loadingElement = document.getElementById('loading');
    const loadingText = loadingElement.querySelector('p');
    loadingText.textContent = message || 'Cargando datos...';
    loadingElement.style.display = 'block';
}

function hideLoading() {
    document.getElementById('loading').style.display = 'none';
}

function showError(message) {
    const errorElement = document.getElementById('error');
    document.getElementById('errorMessage').innerHTML = message;
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

function validateConfig() {
    if (SCRIPT_URL === 'TU_GOOGLE_APPS_SCRIPT_URL_AQUI' || !SCRIPT_URL.includes('script.google.com')) {
        return { valid: false, message: 'URL del Google Apps Script no configurada.' };
    }
    return { valid: true };
}

function reloadPage() {
    window.location.reload();
}

window.hideError = hideError;
window.reloadPage = reloadPage;