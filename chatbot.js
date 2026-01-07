/**
 * DUNVEX CHATBOT WIDGET
 * Handles chat logic, UI injection, and state persistence.
 * Version: 1.0
 */

// Configuration
const CRM_URL_BOT = 'https://script.google.com/macros/s/AKfycbzL5y-A_d6R-Bjh7n-T8jCq-w5JmH6V7kX9JZ4p0nQ/exec';

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
			right: 20px;
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
			right: 20px;
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

function loadChatHistory() {
	const saved = localStorage.getItem('dunvex_chat_history');
	if (saved) {
		try {
			chatHistory = JSON.parse(saved);
		} catch (e) { chatHistory = []; }

		chatHistory.forEach(msg => renderChatMsg(msg.text, msg.type));
	} else {
		// Welcome Msg if empty
		const welcome = "Xin chào! Tôi có thể giúp gì cho bạn? <br><span style='font-size: 0.8rem; opacity: 0.7;'>(Ví dụ: 'Doanh số Đức Toàn', 'Cách lên đơn hàng')</span>";
		addChatMsg(welcome, 'bot', true);
	}

	// Load state
	const savedState = localStorage.getItem('dunvex_bot_state');
	if (savedState) currentBotState = savedState;
}

function clearChatHistory() {
	if (confirm('Xóa toàn bộ lịch sử chat?')) {
		chatHistory = [];
		localStorage.removeItem('dunvex_chat_history');
		localStorage.removeItem('dunvex_bot_state');
		document.getElementById('chatBody').innerHTML = '';
		currentBotState = null;
		loadChatHistory(); // reload welcome
	}
}

function handleChatSend() {
	const input = document.getElementById('chatInput');
	const text = input.value.trim();
	if (!text) return;

	addChatMsg(text, 'user');
	input.value = '';

	setTimeout(() => {
		const response = processBotQuery(text);
		addChatMsg(response, 'bot');
	}, 600);
}

function addChatMsg(text, type, save = true) {
	if (save) {
		chatHistory.push({ text, type, time: Date.now() });
		// Keep limited history? Let's keep last 50 for now
		if (chatHistory.length > 50) chatHistory.shift();
		localStorage.setItem('dunvex_chat_history', JSON.stringify(chatHistory));
	}
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

function processBotQuery(query) {
	const q = query.toLowerCase();

	// Page Context Awareness
	const pageTitle = document.title;

	// --- STATEFUL LOGIC ---
	if (currentBotState === 'check_product') {
		saveBotState(currentBotState); // persist
		if (q.includes('chưa') || q.includes('không')) {
			updateBotState('check_customer');
			return "Vậy anh đã **tạo data khách hàng** chưa?";
		} else if (q.includes('rồi') || q.includes('có')) {
			updateBotState(null);
			return "Tuyệt vời! Nếu đã có sản phẩm thì anh chỉ cần vào mục **Quản lý đơn hàng** để tạo đơn nhé.";
		} else {
			return "Anh vui lòng trả lời 'Rồi' hoặc 'Chưa' để em hướng dẫn tiếp nhé.";
		}
	}

	if (currentBotState === 'check_customer') {
		if (q.includes('chưa') || q.includes('không')) {
			updateBotState(null);
			return `
                📋 **Quy trình lên đơn hàng cho người mới:**
                1️⃣ **Bước 1:** Vào tab **Khách hàng** để tạo hồ sơ khách hàng trước.
                2️⃣ **Bước 2:** Vào trang **Sản phẩm** để nhập danh mục sản phẩm.
                3️⃣ **Bước 3:** Vào trang **Quản lý đơn hàng** > Bấm nút "Tạo đơn".
                
                Anh hãy làm thử từng bước nhé!
            `;
		} else if (q.includes('rồi') || q.includes('có')) {
			updateBotState(null);
			return "OK! Nếu đã có khách hàng, anh hãy kiểm tra lại **Sản phẩm**. Nếu chưa có sản phẩm thì tạo sản phẩm trước, sau đó mới lên đơn được ạ.";
		} else {
			return "Anh vui lòng trả lời 'Rồi' hoặc 'Chưa' để em hướng dẫn tiếp nhé.";
		}
	}

	// --- INTENT DETECTION ---

	// Tutorial Trigger
	if (q.includes('lên đơn') || q.includes('tạo đơn') || (q.includes('mới') && q.includes('làm sao'))) {
		updateBotState('check_product');
		return "Để lên đơn hàng, em cần kiểm tra chút thông tin.\n\nAnh đã **tạo dữ liệu sản phẩm** trong hệ thống chưa?";
	}

	// Data Lookups (Need botData)
	// Try to find customer name in query
	let targetCust = null;
	if (Object.keys(botData || {}).length > 0) {
		// Search by Name in values
		targetCust = Object.values(botData).find(s => q.includes(s.name.toLowerCase()));
	}

	if (targetCust) {
		if (q.includes('doanh số') || q.includes('doanh thu') || q.includes('tiền')) {
			const revenue = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(targetCust.totalRevenue);
			let advice = targetCust.totalRevenue > 50000000 ? "🌟 Khách VIP! Cần chăm sóc kỹ." : "👉 Khách tiềm năng.";
			if (targetCust.totalRevenue === 0) advice = "Khách chưa mua gì.";

			return `📊 **${targetCust.name}**:\n- Tổng đơn: ${targetCust.totalOrders}\n- Doanh số: **${revenue}**\n\n${advice}`;
		}
		// Can add checkin logic here if we pass checkin history too, but sticking to basics for now.
	}

	// General Page Context Help
	if (pageTitle.includes('Đơn Hàng')) {
		if (q.includes('xoá') || q.includes('hủy')) return "Để hủy đơn hàng, anh hãy tìm đơn trong danh sách và bấm nút 'Xóa' (biểu tượng thùng rác). Lưu ý chỉ xóa được đơn chưa hoàn thành.";
		if (q.includes('sửa')) return "Anh bấm vào nút 'Sửa' (hình cây bút) để cập nhật lại đơn hàng nhé.";
	}

	if (q.includes('xin chào') || q.includes('hello')) return "Chào anh/chị! Chúc một ngày làm việc hiệu quả.";

	return "Em chưa hiểu rõ ý anh. Anh có thể hỏi về:\n- 'Cách lên đơn hàng'\n- 'Doanh số [Tên khách]'\n- Hoặc các câu hỏi về chức năng.";
}

function updateBotState(state) {
	currentBotState = state;
	if (state) localStorage.setItem('dunvex_bot_state', state);
	else localStorage.removeItem('dunvex_bot_state');
}

function saveBotState(state) {
	if (state) localStorage.setItem('dunvex_bot_state', state);
}
