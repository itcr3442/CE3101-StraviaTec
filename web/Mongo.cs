using System;

using MongoDB.Bson;
using MongoDB.Driver;

namespace web;

public interface IMongoConn
{
    IMongoCollection<T> Collection<T>(string name);
}

public class MongoConn : IMongoConn
{
    public MongoConn(IConnectionStrings strs) => _strs = strs;

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
