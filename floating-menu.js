/**
 * floating-menu.js
 * Hệ thống Menu điều hướng động dựa trên phân quyền người dùng
 */
(function () {
    // 0. Ngăn chặn chạy trong iframe (modal)
    if (window.self !== window.top) return;

    const AUTH_URL = 'https://script.google.com/macros/s/AKfycbyaz_6xI3Nz0FHnNgr9qEcPuOUGf4OY53l8x1ofSoh_LIGozbKmpSJNAwpq8U6ygpPNHw/exec';

    async function syncPermissions(user) {
        try {
            const res = await fetch(AUTH_URL, {
                method: 'POST',
                body: JSON.stringify({
                    action: 'get_permissions',
                    email: user.email
                })
            });
            const data = await res.json();
            if (data.success && data.permissions) {
                localStorage.setItem('permissions', JSON.stringify(data.permissions));
                return data.permissions;
            }
        } catch (e) {
            console.error("Floating Menu: Sync perms error", e);
        }
        return JSON.parse(localStorage.getItem('permissions'));
    }

    window.refreshDunvexMenu = async function (forceSync = true) {
        // 1. Kiểm tra trạng thái đăng nhập
        const user = JSON.parse(localStorage.getItem('user'));
        if (!user) return;

        // 2. Đồng bộ quyền từ Sheet nếu cần (để ổn định dữ liệu)
        let perms = JSON.parse(localStorage.getItem('permissions'));
        if (forceSync) {
            perms = await syncPermissions(user);
        }

        const oldMenu = document.getElementById('dunvexFloatingMenu');
        if (oldMenu) oldMenu.remove();

        // 3. Cấu hình Menu
        const menuConfig = [
            {
                category: "KINH DOANH & KHO",
                items: [
                    { id: 'menu_checkin', label: "📊 CRM & Sales", url: "crm-sales.html", perm: 'checkinSales', color: '#c084fc' },
                    { id: 'menu_products', label: "📦 Quản lý Sản phẩm", url: "quan-ly-san-pham.html", perm: 'quanLySanPham', color: '#6366f1' },
                    { id: 'menu_list', label: "📋 Danh sách đơn hàng", url: "danh-sach-don-hang.html", perm: 'danhSachDonHang', color: '#f8fafc' },
                    { id: 'menu_list_pl', label: "🏷️ Danh sách bảng giá", url: "danh-sach-bang-gia.html", perm: 'xemBangGia', color: '#fbbf24' },
                    { id: 'menu_inventory', label: "📊 Quản lý kho vận", url: "quan-ly-kho.html", perm: 'quanLyKho', color: '#22c55e' },
                    { id: 'menu_warehouse', label: "🚚 Kho xuất hàng", url: "kho-xuat-hang.html", perm: 'khoXuatHang', color: '#10b981' },
                    { id: 'menu_delivery', label: "📍 Giao hàng (Tài xế)", url: "tai-xe-giao-hang.html", perm: 'giaoHang', color: '#6366f1' },
                    { id: 'menu_debt', label: "💰 Theo dõi công nợ", url: "quan-ly-cong-no.html", perm: 'quanLyCongNo', color: '#fbbf24' }
                ]
            }
        ];

        if (user.roleId === 'R001') {
            const adminItems = [
                { id: 'menu_checkin_summary', label: "📍 Tổng hợp Check-in", url: "admin-checkin-summary.html", perm: 'checkinSummary', color: '#38bdf8' }
            ];
            adminItems.push({ id: 'menu_admin', label: "👥 Quản lý nhân sự", url: "admin-users.html", perm: 'isAdmin', color: '#818cf8' });
            menuConfig.push({ category: "QUẢN TRỊ VIÊN", items: adminItems });
        }

        if (user.email === 'dunvex.green@gmail.com') {
            menuConfig.length = 0;
            menuConfig.push({
                category: "HỆ THỐNG MASTER",
                items: [{ id: 'menu_master', label: "🛡️ Master Control", url: "super-admin.html", perm: 'isAdmin', color: '#ef4444' }]
            });
        }

        // 4. Tạo cấu trúc DOM
        const menuContainer = document.createElement('div');
        menuContainer.className = 'dunvex-floating-actions';
        menuContainer.id = 'dunvexFloatingMenu';

        let menuContentHtml = `<div class="dunvex-menu-overlay" id="dunvexMenuOverlay">`;

        menuConfig.forEach(cat => {
            let catHtml = `<div class="dunvex-menu-section"><div class="dunvex-menu-header">${cat.category}</div>`;
            let hasVisibleItems = false;

            cat.items.forEach(item => {
                let hasPerm = false;
                if (item.perm === 'isAdmin') {
                    hasPerm = (user.roleId === 'R001');
                } else if (perms && perms[item.perm] !== undefined) {
                    hasPerm = perms[item.perm];
                } else {
                    // Nếu không có dữ liệu quyền từ Admin (do chưa tải xong hoặc lỗi),
                    // chỉ có R001 (Admin) mới được thấy. Nhân viên sẽ không thấy gì (Chế độ Riêng tư tuyệt đối).
                    hasPerm = (user.roleId === 'R001');
                }

                if (hasPerm) {
                    catHtml += `<a href="${item.url}" class="dunvex-menu-link" style="color: ${item.color};"><span>${item.label}</span></a>`;
                    hasVisibleItems = true;
                }
            });

            catHtml += `</div>`;
            if (hasVisibleItems) menuContentHtml += catHtml;
        });

        menuContentHtml += `
                <div class="dunvex-menu-link" onclick="handleLogout()" style="color: #ef4444; border-top: 1px solid rgba(255,255,255,0.1); margin-top: 8px;"><span>🚪 Đăng xuất</span></div>
            </div>
            <div class="dunvex-float-btn" onclick="toggleDunvexMenu()" id="dunvexMenuTrigger">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line>
                </svg>
            </div>
        `;

        menuContainer.innerHTML = menuContentHtml;
        document.body.appendChild(menuContainer);

        // Hide older floating actions if present
        const oldActions = document.getElementById('mainFloatingActions');
        if (oldActions) oldActions.style.display = 'none';
    };

    // Initialize Menu with a force sync from sheet
    window.refreshDunvexMenu(true);

    // Add Styles (only once)
    if (!document.getElementById('dunvexFloatingMenuStyle')) {
        const style = document.createElement('style');
        style.id = 'dunvexFloatingMenuStyle';
        style.textContent = `
            .dunvex-floating-actions { position: fixed; bottom: 30px; right: 30px; display: flex; flex-direction: column; gap: 12px; z-index: 10000; }
            .dunvex-float-btn { width: 60px; height: 60px; border-radius: 50%; background: #6366f1; color: white; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275); box-shadow: 0 10px 30px rgba(99, 102, 241, 0.4); border: 1px solid rgba(255, 255, 255, 0.2); }
            .dunvex-float-btn:hover { transform: scale(1.1) rotate(90deg); }
            .dunvex-menu-overlay { position: absolute; bottom: 75px; right: 0; background: rgba(15, 23, 42, 0.95); backdrop-filter: blur(20px); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 24px; width: 280px; padding: 16px; display: none; box-shadow: 0 25px 50px rgba(0, 0, 0, 0.6); transform-origin: bottom right; }
            .dunvex-menu-overlay.active { display: block; animation: dunvexMenuIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
            @keyframes dunvexMenuIn { from { opacity: 0; transform: scale(0.8) translateY(20px); } to { opacity: 1; transform: scale(1) translateY(0); } }
            .dunvex-menu-header { padding: 8px 16px; font-size: 0.7rem; text-transform: uppercase; letter-spacing: 2px; color: #94a3b8; font-weight: 800; opacity: 0.6; }
            .dunvex-menu-link { display: flex; align-items: center; gap: 14px; padding: 14px 16px; color: #f8fafc; text-decoration: none; border-radius: 16px; transition: 0.2s; font-weight: 600; cursor: pointer; margin: 2px 0; }
            .dunvex-menu-link:hover { background: rgba(255, 255, 255, 0.08); transform: translateX(8px); }
            
            .dunvex-menu-section { margin-bottom: 12px; border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 8px; }
            .dunvex-menu-section:last-child { border-bottom: none; }
        `;
        document.head.appendChild(style);
    }

    window.toggleDunvexMenu = function () {
        document.getElementById('dunvexMenuOverlay').classList.toggle('active');
    };

    window.handleLogout = function () {
        if (confirm("Xác nhận đăng xuất khỏi hệ thống?")) {
            localStorage.clear();
            window.location.href = 'auth.html';
        }
    };

    window.addEventListener('click', function (e) {
        const overlay = document.getElementById('dunvexMenuOverlay');
        const trigger = document.getElementById('dunvexMenuTrigger');
        if (overlay && overlay.classList.contains('active')) {
            if (!overlay.contains(e.target) && !trigger.contains(e.target)) {
                overlay.classList.remove('active');
            }
        }
    });

})();
