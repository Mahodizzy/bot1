// Función para cambiar entre pasos
function goToStep(stepNumber) {
    document.querySelectorAll('.step').forEach(step => {
        step.classList.add('hidden');
    });

    const nextStep = document.getElementById(`step-${stepNumber}`);
    if (nextStep) {
        nextStep.classList.remove('hidden');
    }
}

// Selección de tarjetas por contenedor
document.addEventListener('click', (e) => {
    const card = e.target.closest('.option-card');
    if (card) {
        const container = card.parentElement;
        container.querySelectorAll('.option-card').forEach(c => {
            c.classList.remove('selected');
        });
        card.classList.add('selected');
    }
});

// Botón Aceptar → llamar API
document.getElementById('btnAceptar')?.addEventListener('click', async () => {
    try {
        const res = await fetch('/api/obtener-correo');
        const data = await res.json();

        document.getElementById('resultado').innerText =
            data.contenido || data.error;

    } catch (error) {
        document.getElementById('resultado').innerText =
            "Error al conectar con el servidor";
    }
});
