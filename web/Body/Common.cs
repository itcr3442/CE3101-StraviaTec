namespace web.Body.Common;

public enum UserType
{
    Athlete,
    Organizer,
}

public enum UserRelationship
{
    None,
    Self,
    Following,
    FollowedBy,
    BothFollowing,
}

public enum RaceStatus
{
    NotRegistered,
    WaitingConfirmation,
    Registered,
    Completed,
}

public enum ChallengeStatus
{
    NotRegistered,
    Registered,
    Completed,
}

public enum ActivityType
{
    Running,
    Swimming,
    Cycling,
    Hiking,
    Kayaking,
    Walking,
}

public enum Category
{
    Junior,
    Sub23,
    Open,
    Elite,
    MasterA,
    MasterB,
    MasterC,
}
