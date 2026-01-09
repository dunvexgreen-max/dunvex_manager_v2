/**
 * floating-menu.js
 * Hệ thống Menu điều hướng động dựa trên phân quyền người dùng
 */
(function () {
    // 1. Kiểm tra trạng thái đăng nhập
    const user = JSON.parse(localStorage.getItem('user'));
    const perms = JSON.parse(localStorage.getItem('permissions'));

    if (!user) return; // Nếu chưa đăng nhập thì không hiện menu

    // 2. Cấu hình Menu và Phân quyền tương ứng
    const menuConfig = [
        {
            category: "KINH DOANH & KHO",
            items: [
                { id: 'menu_checkin', label: "📊 CRM & Sales", url: "crm-sales.html", perm: 'checkinSales', color: '#c084fc' },
                { id: 'menu_products', label: "📦 Quản lý Sản phẩm", url: "quan-ly-san-pham.html", perm: 'quanLySanPham', color: '#6366f1' },
                { id: 'menu_list', label: "📋 Danh sách đơn hàng", url: "danh-sach-don-hang.html", perm: 'danhSachDonHang', color: '#f8fafc' },
                { id: 'menu_list_pl', label: "🏷️ Danh sách bảng giá", url: "danh-sach-bang-gia.html", perm: 'xemBangGia', color: '#fbbf24' },
                { id: 'menu_inventory', label: "📊 Quản lý kho vận", url: "quan-ly-kho.html", perm: 'quanLyKho', color: '#22c55e' }
            ]
        }
    ];

    // 3. Tạo cấu trúc DOM
    const menuContainer = document.createElement('div');
    menuContainer.className = 'dunvex-floating-actions';
    menuContainer.id = 'dunvexFloatingMenu';

    let menuContentHtml = `<div class="dunvex-menu-overlay" id="dunvexMenuOverlay">`;

    menuConfig.forEach(cat => {
        let catHtml = `<div class="dunvex-menu-section">
                        <div class="dunvex-menu-header">${cat.category}</div>`;
        let hasVisibleItems = false;

        cat.items.forEach(item => {
            // Admin (R001) có quyền xem tất cả
            // Nếu có perms -> kiểm tra theo perms
            // Nếu không có perms (user mồ côi) -> cấp quyền mặc định: Báo giá, Sản phẩm, Khách hàng (CRM), Lên đơn

            const isDefaultPermitted = ['xemBangGia', 'checkinSales', 'quanLySanPham', 'danhSachDonHang'].includes(item.perm);
            const hasPerm = (user.roleId === 'R001') || (perms ? perms[item.perm] : isDefaultPermitted);

            if (hasPerm) {
                catHtml += `<a href="${item.url}" class="dunvex-menu-link" style="color: ${item.color};">
                                ${item.label}
                            </a>`;
                hasVisibleItems = true;
            }
        });

        catHtml += `</div>`;
        if (hasVisibleItems) {
            menuContentHtml += catHtml;
        }
    });

    menuContentHtml += `
            <div class="dunvex-menu-link" onclick="handleLogout()" style="color: #ef4444; border-top: 1px solid rgba(255,255,255,0.1); margin-top: 8px;">🚪 Đăng xuất</div>
        </div>
        <div class="dunvex-float-btn" onclick="toggleDunvexMenu()" id="dunvexMenuTrigger">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="3" y1="12" x2="21" y2="12"></line>
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <line x1="3" y1="18" x2="21" y2="18"></line>
            </svg>
        </div>
    `;

    menuContainer.innerHTML = menuContentHtml;
    document.body.appendChild(menuContainer);

    // 4. Thêm CSS (Scoped)
    const style = document.createElement('style');
    style.textContent = `
        .dunvex-floating-actions {
            position: fixed;
            bottom: 30px;
            right: 30px;
            display: flex;
            flex-direction: column;
            gap: 12px;
            z-index: 10000;
        }
        .dunvex-float-btn {
            width: 60px;
            height: 60px;
            border-radius: 50%;
            background: #6366f1;
            color: white;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
            box-shadow: 0 10px 30px rgba(99, 102, 241, 0.4);
            border: 1px solid rgba(255, 255, 255, 0.2);
        }
        .dunvex-float-btn:hover {
            transform: scale(1.1) rotate(90deg);
        }
        .dunvex-menu-overlay {
            position: absolute;
            bottom: 75px;
            right: 0;
            background: rgba(15, 23, 42, 0.9);
            backdrop-filter: blur(20px);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 24px;
            width: 280px;
            padding: 16px;
            display: none;
            box-shadow: 0 25px 50px rgba(0, 0, 0, 0.6);
            transform-origin: bottom right;
        }
        .dunvex-menu-overlay.active {
            display: block;
            animation: dunvexMenuIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }
        @keyframes dunvexMenuIn {
            from { opacity: 0; transform: scale(0.8) translateY(20px); }
            to { opacity: 1; transform: scale(1) translateY(0); }
        }
        .dunvex-menu-header {
            padding: 8px 16px;
            font-size: 0.7rem;
            text-transform: uppercase;
            letter-spacing: 2px;
            color: #94a3b8;
            font-weight: 800;
            opacity: 0.6;
        }
        .dunvex-menu-link {
            display: flex;
            align-items: center;
            gap: 14px;
            padding: 14px 16px;
            color: #f8fafc;
            text-decoration: none;
            border-radius: 16px;
            transition: 0.2s;
            font-weight: 600;
            cursor: pointer;
            margin: 2px 0;
        }
        .dunvex-menu-link:hover {
            background: rgba(255, 255, 255, 0.08);
            transform: translateX(8px);
        }
        .dunvex-menu-section {
            margin-bottom: 12px;
            border-bottom: 1px solid rgba(255,255,255,0.05);
            padding-bottom: 8px;
        }
        .dunvex-menu-section:last-child {
            border-bottom: none;
        }
    `;
    document.head.appendChild(style);

    // 5. Các hàm điều khiển
    window.toggleDunvexMenu = function () {
        document.getElementById('dunvexMenuOverlay').classList.toggle('active');
    };

    window.handleLogout = function () {
        if (confirm("Xác nhận đăng xuất khỏi hệ thống?")) {
            localStorage.clear();
            window.location.href = 'auth.html';
        }
    };

    // Đóng menu khi click ra ngoài
    window.addEventListener('click', function (e) {
        const overlay = document.getElementById('dunvexMenuOverlay');
        const trigger = document.getElementById('dunvexMenuTrigger');
        if (overlay && overlay.classList.contains('active')) {
            if (!overlay.contains(e.target) && !trigger.contains(e.target)) {
                overlay.classList.remove('active');
            }
        }
    });

    // Tự động ẩn menu cũ nếu tồn tại
    const oldActions = document.getElementById('mainFloatingActions');
    if (oldActions) oldActions.style.display = 'none';

})();
