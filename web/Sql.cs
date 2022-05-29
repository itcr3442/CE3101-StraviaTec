using System;
using System.Collections;
using System.Collections.Generic;
using System.Data;
using System.Runtime.CompilerServices;
using System.Xml;
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

    public SqlCmd Output(string name, SqlDbType type)
    {
        _cmd.Parameters.Add("@" + name, type).Direction = ParameterDirection.Output;
        return this;
    }

    public T? Row<T>() where T : struct
    {
        _exec.Bind(_cmd);
        foreach (var row in Rows<T>())
        {
            return row;
        }

        return null;
    }

    public IEnumerable<T> Rows<T>() where T : struct
    {
        _exec.Bind(_cmd);
        return new SqlRows<T>(_cmd.ExecuteReader());
    }

    public SqlStream Stream()
    {
        _exec.Bind(_cmd);
        return new SqlStream(_cmd.ExecuteReader());
    }

    public XmlReader Xml()
    {
        _exec.Bind(_cmd);
        return _cmd.ExecuteXmlReader();
    }

    public async Task<int> Exec()
    {
        _exec.Bind(_cmd);
        return await _cmd.ExecuteNonQueryAsync();
    }

    public int InsertId() => Row<int>().Value;

    public async Task<SqlParameterCollection> StoredProcedure()
    {
        _cmd.CommandType = CommandType.StoredProcedure;
        await Exec();
        return _cmd.Parameters;
    }

    private ISqlExec _exec;
    private SqlCommand _cmd;
}

public class SqlRows<T> : IDisposable, IEnumerable<T>, IEnumerator<T> where T : struct
{
    public void Dispose() => _reader.Dispose();

    public IEnumerator<T> GetEnumerator() => this;

    public T Current
    {
        get
        {
            var columns = new object?[_args != null ? _args.Length : 1];
            _reader.GetValues(columns);

            for (int i = 0; i < columns.Length; ++i)
            {
                Type reference = _args != null ? _args[i] : _ty;
                if (Nullable.GetUnderlyingType(reference) != null && columns[i] == DBNull.Value)
                {
                    columns[i] = null;
                }
            }

            return (T)(_args != null ? Activator.CreateInstance(_ty, columns) : columns[0])!;
        }
    }

    public bool MoveNext() => _reader.Read();

    public void Reset() => throw new InvalidOperationException("Cannot reset row iterator");

    IEnumerator IEnumerable.GetEnumerator() => this;

    object IEnumerator.Current => Current;

    internal SqlRows(SqlDataReader reader)
    {
        _reader = reader;
        _ty = typeof(T);
        _args = typeof(ITuple).IsAssignableFrom(_ty) ? _ty.GetGenericArguments() : null;
    }

    private readonly SqlDataReader _reader;
    private readonly Type _ty;
    private readonly Type[]? _args;
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
