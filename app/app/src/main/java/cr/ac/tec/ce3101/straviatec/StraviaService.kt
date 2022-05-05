package cr.ac.tec.ce3101.straviatec
import retrofit2.Call
import retrofit2.http.POST
import retrofit2.http.Query


interface StraviaService {
    /**
     * Request to validate credentials of the user
     */
    @POST("check_login")
    fun checkLogin(
        @Query("username") username: String,
        @Query("password") password: String
    ): Call<String>

}
