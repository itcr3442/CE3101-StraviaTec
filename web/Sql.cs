using System;
using System.Data;
using System.Runtime.CompilerServices;
using Microsoft.Data.SqlClient;

namespace web;

public interface ISqlExec : IDisposable
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
    void Commit();
}

public static class SqlOps
{
    public static ISqlTxn Txn(this ISqlConn conn) => new SqlTxn(conn);
    public static SqlCmd Cmd(this ISqlExec exec, string query) => new SqlCmd(query, exec);
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

    public T? Tuple<T>() where T : struct, ITuple
    {
        var ty = typeof(T);
        var args = ty.GetGenericArguments();
        var columns = new object?[args.Length];

        _exec.Bind(_cmd);
        using (var reader = _cmd.ExecuteReader())
        {
            if (!reader.Read())
            {
                return null;
            }

            reader.GetValues(columns);
        }

        for (int i = 0; i < args.Length; ++i)
        {
            if (Nullable.GetUnderlyingType(args[i]) != null && columns[i] == DBNull.Value)
            {
                columns[i] = null;
            }
        }

        return (T?)Activator.CreateInstance(ty, columns);
    }

    public SqlStream Stream()
    {
        _exec.Bind(_cmd);
        return new SqlStream(_cmd.ExecuteReader());
    }

    public void Exec()
    {
        _exec.Bind(_cmd);
        _cmd.ExecuteNonQuery();
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

public class SqlConn : ISqlConn
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

    public void Dispose()
    {
        if (_txn != null)
        {
            _txn.Dispose();
        }
    }

    public SqlConnection Connection => _conn.Connection;

    public void Bind(SqlCommand command)
    {
        command.Transaction = Txn();
    }

    public void Commit()
    {
        _txn!.Commit();
    }

    private ISqlConn _conn;
    private SqlTransaction? _txn;

    private SqlTransaction Txn()
    {
        _txn ??= _conn.BeginTransaction();
        return _txn;
    }
}
