import smtplib
import os
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.mime.base import MIMEBase
from email import encoders
from datetime import datetime
from dotenv import load_dotenv

load_dotenv()

def send_ai_request_email(user_email: str, request_type: str, model: str, prompt: str, 
                         delivery_email: str, file_path: str = None):
    """Send AI request details to admin email"""
    
    smtp_server = os.getenv("SMTP_SERVER")
    smtp_port = int(os.getenv("SMTP_PORT", "587"))
    smtp_username = os.getenv("SMTP_USERNAME")
    smtp_password = os.getenv("SMTP_PASSWORD")
    admin_email = os.getenv("ADMIN_EMAIL")
    
    if not all([smtp_server, smtp_username, smtp_password, admin_email]):
        print("Email configuration not complete")
        return False
    
    try:
        msg = MIMEMultipart()
        msg['From'] = smtp_username
        msg['To'] = admin_email
        msg['Subject'] = f"New AI Request - {request_type}"
        
        body = f"""
New AI Generation Request:

User Email: {user_email}
Request Type: {request_type}
Model: {model}
Delivery Email: {delivery_email}

Prompt:
{prompt}

Please process this request and send the result to: {delivery_email}
        """
        
        msg.attach(MIMEText(body, 'plain'))
        
        # Attach file if provided
        if file_path and os.path.exists(file_path):
            with open(file_path, "rb") as attachment:
                part = MIMEBase('application', 'octet-stream')
                part.set_payload(attachment.read())
                encoders.encode_base64(part)
                part.add_header(
                    'Content-Disposition',
                    f'attachment; filename= {os.path.basename(file_path)}'
                )
                msg.attach(part)
        
        server = smtplib.SMTP(smtp_server, smtp_port)
        server.starttls()
        server.login(smtp_username, smtp_password)
        text = msg.as_string()
        server.sendmail(smtp_username, admin_email, text)
        server.quit()
        
        return True
    except Exception as e:
        print(f"Failed to send email: {e}")
        return False

