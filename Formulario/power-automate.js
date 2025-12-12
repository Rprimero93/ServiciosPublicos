// form-logic.js - Versión Definitiva Optimizada

// ============================================
// CONFIGURACIÓN DE DATOS
// ============================================

const proveedoresPorServicio = {
  'ENERGIA': ['ENEL'],
  'ACUEDUCTO': ['EAAB'],
  'SERVICIO ESPECIAL': ['LIME', 'PROAMBIENTAL'],
  'TELEFONIA': ['MOVISTAR']
};

const cuentasPorCombinacion = {
  'ENERGIA_CAN': '0484361-6',
  'ENERGIA_TEUSAQUILLO': '0449220-9',
  'ENERGIA_ROSALES': '0517016-3',
  'ACUEDUCTO_CAN': '11442973',
  'ACUEDUCTO_TEUSAQUILLO': '10092050',
  'ACUEDUCTO_ROSALES': '10092050',
  'TELEFONIA': '43462198',
  'SERVICIO ESPECIAL_LIME_CAN': '12193482',
  'SERVICIO ESPECIAL_LIME_TEUSAQUILLO': '10092050',
  'SERVICIO ESPECIAL_PROAMBIENTAL': '12192960'
};

const unidadesPorServicio = {
  'ENERGIA': 'kWh',
  'ACUEDUCTO': 'm³',
  'SERVICIO ESPECIAL': '',
  'TELEFONIA': ''
};

// ============================================
// ELEMENTOS DEL DOM
// ============================================

const form = document.getElementById('publicosForm');
const sedeSelect = document.getElementById('sede');
const tipoServicioSelect = document.getElementById('tipoServicio');
const proveedorSelect = document.getElementById('proveedor');
const nroCuentaInput = document.getElementById('nroCuenta');
const unidadInput = document.getElementById('unidad');
const btnRegistrar = form.querySelector('.btn-primary');
const mensajeDiv = document.getElementById('mensaje');
const valorFacturaInput = document.getElementById('valorFactura');

// ============================================
// FORMATEO DE VALOR FACTURA
// ============================================

function formatearMoneda(valor) {
  const numero = valor.replace(/\D/g, '');
  if (!numero) return '';
  const numeroFormateado = parseInt(numero).toLocaleString('es-CO');
  return `$ ${numeroFormateado}`;
}

function obtenerValorNumerico(valorFormateado) {
  return valorFormateado.replace(/\D/g, '');
}

function manejarInputValor(event) {
  const input = event.target;
  const cursorPos = input.selectionStart;
  const valorAnterior = input.value;
  const longitudAnterior = valorAnterior.length;
  
  const valorFormateado = formatearMoneda(input.value);
  input.value = valorFormateado;
  
  const longitudNueva = valorFormateado.length;
  const diferencia = longitudNueva - longitudAnterior;
  const nuevaPosicion = cursorPos + diferencia;
  
  input.setSelectionRange(nuevaPosicion, nuevaPosicion);
}

function permitirSoloNumeros(event) {
  const tecla = event.key;
  const permitidas = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab'];
  
  if (permitidas.includes(tecla)) return;
  
  if (!/^\d$/.test(tecla)) {
    event.preventDefault();
  }
}

// ============================================
// LÓGICA DINÁMICA DEL FORMULARIO
// ============================================

function actualizarProveedores() {
  const tipoServicio = tipoServicioSelect.value;
  proveedorSelect.innerHTML = '<option value="">Seleccione un proveedor</option>';
  
  if (!tipoServicio) {
    proveedorSelect.disabled = true;
    proveedorSelect.innerHTML = '<option value="">Seleccione primero el servicio</option>';
    return;
  }
  
  const proveedores = proveedoresPorServicio[tipoServicio] || [];
  
  if (proveedores.length === 0) {
    proveedorSelect.disabled = true;
    proveedorSelect.innerHTML = '<option value="">No hay proveedores disponibles</option>';
    return;
  }
  
  proveedorSelect.disabled = false;
  proveedores.forEach(proveedor => {
    const option = document.createElement('option');
    option.value = proveedor;
    option.textContent = proveedor;
    proveedorSelect.appendChild(option);
  });
  
  if (proveedores.length === 1) {
    proveedorSelect.value = proveedores[0];
    actualizarNumeroCuenta();
  }
}

function actualizarUnidad() {
  unidadInput.value = unidadesPorServicio[tipoServicioSelect.value] || '';
}

function actualizarNumeroCuenta() {
  const sede = sedeSelect.value;
  const tipoServicio = tipoServicioSelect.value;
  const proveedor = proveedorSelect.value;
  
  if (!sede || !tipoServicio) {
    nroCuentaInput.value = '';
    return;
  }
  
  let clave = '';
  
  switch (tipoServicio) {
    case 'ENERGIA':
    case 'ACUEDUCTO':
      clave = `${tipoServicio}_${sede}`;
      break;
    case 'TELEFONIA':
      clave = 'TELEFONIA';
      break;
    case 'SERVICIO ESPECIAL':
      if (!proveedor) {
        nroCuentaInput.value = '';
        return;
      }
      clave = proveedor === 'PROAMBIENTAL' 
        ? 'SERVICIO ESPECIAL_PROAMBIENTAL' 
        : `SERVICIO ESPECIAL_LIME_${sede}`;
      break;
    default:
      nroCuentaInput.value = '';
      return;
  }
  
  nroCuentaInput.value = cuentasPorCombinacion[clave] || '';
}

