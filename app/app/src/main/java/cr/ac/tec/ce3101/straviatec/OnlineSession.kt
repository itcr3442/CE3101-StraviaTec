package cr.ac.tec.ce3101.straviatec

import android.content.Context
import androidx.room.Room
import com.google.gson.GsonBuilder
import cr.ac.tec.ce3101.tecair.simpleDialog
import retrofit2.Call
import retrofit2.Callback
import retrofit2.Response
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory

class OnlineSession(
    url: String,
    private val user: User,
    var cx: Context,
    private val cache: LocalDB =
        Room.databaseBuilder(cx.applicationContext, LocalDB::class.java, "cache")
            .allowMainThreadQueries().build(),
    /*private val pendingOps: PendingOpDB =
        Room.databaseBuilder(cx.applicationContext, PendingOpDB::class.java, "pending-ops")
            .allowMainThreadQueries().build()*/
) : Session {
    private val service: StraviaService

    init {
        val gson = GsonBuilder().serializeNulls().create()
        val retrofit =
            Retrofit.Builder().baseUrl(url).addConverterFactory(GsonConverterFactory.create(gson))
                .build()
        service = retrofit.create(StraviaService::class.java)
    }

    fun synchronize(): Boolean {
        TODO()
    }

    override fun changeContext(cx: Context) {
        this.cx = cx
    }

    override fun getUser(): User {
        return user
    }

    override fun getUsername(): String {
        return user.username
    }

    override fun getPassword(): String {
        return user.password
    }

    override fun login(auth: (Boolean) -> Unit) {
        service.checkLogin(user.username, user.password).enqueue(
            object : Cb<String>() {
                override fun onResponse(call: Call<String>, response: Response<String>) {
                    if (response.code() == 200) {
                        val currentUser = User(
                            user.username,
                            user.password,
                        )
                        cache.userDao().deleteByUsername(user.username)
                        cache.userDao().insertAll(currentUser)
                        auth(synchronize())
                    } else {
                        auth(false)
                    }
                }
            }
        )
    }

    override fun saveActivity(activity: Activity, afterOp: (Boolean) -> Unit) {
        TODO("Not yet implemented")
    }

    /**
     * Callback wrapper class.
     * In case of request failure, the application must communicate
     */
    abstract inner class Cb<T> : Callback<T> {
        override fun onFailure(call: Call<T>, err: Throwable) {
            simpleDialog(cx, "Network Error")
        }
    }
}