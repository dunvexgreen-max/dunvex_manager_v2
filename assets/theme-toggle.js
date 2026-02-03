
/**
 * Theme Toggle Utility
 * Handles Light/Dark mode switching and persistence.
 */
document.addEventListener('DOMContentLoaded', () => {
	// 1. Initialize Theme
	const storedTheme = localStorage.getItem('theme');
	const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

	if (storedTheme) {
		document.documentElement.setAttribute('data-theme', storedTheme);
	} else if (systemDark && !storedTheme) {
		document.documentElement.setAttribute('data-theme', 'dark');
	}

	// 2. Add Toggle to Nav or predefined container
	const navAuth = document.querySelector('.nav-auth') || document.querySelector('.nav-actions') || document.querySelector('nav');
	const manualContainer = document.getElementById('theme-toggle-container');

	function createToggle(container) {
		if (!container) return;

		const toggleWrapper = document.createElement('div');
		toggleWrapper.className = 'theme-switch-wrapper';

		const currentTheme = getCurrentTheme();

		toggleWrapper.innerHTML = `
			<label class="theme-switch" for="theme-checkbox">
				<input type="checkbox" id="theme-checkbox" ${currentTheme === 'dark' ? 'checked' : ''} />
				<div class="slider-round">
					<i class="fas fa-sun icon-sun"></i>
					<i class="fas fa-moon icon-moon"></i>
				</div>
			</label>
		`;

		container.appendChild(toggleWrapper);

		const checkbox = toggleWrapper.querySelector('#theme-checkbox');
		checkbox.addEventListener('change', (e) => {
			if (e.target.checked) {
				document.documentElement.setAttribute('data-theme', 'dark');
				localStorage.setItem('theme', 'dark');
			} else {
				document.documentElement.setAttribute('data-theme', 'light');
				localStorage.setItem('theme', 'light');
			}
		});
	}

	if (manualContainer) {
		createToggle(manualContainer);
	} else if (navAuth) {
		createToggle(navAuth);
	}
});

function getCurrentTheme() {
	const attr = document.documentElement.getAttribute('data-theme');
	if (attr) return attr;
	return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}
