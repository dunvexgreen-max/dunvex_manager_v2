/**
 * DUNVEX CHATBOT WIDGET - TUTORIAL VERSION
 * Restricted to index.html only, providing quick-access guides.
 */

// Initialize Chatbot on Load
document.addEventListener('DOMContentLoaded', () => {
	// 1. Chỉ hiển thị ở trang chủ index.html
	const isHomePage = window.location.pathname.endsWith('index.html') || window.location.pathname === '/' || window.location.pathname.endsWith('/');
	if (!isHomePage) return;

	injectChatWidget();

	// Hiển thị tin nhắn chào mừng kèm các nút gợi ý nhanh
	setTimeout(() => {
		addChatMsg("🤖 Xin chào! Tôi là Trợ lý Dunvex. Bạn cần hướng dẫn về tính năng nào dưới đây?", 'bot');
		renderQuickReplies();
	}, 500);
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
			background: linear-gradient(135deg, #6366f1, #c084fc);
			border-radius: 50%;
			display: flex;
			align-items: center;
			justify-content: center;
			font-size: 1.8rem;
			color: white;
			cursor: pointer;
			box-shadow: 0 10px 30px rgba(99, 102, 241, 0.4);
			z-index: 9999;
			transition: 0.3s;
		}
		.chat-btn:hover { transform: scale(1.1) rotate(10deg); }
		
		.chat-window {
			position: fixed;
			bottom: 100px;
			left: 30px;
			width: 360px;
			height: 550px;
			background: #1e293b;
			border: 1px solid rgba(255, 255, 255, 0.1);
			border-radius: 24px;
			display: none;
			flex-direction: column;
			z-index: 9999;
			box-shadow: 0 25px 60px rgba(0,0,0,0.6);
			overflow: hidden;
			font-family: 'Outfit', sans-serif;
		}
		.chat-window.active { display: flex; animation: slideUp 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
		
		.chat-header {
			padding: 20px;
			background: rgba(255,255,255,0.03);
			border-bottom: 1px solid rgba(255, 255, 255, 0.08);
			display: flex;
			justify-content: space-between;
			align-items: center;
			color: #f8fafc;
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
			border-radius: 18px;
			font-size: 0.92rem;
			line-height: 1.5;
			max-width: 85%;
			word-wrap: break-word;
		}
		.chat-msg.bot { background: rgba(255,255,255,0.07); color: #f8fafc; align-self: flex-start; border-bottom-left-radius: 4px; }
		.chat-msg.user { background: #6366f1; color: white; align-self: flex-end; border-bottom-right-radius: 4px; }
		
		.quick-replies {
			display: flex;
			flex-wrap: wrap;
			gap: 8px;
			margin-top: 10px;
			padding: 0 5px;
		}
		.qr-btn {
			background: rgba(99, 102, 241, 0.15);
			border: 1px solid rgba(99, 102, 241, 0.3);
			color: #818cf8;
			padding: 8px 14px;
			border-radius: 12px;
			font-size: 0.82rem;
			font-weight: 600;
			cursor: pointer;
			transition: 0.2s;
		}
		.qr-btn:hover { background: #6366f1; color: white; border-color: #6366f1; }
		
		.chat-footer {
			padding: 15px;
			border-top: 1px solid rgba(255, 255, 255, 0.08);
			display: flex;
			gap: 10px;
		}
		#chatInput {
			flex: 1;
			padding: 12px 18px;
			border-radius: 99px;
			border: 1px solid rgba(255,255,255,0.1);
			background: rgba(0,0,0,0.2);
			color: white;
			outline: none;
			font-size: 0.9rem;
		}
		.chat-send-btn { background: #6366f1; border: none; width: 40px; height: 40px; border-radius: 50%; color: white; cursor: pointer; display: flex; align-items: center; justify-content: center; }
		
		@keyframes slideUp { from { opacity: 0; transform: translateY(40px) scale(0.95); } to { opacity: 1; transform: translateY(0) scale(1); } }
	`;

	const style = document.createElement('style');
	style.innerHTML = css;
	document.head.appendChild(style);

	const html = `
		<div id="chatBtn" class="chat-btn" onclick="toggleChat()">🤖</div>
		<div id="chatWindow" class="chat-window">
			<div class="chat-header">
				<div style="display: flex; align-items: center; gap: 10px;">
					<div style="width: 10px; height: 10px; border-radius: 50%; background: #22c55e;"></div>
					<div style="font-weight: 800; letter-spacing: 0.5px;">HƯỚNG DẪN DUNVEX</div>
				</div>
				<span style="font-size: 1.5rem; cursor: pointer; color: var(--text-muted);" onclick="toggleChat()">×</span>
			</div>
			<div id="chatBody" class="chat-body"></div>
			<div class="chat-footer">
				<input type="text" id="chatInput" placeholder="Nhập câu hỏi của bạn..." onkeypress="if(event.key==='Enter') handleChatSend()">
				<button class="chat-send-btn" onclick="handleChatSend()">➤</button>
			</div>
		</div>
	`;

	const div = document.createElement('div');
	div.id = 'dunvexChatbotWidget';
	div.innerHTML = html;
	document.body.appendChild(div);
}

// 2. Data & Response Logic
const TUTORIAL_DATA = {
	"sp_tonkho": {
		q: "📦 Hướng dẫn tạo sản phẩm & tồn kho",
		a: `<b>HƯỚNG DẪN TẠO SẢN PHẨM & QUẢN LÝ TỒN KHO:</b><br><br>
			1. Vào menu <b>Quản lý Sản phẩm</b>.<br>
			2. Bấm <b>Thêm sản phẩm mới</b>, điền thông tin (Tên, Quy cách, Giá). Bấm Lưu.<br>
			3. Để quản lý tồn kho: Chuyển sang tab <b>Tồn Kho</b>.<br>
			4. Nhập số lượng Nhập/Xuất tương ứng với ID sản phẩm. Hệ thống sẽ tự động tính tồn cuối và hiển thị cảnh báo nếu sắp hết hàng.`
	},
	"khachhang": {
		q: "👥 Hướng dẫn tạo khách hàng",
		a: `<b>HƯỚNG DẪN THÊM KHÁCH HÀNG MỚI:</b><br><br>
			1. Vào menu <b>CRM & Sales</b>.<br>
			2. Trên màn hình bản đồ hoặc danh sách, chọn nút <b>+ Thêm khách hàng</b>.<br>
			3. Nhập đầy đủ thông tin: Tên khách, SĐT, Địa chỉ.<br>
			4. Hệ thống sẽ tự động ghim vị trí GPS nếu bạn đang thao tác tại điểm khách hàng, giúp việc quản lý tuyến hành trình chính xác hơn.`
	},
	"donhang": {
		q: "📝 Hướng dẫn lên đơn hàng",
		a: `<b>QUY TRÌNH LÊN ĐƠN HÀNG:</b><br><br>
			1. Vào menu <b>Danh sách đơn hàng</b> hoặc bấm nút <b>Lên đơn nhanh</b>.<br>
			2. Tìm và chọn khách hàng đã có trong hệ thống.<br>
			3. Chọn sản phẩm từ danh mục, nhập số lượng.<br>
			4. Kiểm tra tổng tiền, điều chỉnh phí vận chuyển hoặc chiết khấu nếu có.<br>
			5. Bấm <b>Chốt đơn & In phiếu</b> để hoàn tất.`
	},
	"checkin": {
		q: "📍 Hướng dẫn check-in khách hàng",
		a: `<b>CÁCH THỰC HIỆN CHECK-IN:</b><br><br>
			1. Vào menu <b>CRM & Sales</b>.<br>
			2. Chọn khách hàng bạn đang ghé thăm trên bản đồ.<br>
			3. Bấm nút <b>Check-in</b>.<br>
			4. Chọn mục đích ghé thăm (Chào hàng, Thu nợ, Giao hàng...) và ghi chú nếu cần.<br>
			5. Bấm <b>Xác nhận vị trí</b>. Hệ thống sẽ ghi lại tọa độ và thời gian thực của bạn.`
	},
	"add_staff": {
		q: "➕ Hướng dẫn thêm nhân viên (Admin)",
		a: `<b>THÊM NHÂN VIÊN VÀO HỆ THỐNG (Dành cho Admin):</b><br><br>
			1. Đăng nhập tài khoản Admin, vào mục <b>Quản lý Nhân sự</b>.<br>
			2. Tại phần <b>Tạo Nhân Viên Mới</b>, nhập Họ tên và Email đăng nhập.<br>
			3. Chọn <b>Vai trò</b> phù hợp (Sale, Kho, Kế toán...).<br>
			4. Bấm <b>Tạo tài khoản</b>. Mật khẩu mặc định sẽ là <b>123456</b>.`
	},
	"del_staff": {
		q: "❌ Hướng dẫn xóa nhân viên (Admin)",
		a: `<b>CÁCH XÓA TÀI KHOẢN NHÂN VIÊN:</b><br><br>
			1. Truy cập vào mục <b>Quản lý Nhân sự</b>.<br>
			2. Tìm nhân viên cần xóa trong <b>Danh sách Tài khoản</b>.<br>
			3. Bấm vào biểu tượng <b>Thùng rác (Xóa)</b> ở cột Thao tác.<br>
			4. Nhấn <b>Xác nhận</b>. Tài khoản sẽ bị gỡ bỏ vĩnh viễn khỏi hệ thống quản lý của bạn.`
	}
};

const MASTER_API = 'https://script.google.com/macros/s/AKfycbz2FpV9hWeZKzBJyS636Hlf7JrM8bfA03YbH9xF3KYqdHJXcpgvCLoD2xjOGCDKzpfj/exec';

function renderQuickReplies(excludeKey = null) {
	const body = document.getElementById('chatBody');
	// Xóa các quick replies cũ nếu có để tránh lặp lại cùng lúc
	const oldQR = body.querySelector('.quick-replies');
	if (oldQR) oldQR.remove();

	const qrDiv = document.createElement('div');
	qrDiv.className = 'quick-replies';

	Object.keys(TUTORIAL_DATA).forEach(key => {
		if (key === excludeKey) return; // Bỏ qua câu vừa chọn
		const btn = document.createElement('button');
		btn.className = 'qr-btn';
		btn.innerText = TUTORIAL_DATA[key].q;
		btn.onclick = () => handleQuickReply(key);
		qrDiv.appendChild(btn);
	});

	body.appendChild(qrDiv);
	scrollToBottom();
}

function handleQuickReply(key) {
	const data = TUTORIAL_DATA[key];
	addChatMsg(data.q, 'user');

	// Giả lập bot đang suy nghĩ một chút cho tự nhiên
	setTimeout(() => {
		addChatMsg(data.a, 'bot');
		// Sau khi trả lời, hiện lại lựa chọn cho người dùng (trừ câu vừa chọn)
		setTimeout(() => renderQuickReplies(key), 500);
	}, 400);
}

function toggleChat() {
	const win = document.getElementById('chatWindow');
	win.classList.toggle('active');
	if (win.classList.contains('active')) {
		document.getElementById('chatInput').focus();
		scrollToBottom();
	}
}

async function handleChatSend() {
	const input = document.getElementById('chatInput');
	const text = input.value.trim();
	if (!text) return;

	addChatMsg(text, 'user');
	input.value = '';

	// Tìm kiếm từ khóa đơn giản
	let found = false;
	const query = text.toLowerCase();

	if (query.includes("sản phẩm") || query.includes("tồn kho")) { handleQuickReply("sp_tonkho"); found = true; }
	else if (query.includes("khách hàng")) { handleQuickReply("khachhang"); found = true; }
	else if (query.includes("đơn hàng")) { handleQuickReply("donhang"); found = true; }
	else if (query.includes("nhân viên") || query.includes("thêm")) { handleQuickReply("add_staff"); found = true; }

	if (!found) {
		// Nếu không tìm thấy hướng dẫn, coi là feedback gửi mail
		addChatMsg("⌛ Đang gửi yêu cầu hỗ trợ của bạn đến bộ phận quản trị...", 'bot');

		try {
			const user = JSON.parse(localStorage.getItem('user') || '{}');
			const userEmail = user.email || "Khách vãng lai";

			const res = await fetch(MASTER_API, {
				method: 'POST',
				body: JSON.stringify({
					action: 'sendFeedback',
					userEmail: userEmail,
					message: text
				})
			});
			const data = await res.json();

			if (data.success) {
				addChatMsg(`✅ <b>Yêu cầu của bạn đã được gửi thành công!</b><br><br>Đội ngũ Dunvex sẽ phản hồi trực tiếp cho bạn qua email: <b>${userEmail}</b>.<br><br>Bạn vui lòng kiểm tra hộp thư nhé (nhớ kiểm tra cả mục Spam nếu không thấy thư).`, 'bot');
			} else {
				addChatMsg("❌ Gửi phản hồi thất bại: " + data.message, 'bot');
			}
			renderQuickReplies();
		} catch (e) {
			addChatMsg("❌ Lỗi kết nối. Bạn có thể gửi mail trực tiếp đến <b>dunvex.green@gmail.com</b> để được hỗ trợ nhé.", 'bot');
			renderQuickReplies();
		}
	}
}

function addChatMsg(text, type) {
	const body = document.getElementById('chatBody');
	if (!body) return;

	const div = document.createElement('div');
	div.className = `chat-msg ${type}`;
	div.innerHTML = text;
	body.appendChild(div);
	scrollToBottom();
}

function scrollToBottom() {
	const body = document.getElementById('chatBody');
	if (body) body.scrollTop = body.scrollHeight;
}

// Removed client-side simulation (processBotQuery) in favor of Server-side AI

