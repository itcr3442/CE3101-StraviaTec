using System;
using System.Data;
using Microsoft.Data.SqlClient;

namespace web;

public interface ISqlExec
{
    SqlConnection Connection { get; }

    void Bind(SqlCommand command);
}

public interface ISqlConn : ISqlExec
{
    SqlTransaction BeginTransaction();
}

public interface ISqlTxn : ISqlExec
{
}

public static class SqlOps
{
    public static SqlCmd Cmd(this ISqlExec exec, string query)
    {
        return new SqlCmd(query, exec);
    }
}

public class SqlCmd : IDisposable
{
    public SqlCmd(string query, ISqlExec exec)
    {
        _exec = exec;
        _cmd = new SqlCommand(query, exec.Connection);
    }

    public void Dispose() => _cmd.Dispose();

    public SqlCmd Param(string name, object? val)
    {
        _cmd.Parameters.AddWithValue("@" + name, val ?? DBNull.Value);
        return this;
    }

    public T? Scalar<T>()
    {
        _exec.Bind(_cmd);
        var single = _cmd.ExecuteScalar();
        return single != DBNull.Value ? (T)single : default(T?);
    }

    public SqlStream Stream()
    {
        _exec.Bind(_cmd);
        return new SqlStream(_cmd.ExecuteReader());
    }

    private ISqlExec _exec;
    private SqlCommand _cmd;
}

public class SqlStream : IDisposable
{
    public Stream? Stream => _stream;

    public SqlStream(SqlDataReader reader)
    {
        _reader = reader;
        if (_reader.Read())
        {
            _stream = _reader.GetStream(0);
        }
    }

    public void Dispose()
    {
        if (_stream != null)
        {
            _stream.Dispose();
        }

        _reader.Dispose();
    }

    public Stream? Take()
    {
        var stream = _stream;
        _stream = null;
        return stream;
    }

    private SqlDataReader _reader;
    private Stream? _stream;
}

public class SqlConn : ISqlConn, IDisposable
{
    public SqlConn(IConnectionStrings strs) => _db = new SqlConnection(strs.Sql);

    public void Dispose() => _db.Dispose();

    public SqlConnection Connection => _db;

    public void Bind(SqlCommand command) => Open();

    public SqlTransaction BeginTransaction()
    {
        Open();
        return _db.BeginTransaction();
    }

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

public class SqlTxn : ISqlTxn
{
    public SqlTxn(ISqlConn conn) => _conn = conn;

    public SqlConnection Connection => _conn.Connection;

    public void Bind(SqlCommand command)
    {
        command.Transaction = Txn();
    }

    private ISqlConn _conn;
    private SqlTransaction? _txn;

    private SqlTransaction Txn()
    {
        _txn ??= _conn.BeginTransaction();
        return _txn;
    }
}
