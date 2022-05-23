package cr.ac.tec.ce3101.straviatec

import android.content.Context
import androidx.room.Room

/**
 * Session type for user session without connection to the main server
 * Look into [Session] for documentation on the overridden functions
 */
class OfflineSession(
    private val user: User,
    var cx: Context,
    private val cache: LocalDB =
        Room.databaseBuilder(cx.applicationContext, LocalDB::class.java, "cache")
            .allowMainThreadQueries().build(),
) : Session {
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
        val credentials = cache.userDao().findCredentials(user.username, user.password)
        if (credentials != null) {
            auth(true)
        } else {
            auth(false)
        }
    }

    override fun saveActivity(activity: Activity, afterOp: (Boolean) -> Unit) {
        cache.activityDao().insertAll(activity)
        afterOp(true)
    }
}