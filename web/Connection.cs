namespace web;

public interface IConnectionStrings
{
    public string Sql { get; }
}

public class ConnectionStrings : IConnectionStrings
{
    public ConnectionStrings(IConfiguration config)
        => _sql = config.GetConnectionString("StraviaTecSql");

    public String Sql => _sql;

    private string _sql;
}
