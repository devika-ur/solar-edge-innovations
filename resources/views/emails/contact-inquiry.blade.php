<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" lang="en">
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="format-detection" content="telephone=no" />
    <title>New Website Enquiry - {{ $service }}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f3f4f6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; color: #1f2937;">
    <!-- Preheader text for email clients -->
    <div style="display: none; font-size: 1px; color: #f3f4f6; line-height: 1px; max-height: 0px; max-width: 0px; opacity: 0; overflow: hidden;">
        New inquiry from {{ $name }} for {{ $service }} in {{ $place }}, {{ $district }}.
    </div>

    <!-- Outer Table -->
    <table border="0" cellpadding="0" cellspacing="0" width="100%" bgcolor="#f3f4f6" style="table-layout: fixed;">
        <tr>
            <td align="center" style="padding: 24px 12px 36px 12px;">
                <!-- Main Container (max 600px) -->
                <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06); border: 1px solid #e5e7eb;">
                    
                    <!-- Top Accent Bar -->
                    <tr>
                        <td height="4" bgcolor="#10b981" style="font-size: 4px; line-height: 4px;">&nbsp;</td>
                    </tr>

                    <!-- Header -->
                    <tr>
                        <td align="center" bgcolor="#064e3b" style="padding: 28px 24px 26px 24px;">
                            <table border="0" cellpadding="0" cellspacing="0" width="100%">
                                <tr>
                                    <td align="center">
                                        <div style="font-size: 20px; font-weight: 800; letter-spacing: 1.5px; color: #ffffff; text-transform: uppercase;">
                                            SOLAR EDGE INNOVATIONS
                                        </div>
                                        <div style="font-size: 11px; font-weight: 600; letter-spacing: 1.2px; color: #86efac; text-transform: uppercase; margin-top: 4px;">
                                            Clean Energy &amp; Security Solutions
                                        </div>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                    <!-- Enquiry Title & Service Highlight -->
                    <tr>
                        <td style="padding: 28px 24px 12px 24px;" align="center">
                            <table border="0" cellpadding="0" cellspacing="0" width="100%">
                                <tr>
                                    <td align="center">
                                        <div style="display: inline-block; background-color: #fef3c7; border: 1px solid #fde68a; color: #92400e; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.8px; padding: 4px 12px; border-radius: 20px; margin-bottom: 12px;">
                                            NEW WEBSITE ENQUIRY
                                        </div>
                                        <h1 style="margin: 0; font-size: 22px; font-weight: 700; color: #111827; line-height: 1.3;">
                                            {{ $service }}
                                        </h1>
                                        <p style="margin: 8px 0 0 0; font-size: 13px; color: #6b7280;">
                                            Submitted on {{ $submissionDate }}
                                        </p>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                    <!-- Customer Details Section -->
                    <tr>
                        <td style="padding: 16px 24px;">
                            <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f9fafb; border-radius: 8px; border: 1px solid #e5e7eb; overflow: hidden;">
                                <tr>
                                    <td style="padding: 14px 18px; border-bottom: 1px solid #e5e7eb; background-color: #f3f4f6;">
                                        <span style="font-size: 12px; font-weight: 700; color: #374151; text-transform: uppercase; letter-spacing: 0.8px;">
                                            Customer Information
                                        </span>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding: 12px 18px;">
                                        <table border="0" cellpadding="6" cellspacing="0" width="100%">
                                            <tr>
                                                <td width="32%" valign="top" style="font-size: 13px; color: #6b7280; font-weight: 600;">
                                                    Customer Name:
                                                </td>
                                                <td width="68%" valign="top" style="font-size: 14px; color: #111827; font-weight: 600;">
                                                    {{ $name }}
                                                </td>
                                            </tr>
                                            <tr>
                                                <td valign="top" style="font-size: 13px; color: #6b7280; font-weight: 600;">
                                                    Email Address:
                                                </td>
                                                <td valign="top" style="font-size: 14px; color: #059669; font-weight: 500;">
                                                    <a href="mailto:{{ rawurlencode($email) }}?subject={{ rawurlencode('Re: Solar Edge Innovations Inquiry - ' . $service) }}" style="color: #059669; text-decoration: none; font-weight: 600;">{{ $email }}</a>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td valign="top" style="font-size: 13px; color: #6b7280; font-weight: 600;">
                                                    Phone / Mobile:
                                                </td>
                                                <td valign="top" style="font-size: 14px; color: #111827; font-weight: 600;">
                                                    <a href="tel:{{ preg_replace('/[^0-9+]/', '', $phone) }}" style="color: #111827; text-decoration: none;">{{ $phone }}</a>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td valign="top" style="font-size: 13px; color: #6b7280; font-weight: 600;">
                                                    Service Required:
                                                </td>
                                                <td valign="top" style="font-size: 14px; color: #065f46; font-weight: 700;">
                                                    {{ $service }}
                                                </td>
                                            </tr>
                                            <tr>
                                                <td valign="top" style="font-size: 13px; color: #6b7280; font-weight: 600;">
                                                    Place / Town:
                                                </td>
                                                <td valign="top" style="font-size: 14px; color: #111827; font-weight: 500;">
                                                    {{ $place }}
                                                </td>
                                            </tr>
                                            <tr>
                                                <td valign="top" style="font-size: 13px; color: #6b7280; font-weight: 600;">
                                                    District:
                                                </td>
                                                <td valign="top" style="font-size: 14px; color: #111827; font-weight: 600;">
                                                    {{ $district }}
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                    <!-- Customer Requirements / Message Section -->
                    <tr>
                        <td style="padding: 8px 24px 18px 24px;">
                            <table border="0" cellpadding="0" cellspacing="0" width="100%">
                                <tr>
                                    <td style="padding-bottom: 8px;">
                                        <span style="font-size: 12px; font-weight: 700; color: #374151; text-transform: uppercase; letter-spacing: 0.8px;">
                                            Customer Requirements / Message
                                        </span>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="background-color: #f9fafb; border-left: 4px solid #10b981; border-top: 1px solid #e5e7eb; border-right: 1px solid #e5e7eb; border-bottom: 1px solid #e5e7eb; border-radius: 6px; padding: 16px 18px; font-size: 14px; line-height: 1.6; color: #374151;">
                                        {!! nl2br(e($messageContent)) !!}
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                    <!-- Call to Action Button -->
                    <tr>
                        <td align="center" style="padding: 16px 24px 28px 24px;">
                            <table border="0" cellpadding="0" cellspacing="0">
                                <tr>
                                    <td align="center" bgcolor="#059669" style="border-radius: 8px; box-shadow: 0 2px 6px rgba(5, 150, 105, 0.25);">
                                        <a href="mailto:{{ rawurlencode($email) }}?subject={{ rawurlencode('Re: Solar Edge Innovations Inquiry - ' . $service) }}" target="_blank" style="display: inline-block; padding: 13px 32px; font-size: 14px; font-weight: 700; color: #ffffff; text-decoration: none; border-radius: 8px;">
                                            &rarr; Reply to {{ $name }}
                                        </a>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                    <!-- Footer Divider -->
                    <tr>
                        <td style="padding: 0 24px;">
                            <div style="border-top: 1px solid #e5e7eb; height: 1px; line-height: 1px; font-size: 1px;">&nbsp;</div>
                        </td>
                    </tr>

                    <!-- Footer Content -->
                    <tr>
                        <td align="center" style="padding: 20px 24px 24px 24px; background-color: #fafafa;">
                            <p style="margin: 0; font-size: 12px; color: #6b7280; line-height: 1.5;">
                                This message was automatically generated from the contact form on <br />
                                <strong style="color: #374151;">Solar Edge Innovations</strong> website.
                            </p>
                            <p style="margin: 8px 0 0 0; font-size: 11px; color: #9ca3af;">
                                &copy; {{ date('Y') }} Solar Edge Innovations. All rights reserved.
                            </p>
                        </td>
                    </tr>

                </table>
            </td>
        </tr>
    </table>
</body>
</html>
