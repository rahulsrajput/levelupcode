from anymail.message import AnymailMessage
from django.conf import settings

def sendgrid_template_mail(to_email, template_id, dynamic_data, subject, from_email=settings.DEFAULT_FROM_EMAIL):
    message = AnymailMessage(
        subject=subject,
        to=(to_email,),
        from_email=from_email,
        template_id=template_id, # SendGrid template ID
    )
    message.merge_global_data = dynamic_data # This will replace template variables merge_global_data is dictionary attribute
    message.send()