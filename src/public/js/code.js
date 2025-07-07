// JavaScript para la funcionalidad de edición de productos

document.addEventListener('DOMContentLoaded', function() {
    // Obtener todos los botones de editar
    const btnEditar = document.querySelectorAll('.btnEditar');
    
    // Agregar evento click a cada botón
    btnEditar.forEach(btn => {
        btn.addEventListener('click', function() {
            // Obtener la fila padre
            const fila = this.closest('tr');
            
            // Obtener los datos de la fila
            const id = fila.cells[0].textContent;
            const nombre = fila.cells[2].textContent;
            const descripcion = fila.cells[3].textContent;
            const precio = fila.cells[4].textContent.replace('$', '');
            const stock = fila.cells[5].querySelector('.badge').textContent;
            const experiencia = fila.cells[6].querySelector('.badge').textContent;
            const imagen_url = fila.cells[1].querySelector('img').src;
            
            // Llenar el modal con los datos
            document.getElementById('id_editar').value = id;
            document.getElementById('nombre_editar').value = nombre;
            document.getElementById('descripcion_editar').value = descripcion;
            document.getElementById('precio_editar').value = precio;
            document.getElementById('stock_editar').value = stock;
            document.getElementById('experiencia_editar').value = experiencia;
            document.getElementById('imagen_url_editar').value = imagen_url;
        });
    });
    
    // Validación de formularios
    const formularios = document.querySelectorAll('form');
    formularios.forEach(form => {
        form.addEventListener('submit', function(e) {
            const inputs = form.querySelectorAll('input[required], textarea[required], select[required]');
            let isValid = true;
            
            inputs.forEach(input => {
                if (!input.value.trim()) {
                    isValid = false;
                    input.classList.add('is-invalid');
                } else {
                    input.classList.remove('is-invalid');
                }
            });
            
            if (!isValid) {
                e.preventDefault();
                alert('Por favor, completa todos los campos requeridos.');
            }
        });
    });
    
    // Validación de precio
    const precioInputs = document.querySelectorAll('input[name="precio"], input[name="precio_editar"]');
    precioInputs.forEach(input => {
        input.addEventListener('input', function() {
            const value = parseFloat(this.value);
            if (value < 0) {
                this.value = 0;
            }
        });
    });
    
    // Validación de stock
    const stockInputs = document.querySelectorAll('input[name="stock"], input[name="stock_editar"]');
    stockInputs.forEach(input => {
        input.addEventListener('input', function() {
            const value = parseInt(this.value);
            if (value < 0) {
                this.value = 0;
            }
        });
    });
    
    // Auto-generar ID si está vacío
    const idInput = document.getElementById('_id');
    if (idInput) {
        idInput.addEventListener('blur', function() {
            if (!this.value.trim()) {
                const timestamp = Date.now();
                const random = Math.floor(Math.random() * 1000);
                this.value = `PROD_${timestamp}_${random}`;
            }
        });
    }
    
    // Confirmación para eliminar
    const deleteButtons = document.querySelectorAll('a[href^="/borrar/"]');
    deleteButtons.forEach(btn => {
        btn.addEventListener('click', function(e) {
            if (!confirm('¿Estás seguro de que quieres eliminar este producto?')) {
                e.preventDefault();
            }
        });
    });
    
    // Mostrar notificaciones de éxito/error
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('success')) {
        showNotification('Producto guardado exitosamente!', 'success');
    }
    if (urlParams.get('error')) {
        showNotification('Error al procesar la solicitud', 'error');
    }
});

// Función para mostrar notificaciones
function showNotification(message, type) {
    const notification = document.createElement('div');
    notification.className = `alert alert-${type === 'success' ? 'success' : 'danger'} alert-dismissible fade show position-fixed`;
    notification.style.cssText = 'top: 20px; right: 20px; z-index: 9999; min-width: 300px;';
    notification.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    document.body.appendChild(notification);
    
    // Auto-remover después de 5 segundos
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 5000);
} 