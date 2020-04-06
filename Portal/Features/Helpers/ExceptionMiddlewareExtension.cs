using Portal.Models;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.Http;
using System.Net;

namespace Portal.Helpers {
    public static class ExceptionMiddlewareExtension {
        public static void ConfigureCustomExceptionMiddleware(this IApplicationBuilder app) {
            app.UseMiddleware<ExceptionMiddleware>();
        }
    }
}
