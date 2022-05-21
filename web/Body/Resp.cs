using System.ComponentModel.DataAnnotations;
using web.Body.Common;

namespace web.Body.Resp;

public record struct Ref([Required] int Id);

public record GetUser
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
}

public record HomeStats
{
    [Required]
    public int Following { get; set; }
    [Required]
    public int Followers { get; set; }
    [Required]
    public int Activities { get; set; }
    public int? LatestActivity { get; set; }
}

public record Paged
{
    [Required]
    public int Pages { get; set; }
    [Required]
    public int[] Page { get; set; } = null!;
}

public record Comments
{
    [Required]
    public int Pages { get; set; }
    [Required]
    public Comment[] Page { get; set; } = null!;
}

public record Comment
{
    [Required]
    public int User { get; set; }
    [Required]
    public DateTime Time { get; set; }
    [Required]
    public string Content { get; set; } = null!;
}

public record GetActivity
{
    [Required]
    public int User { get; set; }
    [Required]
    public DateTime Start { get; set; }
    [Required]
    public DateTime End { get; set; }
    [Required]
    public ActivityType Type { get; set; }
    [Required]
    public decimal Length { get; set; }
}
