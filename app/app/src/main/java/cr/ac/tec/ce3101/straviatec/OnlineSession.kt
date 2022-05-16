package cr.ac.tec.ce3101.straviatec

import android.content.Context
import com.google.gson.GsonBuilder
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory

class OnlineSession(
    url: String,
    private val username: String,
    private val password: String,
    var cx: Context,
    /*private val cache: LocalDB =
        Room.databaseBuilder(cx.applicationContext, LocalDB::class.java, "cache")
            .allowMainThreadQueries().build(),
    private val pendingOps: PendingOpDB =
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
    fun synchronize(){
        TODO()
    }
    override fun changeContext(cx: Context) {
        TODO("Not yet implemented")
    }

    override fun getUsername(): String {
        TODO("Not yet implemented")
    }

    override fun getPassword(): String {
        TODO("Not yet implemented")
    }

    override fun login(auth: (Boolean) -> Unit) {
        TODO("Not yet implemented")
    }
}