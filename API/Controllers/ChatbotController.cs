using Microsoft.AspNetCore.Mvc;
using System.Net.Http;
using System.Text;
using System.Text.Json;

namespace API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ChatbotController : ControllerBase
    {
        private readonly HttpClient _httpClient;
        private readonly IConfiguration _config;

        public ChatbotController(HttpClient httpClient, IConfiguration config)
        {
            _httpClient = httpClient;
            _config = config;
        }

        [HttpPost]
        public async Task<IActionResult> AskGemini([FromBody] ChatRequest request)
        {
            var geminiApiKey = _config["Gemini:ApiKey"];
            var faqText = System.IO.File.ReadAllText("App_Data/faq.txt");
            var termsText = System.IO.File.ReadAllText("App_Data/delivery.txt");
            var fullPrompt = $@"
        You are a helpful assistant for an e-commerce site.
        Here are the FAQs:
        {faqText}

        Terms and Conditions:
        {termsText}

        Customer question: {request.Message}
        Answer based on the content above.
";
            var payload = new
            {
                contents = new[]
                {
                    new
                    {
                        parts = new[]
                        {
                            new { text = fullPrompt }
                        }
                    }
                }
            };

            var requestJson = JsonSerializer.Serialize(payload);
            var httpRequest = new HttpRequestMessage(HttpMethod.Post,
                "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite-preview-06-17:generateContent");
                // "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent");
                

            httpRequest.Headers.Add("X-Goog-Api-Key", geminiApiKey);
            httpRequest.Content = new StringContent(requestJson, Encoding.UTF8, "application/json");

            var response = await _httpClient.SendAsync(httpRequest);

            if (!response.IsSuccessStatusCode)
            {
                var errorContent = await response.Content.ReadAsStringAsync();
                return StatusCode((int)response.StatusCode, errorContent);
            }

            var resultStream = await response.Content.ReadAsStreamAsync();
            Console.WriteLine(resultStream);
            using var jsonDoc = await JsonDocument.ParseAsync(resultStream);
            Console.WriteLine(jsonDoc);

            var text = jsonDoc
                .RootElement
                .GetProperty("candidates")[0]
                .GetProperty("content")
                .GetProperty("parts")[0]
                .GetProperty("text")
                .GetString();
            Console.WriteLine(text);
            return Ok(new { message = text });
        }
    }

    public class ChatRequest
    {
        public string Message { get; set; } = "";
    }
}
