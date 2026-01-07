/**
 * DUNVEX CHATBOT WIDGET
 * Handles chat logic, UI injection, and state persistence.
 * Version: 1.0
 */

// Configuration
const CRM_URL_BOT = 'https://script.google.com/macros/s/AKfycbyBsrpwien3g22UPNgprRq0iRA7wDww9PjRC9_WLrJvQFN2ADAnpvrikH4yAMlOrFF8vw/exec';

// Variables
let botData = {};
let isBotLoaded = false;
let currentBotState = null; // null | 'check_product' | 'check_customer'
let chatHistory = [];

// Initialize Chatbot on Load
document.addEventListener('DOMContentLoaded', () => {
	// Determine if we should show the bot. We show it on all pages as requested.
	injectChatWidget();
	loadChatHistory();

	// Auto-load data if chat was previously open
	if (localStorage.getItem('dunvex_chat_open') === 'true') {
		document.getElementById('chatWindow').classList.add('active');
		loadBotData();
	}
});

// Helper to check login status
function getBotUser() {
	// Try to get from global currentUser variable first (if main script loaded)
	if (typeof currentUser !== 'undefined') return currentUser;
	// Else try localStorage
	const userStr = localStorage.getItem('user');
	return userStr ? JSON.parse(userStr) : null;
}

// 1. Inject UI
function injectChatWidget() {
	// CSS to inject
	const css = `
		.chat-btn {
			position: fixed;
			bottom: 20px;
			right: unset;
            left: 20px;
			width: 60px;
			height: 60px;
			background: linear-gradient(135deg, #6366f1, #c084fc);
			border-radius: 50%;
			display: flex;
			align-items: center;
			justify-content: center;
			font-size: 2rem;
			color: white;
			cursor: pointer;
			box-shadow: 0 10px 30px rgba(99, 102, 241, 0.4);
			z-index: 5000;
			transition: 0.3s;
            user-select: none;
		}
		.chat-btn:hover { transform: scale(1.1); }
		
		.chat-window {
			position: fixed;
			bottom: 90px;
			right: unset;
            left: 20px;
			width: 350px;
			height: 500px;
			background: #1e293b;
			border: 1px solid rgba(255, 255, 255, 0.1);
			border-radius: 20px;
			display: none;
			flex-direction: column;
			z-index: 5000;
			box-shadow: 0 20px 50px rgba(0,0,0,0.5);
			overflow: hidden;
            font-family: 'Outfit', sans-serif;
		}
		.chat-window.active { display: flex; animation: slideUp 0.3s ease; }
		
		.chat-header {
			padding: 15px;
			background: rgba(255,255,255,0.05);
			border-bottom: 1px solid rgba(255, 255, 255, 0.1);
			display: flex;
			justify-content: space-between;
			align-items: center;
            color: #f8fafc;
		}
		
		.chat-body {
			flex: 1;
			padding: 15px;
			overflow-y: auto;
			display: flex;
			flex-direction: column;
			gap: 10px;
            color: #f8fafc;
		}
		
		.chat-msg {
			padding: 10px 15px;
			border-radius: 12px;
			font-size: 0.9rem;
			line-height: 1.4;
			max-width: 80%;
            word-wrap: break-word;
		}
		
		.chat-msg.bot {
			background: rgba(255,255,255,0.1);
			color: #f8fafc;
			align-self: flex-start;
			border-bottom-left-radius: 2px;
		}
		
		.chat-msg.user {
			background: #6366f1;
			color: white;
			align-self: flex-end;
			border-bottom-right-radius: 2px;
		}
		
		.chat-footer {
			padding: 10px;
			border-top: 1px solid rgba(255, 255, 255, 0.1);
			display: flex;
			gap: 10px;
		}
		
		#chatInput {
			flex: 1;
			padding: 10px;
			border-radius: 20px;
			border: none;
			background: rgba(0,0,0,0.3);
			color: white;
            outline: none;
		}
        #chatInput:focus { background: rgba(0,0,0,0.5); }
		
		.chat-send-btn {
			background: none;
			border: none;
			color: #6366f1;
			font-size: 1.5rem;
			cursor: pointer;
		}
		
		@keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
    `;

	// Inject CSS
	const style = document.createElement('style');
	style.innerHTML = css;
	document.head.appendChild(style);

	// Inject HTML
	const html = `
        <div id="chatBtn" class="chat-btn" onclick="toggleChat()">🤖</div>
        <div id="chatWindow" class="chat-window">
            <div class="chat-header">
                <div style="font-weight: 800;">Trợ lý Kinh doanh AI</div>
                <div style="display: flex; gap: 10px; align-items: center;">
                    <span style="font-size: 1rem; cursor: pointer;" title="Xóa lịch sử" onclick="clearChatHistory()">🗑️</span>
                    <span style="font-size: 1.2rem; cursor: pointer;" onclick="toggleChat()">✕</span>
                </div>
            </div>
            <div id="chatBody" class="chat-body"></div>
            <div class="chat-footer">
                <input type="text" id="chatInput" placeholder="Nhập câu hỏi..." onkeypress="if(event.key==='Enter') handleChatSend()">
                <button class="chat-send-btn" onclick="handleChatSend()">➤</button>
            </div>
        </div>
    `;

	const div = document.createElement('div');
	div.innerHTML = html;
	document.body.appendChild(div);
}

