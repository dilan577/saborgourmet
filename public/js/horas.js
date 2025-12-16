document.addEventListener('DOMContentLoaded', () => {
  const fechaInput = document.querySelector('input[name="fecha"]');
  const horaSelect = document.querySelector('select[name="hora"]');

  if (!fechaInput || !horaSelect) return;

  fechaInput.addEventListener('change', async () => {
    horaSelect.innerHTML = '<option value="">Cargando horarios...</option>';

    if (!fechaInput.value) {
      horaSelect.innerHTML = '<option value="">Seleccione una hora</option>';
      return;
    }

    try {
      const res = await fetch(`/horarios/disponibles?fecha=${fechaInput.value}`);
      const horas = await res.json();

      horaSelect.innerHTML = '<option value="">Seleccione una hora</option>';

      if (horas.length === 0) {
        const opt = document.createElement('option');
        opt.textContent = 'No hay horarios disponibles';
        opt.disabled = true;
        horaSelect.appendChild(opt);
        return;
      }

      horas.forEach(hora => {
        const opt = document.createElement('option');
        opt.value = hora;
        opt.textContent = hora;
        horaSelect.appendChild(opt);
      });

    } catch (error) {
      console.error('Error cargando horarios:', error);
      horaSelect.innerHTML = '<option value="">Error al cargar horarios</option>';
    }
  });
});
