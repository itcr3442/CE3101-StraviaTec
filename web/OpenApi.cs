using System;
using Microsoft.OpenApi.Models;
using Swashbuckle.AspNetCore.SwaggerGen;

namespace web;

[AttributeUsage(AttributeTargets.Method)]
public class FileUploadAttribute : Attribute
{ }

// https://stackoverflow.com/questions/39152612/swashbuckle-5-and-multipart-form-data-helppages/58516446#58516446
public class FileUploadOperationFilter : IOperationFilter
{
    public void Apply(OpenApiOperation operation, OperationFilterContext context)
    {
        var isFileUploadOperation =
            context.MethodInfo.CustomAttributes.Any(a => a.AttributeType == typeof(FileUploadAttribute));

        if (!isFileUploadOperation) return;

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
                ["image/jpeg"] = uploadFileMediaType
            }
        };
    }
}
