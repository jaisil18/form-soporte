function doPost(e) {
    // 1. Obtener la hoja activa
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();

    try {
        // 2. Parsear los datos recibidos (JSON)
        var data = JSON.parse(e.postData.contents);

        // 3. Insertar fila con el orden exacto de columnas
        // Asegúrate de que tus encabezados en Sheets coincidan con este orden:
        // A: Fecha/Hora | B: Sede | C: Pabellón | D: Actividad | E: Nombre | F: Email | G: Ambiente | H: Tipo Incidencia | I: Equipo | J: Tiempo | K: Estado

        sheet.appendRow([
            data.fecha_hora,           // Columna A
            data.sede,                 // Columna B
            data.pabellon || "",       // Columna C (puede ser null)
            data.tipo_actividad,       // Columna D
            data.usuario_nombre,       // Columna E
            data.usuario_email,        // Columna F
            data.ambiente_incidencia || "", // Columna G
            data.tipo_incidencia || "",     // Columna H
            data.equipo_afectado || "",     // Columna I
            data.tiempo_aproximado,    // Columna J
            data.estado || "pendiente" // Columna K
        ]);

        // 4. Devolver respuesta exitosa
        return ContentService.createTextOutput(JSON.stringify({
            "result": "success",
            "message": "Fila insertada correctamente"
        })).setMimeType(ContentService.MimeType.JSON);

    } catch (error) {
        // Manejo de errores
        return ContentService.createTextOutput(JSON.stringify({
            "result": "error",
            "message": error.toString()
        })).setMimeType(ContentService.MimeType.JSON);
    }
}