def send_welcome_email(user_email: str, user_name: str = None):
    """Send welcome email to new users"""
    
    smtp_server = os.getenv("SMTP_SERVER")
    smtp_port = int(os.getenv("SMTP_PORT", "587"))
    smtp_username = os.getenv("SMTP_USERNAME")
    smtp_password = os.getenv("SMTP_PASSWORD")
    
    if not all([smtp_server, smtp_username, smtp_password]):
        print("Email configuration not complete")
        return False
    
    try:
        msg = MIMEMultipart()
        msg['From'] = smtp_username
        msg['To'] = user_email
        msg['Subject'] = "Welcome to AI Gen Platform! 🚀"
        
        # Create HTML email template
        html_body = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body {{ font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }}
                .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                .header {{ background: linear-gradient(135deg, #06b6d4, #8b5cf6); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }}
                .content {{ background: #f8fafc; padding: 30px; border-radius: 0 0 10px 10px; }}
                .feature {{ background: white; margin: 15px 0; padding: 20px; border-radius: 8px; border-left: 4px solid #06b6d4; }}
                .button {{ display: inline-block; background: linear-gradient(135deg, #06b6d4, #8b5cf6); color: white; padding: 12px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; margin: 20px 0; }}
                .footer {{ text-align: center; margin-top: 30px; color: #666; font-size: 14px; }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>🚀 Welcome to AI Gen Platform!</h1>
                    <p>Your journey into the future of AI starts now</p>
                </div>
                
                <div class="content">
                    <h2>Hello{f" {user_name}" if user_name else ""}! 👋</h2>
                    
                    <p>Welcome to the most advanced AI generation platform! We're thrilled to have you join our community of creators and innovators.</p>
                    
                    <div class="feature">
                        <h3>📄 Text Generation</h3>
                        <p>Create human-like content with exceptional coherence and creativity.</p>
                    </div>
                    
                    <div class="feature">
                        <h3>🎨 Image Generation</h3>
                        <p>Transform your ideas into stunning visuals and artwork.</p>
                    </div>
                    
                    <div class="feature">
                        <h3>💻 Code Generation</h3>
                        <p>Generate clean, efficient code across multiple programming languages.</p>
                    </div>
                    
                    <p>Ready to get started? Click the button below to explore our platform:</p>
                    
                    <a href="#" class="button">Launch Platform</a>
                    
                    <p><strong>Need help?</strong> Our support team is here to assist you every step of the way.</p>
                    
                    <div class="footer">
                        <p>Thank you for choosing AI Gen Platform!</p>
                        <p>Best regards,<br>The AI Gen Team</p>
                    </div>
                </div>
            </div>
        </body>
        </html>
        """
        
        msg.attach(MIMEText(html_body, 'html'))
        
        server = smtplib.SMTP(smtp_server, smtp_port)
        server.starttls()
        server.login(smtp_username, smtp_password)
        text = msg.as_string()
        server.sendmail(smtp_username, user_email, text)
        server.quit()
        
        return True
    except Exception as e:
        print(f"Failed to send welcome email: {e}")
        return False

def send_login_notification(user_email: str, login_time: datetime = None, ip_address: str = None):
    """Send login notification email"""
    
    smtp_server = os.getenv("SMTP_SERVER")
    smtp_port = int(os.getenv("SMTP_PORT", "587"))
    smtp_username = os.getenv("SMTP_USERNAME")
    smtp_password = os.getenv("SMTP_PASSWORD")
    
    if not all([smtp_server, smtp_username, smtp_password]):
        print("Email configuration not complete")
        return False
    
    if not login_time:
        login_time = datetime.now()
    
    try:
        msg = MIMEMultipart()
        msg['From'] = smtp_username
        msg['To'] = user_email
        msg['Subject'] = "Login Alert - AI Gen Platform 🔐"
        
        # Create HTML email template
        html_body = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body {{ font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }}
                .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                .header {{ background: linear-gradient(135deg, #06b6d4, #8b5cf6); color: white; padding: 25px; text-align: center; border-radius: 10px 10px 0 0; }}
                .content {{ background: #f8fafc; padding: 30px; border-radius: 0 0 10px 10px; }}
                .info-box {{ background: white; padding: 20px; border-radius: 8px; border-left: 4px solid #10b981; margin: 20px 0; }}
                .security-note {{ background: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b; }}
                .footer {{ text-align: center; margin-top: 30px; color: #666; font-size: 14px; }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>🔐 Login Alert</h1>
                    <p>AI Gen Platform</p>
                </div>
                
                <div class="content">
                    <h2>Hello! 👋</h2>
                    
                    <p>We wanted to let you know that your account was just accessed.</p>
                    
                    <div class="info-box">
                        <h3>Login Details:</h3>
                        <p><strong>📅 Time:</strong> {login_time.strftime("%B %d, %Y at %I:%M %p")}</p>
                        {f'<p><strong>🌐 IP Address:</strong> {ip_address}</p>' if ip_address else ''}
                        <p><strong>📱 Platform:</strong> AI Gen Platform</p>
                    </div>
                    
                    <div class="security-note">
                        <h3>🛡️ Security Notice</h3>
                        <p>If this wasn't you, please secure your account immediately by changing your password or contacting our support team.</p>
                    </div>
                    
                    <p>Thank you for using AI Gen Platform securely!</p>
                    
                    <div class="footer">
                        <p>Best regards,<br>The AI Gen Security Team</p>
                        <p><small>This is an automated security notification.</small></p>
                    </div>
                </div>
            </div>
        </body>
        </html>
        """
        
        msg.attach(MIMEText(html_body, 'html'))
        
        server = smtplib.SMTP(smtp_server, smtp_port)
        server.starttls()
        server.login(smtp_username, smtp_password)
        text = msg.as_string()
        server.sendmail(smtp_username, user_email, text)
        server.quit()
        
        return True
    except Exception as e:
        print(f"Failed to send login notification: {e}")
        return False

def send_completion_notification(user_email: str, request_type: str, prompt: str, 
                              admin_response: str = None, admin_file: str = None):
    """Send completion notification to user when admin submits result"""
    
    smtp_server = os.getenv("SMTP_SERVER")
    smtp_port = int(os.getenv("SMTP_PORT", "587"))
    smtp_username = os.getenv("SMTP_USERNAME")
    smtp_password = os.getenv("SMTP_PASSWORD")
    
    if not all([smtp_server, smtp_username, smtp_password]):
        print("Email configuration not complete")
        return False
    
    try:
        msg = MIMEMultipart()
        msg['From'] = smtp_username
        msg['To'] = user_email
        msg['Subject'] = f"✅ Your {request_type} Request is Complete - AI Gen Platform"
        
        # Create HTML email template
        html_body = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body {{ font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }}
                .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                .header {{ background: linear-gradient(135deg, #10b981, #06b6d4); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }}
                .content {{ background: #f8fafc; padding: 30px; border-radius: 0 0 10px 10px; }}
                .success-box {{ background: #d1fae5; padding: 20px; border-radius: 8px; border-left: 4px solid #10b981; margin: 20px 0; }}
                .request-box {{ background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #e2e8f0; }}
                .response-box {{ background: #f0f9ff; padding: 20px; border-radius: 8px; border-left: 4px solid #06b6d4; margin: 20px 0; }}
                .button {{ display: inline-block; background: linear-gradient(135deg, #10b981, #06b6d4); color: white; padding: 12px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; margin: 20px 0; }}
                .footer {{ text-align: center; margin-top: 30px; color: #666; font-size: 14px; }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>✅ Request Completed!</h1>
                    <p>Your AI generation request has been processed</p>
                </div>
                
                <div class="content">
                    <div class="success-box">
                        <h3>🎉 Great News!</h3>
                        <p>Your <strong>{request_type}</strong> generation request has been completed and is ready for review.</p>
                    </div>
                    
                    <div class="request-box">
                        <h3>📋 Original Request:</h3>
                        <p><strong>Type:</strong> {request_type}</p>
                        <p><strong>Prompt:</strong></p>
                        <p style="background: #f1f5f9; padding: 15px; border-radius: 5px; font-style: italic;">{prompt[:200]}{"..." if len(prompt) > 200 else ""}</p>
                    </div>
                    
                    {f'''
                    <div class="response-box">
                        <h3>💬 Admin Response:</h3>
                        <p style="background: white; padding: 15px; border-radius: 5px;">{admin_response}</p>
                    </div>
                    ''' if admin_response else ''}
                    
                    {f'''
                    <div class="success-box">
                        <h3>📎 File Attachment:</h3>
                        <p>A file has been attached to your completed request. You can download it from your dashboard.</p>
                    </div>
                    ''' if admin_file else ''}
                    
                    <p>You can view the complete results by logging into your dashboard:</p>
                    
                    <a href="{os.getenv('FRONTEND_URL', 'http://localhost:3000')}/dashboard" class="button">View Results</a>
                    
                    <p>Thank you for using AI Gen Platform!</p>
                    
                    <div class="footer">
                        <p>Best regards,<br>The AI Gen Team</p>
                        <p><small>This is an automated notification.</small></p>
                    </div>
                </div>
            </div>
        </body>
        </html>
        """
        
        msg.attach(MIMEText(html_body, 'html'))
        
        # Attach admin file if provided
        if admin_file and os.path.exists(admin_file):
            try:
                with open(admin_file, "rb") as attachment:
                    part = MIMEBase('application', 'octet-stream')
                    part.set_payload(attachment.read())
                    encoders.encode_base64(part)
                    part.add_header(
                        'Content-Disposition',
                        f'attachment; filename= {os.path.basename(admin_file)}'
                    )
                    msg.attach(part)
            except Exception as e:
                print(f"Failed to attach file: {e}")
        
        server = smtplib.SMTP(smtp_server, smtp_port)
        server.starttls()
        server.login(smtp_username, smtp_password)
        text = msg.as_string()
        server.sendmail(smtp_username, user_email, text)
        server.quit()
        
        return True
    except Exception as e:
        print(f"Failed to send completion notification: {e}")
        return False
