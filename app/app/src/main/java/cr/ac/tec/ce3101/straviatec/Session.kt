package cr.ac.tec.ce3101.straviatec

import android.content.Context
/**
 * Defines the functionality that must be provided
 * online and offline
 */

interface Session {
    fun changeContext(cx: Context)
    fun getUser(): User
    /**
     * Retrieves the username used in the session
     */
    fun getUsername(): String

    /**
     * Retrieves the password used in the session
     */
    fun getPassword(): String

    /**
     * Authenticates the current user
     */
    fun login(auth: (Boolean) -> Unit)

    fun saveActivity(activity: Activity, afterOp: (Boolean) -> Unit)
}
