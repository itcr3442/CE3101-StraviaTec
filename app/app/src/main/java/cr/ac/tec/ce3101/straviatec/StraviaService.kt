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

    @POST("Activities")
    fun addActivity(@Body activity: NewActivity): Call<Id>
    
    @PUT("Activities/{id}/track")
    fun addActivityGPX(@Path("id") id: Int, @Body gpx: RequestBody): Call<Unit>

}

data class Id(
    val id: Int
)

data class NewActivity(
    val start: String,
    val end : String,
    val type: String,
    val length: Float,
)