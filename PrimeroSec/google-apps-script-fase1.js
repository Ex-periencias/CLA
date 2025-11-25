// ========================================
// GOOGLE APPS SCRIPT - SISTEMA MULTIGRADO
// Versión: Fase 1 - Filtrado por Períodos
// ========================================

function doGet(e) {
    const action = e.parameter.action;
    const student = e.parameter.student;
    const periodo = e.parameter.periodo || 'P1'; // NUEVO: Parámetro para período
    
    try {
        if (action === 'getStudents') {
            // Obtener lista de estudiantes desde la hoja "Lista de Alumnos"
            const students = getStudentsList();
            return createJSONResponse({students: students});
            
        } else if (action === 'getStudentData') {
            // NUEVO: Obtener datos filtrados por período
            const data = getStudentDataByPeriodo(student, periodo);
            return createJSONResponse({data: data, student: student, periodo: periodo});
        }
    } catch (error) {
        console.error('Error en doGet:', error);
        return createJSONResponse({error: error.toString()});
    }
}

/**
 * Obtener lista de estudiantes desde la hoja "Lista de Alumnos"
 */
function getStudentsList() {
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    
    // Buscar la hoja de lista de alumnos (puede tener diferentes nombres)
    let studentsSheet = null;
    const sheetNames = ['Lista de Alumnos', 'Lista', 'Students', 'Alumnos'];
    
    for (let sheetName of sheetNames) {
        try {
            studentsSheet = spreadsheet.getSheetByName(sheetName);
            if (studentsSheet) break;
        } catch (error) {
            continue;
        }
    }
    
    if (!studentsSheet) {
        // Si no encuentra hoja específica, usar la primera hoja
        studentsSheet = spreadsheet.getSheets()[0];
    }
    
    const data = studentsSheet.getDataRange().getValues();
    const students = [];
    
    // Asumiendo que la primera columna tiene los nombres de estudiantes
    // y la segunda columna tiene el número de lista
    for (let i = 1; i < data.length; i++) { // Empezar en fila 2 (índice 1)
        if (data[i][0] && data[i][0].toString().trim() !== '') {
            students.push({
                numeroLista: data[i][0],
                nombre: data[i][1] || data[i][0] // Usar columna 1 o 2
            });
        }
    }
    
    return students;
}

/**
 * NUEVO: Obtener datos de estudiante filtrados por período
 */
function getStudentDataByPeriodo(studentName, periodo) {
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    const sheets = spreadsheet.getSheets();
    
    const filteredData = {};
    
    sheets.forEach(sheet => {
        const sheetName = sheet.getName();
        
        // NUEVO: Filtrar solo hojas que terminen con el período especificado
        if (sheetName.includes(periodo)) {
            console.log(`Procesando hoja: ${sheetName} para período ${periodo}`);
            
            try {
                const data = sheet.getDataRange().getValues();
                const studentData = processSheetDataForStudent(data, studentName);
                
                if (studentData && Object.keys(studentData).length > 0) {
                    // Usar el nombre de la hoja como clave (incluye el período)
                    filteredData[sheetName] = studentData;
                    console.log(`Datos encontrados en ${sheetName}:`, Object.keys(studentData));
                }
            } catch (error) {
                console.error(`Error procesando hoja ${sheetName}:`, error);
            }
        }
    });
    
    console.log(`Total de materias encontradas para ${studentName} en ${periodo}:`, Object.keys(filteredData).length);
    return filteredData;
}

/**
 * Procesar datos de una hoja específica para un estudiante
 */
function processSheetDataForStudent(data, studentName) {
    if (data.length < 2) return null;
    
    const studentData = {
        actividades: {},
        variantes: {},
        calificacionTotal: null
    };
    
    // Asumiendo estructura:
    // Fila 1: Headers (Actividad, Calificación, etc.)
    // Columna 1: Nombres de actividades
    // Columna 2: Valores de calificaciones
    
    for (let i = 1; i < data.length; i++) {
        const actividad = data[i][0];
        const calificacion = data[i][1];
        
        if (actividad && actividad.toString().trim() !== '') {
            const actividadTrim = actividad.toString().trim();
            const calificacionValue = procesarCalificacion(calificacion);
            
            // Determinar si es una variante (actividad extra)
            const isVariante = actividadTrim.toLowerCase().includes('extra') || 
                             actividadTrim.toLowerCase().includes('variante') ||
                             actividadTrim.toLowerCase().includes('optativa');
            
            if (isVariante) {
                studentData.variantes[actividadTrim] = calificacionValue;
            } else {
                studentData.actividades[actividadTrim] = calificacionValue;
            }
        }
    }
    
    // Calcular promedio si hay datos
    const todasLasCalificaciones = [
        ...Object.values(studentData.actividades),
        ...Object.values(studentData.variantes)
    ].filter(val => typeof val === 'number');
    
    if (todasLasCalificaciones.length > 0) {
        const suma = todasLasCalificaciones.reduce((acc, val) => acc + val, 0);
        studentData.calificacionTotal = suma / todasLasCalificaciones.length;
    }
    
    return studentData;
}

/**
 * Procesar valor de calificación para asegurar formato correcto
 */
function procesarCalificacion(valor) {
    if (valor === null || valor === undefined || valor === '') {
        return '-';
    }
    
    if (typeof valor === 'number') {
        return valor;
    }
    
    // Convertir string a número si es posible
    const numero = parseFloat(valor.toString());
    if (!isNaN(numero)) {
        return numero;
    }
    
    return valor.toString();
}

/**
 * Crear respuesta JSON con headers apropiados
 */
function createJSONResponse(data) {
    return ContentService
        .createTextOutput(JSON.stringify(data))
        .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Función para debug y testing
 */
function testGetStudentData() {
    const testData = getStudentDataByPeriodo('Ana García', 'P1');
    console.log('Test data:', JSON.stringify(testData, null, 2));
    return testData;
}

/**
 * Función para obtener lista de todas las pestañas (debug)
 */
function getAllSheets() {
    const sheets = SpreadsheetApp.getActiveSpreadsheet().getSheets();
    const sheetNames = sheets.map(sheet => sheet.getName());
    console.log('Todas las hojas disponibles:', sheetNames);
    return sheetNames;
}