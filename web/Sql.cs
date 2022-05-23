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
    public static SqlCmd Command(this ISqlExec exec, string query)
    {
        return new SqlCmd(query, exec);
    }
}

public class SqlCmd : IDisposable
{
    public SqlCmd(string query, ISqlExec exec) => _cmd = new SqlCommand(query, exec.Connection);

    public void Dispose() => _cmd.Dispose();

    public SqlCmd Param(string name, SqlDbType ty, object? val)
    {
        _cmd.Parameters.Add("@" + name, ty).Value = val ?? DBNull.Value;
        return this;
    }

    public T? Scalar<T>()
    {
        var single = _cmd.ExecuteScalar();
        return single != DBNull.Value ? (T)single : default(T?);
    }

    private SqlCommand _cmd;
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
