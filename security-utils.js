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
	const SESSION_TIMEOUT = 12 * 60 * 60 * 1000; // 12 hours in ms
	const STORAGE_KEY = 'dv_secure_app_data';

	// Simple Encryption Key (Client-side obfuscation)
	const SECRET_KEY = 'dv_client_sec_2025';

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

	function xorCipher(text) {
		if (!text) return "";
		let result = "";
		for (let i = 0; i < text.length; i++) {
			result += String.fromCharCode(text.charCodeAt(i) ^ SECRET_KEY.charCodeAt(i % SECRET_KEY.length));
		}
		return btoa(unescape(encodeURIComponent(result)));
	}

	function xorDecipher(encoded) {
		if (!encoded) return "";
		try {
			let text = decodeURIComponent(escape(atob(encoded)));
			let result = "";
			for (let i = 0; i < text.length; i++) {
				result += String.fromCharCode(text.charCodeAt(i) ^ SECRET_KEY.charCodeAt(i % SECRET_KEY.length));
			}
			return result;
		} catch (e) { return ""; }
	}

	// Exported check function
	window.SecurityProvider = {
		saveSession: function (userData, permissions) {
			const session = {
				user: userData,
				permissions: permissions,
				timestamp: Date.now()
			};
			const encrypted = xorCipher(JSON.stringify(session));
			localStorage.setItem(STORAGE_KEY, encrypted);

			// Clean legacy keys
			localStorage.removeItem('user');
			localStorage.removeItem('permissions');
		},

		getSession: function () {
			const encrypted = localStorage.getItem(STORAGE_KEY);
			if (!encrypted) return null;

			const decrypted = xorDecipher(encrypted);
			if (!decrypted) return null;

			try {
				const session = JSON.parse(decrypted);
				// Check expiry
				if (Date.now() - session.timestamp > SESSION_TIMEOUT) {
					console.warn('Security: Session expired');
					this.logout();
					return null;
				}
				return session;
			} catch (e) { return null; }
		},

		logout: function () {
			localStorage.removeItem(STORAGE_KEY);
			if (!window.location.pathname.endsWith('auth.html')) {
				window.location.href = 'auth.html';
			}
		},

		validateAccess: function () {
			const session = this.getSession();
			const isAuthPage = window.location.pathname.endsWith('auth.html');

			if (!session && !isAuthPage) {
				window.location.href = 'auth.html';
			} else if (session && isAuthPage) {
				// Already logged in, go to home
				window.location.href = 'index.html';
			}
			return session;
		},

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
