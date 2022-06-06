using System;

using MongoDB.Bson;
using MongoDB.Driver;

/* Este es un análogo a Sql.cs pero para el caso de Mongo.
 * La interfaz es muy reducida ya que no se necesita Mongo
 * para mucho en comparación a SQL Server en esta aplicación.
 */

namespace web;

public interface IMongoConn
{
    IMongoCollection<T> Collection<T>(string name);
}

public class MongoConn : IMongoConn
{
    public MongoConn(IConnectionStrings strs) => _strs = strs;

    // Obtiene una colección dentro de la DB "straviatec"
    public IMongoCollection<T> Collection<T>(string name)
    {
        if (_db == null)
        {
            _client = new MongoClient(_strs.Mongo);
            _db = _client.GetDatabase("straviatec");
        }

        return _db.GetCollection<T>(name);
    }

    private readonly IConnectionStrings _strs;
    private MongoClient? _client = null;
    private IMongoDatabase? _db = null;
}
