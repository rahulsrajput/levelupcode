import smtplib
from email.message import EmailMessage
from decouple import config


class SMTPResponse:
    def __init__(self, status_code=200, text="OK"):
        self.status_code = status_code
        self.text = text

def send_real_email(to_email, user_name, link):
    msg = EmailMessage()
    msg['Subject'] = 'Verify your email'
    msg['From'] = config('GMAIL_USERNAME')
    msg['To'] = to_email
    msg.set_content(f"Hi {user_name}, click here: {link}")
    
    try:
        with smtplib.SMTP('smtp.gmail.com', 587) as smtp:
            smtp.starttls()
            smtp.login(config('GMAIL_USERNAME'), config('GMAIL_APP_PASSWORD'))
            smtp.send_message(msg)
        print("Email sent successfully")
        return SMTPResponse()
    except Exception as e:
        print("Error sending email:", e)
        raise e