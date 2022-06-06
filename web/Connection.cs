namespace web;

// Cadenas de conexión a bases de datos
public interface IConnectionStrings
{
    public string Sql { get; }
    public string Mongo { get; }
}

public class ConnectionStrings : IConnectionStrings
{
    public ConnectionStrings(IConfiguration config)
    {
        _sql = config.GetConnectionString("StraviaTecSql");
        _mongo = config.GetConnectionString("StraviaTecMongo");
    }

    public String Sql => _sql;
    public String Mongo => _mongo;

    private string _sql;
    private string _mongo;
}
