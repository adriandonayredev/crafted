// Script global para el carrito
class CarritoManager {
    constructor() {
        this.badge = document.querySelector('.cart-badge');
        this.init();
    }

    async init() {
        await this.actualizarBadge();
        // Actualizar cada 30 segundos
        setInterval(() => this.actualizarBadge(), 30000);
    }

    async actualizarBadge() {
        try {
            const response = await fetch('/carrito/count');
            const data = await response.json();
            if (this.badge) {
                this.badge.textContent = data.count;
                this.badge.style.display = data.count > 0 ? 'inline' : 'none';
            }
        } catch (error) {
            console.log('Error actualizando badge del carrito:', error);
        }
    }

    async agregarProducto(idProducto) {
        try {
            const response = await fetch('/carrito/agregar', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id_producto: idProducto })
            });
            const data = await response.json();
            if (data.ok) {
                await this.actualizarBadge();
                return true;
            }
            return false;
        } catch (error) {
            console.error('Error agregando al carrito:', error);
            return false;
        }
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    window.carritoManager = new CarritoManager();
});