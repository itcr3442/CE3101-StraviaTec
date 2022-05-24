using System.ComponentModel.DataAnnotations;
using web.Body.Common;

namespace web.Body.Resp;

public record struct Ref([Required] int Id);

public record Login
{
    [Required]
    public int Id { get; set; }
    [Required]
    public UserType Type { get; set; }
}

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
    public int Age { get; set; }
    [Required]
    public string Nationality { get; set; } = null!;
    [Required]
    public UserRelationship Relationship { get; set; }
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

public record GetGroup
{
    [Required]
    public string Name { get; set; } = null!;
    [Required]
    public int Admin { get; set; }
    [Required]
    public int[] Members { get; set; } = null!;
    [Required]
    public bool AmMember { get; set; }
}

public record GetRace
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
    public int[] PrivateGroups { get; set; } = null!;
    [Required]
    public decimal Price { get; set; }
    [Required]
    public RaceStatus Status { get; set; }
}

public record GetChallenge
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
    public decimal Progress { get; set; }
    [Required]
    public int RemainingDays { get; set; }
    [Required]
    public int[] PrivateGroups { get; set; } = null!;
    [Required]
    public ChallengeStatus Status { get; set; }
}

public record LeaderboardRow
{
    [Required]
    public int Activity { get; set; }
    [Required]
    public int Seconds { get; set; }
    [Required]
    public decimal Length { get; set; }
}

public record RaceParticipants
{
    [Required]
    public Category Category { get; set; }
    [Required]
    public int[] Participants { get; set; } = null!;
}

public record RacePositions
{
    [Required]
    public Category Category { get; set; }
    [Required]
    public int[] Activities { get; set; } = null!;
}
