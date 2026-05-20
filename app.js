const API_URL = "http://localhost:5131/api/Repuestos";

let modalAgregar;

window.onload = () => {
    modalAgregar = new bootstrap.Modal(document.getElementById('modalAgregar'));
    cargarDatos();
};

async function cargarDatos() {
    try {
        const respuesta = await fetch(API_URL);
        const repuestos = await respuesta.json();

        // Actualizar tarjetas resumen
        const criticos = repuestos.filter(r => r.cantidadStock <= r.nivelCritico);
        document.getElementById('totalRepuestos').textContent = repuestos.length;
        document.getElementById('totalCriticos').textContent = criticos.length;
        document.getElementById('totalNormales').textContent = repuestos.length - criticos.length;
        document.getElementById('ultimaActualizacion').textContent = 
            'Actualizado: ' + new Date().toLocaleTimeString('es-CL');

        // Llenar tabla
        let html = '';
        repuestos.forEach(r => {
            const critico = r.cantidadStock <= r.nivelCritico;
            html += `
                <tr class="${critico ? 'fila-critica' : ''}">
                    <td>${r.id}</td>
                    <td>${r.nombre}</td>
                    <td><strong>${r.cantidadStock}</strong></td>
                    <td>${r.nivelCritico}</td>
                    <td>
                        <span class="${critico ? 'badge-critico' : 'badge-normal'}">
                            ${critico ? '⚠ Crítico' : '✓ Normal'}
                        </span>
                    </td>
                    <td>
                        <button class="btn btn-sm btn-outline-danger btn-accion" 
                            onclick="eliminarRepuesto(${r.id})">
                            <i class="bi bi-trash"></i>
                        </button>
                    </td>
                </tr>`;
        });
        document.getElementById('cuerpoTabla').innerHTML = html;

    } catch (error) {
        document.getElementById('cuerpoTabla').innerHTML = 
            '<tr><td colspan="6" class="text-center text-danger py-4">Error conectando a la API. ¿Está corriendo Visual Studio?</td></tr>';
    }
}

function abrirModalAgregar() {
    document.getElementById('inputNombre').value = '';
    document.getElementById('inputStock').value = '';
    document.getElementById('inputNivelCritico').value = '';
    modalAgregar.show();
}

async function agregarRepuesto() {
    const repuesto = {
        nombre: document.getElementById('inputNombre').value,
        cantidadStock: parseInt(document.getElementById('inputStock').value),
        nivelCritico: parseInt(document.getElementById('inputNivelCritico').value),
        alertaEnviada: false
    };

    if (!repuesto.nombre || isNaN(repuesto.cantidadStock) || isNaN(repuesto.nivelCritico)) {
        alert('Por favor completa todos los campos.');
        return;
    }

    await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(repuesto)
    });

    modalAgregar.hide();
    cargarDatos();
}

async function eliminarRepuesto(id) {
    if (!confirm('¿Eliminar este repuesto?')) return;
    
    await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
    cargarDatos();
}