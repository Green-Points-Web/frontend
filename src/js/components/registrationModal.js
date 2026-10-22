import { getActionTypes, createAction } from "../services/actionService.js";

const FOCUSABLE_SELECTOR = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

function trapFocus(event, container) {

    if (event.key !== 'Tab') return;

    const focusable = Array.from(container.querySelectorAll(FOCUSABLE_SELECTOR));
    if (!focusable.length) return;

    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
    }

    else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
    }
}

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

    const today = new Date().toISOString().slice(0, 10);
    if (dateInput) dateInput.max = today;

    if (!modal || !form) return;

    modal.setAttribute('aria-hidden', 'true');

    let catalogData = [];
    let lastFocusedElement = null;

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

    const openModal = () => {
        lastFocusedElement = document.activeElement;
        modal.classList.add('is-active');
        modal.setAttribute('aria-hidden', 'false');
        actionSelect?.focus();
    };

    const closeModal = () => {
        modal.classList.remove('is-active');
        modal.setAttribute('aria-hidden', 'true');
        lastFocusedElement?.focus();
        lastFocusedElement = null;
    };

    openBtn?.addEventListener('click', openModal);
    closeBtn?.addEventListener('click', closeModal);
    cancelBtn?.addEventListener('click', closeModal);

    modal.addEventListener('click', (event) => {
        if (event.target === modal) closeModal();
    });

    document.addEventListener('keydown', (event) => {

        if (!modal.classList.contains('is-active')) return;

        if (event.key === 'Escape') {
            closeModal();
            return;
        }

        trapFocus(event, modal);
    });

    actionSelect.addEventListener('change', (e) => {

        const selectedId = parseInt(e.target.value, 10);
        const selectedAction = catalogData.find(item => item.id === selectedId);

        if (selectedAction) {
            const co2 = selectedAction.co2_impact ?? selectedAction.co2_kg ?? 0;
            impactValue.textContent = `+${selectedAction.points} pts · ${co2} kg CO₂`;
        }
    });

    form.addEventListener('submit', async (event) => {

        if (dateInput.value > today) {
            alert('No puedes registrar una acción en una fecha futura.');
            submitBtn.disabled = false;
            submitBtn.textContent = 'Guardar acción';
            return;
        }

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
            submitBtn.textContent = 'Guardar acción';
        }

    });

    loadCatalog();

}