// power-automate.js - Versión Definitiva Optimizada

// ============================================
// CONFIGURACIÓN
// ============================================

const POWER_AUTOMATE_FLOW_URL = "https://defaultb24f0388e61b43e0b9e7baa5b0d512.1e.environment.api.powerplatform.com:443/powerautomate/automations/direct/workflows/5cb5bd7efb6a4c6181bea54fc653d660/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=WzhOs-3sRRRnFNbL47JAQH06U5WXI4ieRV916XlFxrA"; // ← REEMPLAZA CON TU URL DE POWER AUTOMATE
const REQUEST_TIMEOUT = 30000;

// ============================================
// FUNCIONES PRINCIPALES
// ============================================

/**
 * Envía datos a Power Automate
 */
async function enviarAPowerAutomate(payload) {
  if (!POWER_AUTOMATE_FLOW_URL || POWER_AUTOMATE_FLOW_URL === "TU_URL_AQUI") {
    throw new Error("⚠️ URL de Power Automate no configurada");
  }

  if (!payload || typeof payload !== 'object') {
    throw new Error("Payload inválido");
  }

  console.log('📤 Enviando datos:', payload);

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

    const response = await fetch(POWER_AUTOMATE_FLOW_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(payload),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Sin detalles');
      throw new Error(`Error HTTP ${response.status}: ${errorText}`);
    }

    let responseData;
    try {
      responseData = await response.json();
    } catch (e) {
      responseData = { success: true, message: 'Datos enviados correctamente' };
    }

    console.log('✅ Respuesta:', responseData);
    return responseData;

  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error('⏱️ Tiempo de espera agotado');
    }
    if (error.message.includes('Failed to fetch')) {
      throw new Error('🌐 Error de conexión. Verifica CORS en Power Automate');
    }
    throw error;
  }
}

/**
 * Formatea datos antes de enviar
 */
function formatearDatosParaEnvio(datos) {
  const datosFormateados = {};

  for (const [key, value] of Object.entries(datos)) {
    if (value === '' || value === null || value === undefined) {
      datosFormateados[key] = '';
      continue;
    }

    switch (key) {
      case 'ValorFactura':
      case 'Consumo':
        // Convertir a número, si está vacío o inválido = 0
        datosFormateados[key] = parseFloat(value) || 0;
        break;
      case 'FechaLlegada':
      case 'FechaVencimiento':
        // Convertir a formato ISO si existe fecha
        datosFormateados[key] = value ? new Date(value).toISOString() : '';
        break;
      default:
        // Todo lo demás como string
        datosFormateados[key] = String(value).trim();
    }
  }

  // Agregar campos adicionales
  datosFormateados.FechaRegistro = new Date().toISOString();
  datosFormateados.Origen = 'Formulario Web';

  return datosFormateados;
}

/**
 * Valida respuesta de Power Automate
 */
function validarRespuesta(response) {
  if (!response) return false;
  return (
    response.success === true ||
    response.status === 'success' ||
    response.StatusCode === 200 ||
    response.message?.includes('éxito') ||
    response.message?.includes('success')
  );
}

/**
 * Función principal para procesar y enviar
 */
async function procesarYEnviar(datosFormulario) {
  try {
    const datosFormateados = formatearDatosParaEnvio(datosFormulario);
    console.log('📝 Datos formateados:', datosFormateados);

    const respuesta = await enviarAPowerAutomate(datosFormateados);
    const exitoso = validarRespuesta(respuesta);

    console.log(`📊 Envío ${exitoso ? 'EXITOSO' : 'FALLIDO'}`);

    if (!exitoso) {
      throw new Error('El servidor indicó un error en el procesamiento');
    }

    return {
      success: true,
      message: 'Datos guardados correctamente en SharePoint',
      data: respuesta
    };

  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  }
}

// ============================================
// MODO PRUEBA (SOLO LOCALHOST)
// ============================================

async function simularEnvioPowerAutomate(payload) {
  console.log('🧪 MODO PRUEBA: Simulando envío');
  console.log('Datos:', payload);

  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        message: 'Simulación exitosa',
        data: {
          id: Math.random().toString(36).substr(2, 9),
          timestamp: new Date().toISOString()
        }
      });
    }, 1500);
  });
}

function esModoPrueba() {
  return false; // Cambiar a true para probar sin enviar a Power Automate
}

// ============================================
// EXPORTAR
// ============================================

window.PowerAutomate = {
  procesarYEnviar,
  esModoPrueba,
  simularEnvioPowerAutomate
};

console.log('✓ Power Automate cargado');
console.log('📊 Modo prueba:', esModoPrueba() ? 'ACTIVADO' : 'DESACTIVADO');