import aiosmtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import os
import logging

logger = logging.getLogger(__name__)

# Email configuration - using Gmail SMTP as example
# You'll need to set these in .env file
SMTP_HOST = os.environ.get("SMTP_HOST", "smtp.gmail.com")
SMTP_PORT = int(os.environ.get("SMTP_PORT", "587"))
SMTP_USER = os.environ.get("SMTP_USER", "")  # Your Gmail address
SMTP_PASSWORD = os.environ.get("SMTP_PASSWORD", "")  # Your Gmail App Password
ADMIN_EMAIL = os.environ.get("ADMIN_EMAIL", "hazon.pro@gmail.com")

async def send_email(to_email: str, subject: str, html_content: str, text_content: str = None):
    """Send email using SMTP"""
    if not SMTP_USER or not SMTP_PASSWORD:
        logger.warning("SMTP credentials not configured. Email not sent.")
        return False
    
    try:
        message = MIMEMultipart("alternative")
        message["From"] = SMTP_USER
        message["To"] = to_email
        message["Subject"] = subject
        
        # Add text and HTML parts
        if text_content:
            part1 = MIMEText(text_content, "plain")
            message.attach(part1)
        
        part2 = MIMEText(html_content, "html")
        message.attach(part2)
        
        # Send email
        await aiosmtplib.send(
            message,
            hostname=SMTP_HOST,
            port=SMTP_PORT,
            username=SMTP_USER,
            password=SMTP_PASSWORD,
            start_tls=True
        )
        
        logger.info(f"Email sent successfully to {to_email}")
        return True
    except Exception as e:
        logger.error(f"Failed to send email: {str(e)}")
        return False

def generate_order_email_html(order_data: dict, is_admin: bool = False):
    """Generate HTML email for order confirmation"""
    items_html = ""
    for item in order_data.get("items", []):
        items_html += f"""
        <tr>
            <td style="padding: 10px; border-bottom: 1px solid #eee;">{item.get('product_name')}</td>
            <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">{item.get('quantity')}</td>
            <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">₪{item.get('price'):.2f}</td>
            <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">₪{(item.get('price') * item.get('quantity')):.2f}</td>
        </tr>
        """
    
    payment_method_text = {
        "cash": "תשלום במזומן",
        "bank_transfer": "העברה בנקאית - בנק הפועלים (12), סניף 665, חשבון 224471",
        "bit": "העברת Bit",
        "credit_card": "כרטיס אשראי"
    }.get(order_data.get("payment_method", "cash"), "לא צוין")
    
    subject_prefix = "הזמנה חדשה התקבלה!" if is_admin else "אישור הזמנה"
    greeting = f"הזמנה חדשה מ-{order_data.get('customer_name')}" if is_admin else f"שלום {order_data.get('customer_name')},"
    
    html = f"""
    <!DOCTYPE html>
    <html dir="rtl" lang="he">
    <head>
        <meta charset="UTF-8">
        <style>
            body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
            .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
            .header {{ background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }}
            .content {{ background: white; padding: 30px; border: 1px solid #ddd; }}
            .order-details {{ background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; }}
            .footer {{ background: #f8f9fa; padding: 20px; text-align: center; border-radius: 0 0 10px 10px; }}
            table {{ width: 100%; border-collapse: collapse; margin: 20px 0; }}
            th {{ background: #667eea; color: white; padding: 12px; text-align: right; }}
            .total-row {{ font-weight: bold; font-size: 18px; background: #f0f0f0; }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🛡️ חזון מערכות אבטחה</h1>
                <h2>{subject_prefix}</h2>
            </div>
            
            <div class="content">
                <p style="font-size: 18px;">{greeting}</p>
                
                {"<p>הזמנה חדשה התקבלה במערכת!</p>" if is_admin else "<p>תודה שבחרת בחזון מערכות אבטחה. הזמנתך התקבלה בהצלחה!</p>"}
                
                <div class="order-details">
                    <h3>פרטי ההזמנה</h3>
                    <p><strong>מספר הזמנה:</strong> #{order_data.get('id', 'N/A')[:8]}</p>
                    <p><strong>שם לקוח:</strong> {order_data.get('customer_name')}</p>
                    <p><strong>טלפון:</strong> {order_data.get('customer_phone')}</p>
                    <p><strong>אימייל:</strong> {order_data.get('customer_email')}</p>
                    <p><strong>כתובת משלוח:</strong> {order_data.get('shipping_address', 'לא צוין')}, {order_data.get('city', '')}</p>
                    <p><strong>אמצעי תשלום:</strong> {payment_method_text}</p>
                    {f"<p><strong>הערות:</strong> {order_data.get('notes')}</p>" if order_data.get('notes') else ""}
                </div>
                
                <h3>פירוט מוצרים</h3>
                <table>
                    <thead>
                        <tr>
                            <th>מוצר</th>
                            <th style="text-align: center;">כמות</th>
                            <th style="text-align: right;">מחיר יחידה</th>
                            <th style="text-align: right;">סה"כ</th>
                        </tr>
                    </thead>
                    <tbody>
                        {items_html}
                        <tr>
                            <td colspan="3" style="padding: 10px; text-align: left;"><strong>סכום ביניים:</strong></td>
                            <td style="padding: 10px; text-align: right;"><strong>₪{order_data.get('subtotal', 0):.2f}</strong></td>
                        </tr>
                        <tr>
                            <td colspan="3" style="padding: 10px; text-align: left;"><strong>משלוח:</strong></td>
                            <td style="padding: 10px; text-align: right;"><strong>{"חינם 🎉" if order_data.get('shipping_cost', 0) == 0 else f"₪{order_data.get('shipping_cost', 0):.2f}"}</strong></td>
                        </tr>
                        <tr class="total-row">
                            <td colspan="3" style="padding: 15px; text-align: left;">סה"כ לתשלום:</td>
                            <td style="padding: 15px; text-align: right; font-size: 20px; color: #667eea;">₪{order_data.get('total', 0):.2f}</td>
                        </tr>
                    </tbody>
                </table>
                
                {"<p style='color: #666; font-size: 14px;'>יש ליצור קשר עם הלקוח לאישור ההזמנה.</p>" if is_admin else "<p>נציג יצור איתך קשר בהקדם לאישור ההזמנה.</p>"}
            </div>
            
            <div class="footer">
                <p><strong>חזון מערכות אבטחה</strong></p>
                <p>📧 hazon.pro@gmail.com | 🌐 hazonpro.com</p>
                <p style="font-size: 12px; color: #666;">פתרונות תקשורת ואבטחה מתקדמים</p>
            </div>
        </div>
    </body>
    </html>
    """
    return html

