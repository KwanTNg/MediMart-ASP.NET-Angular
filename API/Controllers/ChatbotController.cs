using Core.Entities;
using Core.Interfaces;
using Core.Specifications;
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
        private readonly IUnitOfWork _unit;

        public ChatbotController(HttpClient httpClient, IConfiguration config, IUnitOfWork unit)
        {
            _httpClient = httpClient;
            _config = config;
            _unit = unit;
        }

        private async Task<IReadOnlyList<Product>> SearchProductsAsync(string query)
        {
            // Convert the user's message into a spec param for searching
            var specParams = new ProductSpecParams
            {
                Search = query, // this will match Name
                PageIndex = 1,
                PageSize = 10
            };

            var spec = new ProductSpecification(specParams);

            var products = await _unit.Repository<Product>().ListAsync(spec);
            return products;
        }


        [HttpPost]
        public async Task<IActionResult> AskGemini([FromBody] ChatRequest request)
        {
            var geminiApiKey = _config["Gemini:ApiKey"];
            var faqText = System.IO.File.ReadAllText("App_Data/faq.txt");
            var termsText = System.IO.File.ReadAllText("App_Data/delivery.txt");
            
        // Search products
        var matchedProducts = await SearchProductsAsync(request.Message);
        Console.WriteLine("Matched products:");
        foreach (var p in matchedProducts)
        {
             Console.WriteLine($"- {p.Name} (${p.Price}) - {p.QuantityInStock}");
        }


        string productInfo = matchedProducts.Any()
            ? "Here are relevant product details from our catalog:\n\n" +
            string.Join("\n", matchedProducts.Select(p =>
            $"- Name: {p.Name}\n  Description: {p.Description}\n  Price: £{p.Price}\n  Quantity In Stock: {p.QuantityInStock}\n  Prescription Required: {(p.Category.ToLower().Contains("prescription") ? "Yes" : "No")}\n"))
            : "No matching product found.";


        var fullPrompt = $@"
        You are a helpful assistant for an online pharmacy e-commerce platform.

        Here is a list of available products in the catalog (you MUST use this information to answer questions about availability, pricing, and prescriptions, when the Quantity In Stock is 0, it means it is currently out of stock):
        {productInfo}

        Below are some frequently asked questions and delivery terms (for general reference):

        FAQs:
        {faqText}

        Terms and Conditions:
        {termsText}

        Customer question: {request.Message}
        Answer clearly and directly based only on the available product information above. 
        If a product is listed, provide its price and prescription requirement. If it's not listed, politely mention that the product is not available.
        Do NOT refer customers to the website unless the product is truly not found.
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


            httpRequest.Headers.Add("X-Goog-Api-Key", geminiApiKey);
            httpRequest.Content = new StringContent(requestJson, Encoding.UTF8, "application/json");

            var response = await _httpClient.SendAsync(httpRequest);

            if (!response.IsSuccessStatusCode)
            {
                var errorContent = await response.Content.ReadAsStringAsync();
                return StatusCode((int)response.StatusCode, errorContent);
            }

            var resultStream = await response.Content.ReadAsStreamAsync();
            using var jsonDoc = await JsonDocument.ParseAsync(resultStream);

            var text = jsonDoc
                .RootElement
                .GetProperty("candidates")[0]
                .GetProperty("content")
                .GetProperty("parts")[0]
                .GetProperty("text")
                .GetString();
            return Ok(new { message = text });
        }
    }

    public class ChatRequest
    {
        public string Message { get; set; } = "";
    }
}
