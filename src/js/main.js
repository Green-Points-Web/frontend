document.addEventListener('DOMContentLoaded', async () => {
    console.log("App initialized. Attempting to connect to the backend...");

    try {
        const response = await fetch('http://127.0.0.1:8000/catalog');
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const catalogData = await response.json();
        console.log("Success! Catalog loaded:", catalogData);

        const actionSelect = document.querySelector('#action-type');
        
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

        async function loadHistory() {
        try {
            const response = await fetch('http://127.0.0.1:8000/history');

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const historyData = await response.json();
            const historyBody = document.querySelector('#history-body');

            if (!historyBody) {
                return;
            }

            historyBody.replaceChildren();

            historyData.forEach(action => {
                const row = document.createElement('tr');

                const values = [
                    action.action_date,
                    `Acción #${action.action_type_id}`,
                    action.category,
                    action.description,
                    action.points_earned,
                    action.co2_saved
                ];

                values.forEach(value => {
                    const cell = document.createElement('td');
                    cell.textContent = value ?? '—';
                    row.appendChild(cell);
                });

                historyBody.appendChild(row);
            });

        } catch (error) {
            console.error('Error al cargar el historial:', error);
        }
    }

    loadHistory();
});