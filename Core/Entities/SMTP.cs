namespace Core.Entities;

public class SMTP
{
    public string SenderAddress { get; set; }
    public string SenderDisplayName { get; set; }
    public string UserName { get; set; }
    public string Password { get; set; }
    public string Host { get; set; }
    public int Port { get; set; }
    public bool EnableSSL { get; set; }
    public bool UseDefaultCredentials { get; set; }
    public bool IsBodyHTML { get; set; }

}
