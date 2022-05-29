using System;
using Microsoft.OpenApi.Models;
using Swashbuckle.AspNetCore.SwaggerGen;

namespace web;

[AttributeUsage(AttributeTargets.Method)]
public class FileUploadAttribute : Attribute
{
    public FileUploadAttribute(string mime) { }
}

// https://stackoverflow.com/questions/39152612/swashbuckle-5-and-multipart-form-data-helppages/58516446#58516446
public class FileUploadOperationFilter : IOperationFilter
{
    public void Apply(OpenApiOperation operation, OperationFilterContext context)
    {
        var attribute =
            context.MethodInfo.CustomAttributes.FirstOrDefault(a => a.AttributeType == typeof(FileUploadAttribute));

        if (attribute == null)
        {
            return;
        }

        string? mime = attribute.ConstructorArguments.First()!.Value as string;
        var uploadFileMediaType = new OpenApiMediaType()
        {
            Schema = new OpenApiSchema()
            {
                Type = "object",
                Properties =
                {
                    ["uploadedFile"] = new OpenApiSchema()
                    {
                        Description = "Upload File",
                        Type = "file",
                        Format = "binary"
                    }
                },
                Required = new HashSet<string>()
                {
                    "uploadedFile"
                }
            }
        };

        operation.RequestBody = new OpenApiRequestBody
        {
            Content =
            {
                [mime] = uploadFileMediaType
            }
        };
    }
}