async def send_order_confirmation_emails(order_data: dict):
    """Send order confirmation to both customer and admin"""
    try:
        # Send to customer
        customer_html = generate_order_email_html(order_data, is_admin=False)
        await send_email(
            to_email=order_data.get('customer_email'),
            subject=f"אישור הזמנה - חזון מערכות אבטחה",
            html_content=customer_html
        )
        
        # Send to admin
        admin_html = generate_order_email_html(order_data, is_admin=True)
        await send_email(
            to_email=ADMIN_EMAIL,
            subject=f"הזמנה חדשה מ-{order_data.get('customer_name')} - #{order_data.get('id', 'N/A')[:8]}",
            html_content=admin_html
        )
        
        return True
    except Exception as e:
        logger.error(f"Error sending order emails: {str(e)}")
        return False

async def send_contact_form_email(contact_data: dict):
    """Send contact form submission to admin"""
    html = f"""
    <!DOCTYPE html>
    <html dir="rtl" lang="he">
    <head>
        <meta charset="UTF-8">
        <style>
            body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
            .container {{ max-width: 600px; margin: 0 auto; padding: 20px; background: white; }}
            .header {{ background: #667eea; color: white; padding: 20px; text-align: center; }}
            .content {{ padding: 20px; border: 1px solid #ddd; }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h2>📧 הודעה חדשה מטופס צור קשר</h2>
            </div>
            <div class="content">
                <p><strong>שם:</strong> {contact_data.get('name')}</p>
                <p><strong>אימייל:</strong> {contact_data.get('email')}</p>
                <p><strong>טלפון:</strong> {contact_data.get('phone')}</p>
                <p><strong>נושא:</strong> {contact_data.get('subject', 'לא צוין')}</p>
                <hr>
                <p><strong>הודעה:</strong></p>
                <p>{contact_data.get('message')}</p>
            </div>
        </div>
    </body>
    </html>
    """
    
    try:
        await send_email(
            to_email=ADMIN_EMAIL,
            subject=f"צור קשר מ-{contact_data.get('name')} - {contact_data.get('subject', 'ללא נושא')}",
            html_content=html
        )
        return True
    except Exception as e:
        logger.error(f"Error sending contact form email: {str(e)}")
        return False
