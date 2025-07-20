using System.Net;
using System.Net.Mail;
using System.Reflection;
using System.Text;
using Core.Entities;
using Core.Interfaces;
using Core.Specifications;
using Microsoft.Extensions.Options;

namespace Infrastructure.Services;

public class EmailService : IEmailService
{
    // private const string templatePath = @"../Infrastructure/Data/EmailTemplate/{0}.html";
    private readonly SMTP _smtpConfig;
    private readonly string _templateDirectory;

    public EmailService(IOptions<SMTP> smtpConfig)
    {
        _smtpConfig = smtpConfig.Value;

        // Initialize template directory path here (once)
        var basePath = Path.GetDirectoryName(Assembly.GetExecutingAssembly().Location)!;
        _templateDirectory = Path.Combine(basePath, "Data", "EmailTemplate");
    }


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
            From = new MailAddress(_smtpConfig.SenderAddress,
                _smtpConfig.SenderDisplayName),
            IsBodyHtml = _smtpConfig.IsBodyHTML
        };

        foreach (var toEmail in userEmailOptions.ToEmails)
        {
            mail.To.Add(toEmail);
        }

        NetworkCredential networkCredential = new NetworkCredential(
            _smtpConfig.UserName,
            _smtpConfig.Password
        );

        SmtpClient smtpClient = new SmtpClient
        {
            Host = _smtpConfig.Host,
            Port = _smtpConfig.Port,
            EnableSsl = _smtpConfig.EnableSSL,
            UseDefaultCredentials = _smtpConfig.UseDefaultCredentials,
            Credentials = networkCredential
        };

        mail.BodyEncoding = Encoding.Default;

        await smtpClient.SendMailAsync(mail);


    }
    private string GetEmailBody(string templateName)
    {
        // var body = File.ReadAllText(string.Format(templatePath, templateName));
        var fullPath = Path.Combine(_templateDirectory, $"{templateName}.html");

        if (!File.Exists(fullPath))
            throw new FileNotFoundException($"Email template not found: {fullPath}");

        // return body;
        return File.ReadAllText(fullPath);
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