// 2. Logic
async function loadBotData() {
	if (isBotLoaded) return;
	const user = getBotUser();

	// If no user logged in, we can't fetch personal/sales data
	if (!user || !user.email) return;

	try {
		const res = await fetch(CRM_URL_BOT, {
			method: 'POST',
			body: JSON.stringify({ action: 'getBotContext', salesId: user.email })
		});
		const data = await res.json();
		if (data.success) {
			botData = data.stats; // Now contains { id: { name, totalRevenue... } }
			isBotLoaded = true;
			console.log("Bot Data Loaded", Object.keys(botData).length + " customers");
		}
	} catch (e) { console.warn("Lỗi load bot data", e); }
}

function toggleChat() {
	const win = document.getElementById('chatWindow');
	win.classList.toggle('active');

	const isActive = win.classList.contains('active');
	localStorage.setItem('dunvex_chat_open', isActive);

	if (isActive) {
		loadBotData();
		scrollToBottom();
		document.getElementById('chatInput').focus();
	}
}

function scrollToBottom() {
	const body = document.getElementById('chatBody');
	if (body) body.scrollTop = body.scrollHeight;
}

async function loadChatHistory() {
	const user = getBotUser();
	if (!user) return;

	// Clear current UI first
	document.getElementById('chatBody').innerHTML = '';

	try {
		// We can create a getHistory endpoint if we want to load old messages on refresh
		// For now, let's just leave it empty or load from localStorage if we want speed
		// BUT user asked for JSON storage. 
		// Let's implement 'getHistory' in handleChatAction or separate one.
		// Actually, handleChatAction returns history but only when sending.
		// Let's assume we start fresh or implementing a 'getChatHistory' action in GAS would be better.
		// Re-using local storage for 'quick view' but really should fetch from server.

		// Since we didn't add 'getChatHistory' to GAS yet (we only did chat action), 
		// we'll rely on the chat action to sync history OR just show welcome message.
		// User asked for history to be saved in JSON. 
		// Let's rely on immediate conversation. To retrieve old history, we'd need another call.

		// TEMPORARY: Just show welcome, history is saved in backend.
		const welcome = "Xin chào! Tôi có thể giúp gì cho bạn? <br><span style='font-size: 0.8rem; opacity: 0.7;'>(Ví dụ: 'Doanh số Đức Toàn', 'Cách lên đơn hàng')</span>";
		addChatMsg(welcome, 'bot', false);

	} catch (e) { console.warn(e); }
}

async function clearChatHistory() {
	if (confirm('Xóa toàn bộ lịch sử chat?')) {
		const user = getBotUser();
		document.getElementById('chatBody').innerHTML = '';
		if (user) {
			await fetch(CRM_URL_BOT, {
				method: 'POST',
				body: JSON.stringify({ action: 'clearChat', userId: user.email })
			});
		}
		loadChatHistory();
	}
}

async function handleChatSend() {
	const input = document.getElementById('chatInput');
	const text = input.value.trim();
	if (!text) return;
	const user = getBotUser();
	if (!user) {
		addChatMsg("Bạn cần đăng nhập để chat.", 'bot', false);
		return;
	}

	addChatMsg(text, 'user', false); // Render immediately, backend saves it
	input.value = '';

	// Send to Backend
	try {
		const res = await fetch(CRM_URL_BOT, {
			method: 'POST',
			body: JSON.stringify({
				action: 'chat',
				userId: user.email,
				message: text,
				context: { page: document.title, botDataSummary: botData } // Pass context
			})
		});
		const data = await res.json();

		if (data.success) {
			// Backend returns AI response
			addChatMsg(data.response, 'bot', false);
		} else {
			addChatMsg("Lỗi: " + data.message, 'bot', false);
		}
	} catch (e) {
		addChatMsg("Lỗi kết nối server.", 'bot', false);
	}
}

function addChatMsg(text, type, save = false) {
	// Save param is deprecated since we save to backend
	renderChatMsg(text, type);
}

function renderChatMsg(text, type) {
	const body = document.getElementById('chatBody');
	if (!body) return;
	const div = document.createElement('div');
	div.className = `chat-msg ${type}`;
	div.innerHTML = text.replace(/\n/g, '<br>');
	body.appendChild(div);
	scrollToBottom();
}

// Removed client-side simulation (processBotQuery) in favor of Server-side AI

