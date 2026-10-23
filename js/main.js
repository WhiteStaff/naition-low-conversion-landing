document.addEventListener('DOMContentLoaded', () => {
    const registrationSection = document.getElementById('registration');
    const form = document.getElementById('registration-form');
    const message = document.getElementById('form-message');
    const registerButtons = document.querySelectorAll('.btn-register');
    const stickyCta = document.querySelector('.sticky-cta');

    // Плавающая кнопка перекрывает кнопку отправки, поэтому у формы её прячем
    if (stickyCta && registrationSection && 'IntersectionObserver' in window) {
        new IntersectionObserver(([entry]) => {
            stickyCta.classList.toggle('is-hidden', entry.isIntersecting);
        }).observe(registrationSection);
    }
    const tariffSelect = document.getElementById('tariff-select');
    const purposeSelect = document.getElementById('purpose-select');
    const tariffHint = document.getElementById('tariff-hint');
    const tariffHints = {
        'Базовый — 4 900 ₽': 'Полный однодневный курс, сертификат, памятка и кофе-брейки.',
        'Расширенный — 7 900 ₽': 'Всё из базового + набор перевязочных материалов и дополнительный практический блок.',
        'Корпоративный — 12 900 ₽': 'Разбор рисков вашей профессии, консультация для HR и отчёт для работодателя. Число сотрудников обсудим по телефону.',
    };

    const updateTariffHint = () => {
        if (tariffHint && tariffSelect instanceof HTMLSelectElement) {
            tariffHint.textContent = tariffHints[tariffSelect.value] || '';
        }
    };

    tariffSelect?.addEventListener('change', updateTariffHint);

    registerButtons.forEach((button) => {
        button.addEventListener('click', () => {
            if (tariffSelect instanceof HTMLSelectElement && button.dataset.tariff) {
                tariffSelect.value = button.dataset.tariff;
                updateTariffHint();

                if (purposeSelect instanceof HTMLSelectElement && button.dataset.tariff.startsWith('Корпоративный')) {
                    purposeSelect.value = 'Корпоративное обучение';
                }
            }

            if (!registrationSection) {
                return;
            }

            registrationSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
    });

    if (!form) {
        return;
    }

    form.addEventListener('submit', async (event) => {
        event.preventDefault();

        const submitButton = form.querySelector('button[type="submit"]');
        const formData = new FormData(form);

        // API сохраняет только purpose, поэтому тариф дописываем в него
        const tariff = formData.get('tariff');
        if (tariff) {
            formData.set('purpose', `${formData.get('purpose')} · Тариф: ${tariff}`);
            formData.delete('tariff');
        }

        if (submitButton instanceof HTMLButtonElement) {
            submitButton.disabled = true;
        }

        if (message) {
            message.textContent = '';
            message.className = 'form-message';
        }

        try {
            const response = await fetch(form.action, {
                method: 'POST',
                body: formData,
            });

            const data = await response.json();

            if (!response.ok || !data.ok) {
                throw new Error(data.error || 'Не удалось отправить заявку.');
            }

            if (message) {
                message.textContent = 'Заявка успешно отправлена. Мы свяжемся с вами в ближайшее время.';
                message.className = 'form-message success';
                message.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }

            form.reset();
            updateTariffHint();
        } catch (error) {
            if (message) {
                message.textContent = error instanceof Error ? error.message : 'Не удалось отправить заявку.';
                message.className = 'form-message error';
            }
        } finally {
            if (submitButton instanceof HTMLButtonElement) {
                submitButton.disabled = false;
            }
        }
    });
});
