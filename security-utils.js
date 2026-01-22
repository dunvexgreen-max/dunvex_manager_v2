/**
 * Security Utils for Dunvex App
 * Provides: Throttling, Bot detection, and Honeypot
 */

(function () {
	const lastRequestTime = {};
	const requestCounter = {};
	const PAGE_LOAD_TIME = Date.now();
	let isBot = false;

	// --- CONFIG ---
	const MIN_GAP = 2000; // 2 seconds between clicks for same action
	const MAX_REQ_PER_MIN = 10;
	const MIN_INTERACT_TIME = 2000; // 2 seconds after page load

	// Create Honeypot field inside forms automatically
	function setupHoneypot() {
		const forms = document.querySelectorAll('form');
		forms.forEach(form => {
			if (!form.querySelector('.dv-hp-field')) {
				const hp = document.createElement('div');
				hp.style.display = 'none';
				hp.className = 'dv-hp-field';
				hp.innerHTML = `<input type="text" name="dv_hp_email" tabindex="-1" autocomplete="off" value="">`;
				form.prepend(hp);
			}
		});
	}

	// Exported check function
	window.SecurityProvider = {
		check: function (action) {
			const now = Date.now();

			// 1. Honeypot check
			const hpFields = document.querySelectorAll('input[name="dv_hp_email"]');
			for (let field of hpFields) {
				if (field.value !== "") {
					console.error('Security: Bot behavior detected (hp)');
					isBot = true;
					return false;
				}
			}

			// 2. Interaction speed check
			if (now - PAGE_LOAD_TIME < MIN_INTERACT_TIME) {
				console.warn('Security: Too fast interaction');
				return false;
			}

			// 3. Throttle check
			if (lastRequestTime[action] && (now - lastRequestTime[action] < MIN_GAP)) {
				this.notify('Bạn đang thao tác quá nhanh, vui lòng chờ...');
				return false;
			}

			// 4. Rate limit check (local)
			const oneMinAgo = now - 60000;
			if (!requestCounter[action]) requestCounter[action] = [];
			requestCounter[action] = requestCounter[action].filter(time => time > oneMinAgo);

			if (requestCounter[action].length >= MAX_REQ_PER_MIN) {
				this.notify('Quá nhiều yêu cầu. Vui lòng thử lại sau 1 phút.');
				return false;
			}

			// Update state
			lastRequestTime[action] = now;
			requestCounter[action].push(now);
			return true;
		},

		notify: function (msg) {
			// Try to find toast function from the host page
			if (typeof window.showToast === 'function') {
				window.showToast(msg, true);
			} else if (typeof window.showMsg === 'function') {
				window.showMsg(msg, 'error');
			} else {
				alert(msg);
			}
		}
	};

	// Initialize
	window.addEventListener('DOMContentLoaded', setupHoneypot);
})();
