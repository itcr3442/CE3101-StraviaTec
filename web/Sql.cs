using System;
using Microsoft.Data.SqlClient;

namespace web;

public interface ISqlConn
{
}

public class SqlConn : ISqlConn, IDisposable
{
    public SqlConn(IConnectionStrings strs) => _db = new SqlConnection(strs.Sql);

    public void Dispose() => _db.Dispose();

    private SqlConnection _db;
    private bool _open = false;

    private void Open()
    {
        if (!_open)
        {
            _db.Open();
            _open = true;
        }
    }
}
