// Initialize Chatbot on Load
document.addEventListener('DOMContentLoaded', () => {
	// Only on index.html
	const isHomePage = window.location.pathname.endsWith('index.html') || window.location.pathname === '/' || window.location.pathname.endsWith('/');
	if (!isHomePage) return;

	injectChatWidget();
	loadChatHistory();

	// Tự động kiểm tra tin nhắn mới mỗi 5 giây
	setInterval(() => {
		const win = document.getElementById('chatWindow');
		if (win && win.classList.contains('active')) {
			loadChatHistory(true); // pass true to indicate a silent background poll
		}
	}, 5000);

	setTimeout(() => {
		if (document.getElementById('chatBody').children.length === 0) {
			addChatMsg("🤖 Xin chào! Tôi là Trợ lý Dunvex. Bạn cần hướng dẫn hay muốn nhắn tin hỗ trợ?", 'bot');
			renderQuickReplies();
		}
	}, 1000);
});

// 1. Inject UI & CSS
function injectChatWidget() {
	const css = `
		.chat-btn {
			position: fixed;
			bottom: 30px;
			left: 30px;
			width: 60px;
			height: 60px;
			background: linear-gradient(135deg, #FACC15, #EAB308); /* Yellow gradient */
			border-radius: 50%;
			display: flex;
			align-items: center;
			justify-content: center;
			font-size: 1.8rem;
			color: #0f172a; /* Dark Icon */
			cursor: pointer;
			box-shadow: 0 10px 30px rgba(250, 204, 21, 0.4);
			z-index: 9999;
			transition: 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
		}
		.chat-btn:hover { transform: scale(1.1) rotate(10deg); }
		
		.chat-window {
			position: fixed;
			bottom: 100px;
			left: 30px;
			width: 380px;
			height: 600px;
			background: #ffffff; /* White background */
			border: 1px solid rgba(0, 0, 0, 0.1);
			border-radius: 28px;
			display: none;
			flex-direction: column;
			z-index: 9999;
			box-shadow: 0 25px 60px rgba(0,0,0,0.15); /* Softer shadow */
			overflow: hidden;
		}
		.chat-window.active { display: flex; animation: slideUp 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
		
		.chat-header {
			padding: 20px;
			background: #f8fafc;
			border-bottom: 1px solid #e2e8f0;
			display: flex;
			justify-content: space-between;
			align-items: center;
			color: #0f172a; /* Dark text */
		}
		
		.chat-body {
			flex: 1;
			padding: 20px;
			overflow-y: auto;
			display: flex;
			flex-direction: column;
			gap: 12px;
			scroll-behavior: smooth;
		}
		
		.chat-msg {
			padding: 12px 18px;
			border-radius: 20px;
			font-size: 0.9rem;
			line-height: 1.5;
			max-width: 80%;
			word-wrap: break-word;
			position: relative;
			animation: fadeInMsg 0.3s ease;
		}
		@keyframes fadeInMsg { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }

		.chat-msg.bot { background: #f1f5f9; color: #0f172a; align-self: flex-start; border-bottom-left-radius: 4px; border: 1px solid #e2e8f0; }
		.chat-msg.user { background: linear-gradient(135deg, #FACC15, #EAB308); color: #0f172a; align-self: flex-end; border-bottom-right-radius: 4px; font-weight: 500; }
		
		.chat-msg img {
			max-width: 100%;
			border-radius: 12px;
			margin-bottom: 8px;
			display: block;
			cursor: pointer;
		}

		.msg-meta { font-size: 0.7rem; opacity: 0.6; margin-top: 5px; }
		.bot .msg-meta { text-align: left; }
		.user .msg-meta { text-align: right; }

		.quick-replies {
			display: flex;
			flex-wrap: wrap;
			gap: 8px;
			margin-top: 10px;
		}
		.qr-btn {
			background: #fefce8; /* Light Yellow */
			border: 1px solid #FACC15;
			color: #854d0e;
			padding: 8px 14px;
			border-radius: 14px;
			font-size: 0.8rem;
			font-weight: 600;
			cursor: pointer;
			transition: 0.2s;
		}
		.qr-btn:hover { background: #FACC15; color: #0f172a; transform: translateY(-2px); }
		
		.chat-footer {
			padding: 20px;
			border-top: 1px solid #e2e8f0;
			display: flex;
			flex-direction: column;
			gap: 10px;
			background: #f8fafc;
		}
		
		.input-row { display: flex; gap: 10px; align-items: center; }

		.chat-input-wrapper {
			flex: 1;
			position: relative;
		}

		#chatInput {
			width: 100%;
			padding: 12px 45px 12px 20px;
			border-radius: 25px;
			border: 1px solid #e2e8f0;
			background: #ffffff;
			color: #0f172a;
			outline: none;
			font-size: 0.9rem;
			transition: 0.3s;
		}
		#chatInput:focus { border-color: #FACC15; background: #fff; box-shadow: 0 0 0 2px rgba(250, 204, 21, 0.2); }

		.btn-attach {
			position: absolute;
			right: 12px;
			top: 50%;
			transform: translateY(-50%);
			background: none;
			border: none;
			color: #64748b;
			cursor: pointer;
			padding: 5px;
			display: flex;
			align-items: center;
			justify-content: center;
		}
		.btn-attach:hover { color: #FACC15; }

		.chat-send-btn { 
			background: #FACC15; 
			border: none; 
			width: 44px; 
			height: 44px; 
			border-radius: 50%; 
			color: #0f172a; 
			cursor: pointer; 
			display: flex; 
			align-items: center; 
			justify-content: center;
			box-shadow: 0 4px 12px rgba(250, 204, 21, 0.3);
			transition: 0.3s;
		}
		.chat-send-btn:hover { transform: scale(1.1); box-shadow: 0 6px 16px rgba(250, 204, 21, 0.4); }

		.img-preview-bar {
			display: none;
			padding: 10px;
			background: #f1f5f9;
			border-radius: 12px;
			position: relative;
		}
		.img-preview-bar img { height: 60px; border-radius: 8px; }
		.btn-remove-img {
			position: absolute;
			top: -5px;
			right: -5px;
			background: #ef4444;
			color: white;
			border-radius: 50%;
			width: 20px;
			height: 20px;
			display: flex;
			align-items: center;
			justify-content: center;
			font-size: 12px;
			cursor: pointer;
		}
		
		@keyframes slideUp { from { opacity: 0; transform: translateY(40px) scale(0.95); } to { opacity: 1; transform: translateY(0) scale(1); } }

		::-webkit-scrollbar { width: 5px; }
		::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
	`;

	const style = document.createElement('style');
	style.innerHTML = css;
	document.head.appendChild(style);

	const html = `
		<div id="chatBtn" class="chat-btn" onclick="toggleChat()">🤖</div>
		<div id="chatWindow" class="chat-window">
			<div class="chat-header">
				<div style="display: flex; align-items: center; gap: 12px;">
					<div style="width: 12px; height: 12px; border-radius: 50%; background: #22c55e; box-shadow: 0 0 10px #22c55e;"></div>
					<div style="font-weight: 800; letter-spacing: 0.5px; font-family: 'Outfit', sans-serif;">DUNVEX ASSISTANT</div>
				</div>
				<span style="font-size: 1.8rem; cursor: pointer; color: #94a3b8; transition: 0.3s;" onclick="toggleChat()">×</span>
			</div>
			<div id="chatBody" class="chat-body"></div>
			<div id="imgPreviewBar" class="img-preview-bar">
				<img id="imgPreview" src="">
				<div class="btn-remove-img" onclick="removeSelectedImage()">×</div>
			</div>
			<div class="chat-footer">
				<div class="input-row">
					<div class="chat-input-wrapper">
						<input type="text" id="chatInput" placeholder="Nhập tin nhắn..." onkeypress="if(event.key==='Enter') handleChatSend()">
						<button class="btn-attach" onclick="document.getElementById('imgUpload').click()">
							<svg style="width:20px;height:20px" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>
						</button>
						<input type="file" id="imgUpload" hidden accept="image/*" onchange="previewImage(this)">
					</div>
					<button class="chat-send-btn" onclick="handleChatSend()">
						<svg style="width:20px;height:20px;transform:rotate(45deg)" viewBox="0 0 24 24" fill="currentColor"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
					</button>
				</div>
			</div>
		</div>
	`;

	const div = document.createElement('div');
	div.id = 'dunvexChatbotWidget';
	div.innerHTML = html;
	document.body.appendChild(div);
}

