import type { FormularioData } from '@/types';

/**
 * Función para enviar los datos de la incidencia a Google Sheets
 * @param data Datos del formulario de incidencia
 * @returns Promise<void>
 */
export const saveToGoogleSheets = async (data: FormularioData): Promise<void> => {
    // URL de tu Script de Google Apps (Despliegue)
    const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyZtnnUV9mv9JzbHF9yMzlD3swPr_R8zA0ea8yjji-B4H2gGFzN980LyCMI2g76AL7smQ/exec';
    try {
        // Es importante enviar como text/plain para evitar problemas de CORS con Google Scripts
        const response = await fetch(SCRIPT_URL, {
            method: 'POST',
            mode: 'no-cors', // Importante para evitar error de CORS, aunque hace la response opaca
            headers: {
                'Content-Type': 'text/plain;charset=utf-8',
            },
            body: JSON.stringify({
                usuario_nombre: data.usuario_nombre || 'Anónimo',
                sede: data.sede,
                pabellon: data.pabellon,
                tipo_actividad: data.tipo_actividad,
                ambiente_incidencia: data.ambiente_incidencia,
                tipo_incidencia: data.tipo_incidencia,
                equipo_afectado: data.equipo_afectado,
                tiempo_aproximado: data.tiempo_aproximado,
                // La fecha la genera el script, pero enviamos todo por si acaso
                usuario_email: data.usuario_email
            }),
        });

        console.log('✅ Enviado a Google Sheets');
        // Con mode: 'no-cors', no podemos verificar response.ok o leer el cuerpo,
        // pero si el fetch no falló, asumimos que llegó al servidor.
    } catch (error) {
        console.error('❌ Error al enviar a Google Sheets:', error);
        // No lanzamos el error para no detener el flujo principal si Google falla
    }
};
