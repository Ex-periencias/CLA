/**
 * Google Apps Script CORREGIDO para Control de Actividades y Seguimiento de Alumnos
 * Versión corregida para manejar múltiples filas de alumnos por materia
 */

// CONFIGURACIÓN: Reemplaza con el ID de tu Google Sheet
const SHEET_ID = 'TU_GOOGLE_SHEET_ID_AQUI';

// Función principal que se ejecuta como Web App
function doGet(e) {
  try {
    const action = e.parameter.action || 'getStudents';
    
    switch (action) {
      case 'getStudents':
        return getStudentsList();
      case 'getStudentData':
        const studentName = e.parameter.student;
        return getStudentData(studentName);
      case 'getAllData':
        return getAllData();
      default:
        return ContentService
          .createTextOutput(JSON.stringify({error: 'Acción no válida'}))
          .setMimeType(ContentService.MimeType.JSON);
    }
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({error: error.toString()}))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Obtiene la lista de todos los alumnos
 */
function getStudentsList() {
  try {
    const spreadsheet = SpreadsheetApp.openById(SHEET_ID);
    const sheet = spreadsheet.getSheetByName('Lista Alumnos'); // Primera pestaña con lista de alumnos
    
    if (!sheet) {
      throw new Error('No se encontró la hoja "Lista Alumnos"');
    }
    
    const data = sheet.getDataRange().getValues();
    const students = [];
    
    console.log('Datos de lista de alumnos:', data); // Para debug
    
    // Asumiendo que la columna A tiene el número de lista y B el nombre
    for (let i = 1; i < data.length; i++) { // Empezar desde la fila 1 (índice 1) para skip header
      if (data[i][0] && data[i][1]) { // Verificar que no estén vacías
        students.push({
          numeroLista: data[i][0],
          nombre: data[i][1]
        });
      }
    }
    
    console.log('Estudiantes encontrados:', students); // Para debug
    
    return ContentService
      .createTextOutput(JSON.stringify({students: students}))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    console.error('Error en getStudentsList:', error); // Para debug
    return ContentService
      .createTextOutput(JSON.stringify({error: error.toString()}))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Obtiene todos los datos de un estudiante específico
 * VERSIÓN CORREGIDA para buscar en todas las filas
 */
function getStudentData(studentName) {
  try {
    console.log('Buscando datos para:', studentName); // Para debug
    
    const spreadsheet = SpreadsheetApp.openById(SHEET_ID);
    const sheets = spreadsheet.getSheets();
    
    const studentData = {};
    const materias = [];
    
    // Iterar por todas las hojas excepto la primera (lista de alumnos)
    for (let i = 1; i < sheets.length; i++) {
      const sheet = sheets[i];
      const sheetName = sheet.getName();
      console.log('Procesando hoja:', sheetName); // Para debug
      
      materias.push(sheetName);
      
      // Obtener datos de la hoja
      const lastRow = sheet.getLastRow();
      const lastCol = sheet.getLastColumn();
      
      if (lastRow < 3) {
        console.log('Hoja', sheetName, 'no tiene suficientes datos'); // Para debug
        continue;
      }
      
      // Obtener datos completos (para buscar estudiante) y datos de actividades (para valores)
      const allData = sheet.getRange(3, 1, lastRow - 2, lastCol).getValues();
      const activityData = sheet.getRange(3, 3, lastRow - 2, lastCol - 2).getValues();
      
      console.log('Datos de', sheetName, ':', allData.length, 'filas'); // Para debug
      
      // Buscar al estudiante en todas las filas de datos
      let studentFound = false;
      for (let rowIndex = 0; rowIndex < allData.length; rowIndex++) {
        const row = allData[rowIndex];
        const studentNameInSheet = (row[1] || '').toString().trim(); // Columna B
        const studentNumberInSheet = row[0]; // Columna A
        
        console.log('Comparando:', studentName, 'con:', studentNameInSheet); // Para debug
        
        // Comparación más flexible para manejar espacios y mayúsculas
        if (studentNameInSheet === studentName.trim()) {
          studentFound = true;
          console.log('¡Estudiante encontrado en', sheetName, '!'); // Para debug
          
          // Extraer encabezados de actividades (fila 2, desde columna C hasta donde haya datos)
          const headers = [];
          const headersRange = sheet.getRange(2, 3, 1, lastCol - 2).getValues()[0]; // Fila 2, desde columna C
          
          for (let col = 0; col < headersRange.length; col++) {
            if (headersRange[col]) {
              headers.push({
                arrayIndex: col, // Índice directo en el array (empieza desde 0 para columna C)
                excelColumn: col + 3, // Columna real en Excel (C=3, D=4, etc.)
                name: headersRange[col]
              });
            }
          }
          
          console.log('Encabezados encontrados:', headers); // Para debug
          
          // Procesar actividades, variantes y totales
          const actividades = {};
          const variantes = {};
          let calificacionTotal = 0;
          
          // Recorrer todos los encabezados
          headers.forEach(header => {
            const value = activityData[rowIndex][header.arrayIndex]; // Usar array de actividades separado
            const headerName = header.name;
            
            // Validar que headerName sea un string válido
            if (!headerName || typeof headerName !== 'string' || headerName.trim() === '') {
              return; // Saltar encabezados inválidos
            }
            
            if (value !== undefined && value !== null && value !== '') {
              const headerNameLower = headerName.toLowerCase();
              
              if (headerNameLower.includes('total')) {
                if (headerNameLower.includes('calificación')) {
                  calificacionTotal = parseFloat(value) || 0;
                } else {
                  variantes[headerName] = parseFloat(value) || 0;
                }
              } else if (headerNameLower.includes('variante')) {
                variantes[headerName] = parseFloat(value) || 0;
              } else {
                actividades[headerName] = parseFloat(value) || value;
              }
            }
          });
          
          studentData[sheetName] = {
            numeroLista: allData[rowIndex][0], // Obtener de array completo
            nombre: studentNameInSheet,
            actividades: actividades,
            variantes: variantes,
            calificacionTotal: calificacionTotal
          };
          
          console.log('Datos procesados para', sheetName, ':', {
            actividades: Object.keys(actividades).length,
            variantes: Object.keys(variantes).length,
            calificacionTotal: calificacionTotal
          }); // Para debug
          
          break; // Salir del bucle de búsqueda ya que encontramos al estudiante
        }
      }
      
      if (!studentFound) {
        console.log('Estudiante no encontrado en', sheetName); // Para debug
      }
    }
    
    const result = {
      student: studentName,
      materias: materias,
      data: studentData
    };
    
    console.log('Resultado final:', result); // Para debug
    
    return ContentService
      .createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    console.error('Error en getStudentData:', error); // Para debug
    return ContentService
      .createTextOutput(JSON.stringify({error: error.toString()}))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Función de debug para probar la conexión
 */
function testConnection() {
  try {
    console.log('=== INICIO DE PRUEBA ===');
    
    // 1. Probar acceso al spreadsheet
    const spreadsheet = SpreadsheetApp.openById(SHEET_ID);
    console.log('✅ Acceso al spreadsheet exitoso');
    
    // 2. Listar todas las hojas
    const sheets = spreadsheet.getSheets();
    console.log('📋 Hojas encontradas:', sheets.map(s => s.getName()));
    
    // 3. Probar lectura de lista de alumnos
    const studentsResponse = getStudentsList();
    console.log('👥 Lista de estudiantes:', JSON.parse(studentsResponse.getContent()));
    
    // 4. Probar búsqueda de un estudiante específico
    const studentName = 'ZURY DANIELA'; // Cambiar por un nombre real
    console.log('🔍 Buscando estudiante:', studentName);
    const studentDataResponse = getStudentData(studentName);
    console.log('📊 Datos del estudiante:', JSON.parse(studentDataResponse.getContent()));
    
    console.log('=== FIN DE PRUEBA ===');
    
    return 'Prueba completada. Revisa los logs.';
    
  } catch (error) {
    console.error('❌ Error en la prueba:', error);
    return 'Error: ' + error.toString();
  }
}

/**
 * Función para ver logs de ejecución
 * (Se ejecuta después de testConnection para ver los logs)
 */
function showLogs() {
  const executions = ScriptApp.getProject().getExecutionLog();
  console.log('Execution Log:', executions);
  return executions;
}