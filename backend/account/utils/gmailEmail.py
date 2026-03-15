import smtplib
from email.message import EmailMessage
from decouple import config


def send_real_email(to_email, user_name, link):
    msg = EmailMessage()
    msg['Subject'] = 'Welcome to LevelUpCode'
    msg['From'] = config('GMAIL_USERNAME')
    msg['To'] = to_email
    msg.set_content(f'Hi {user_name}, click here: {link}')
    
    with smtplib.SMTP('smtp.gmail.com', 587) as smtp:
        smtp.starttls()
        smtp.login(config('GMAIL_USERNAME'), config('GMAIL_APP_PASSWORD'))
        smtp.send_message(msg)