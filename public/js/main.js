// Funciones auxiliares para el frontend

// Mostrar alertas temporales
function mostrarAlerta(mensaje, tipo = 'info') {
  const alertaDiv = document.createElement('div');
  alertaDiv.className = `fixed top-4 right-4 px-6 py-4 rounded-lg shadow-lg z-50 ${
    tipo === 'success' ? 'bg-green-500' :
    tipo === 'error' ? 'bg-red-500' :
    tipo === 'warning' ? 'bg-yellow-500' :
    'bg-blue-500'
  } text-white`;
  alertaDiv.textContent = mensaje;
  
  document.body.appendChild(alertaDiv);
  
  setTimeout(() => {
    alertaDiv.remove();
  }, 3000);
}

// Formatear fecha
function formatearFecha(fecha) {
  const opciones = { year: 'numeric', month: 'long', day: 'numeric' };
  return new Date(fecha).toLocaleDateString('es-ES', opciones);
}

// Formatear hora
function formatearHora(hora) {
  return hora.substring(0, 5);
}

// Confirmar acción
function confirmarAccion(mensaje) {
  return confirm(mensaje);
}

// Obtener parámetros de URL
function obtenerParametroURL(nombre) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(nombre);
}

// Mostrar mensaje de la URL si existe
document.addEventListener('DOMContentLoaded', () => {
  const mensaje = obtenerParametroURL('mensaje');
  const error = obtenerParametroURL('error');
  
  if (mensaje) {
    mostrarAlerta(mensaje, 'success');
  }
  
  if (error) {
    mostrarAlerta(error, 'error');
  }
});

function volverAtras() {
  if (window.history.length > 1) {
    window.history.back();
  } else {
    window.location.href = '/dashboard';
  }
}
