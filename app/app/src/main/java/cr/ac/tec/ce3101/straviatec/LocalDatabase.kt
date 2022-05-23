package cr.ac.tec.ce3101.straviatec

import androidx.room.*

/**
 * Database definition for storing local data related to users and activities
 */
@Database(
    entities = [User::class, Activity::class],
    version = 1
)
abstract class LocalDB : RoomDatabase() {
    abstract fun userDao(): UserDao
    abstract fun activityDao(): ActivityDao
}
/**
 * Stores only previously logged users, must validate credentials again
 * when doing synchronization
 */
@Entity
data class User(
    @PrimaryKey val username: String,
    val password: String,
)

/**
 * Stores Data related to an activity
 */
@Entity
data class Activity(
    @PrimaryKey val start: String,
    val end: String,
    val length: Float,
    val type: String,
    var gpx: String,
    @Embedded
    val user: User,
)

/**
 * Interface to perform sql operations on databases that have a
 * [User] entity
 */
@Dao
interface UserDao {
    @Insert
    fun insertAll(vararg users: User)

    @Delete
    fun delete(user: User)

    @Update
    fun updateUser(user: User)

    @Query("DELETE FROM user where username = :username")
    fun deleteByUsername(username: String)

    @Query("SELECT * FROM user")
    fun getAll(): List<User>

    @Query(
        "SELECT * FROM user WHERE username = :username"
    )
    fun findUser(username: String): User?

    @Query(
        "SELECT * FROM user WHERE username = :username AND password = :password"
    )
    fun findCredentials(username: String, password: String): User?
}

/**
 * Interface to perform sql operations on databases that have a
 * [Activity] entity
 */
@Dao
interface ActivityDao {
    @Insert
    fun insertAll(vararg activity: Activity)

    @Delete
    fun delete(activity: Activity)

    @Query("SELECT * FROM activity")
    fun getAll(): List<Activity>
}

