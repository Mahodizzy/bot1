// Seleccionamos todos los botones de opción
const options = document.querySelectorAll('.option-card');

options.forEach(option => {
    option.addEventListener('click', () => {
        // 1. Quitamos la clase 'selected' de todos los botones
        options.forEach(opt => opt.classList.remove('selected'));
        
        // 2. Se la agregamos solo al botón al que le dimos clic
        option.classList.add('selected');
    });
});

// Función para cambiar entre pasos
function goToStep(stepNumber) {
    // Ocultar todos los pasos
    document.querySelectorAll('.step').forEach(step => {
        step.classList.add('hidden');
    });

    // Mostrar el paso deseado
    document.getElementById(`step-${stepNumber}`).classList.remove('hidden');
}

// Lógica de selección de tarjetas (reutilizable)
document.addEventListener('click', (e) => {
    const card = e.target.closest('.option-card');
    if (card) {
        // Buscar todas las tarjetas del contenedor actual
        const container = card.parentElement;
        container.querySelectorAll('.option-card').forEach(c => c.classList.remove('selected'));
        
        // Seleccionar la actual
        card.classList.add('selected');
    }
});

function goToStep(stepNumber) {
    // Ocultar todos los pasos
    document.querySelectorAll('.step').forEach(step => {
        step.classList.add('hidden');
    });

    // Mostrar el paso solicitado
    const nextStep = document.getElementById(`step-${stepNumber}`);
    if (nextStep) {
        nextStep.classList.remove('hidden');
    }
}

function finalizarProceso() {
    // Aquí puedes añadir la lógica para enviar los datos
    alert("¡Datos enviados con éxito!");
}

// Mantener la lógica de selección de tarjetas que hicimos antes
document.addEventListener('click', (e) => {
    const card = e.target.closest('.option-card');
    if (card) {
        const container = card.parentElement;
        container.querySelectorAll('.option-card').forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');
    }
});