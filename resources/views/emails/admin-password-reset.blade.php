<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reset Your Password</title>
    <style>
        body {
            margin: 0;
            padding: 0;
            background-color: #F8FAFC;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            color: #1E293B;
            -webkit-text-size-adjust: 100%;
        }
        .container {
            max-width: 580px;
            margin: 30px auto;
            background: #FFFFFF;
            border-radius: 20px;
            overflow: hidden;
            border: 1px solid #E2E8F0;
            box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05);
        }
        .header {
            background: linear-gradient(135deg, #092B18 0%, #1A4D2E 100%);
            padding: 32px 28px;
            text-align: center;
        }
        .header h1 {
            color: #FFFFFF;
            font-size: 20px;
            margin: 12px 0 0;
            font-weight: 700;
            letter-spacing: -0.02em;
        }
        .content {
            padding: 36px 32px;
        }
        .greeting {
            font-size: 16px;
            font-weight: 600;
            color: #0F172A;
            margin-bottom: 12px;
        }
        .text {
            font-size: 14px;
            line-height: 1.6;
            color: #475569;
            margin: 0 0 20px;
        }
        .button-wrapper {
            text-align: center;
            margin: 28px 0;
        }
        .button {
            display: inline-block;
            background-color: #1A4D2E;
            color: #FFFFFF !important;
            text-decoration: none;
            padding: 14px 32px;
            font-size: 14px;
            font-weight: 700;
            border-radius: 12px;
            box-shadow: 0 4px 12px rgba(26, 77, 46, 0.25);
            letter-spacing: 0.01em;
        }
        .info-box {
            background-color: #F0FDF4;
            border: 1px solid #BBF7D0;
            border-radius: 12px;
            padding: 14px 18px;
            font-size: 12px;
            color: #166534;
            margin-bottom: 24px;
        }
        .link-fallback {
            font-size: 12px;
            color: #64748B;
            word-break: break-all;
            background: #F8FAFC;
            padding: 12px;
            border-radius: 8px;
            border: 1px solid #E2E8F0;
        }
        .link-fallback a {
            color: #1A4D2E;
            text-decoration: underline;
        }
        .footer {
            background-color: #F8FAFC;
            padding: 24px 32px;
            text-align: center;
            border-top: 1px solid #E2E8F0;
            font-size: 12px;
            color: #94A3B8;
        }
    </style>
</head>
<body>
    <div class="container">
        <!-- Brand Header -->
        <div class="header">
            <div style="display: inline-block; background: rgba(255, 255, 255, 0.15); padding: 8px 16px; border-radius: 20px; color: #86EFAC; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em;">
                Solar Edge Innovations
            </div>
            <h1>Admin Password Reset</h1>
        </div>

        <!-- Email Body -->
        <div class="content">
            <div class="greeting">
                Hello {{ $username }},
            </div>
            <p class="text">
                We received a request to reset the password for your <strong>{{ $roleLabel }}</strong> account on the Solar Edge Admin Portal.
            </p>
            <p class="text">
                To set a new password, click the button below:
            </p>

            <div class="button-wrapper">
                <a href="{{ $resetUrl }}" target="_blank" class="button">
                    Reset Your Password
                </a>
            </div>

            <div class="info-box">
                <strong>Important:</strong> This password reset link is valid for <strong>{{ $expiresInMinutes }} minutes</strong>. If you did not make this request, you can safely ignore this email — your password will remain unchanged.
            </div>

            <p class="text" style="font-size: 12px; color: #64748B; margin-bottom: 8px;">
                Button not working? Copy and paste this URL into your browser:
            </p>
            <div class="link-fallback">
                <a href="{{ $resetUrl }}" target="_blank">{{ $resetUrl }}</a>
            </div>
        </div>

        <!-- Footer -->
        <div class="footer">
            &copy; {{ date('Y') }} Solar Edge Innovations. All rights reserved.<br>
            Automated security notification &mdash; please do not reply to this email.
        </div>
    </div>
</body>
</html>

