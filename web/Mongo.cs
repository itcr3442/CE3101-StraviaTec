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
    public MongoConn(IConnectionStrings strs)
    {
        _client = new MongoClient(strs.Mongo);
        _db = _client.GetDatabase("straviatec");
    }

    public IMongoCollection<T> Collection<T>(string name) => _db.GetCollection<T>(name);

    private MongoClient _client;
    private IMongoDatabase _db;
}
