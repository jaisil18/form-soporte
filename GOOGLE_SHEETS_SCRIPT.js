function doPost(e) {
    // 1. Obtener la hoja llamada "Reporte"
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName("Reporte");

    // Si no existe, usar la primera hoja o crearla
    if (!sheet) {
        sheet = ss.getSheets()[0];
        // Opcional: sheet.setName("Reporte");
    }

    try {
        // 2. Parsear los datos recibidos (JSON)
        var data = JSON.parse(e.postData.contents);

        // 3. Obtener fecha actual de Perú
        var fechaPeru = Utilities.formatDate(new Date(), "GMT-5", "dd/MM/yyyy HH:mm:ss");

        // 4. Insertar fila en el orden solicitado
        // Orden: Nombre | Sede | Pabellón | Actividad | Ambiente | Incidencia | Equipo | Tiempo | Fecha
        sheet.appendRow([
            data.usuario_nombre || "Anónimo",
            data.sede,
            data.pabellon || "",
            data.tipo_actividad,
            data.ambiente_incidencia || "",
            data.tipo_incidencia || "",
            data.equipo_afectado || "",
            data.tiempo_aproximado,
            fechaPeru // Usamos la fecha generada aquí, no la del cliente
        ]);

        // 5. Devolver respuesta exitosa
        return ContentService.createTextOutput(JSON.stringify({
            "result": "success",
            "message": "Fila insertada correctamente en Reporte"
        })).setMimeType(ContentService.MimeType.JSON);

    } catch (error) {
        return ContentService.createTextOutput(JSON.stringify({
            "result": "error",
            "message": error.toString()
        })).setMimeType(ContentService.MimeType.JSON);
    }
}