// 2. Chat Logic
const CHAT_API = 'https://script.google.com/macros/s/AKfycbzL5nsc-u96YwEitgWn6J6Qx07LFrYI1D6D2Q7N7X7D6D2Q7N7X7D6D2Q/exec';
// Note: Replace with actual deployed Chatbot Script URL
const CHAT_BACKEND = 'https://script.google.com/macros/s/AKfycbw8gn4XKtN7XquKSEH0fDwEm2QU3PkL41kDbNZoYKcY4rQoPqkDPgq95zZl3WtLm_HjGg/exec';

async function handleChatSend() {
	const input = document.getElementById('chatInput');
	const text = input.value.trim();
	const imgInput = document.getElementById('imgUpload');
	const hasImg = imgInput.files && imgInput.files[0];
	const sendBtn = document.querySelector('.chat-send-btn');

	if ((!text && !hasImg) || sendBtn.disabled) return;

	// Khóa nút gửi để tránh bấm nhiều lần
	sendBtn.disabled = true;
	sendBtn.style.opacity = '0.5';
	sendBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';

	let user = (typeof currentUser !== 'undefined' && currentUser) ? currentUser : null;
	if (!user) {
		user = JSON.parse(localStorage.getItem('user') || '{"fullName":"Khách","email":"guest@dunvex.com"}');
	}

	let imgBase64 = null;
	if (hasImg) {
		imgBase64 = await toBase64(imgInput.files[0]);
	}

	// Thêm vào UI ngay lập tức
	addChatMsg(text, 'user', { image: imgBase64, timestamp: new Date().toISOString() });

	input.value = '';
	removeSelectedImage();

	try {
		const payload = {
			email: user.email,
			fullName: user.fullName,
			text: text,
			image: imgBase64,
			imageType: hasImg ? imgInput.files[0].type : null
		};

		const body = (typeof SecurityProvider !== 'undefined')
			? SecurityProvider.prepareRequest('send_msg', payload)
			: JSON.stringify({ action: 'send_msg', ...payload });

		const res = await fetch(CHAT_BACKEND, {
			method: 'POST',
			body: body
		});
		const data = await res.json();
		if (!data.success) console.error("Chat send error:", data.message);
	} catch (e) {
		console.error("Connection failed", e);
	} finally {
		// Mở khóa nút gửi
		sendBtn.disabled = false;
		sendBtn.style.opacity = '1';
		sendBtn.innerHTML = '<svg style="width:20px;height:20px;transform:rotate(45deg)" viewBox="0 0 24 24" fill="currentColor"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>';
	}
}

