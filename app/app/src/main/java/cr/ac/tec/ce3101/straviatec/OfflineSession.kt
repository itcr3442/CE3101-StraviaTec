package cr.ac.tec.ce3101.straviatec

import android.content.Context

/**
 * Session type for user session without connection to the main server
 * Look into [Session] for documentation on the overriden functions
 */
class OfflineSession(
    private val username: String,
    private val password: String,
    var cx: Context,
    //private val cache: LocalDB =
    //    Room.databaseBuilder(cx.applicationContext, LocalDB::class.java, "cache")
    //        .allowMainThreadQueries().build(),
    //private val pendingOps: PendingOpDB =
    //    Room.databaseBuilder(cx.applicationContext, PendingOpDB::class.java, "pending-ops")
    //        .allowMainThreadQueries().build()
) : Session {
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
        auth(true)
        //TODO("Not yet implemented")
    }
}