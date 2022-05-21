using System.ComponentModel.DataAnnotations;
using web.Body.Common;

namespace web.Body.Req;

public record Login
{
    [Required]
    public string Username { get; set; } = null!;
    [Required]
    public string Password { get; set; } = null!;
}

public record UpdatePassword
{
    public string? Current { get; set; }
    [Required]
    public string New { get; set; } = null!;
}

public record NewUser
{
    [Required]
    public string Username { get; set; } = null!;
    [Required]
    public string FirstName { get; set; } = null!;
    [Required]
    public string LastName { get; set; } = null!;
    [Required]
    public DateTime BirthDate { get; set; }
    [Required]
    public string Nationality { get; set; } = null!;
    [Required]
    public UserType Type { get; set; }
}

public record PatchUser
{
    public string? Username { get; set; }
    public string? FirstName { get; set; }
    public string? LastName { get; set; }
    public DateTime? BirthDate { get; set; }
    public string? Nationality { get; set; }
}

public record Search
{
    [Required]
    public string Query { get; set; } = null!;
    [Required]
    public int Page { get; set; }
}

public record NewComment
{
    [Required]
    public string Content { get; set; } = null!;
}

public record NewActivity
{
    [Required]
    public DateTime Start { get; set; }
    [Required]
    public DateTime End { get; set; }
    [Required]
    public ActivityType Type { get; set; }
    [Required]
    public decimal Length { get; set; }
}

