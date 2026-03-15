import smtplib
from email.message import EmailMessage
from decouple import config
import resend
import sib_api_v3_sdk
from sib_api_v3_sdk.rest import ApiException


class SMTPResponse:
    def __init__(self, status_code=200, text="OK"):
        self.status_code = status_code
        self.text = text

# def send_real_email(to_email, user_name, link):
#     msg = EmailMessage()
#     msg['Subject'] = 'Verify your email'
#     msg['From'] = config('GMAIL_USERNAME')
#     msg['To'] = to_email
#     msg.set_content(f"Hi {user_name}, click here: {link}")
    
#     try:
#         with smtplib.SMTP('smtp.gmail.com', 587) as smtp:
#             smtp.starttls()
#             smtp.login(config('GMAIL_USERNAME'), config('GMAIL_APP_PASSWORD'))
#             smtp.send_message(msg)
#         print("Email sent successfully")
#         return SMTPResponse()
#     except Exception as e:
#         print("Error sending email:", e)
#         raise e

# def send_real_email(to_email, user_name, link):
#     resend.api_key = config("RESEND_API_KEY")

#     try:
#         response = resend.Emails.send({
#             "from": "onboarding@resend.dev",
#             "to": to_email,
#             "subject": "Verify your email",
#             "text": f"Hi {user_name}, click here: {link}"
#         })
#         print("Resend response:", response)

#         if response and response.id:   # ← .id not .get("id"), it's an object not dict
#             return SMTPResponse(status_code=200, text="OK")
#         else:
#             return SMTPResponse(status_code=500, text=f"Unexpected response: {response}")

#     except Exception as e:
#         print("Resend error:", e)
#         return SMTPResponse(status_code=500, text=str(e))


def send_real_email(to_email, user_name, link):
    configuration = sib_api_v3_sdk.Configuration()
    configuration.api_key['api-key'] = config("BREVO_API_KEY")

    api_instance = sib_api_v3_sdk.TransactionalEmailsApi(
        sib_api_v3_sdk.ApiClient(configuration)
    )

    email = sib_api_v3_sdk.SendSmtpEmail(
        to=[{"email": to_email, "name": user_name}],
        sender={"email": "rahulsrajput29@gmail.com", "name": "YourApp"},
        subject="Verify your email",
        text_content=f"Hi {user_name}, click here: {link}"
    )

    try:
        response = api_instance.send_transac_email(email)
        print("Brevo response:", response)
        return SMTPResponse(status_code=200, text="OK")

    except ApiException as e:
        print("Brevo error:", e)
        return SMTPResponse(status_code=500, text=str(e))

    except Exception as e:
        print("Unexpected error:", e)
        return SMTPResponse(status_code=500, text=str(e))
