document.addEventListener('DOMContentLoaded', async () => {
    console.log("App initialized. Attempting to connect to the backend...");

    try {
        const response = await fetch('http://127.0.0.1:8000/catalog');
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const catalogData = await response.json();
        console.log("Success! Catalog loaded:", catalogData);

        const actionSelect = document.querySelector('select');
        
        if (actionSelect && catalogData.length > 0) {
            actionSelect.innerHTML = '<option value="">Selecciona una acción</option>';
            
            for (const action of catalogData) {
                const option = document.createElement('option');
                option.value = action.id;
                option.textContent = `${action.name} (+${action.points} pts, -${action.co2_kg}kg CO2)`;
                actionSelect.appendChild(option);
            }
        }
    } catch (error) {
        console.error("Error connecting to the backend:", error);
    }

    const menuLinks = document.querySelectorAll('nav a'); 
    const sections = document.querySelectorAll('main > section');

    menuLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const targetId = link.getAttribute('href');
            
            if (targetId && targetId.startsWith('#')) {
                e.preventDefault(); 

                sections.forEach(section => {
                    section.classList.add('hidden');
                });

                const targetSection = document.querySelector(targetId);
                if (targetSection) {
                    targetSection.classList.remove('hidden');
                }
            }
        });
    });
});