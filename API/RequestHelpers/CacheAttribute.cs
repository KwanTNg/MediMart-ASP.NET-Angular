using System.Text;
using Core.Interfaces;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;

namespace API.RequestHelpers;

//IAsyncActionFilter gives us access to the on action execution async
//It acts as a filter before the action is executed
[AttributeUsage(AttributeTargets.All)]
public class CacheAttribute(int timeToLiveSeconds) : Attribute, IAsyncActionFilter
{
    public async Task OnActionExecutionAsync(ActionExecutingContext context, ActionExecutionDelegate next)
    {
        var cacheService = context.HttpContext.RequestServices.GetRequiredService<IResponseCacheService>();
        var cacheKey = GenerateCacheKeyFromRequest(context.HttpContext.Request);
        var cachedResponse = await cacheService.GetCachedResponseAsync(cacheKey);
        if (!string.IsNullOrEmpty(cachedResponse))
        {
            var contentResult = new ContentResult
            {
                Content = cachedResponse,
                ContentType = "application/json",
                StatusCode = 200
            };
            context.Result = contentResult;
            return;
        }

        //if cachedResponse is null, API should get result from SQL Server
        var executedContext = await next();
        if (executedContext.Result is OkObjectResult okObjectResult)
        {
            if (okObjectResult.Value != null)
            {
                await cacheService.CacheResponseAsync(cacheKey, okObjectResult.Value,
                    TimeSpan.FromSeconds(timeToLiveSeconds));
            }
        }
    }

    private string GenerateCacheKeyFromRequest(HttpRequest request)
    {
        var keyBuilder = new StringBuilder();
        keyBuilder.Append($"{request.Path}");
        foreach (var (key, value) in request.Query.OrderBy(x => x.Key))
        {
            keyBuilder.Append($"|{key}-{value}");
        }
        return keyBuilder.ToString();
    }
}
