<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Đặt lại mật khẩu</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background-color: #f5f7fa;
            margin: 0;
            padding: 0;
        }
        .container {
            max-width: 600px;
            margin: 40px auto;
            background: white;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .header {
            background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%);
            color: white;
            padding: 40px 30px;
            text-align: center;
        }
        .header h1 {
            margin: 0;
            font-size: 28px;
            font-weight: 600;
        }
        .content {
            padding: 40px 30px;
            color: #374151;
            line-height: 1.6;
        }
        .greeting {
            font-size: 18px;
            margin-bottom: 20px;
            color: #1f2937;
        }
        .token-box {
            background: #eff6ff;
            border: 2px dashed #3b82f6;
            border-radius: 8px;
            padding: 30px;
            text-align: center;
            margin: 30px 0;
        }
        .token {
            font-size: 42px;
            font-weight: bold;
            color: #1e40af;
            letter-spacing: 8px;
            font-family: 'Courier New', monospace;
        }
        .token-label {
            font-size: 14px;
            color: #6b7280;
            margin-top: 10px;
        }
        .info-box {
            background: #fef3c7;
            border-left: 4px solid #f59e0b;
            padding: 15px 20px;
            margin: 25px 0;
            border-radius: 4px;
        }
        .info-box p {
            margin: 5px 0;
            color: #92400e;
            font-size: 14px;
        }
        .warning {
            background: #fee2e2;
            border-left: 4px solid #ef4444;
            padding: 15px 20px;
            margin: 25px 0;
            border-radius: 4px;
        }
        .warning p {
            margin: 5px 0;
            color: #991b1b;
            font-size: 14px;
        }
        .footer {
            background: #f9fafb;
            padding: 30px;
            text-align: center;
            color: #6b7280;
            font-size: 14px;
            border-top: 1px solid #e5e7eb;
        }
        .footer a {
            color: #3b82f6;
            text-decoration: none;
        }
        .divider {
            height: 1px;
            background: #e5e7eb;
            margin: 30px 0;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🏥 Meddical Hospital</h1>
            <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">Đặt lại mật khẩu</p>
        </div>

        <div class="content">
            <div class="greeting">
                Xin chào <strong>{{ $user->email }}</strong>,
            </div>

            <p>Chúng tôi đã nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn. Vui lòng sử dụng mã xác thực bên dưới để tiếp tục:</p>

            <div class="token-box">
                <div class="token">{{ $token }}</div>
                <div class="token-label">Mã xác thực của bạn</div>
            </div>

            <div class="info-box">
                <p><strong>⏰ Lưu ý quan trọng:</strong></p>
                <p>• Mã này sẽ hết hạn sau <strong>{{ $expires_in }} phút</strong></p>
                <p>• Chỉ sử dụng được <strong>một lần</strong></p>
                <p>• Không chia sẻ mã này với bất kỳ ai</p>
            </div>

            <div class="divider"></div>

            <p><strong>Các bước tiếp theo:</strong></p>
            <ol style="padding-left: 20px;">
                <li>Nhập mã <strong>{{ $token }}</strong> vào trang đặt lại mật khẩu</li>
                <li>Tạo mật khẩu mới (tối thiểu 6 ký tự)</li>
                <li>Đăng nhập lại với mật khẩu mới</li>
            </ol>

            <div class="warning">
                <p><strong>🛡️ Bảo mật tài khoản:</strong></p>
                <p>Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này và liên hệ với chúng tôi ngay lập tức.</p>
            </div>
        </div>

        <div class="footer">
            <p><strong>Meddical Hospital</strong></p>
            <p>Hệ thống quản lý bệnh viện</p>
            <p style="margin-top: 15px;">
                Liên hệ hỗ trợ: <a href="mailto:support@meddical.com">support@meddical.com</a>
            </p>
            <p style="margin-top: 10px; font-size: 12px; color: #9ca3af;">
                © {{ date('Y') }} Meddical Hospital. All rights reserved.
            </p>
        </div>
    </div>
</body>
</html>