/**
 * Google Apps Script para Control de Actividades y Seguimiento de Alumnos
 * Lectura de Google Sheets y devolución de datos en formato JSON
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
    
    // Asumiendo que la columna A tiene el número de lista y B el nombre
    for (let i = 1; i < data.length; i++) { // Empezar desde la fila 1 (índice 1) para skip header
      if (data[i][0] && data[i][1]) { // Verificar que no estén vacías
        students.push({
          numeroLista: data[i][0],
          nombre: data[i][1]
        });
      }
    }
    
    return ContentService
      .createTextOutput(JSON.stringify({students: students}))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({error: error.toString()}))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Obtiene todos los datos de un estudiante específico
 */
function getStudentData(studentName) {
  try {
    const spreadsheet = SpreadsheetApp.openById(SHEET_ID);
    const sheets = spreadsheet.getSheets();
    
    const studentData = {};
    const materias = [];
    
    // Iterar por todas las hojas excepto la primera (lista de alumnos)
    for (let i = 1; i < sheets.length; i++) {
      const sheet = sheets[i];
      const sheetName = sheet.getName();
      materias.push(sheetName);
      
      // Obtener datos de la hoja
      const data = sheet.getDataRange().getValues();
      
      if (data.length < 3) continue; // Necesitamos al menos 3 filas
      
      // Encontrar la fila del estudiante (fila 3, columnas A y B)
      const studentNameInSheet = data[2][1]; // Fila 3 (índice 2), columna B (índice 1)
      const studentNumberInSheet = data[2][0]; // Fila 3, columna A
      
      if (studentNameInSheet === studentName) {
        // Extraer encabezados de actividades (fila 2, desde columna C)
        const headers = [];
        for (let col = 2; col < data[2].length; col++) {
          if (data[2][col]) {
            headers.push({
              columnIndex: col,
              name: data[2][col]
            });
          }
        }
        
        // Extraer datos del estudiante (fila 3)
        const studentRow = data[2];
        
        // Procesar actividades
        const actividades = {};
        const variantes = {};
        let calificacionTotal = 0;
        
        for (let col = 2; col < studentRow.length; col++) {
          const headerName = headers.find(h => h.columnIndex === col)?.name;
          if (!headerName) continue;
          
          const value = studentRow[col];
          
          if (headerName.toLowerCase().includes('total')) {
            if (headerName.toLowerCase().includes('calificación')) {
              calificacionTotal = value || 0;
            } else {
              variantes[headerName] = value || 0;
            }
          } else if (headerName.toLowerCase().includes('variante')) {
            variantes[headerName] = value || 0;
          } else {
            actividades[headerName] = value || 0;
          }
        }
        
        studentData[sheetName] = {
          numeroLista: studentNumberInSheet,
          nombre: studentNameInSheet,
          actividades: actividades,
          variantes: variantes,
          calificacionTotal: calificacionTotal
        };
      }
    }
    
    return ContentService
      .createTextOutput(JSON.stringify({
        student: studentName,
        materias: materias,
        data: studentData
      }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({error: error.toString()}))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Obtiene todos los datos (para desarrollo/testing)
 */
function getAllData() {
  try {
    const studentsResponse = getStudentsList();
    const studentsData = JSON.parse(studentsResponse.getContent());
    
    const allData = {};
    
    for (const student of studentsData.students) {
      const studentResponse = getStudentData(student.nombre);
      const studentInfo = JSON.parse(studentResponse.getContent());
      allData[student.nombre] = studentInfo.data;
    }
    
    return ContentService
      .createTextOutput(JSON.stringify(allData))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({error: error.toString()}))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Función de prueba para verificar conexión
 */
function testConnection() {
  return getStudentsList();
}

/**
 * Función para obtener información de debugging
 */
function getDebugInfo() {
  try {
    const spreadsheet = SpreadsheetApp.openById(SHEET_ID);
    const sheets = spreadsheet.getSheets();
    
    const info = {
      sheetId: SHEET_ID,
      totalSheets: sheets.length,
      sheetNames: sheets.map(s => s.getName()),
      firstSheetData: sheets[0] ? sheets[0].getDataRange().getValues() : []
    };
    
    return ContentService
      .createTextOutput(JSON.stringify(info, null, 2))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({error: error.toString()}))
      .setMimeType(ContentService.MimeType.JSON);
  }
}