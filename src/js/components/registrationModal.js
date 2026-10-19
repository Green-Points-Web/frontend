import { getActionTypes, createAction } from "../services/actionService.js";

export function initRegistrationModal(onSuccessCallBack) {

    const modal = document.getElementById('modal-registration');
    const openBtn = document.getElementById('open-modal-btn');
    const form = document.getElementById('modal-action-form');
    const actionSelect = document.getElementById('modal-action-type-select');
    const dateInput = document.getElementById('modal-action-date');
    const descriptionInput = document.getElementById('modal-action-description');
    const impactValue = document.getElementById('modal-impact-value');
    const closeBtn = document.getElementById('close-modal-btn');
    const cancelBtn = document.getElementById('cancel-btn');
    const submitBtn = document.getElementById('submit-btn');

    if (!modal || !form) return;

    let catalogData = [];

    async function loadCatalog() {

        try {
            catalogData = (await getActionTypes()) ?? [];
            actionSelect.innerHTML = '<option value="" disabled selected>Selecciona una acción...</option>';
            catalogData.forEach(action => {
                const option = document.createElement('option');
                option.value = action.id;
                option.textContent = `${action.name} (${action.category})`;
                actionSelect.appendChild(option);
            });
        }

        catch (error) {
            actionSelect.innerHTML = '<option value="" disabled>Error al cargar acciones</option>';
        }
    }

    const openModal = () => modal.classList.add('is-active');
    const closeModal = () => modal.classList.remove('is-active');

    openBtn?.addEventListener('click', openModal);
    closeBtn.addEventListener('click', closeModal);
    cancelBtn.addEventListener('click', closeModal);

    actionSelect.addEventListener('change', (e) => {

        const selectedId = parseInt(e.target.value, 10);
        const selectedAction = catalogData.find(item => item.id === selectedId);

        if (selectedAction) {
            const co2 = selectedAction.co2_impact ?? selectedAction.co2_kg ?? 0;
            impactValue.textContent = `+${selectedAction.points} pts · ${co2} kg CO₂`;
        }
    });

    form.addEventListener('submit', async (event) => {

        event.preventDefault();
        submitBtn.disabled = true;
        submitBtn.textContent = 'Guardando...';

        const payload = {
            user_id: 1,
            action_type_id: parseInt(actionSelect.value, 10),
            action_date: dateInput.value,
            description: descriptionInput.value.trim() || null
        };

        try {

            await createAction(payload);
            form.reset();
            impactValue.textContent = '+0 pts · 0 kg CO₂';
            closeModal();
            if (typeof onSuccessCallBack === 'function') {onSuccessCallBack();}
            window.dispatchEvent(new CustomEvent('action:created'));
        }

        catch (error) {
            alert(`No se pudo guardar la acción: ${error.message}`);
        }

        finally {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Guardar eco-acción';
        }

    });

    loadCatalog();

}