function resetearCamposDependientes() {
  proveedorSelect.value = '';
  proveedorSelect.disabled = true;
  proveedorSelect.innerHTML = '<option value="">Seleccione primero el servicio</option>';
  nroCuentaInput.value = '';
  unidadInput.value = '';
}

// ============================================
// VALIDACIÓN Y DATOS
// ============================================

function validarFormulario() {
  const errores = [];
  
  if (!sedeSelect.value) errores.push('Debe seleccionar una sede');
  if (!tipoServicioSelect.value) errores.push('Debe seleccionar un tipo de servicio');
  if (!proveedorSelect.value && !proveedorSelect.disabled) errores.push('Debe seleccionar un proveedor');
  if (!nroCuentaInput.value) errores.push('El número de cuenta debe generarse automáticamente');
  
  return {
    valido: errores.length === 0,
    errores: errores
  };
}

function recopilarDatosFormulario() {
  return {
    Sede: sedeSelect.value,
    TipoServicio: tipoServicioSelect.value,
    Proveedor: proveedorSelect.value,
    NroCuenta: nroCuentaInput.value,
    NroFactura: document.getElementById('nroFactura').value,
    ValorFactura: obtenerValorNumerico(valorFacturaInput.value),
    Periodo: document.getElementById('periodo').value,
    Consumo: document.getElementById('consumo').value,
    Unidad: unidadInput.value,
    FechaLlegada: document.getElementById('fechaLlegada').value,
    FechaVencimiento: document.getElementById('fechaVencimiento').value
  };
}

// ============================================
// MENSAJES
// ============================================

function mostrarMensaje(texto, tipo = 'success') {
  mensajeDiv.textContent = texto;
  mensajeDiv.className = `mensaje ${tipo}`;
  setTimeout(() => {
    mensajeDiv.textContent = '';
    mensajeDiv.className = 'mensaje';
  }, 5000);
}

function mostrarToast(titulo, mensaje, tipo = 'success') {
  const toast = document.createElement('div');
  toast.className = `toast-notification ${tipo}`;
  
  toast.innerHTML = `
    <div class="toast-icon">${tipo === 'success' ? '✓' : '✗'}</div>
    <div class="toast-content">
      <div class="toast-title">${titulo}</div>
      <div class="toast-message">${mensaje}</div>
    </div>
    <button class="toast-close" aria-label="Cerrar">×</button>
    <div class="toast-progress"></div>
  `;
  
  document.body.appendChild(toast);
  
  setTimeout(() => toast.classList.add('show'), 10);
  
  const cerrarToast = () => {
    toast.classList.remove('show');
    toast.classList.add('hide');
    setTimeout(() => toast.remove(), 400);
  };
  
  toast.querySelector('.toast-close').addEventListener('click', cerrarToast);
  
  setTimeout(cerrarToast, 5000);
}

// ============================================
// ENVÍO DEL FORMULARIO
// ============================================

async function handleSubmit(event) {
  event.preventDefault();
  
  const validacion = validarFormulario();
  if (!validacion.valido) {
    mostrarMensaje(validacion.errores.join('. '), 'error');
    return;
  }
  
  const datos = recopilarDatosFormulario();
  btnRegistrar.disabled = true;
  btnRegistrar.textContent = 'Enviando...';
  
  try {
    if (typeof window.PowerAutomate === 'undefined') {
      throw new Error('Módulo Power Automate no cargado');
    }

    const resultado = window.PowerAutomate.esModoPrueba()
      ? await window.PowerAutomate.simularEnvioPowerAutomate(datos)
      : await window.PowerAutomate.procesarYEnviar(datos);
    
    console.log('✅ Resultado:', resultado);
    
    mostrarToast(
      '¡Registro Exitoso!', 
      'Los datos se guardaron correctamente en SharePoint', 
      'success'
    );
    
    mostrarMensaje('✓ Registro guardado correctamente', 'success');
    
    setTimeout(() => {
      form.reset();
      resetearCamposDependientes();
    }, 2000);
    
  } catch (error) {
    console.error('❌ Error:', error);
    
    let mensajeError = 'Error al registrar: ';
    if (error.message.includes('URL')) {
      mensajeError += 'Configuración pendiente';
    } else if (error.message.includes('conexión')) {
      mensajeError += 'Error de conexión. Verifica CORS';
    } else if (error.message.includes('Tiempo')) {
      mensajeError += 'Tiempo de espera agotado';
    } else {
      mensajeError += error.message;
    }
    
    mostrarToast('Error en el Registro', mensajeError, 'error');
    mostrarMensaje('✗ ' + mensajeError, 'error');
  } finally {
    btnRegistrar.disabled = false;
    btnRegistrar.textContent = 'Registrar';
  }
}

// ============================================
// INICIALIZACIÓN
// ============================================

function inicializar() {
  tipoServicioSelect.addEventListener('change', () => {
    actualizarProveedores();
    actualizarUnidad();
    actualizarNumeroCuenta();
  });
  
  sedeSelect.addEventListener('change', actualizarNumeroCuenta);
  proveedorSelect.addEventListener('change', actualizarNumeroCuenta);
  form.addEventListener('submit', handleSubmit);
  
  valorFacturaInput.addEventListener('input', manejarInputValor);
  valorFacturaInput.addEventListener('keydown', permitirSoloNumeros);
  
  resetearCamposDependientes();
  
  console.log('✓ Formulario inicializado');
  
  if (typeof window.PowerAutomate !== 'undefined') {
    const modoPrueba = window.PowerAutomate.esModoPrueba();
    console.log(`✓ Power Automate: ${modoPrueba ? 'MODO PRUEBA' : 'MODO PRODUCCIÓN'}`);
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', inicializar);
} else {
  inicializar();
}