let lastMsgCount = 0;
async function loadChatHistory(isPoll = false) {
	let user = (typeof currentUser !== 'undefined' && currentUser) ? currentUser : null;
	if (!user) {
		user = JSON.parse(localStorage.getItem('user'));
	}
	if (!user) return;

	try {
		const body = (typeof SecurityProvider !== 'undefined')
			? SecurityProvider.prepareRequest('get_history', { email: user.email })
			: JSON.stringify({ action: 'get_history', email: user.email });

		const res = await fetch(CHAT_BACKEND, {
			method: 'POST',
			body: body
		});
		const data = await res.json();
		if (data.success && data.history) {
			// Chỉ re-render nếu số lượng tin nhắn thay đổi (tránh giật lag)
			if (data.history.length !== lastMsgCount) {
				const body = document.getElementById('chatBody');
				body.innerHTML = '';
				data.history.forEach(m => {
					addChatMsg(m.text, m.type === 'admin' ? 'bot' : 'user', {
						image: m.image,
						timestamp: m.timestamp,
						senderName: m.senderName
					});
				});
				lastMsgCount = data.history.length;
			}
		}
	} catch (e) { if (!isPoll) console.warn("Could not load history"); }
}

function addChatMsg(text, type, meta = {}) {
	const body = document.getElementById('chatBody');
	if (!body) return;

	const div = document.createElement('div');
	div.className = `chat-msg ${type}`;

	let html = '';
	if (meta.image) {
		html += `<img src="${meta.image}" onclick="window.open(this.src)">`;
	}
	if (text) {
		html += `<div>${text}</div>`;
	}

	const time = meta.timestamp ? new Date(meta.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';
	html += `<div class="msg-meta">${meta.senderName ? meta.senderName + ' • ' : ''}${time}</div>`;

	div.innerHTML = html;
	body.appendChild(div);
	scrollToBottom();
}

// Media Utils
function previewImage(input) {
	if (input.files && input.files[0]) {
		const reader = new FileReader();
		reader.onload = (e) => {
			document.getElementById('imgPreview').src = e.target.result;
			document.getElementById('imgPreviewBar').style.display = 'block';
		};
		reader.readAsDataURL(input.files[0]);
	}
}

function removeSelectedImage() {
	document.getElementById('imgUpload').value = '';
	document.getElementById('imgPreviewBar').style.display = 'none';
	document.getElementById('imgPreview').src = '';
}

const toBase64 = file => new Promise((resolve, reject) => {
	const reader = new FileReader();
	reader.readAsDataURL(file);
	reader.onload = () => resolve(reader.result);
	reader.onerror = error => reject(error);
});

// Tutorial Logic remains from before for quick help
const TUTORIAL_DATA = {
	"sp_tonkho": { q: "📦 Tạo SP & Tồn kho", a: `Vào menu <b>Sản phẩm</b> > Bấm Thêm để tạo mới. Quản lý kho tại tab <b>Tồn Kho</b>.` },
	"khachhang": { q: "👥 Tạo khách hàng", a: `Vào <b>CRM & Sales</b> > Bấm <b>+ Thêm khách hàng</b> và điền thông tin.` },
	"donhang": { q: "📝 Lên đơn hàng", a: `Vào <b>Đơn hàng</b> hoặc chọn Khách hàng trên bản đồ > Bấm <b>Lên đơn</b>.` }
};

function renderQuickReplies() {
	const body = document.getElementById('chatBody');
	const qrDiv = document.createElement('div');
	qrDiv.className = 'quick-replies';
	Object.keys(TUTORIAL_DATA).forEach(key => {
		const btn = document.createElement('button');
		btn.className = 'qr-btn';
		btn.innerText = TUTORIAL_DATA[key].q;
		btn.onclick = () => {
			addChatMsg(TUTORIAL_DATA[key].q, 'user');
			setTimeout(() => {
				addChatMsg(TUTORIAL_DATA[key].a, 'bot');
				renderQuickReplies();
			}, 500);
		};
		qrDiv.appendChild(btn);
	});
	body.appendChild(qrDiv);
	scrollToBottom();
}

function toggleChat() {
	const win = document.getElementById('chatWindow');
	win.classList.toggle('active');
	if (win.classList.contains('active')) {
		document.getElementById('chatInput').focus();
		scrollToBottom();
		loadChatHistory();
	}
}

function scrollToBottom() {
	const body = document.getElementById('chatBody');
	if (body) body.scrollTop = body.scrollHeight;
}

// Removed client-side simulation (processBotQuery) in favor of Server-side AI
