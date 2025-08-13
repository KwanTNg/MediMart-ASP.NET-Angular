using API.DTOs;
using Azure.Communication.Email;
// using Azure.Storage.Blobs;
// using Azure.Storage.Blobs.Models;
using CloudinaryDotNet;
using CloudinaryDotNet.Actions;
using Core.Entities;
using Core.Interfaces;
using Microsoft.AspNetCore.Mvc;
// using Azure;
using MimeKit;
using MailKit.Net.Smtp;

namespace API.Controllers;

public class ContactController(IUnitOfWork unit, HttpClient httpClient, IConfiguration config) : BaseApiController
{
    [HttpPost("send")]
    [RequestSizeLimit(2_000_000)] // extra buffer above 1MB to account for form overhead
    public async Task<IActionResult> SendContactMessage([FromForm] ContactRequestDto requestDto)
    {
        try
        {
            // Verify CAPTCHA before saving message or sending email
            var captchaValid = await VerifyCaptchaAsync(requestDto.CaptchaToken);
            if (!captchaValid)
                return BadRequest(new { Success = false, Message = "Captcha verification failed." });

            string? fileUrl = null;
            // If file is provided, validate and upload
            if (requestDto.Attachment != null && requestDto.Attachment.Length > 0)
            {
                // Validate size (max 1MB)
                if (requestDto.Attachment.Length > 1_000_000)
                    return BadRequest("File size exceeds 1MB limit.");
                // validate extension
                var allowedExtensions = new[] { ".pdf", ".png", ".jpg", ".jpeg", ".docx", ".xlsx" };
                var fileExt = Path.GetExtension(requestDto.Attachment.FileName).ToLowerInvariant();
                if (!allowedExtensions.Contains(fileExt))
                    return BadRequest("Only PDF, DOCX, XLSX, PNG, JPG and JPEG files are allowed.");
                // Upload to Azure Blob Storage
                // var blobService = new BlobServiceClient(config["AzureStorage:ConnectionString"]);
                // var containerClient = blobService.GetBlobContainerClient("contact-attachments");
                // await containerClient.CreateIfNotExistsAsync(PublicAccessType.None);

                // var blobName = $"{Guid.NewGuid()}{fileExt}";
                // var blobClient = containerClient.GetBlobClient(blobName);

                // await using var fileStream = requestDto.Attachment.OpenReadStream();
                // await blobClient.UploadAsync(fileStream, new BlobHttpHeaders { ContentType = requestDto.Attachment.ContentType });

                // fileUrl = blobClient.Uri.ToString();

                // Upload to Cloudinary
                var cloudinary = new Cloudinary(new Account(
                    config["CloudinarySettings:CloudName"],
                    config["CloudinarySettings:ApiKey"],
                    config["CloudinarySettings:ApiSecret"]
                ));

                var uploadParams = new RawUploadParams()
                {
                    File = new FileDescription(requestDto.Attachment.FileName, requestDto.Attachment.OpenReadStream()),
                    PublicId = $"contact-attachments/{Guid.NewGuid()}{fileExt}",

                };
                // Explicitly tell Cloudinary to accept any file type
                uploadParams.Type = "upload"; // default, but ensures file is stored

                var uploadResult = await cloudinary.UploadAsync(uploadParams);

                fileUrl = uploadResult.SecureUrl?.ToString();
            }

            //Save to Database
            var contactMessage = new ContactMessage
            {
                Name = requestDto.Name,
                Email = requestDto.Email,
                Message = requestDto.Message,
                AttachmentUrl = fileUrl
            };

            unit.Repository<ContactMessage>().Add(contactMessage);

            if (await unit.Complete())
            {
                // Send Email to Admin
                var htmlBody = $@"
                        <html>
                            <body>
                                <h2>New Contact Us Message</h2>
                                <p><strong>Name:</strong> {requestDto.Name}</p>
                                <p><strong>Email:</strong> {requestDto.Email}</p>
                                <p><strong>Message:</strong></p>
                                <p>{requestDto.Message}</p>";

                if (!string.IsNullOrEmpty(fileUrl))
                    htmlBody += $"<p><strong>Attachment:</strong> <a href='{fileUrl}'>Download</a></p>";

                htmlBody += "</body></html>";

                //Azure email

                // var emailMessage = new EmailMessage(
                //     senderAddress: "DoNotReply@bdb9c4b6-6ea8-4cbf-ab06-d6f6780279ca.azurecomm.net",
                //     content: new EmailContent($"New Contact Us Message from {requestDto.Name}")
                //     {
                //         PlainText = $"Name: {requestDto.Name}\nEmail: {requestDto.Email}\n\nMessage:\n{requestDto.Message}\nAttachment: {fileUrl}",
                //         Html = htmlBody
                //     },
                //     recipients: new EmailRecipients(new List<EmailAddress>
                //     {
                //         new EmailAddress("kt.ng@rgu.ac.uk")
                //     })
                // );

                // await emailClient.SendAsync(WaitUntil.Completed, emailMessage);

                // USe Mailtrap
                // Build email
                var message = new MimeMessage();
                message.From.Add(new MailboxAddress("MediMart Contact Form", config["Mailtrap:FromEmail"]));
                message.To.Add(new MailboxAddress("Admin", config["Mailtrap:ToEmail"]));
                message.Subject = $"New Contact Us Message from {requestDto.Name}";

                // HTML + plain text
                var builder = new BodyBuilder
                {
                    TextBody = $"Name: {requestDto.Name}\nEmail: {requestDto.Email}\n\nMessage:\n{requestDto.Message}\nAttachment: {fileUrl}",
                    HtmlBody = htmlBody
                };

                message.Body = builder.ToMessageBody();

                // Send via SMTP
                using (var smtp = new SmtpClient())
                {
                    await smtp.ConnectAsync(config["Mailtrap:Host"], int.Parse(config["Mailtrap:Port"]), MailKit.Security.SecureSocketOptions.StartTls);
                    await smtp.AuthenticateAsync(config["Mailtrap:Username"], config["Mailtrap:Password"]);
                    await smtp.SendAsync(message);
                    await smtp.DisconnectAsync(true);
                }

                return Ok(new { Success = true });
            }

            return BadRequest("Problem saving contact message!");
        }
        catch (Exception ex)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, $"An unexpected error occurred: {ex.Message}");
        }
    }

    private async Task<bool> VerifyCaptchaAsync(string token)
    {
        var secret = config["Captcha:Secret"];
        var response = await httpClient.PostAsync(
            $"https://www.google.com/recaptcha/api/siteverify?secret={secret}&response={token}", null);
        if (!response.IsSuccessStatusCode) return false;

        var jsonString = await response.Content.ReadAsStringAsync();
        var captchaResponse = System.Text.Json.JsonSerializer.Deserialize<GoogleCaptchaResponse>(jsonString);
        Console.WriteLine(jsonString);
        Console.WriteLine(captchaResponse);
        return captchaResponse?.Success == true;
    }
}

