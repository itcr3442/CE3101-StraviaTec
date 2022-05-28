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
    [Required]
    public string Current { get; set; } = null!;
    [Required]
    public string New { get; set; } = null!;
}

public record NewUser
{
    [Required]
    public string Username { get; set; } = null!;
    [Required]
    public string Password { get; set; } = null!;
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

public record NewGroup
{
    [Required]
    public string Name { get; set; } = null!;
    [Required]
    public int Admin { get; set; }
}

public record PatchGroup
{
    public string? Name { get; set; }
    public int? Admin { get; set; }
}

public record NewRace
{
    [Required]
    public string Name { get; set; } = null!;
    [Required]
    public DateTime Day { get; set; }
    [Required]
    public ActivityType Type { get; set; }
    [Required]
    public decimal Price { get; set; }
    [Required]
    public int[] PrivateGroups { get; set; } = null!;
    [Required]
    public Category[] Categories { get; set; } = null!;
}

public record PatchRace
{
    public string? Name { get; set; }
    public DateTime? Day { get; set; }
    public ActivityType? Type { get; set; }
    public int[]? PrivateGroups { get; set; }
    public Category[]? Categories { get; set; }
    public decimal? Price { get; set; }
}

public record NewChallenge
{
    [Required]
    public string Name { get; set; } = null!;
    [Required]
    public DateTime Start { get; set; }
    [Required]
    public DateTime End { get; set; }
    [Required]
    public ActivityType Type { get; set; }
    [Required]
    public decimal Goal { get; set; }
    [Required]
    public int[] PrivateGroups { get; set; } = null!;
}

public record PatchChallenge
{
    public string? Name { get; set; }
    public DateTime? Start { get; set; }
    public DateTime? End { get; set; }
    public ActivityType? Type { get; set; }
    public decimal? Goal { get; set; }
    public int[]? PrivateGroups { get; set; }
}
