package cr.ac.tec.ce3101.straviatec
import okhttp3.RequestBody
import retrofit2.Call
import retrofit2.http.*


interface StraviaService {
    /**
     * Request to validate credentials of the user
     */
    @POST("Users/Login")
    fun checkLogin(@Body user: User): Call<String>

    /**
     * Request to add a new activity without a gpx
     */
    @POST("Activities")
    fun addActivity(@Body activity: NewActivity): Call<Id>

    /**
     * Request to add a track gpx to an activity
     */
    @PUT("Activities/{id}/track")
    fun addActivityGPX(@Path("id") id: Int, @Body gpx: RequestBody): Call<Unit>

}

/**
 * Simple object to receive an activity id
 */
data class Id(
    val id: Int
)

/**
 * Simple object to send the required information to create a new activity
 */
data class NewActivity(
    val start: String,
    val end : String,
    val type: String,
    val length: Float,
)