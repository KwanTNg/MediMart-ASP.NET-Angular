using Core.Specifications;

namespace Core.Interfaces;

public interface IEmailService
{
    Task SendTestEmail(UserEmailOptions userEmailOptions);
    Task SendTestEmailConfirmation(UserEmailOptions userEmailOptions);
    Task SendEmailForFogotPassword(UserEmailOptions userEmailOptions);
}