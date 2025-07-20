using System.Net;
using System.Net.Mail;
using System.Text;
using Core.Entities;
using Core.Interfaces;
using Core.Specifications;
using Microsoft.Extensions.Options;

namespace Infrastructure.Services;

public class EmailService(IOptions<SMTP> smtpConfig) : IEmailService
{
    private const string templatePath = @"../Infrastructure/Data/EmailTemplate/{0}.html";

    public async Task SendTestEmail(UserEmailOptions userEmailOptions)
    {
        userEmailOptions.Subject = UpdatePlaceHolders("Hello {{UserName}}, this is test email!", userEmailOptions.PlaceHolders);
        userEmailOptions.Body = UpdatePlaceHolders(GetEmailBody("TestEmail"), userEmailOptions.PlaceHolders);

        await SendEmail(userEmailOptions);
    }

    public async Task SendTestEmailConfirmation(UserEmailOptions userEmailOptions)
    {
        userEmailOptions.Subject = UpdatePlaceHolders("Hello {{UserName}}, please confirm your email!", userEmailOptions.PlaceHolders);
        userEmailOptions.Body = UpdatePlaceHolders(GetEmailBody("EmailConfirm"), userEmailOptions.PlaceHolders);

        await SendEmail(userEmailOptions);
    }

    public async Task SendEmailForFogotPassword(UserEmailOptions userEmailOptions)
    {
        userEmailOptions.Subject = UpdatePlaceHolders("Hello {{UserName}}, reset your password!", userEmailOptions.PlaceHolders);
        userEmailOptions.Body = UpdatePlaceHolders(GetEmailBody("ForgotPassword"), userEmailOptions.PlaceHolders);

        await SendEmail(userEmailOptions);
    }

    public async Task SendOrderConfirmationEmail(UserEmailOptions userEmailOptions)
    {
        userEmailOptions.Subject = UpdatePlaceHolders("Order Confirmation - Order #{{OrderId}}", userEmailOptions.PlaceHolders);
        userEmailOptions.Body = UpdatePlaceHolders(GetEmailBody("OrderConfirmation"), userEmailOptions.PlaceHolders);

        await SendEmail(userEmailOptions);
    }

    private async Task SendEmail(UserEmailOptions userEmailOptions)
    {
        MailMessage mail = new MailMessage
        {
            Subject = userEmailOptions.Subject,
            Body = userEmailOptions.Body,
            From = new MailAddress(smtpConfig.Value.SenderAddress,
                smtpConfig.Value.SenderDisplayName),
            IsBodyHtml = smtpConfig.Value.IsBodyHTML
        };

        foreach (var toEmail in userEmailOptions.ToEmails)
        {
            mail.To.Add(toEmail);
        }

        NetworkCredential networkCredential = new NetworkCredential(
            smtpConfig.Value.UserName,
            smtpConfig.Value.Password
        );

        SmtpClient smtpClient = new SmtpClient
        {
            Host = smtpConfig.Value.Host,
            Port = smtpConfig.Value.Port,
            EnableSsl = smtpConfig.Value.EnableSSL,
            UseDefaultCredentials = smtpConfig.Value.UseDefaultCredentials,
            Credentials = networkCredential
        };

        mail.BodyEncoding = Encoding.Default;

        await smtpClient.SendMailAsync(mail);


    }
    private string GetEmailBody(string templateName)
    {
        var body = File.ReadAllText(string.Format(templatePath, templateName));
        return body;
    }

    private string UpdatePlaceHolders(string text, List<KeyValuePair<string, string>> keyValuePairs)
    {
        if (!string.IsNullOrEmpty(text) && keyValuePairs != null)
        {
            foreach (var placeholder in keyValuePairs)
            {
                if (text.Contains(placeholder.Key))
                {
                    text = text.Replace(placeholder.Key, placeholder.Value);
                }
            }
        }
        return text;
    }
}
