using System;

using MongoDB.Bson;
using MongoDB.Driver;

namespace web;

public interface IMongoConn
{
    IMongoCollection<LazyBsonDocument> Collection(string name);
}

public class MongoConn : IMongoConn
{
    public MongoConn(IConnectionStrings strs)
    {
        _client = new MongoClient(strs.Mongo);
        _db = _client.GetDatabase("straviatec");
    }

    public IMongoCollection<LazyBsonDocument> Collection(string name) =>
        _db.GetCollection<LazyBsonDocument>(name);

    private MongoClient _client;
    private IMongoDatabase _db;
}
