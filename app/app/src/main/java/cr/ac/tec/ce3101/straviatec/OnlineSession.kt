package cr.ac.tec.ce3101.straviatec

import android.content.Context
import androidx.room.Room
import com.google.gson.GsonBuilder
import okhttp3.*
import retrofit2.Call
import retrofit2.Callback
import retrofit2.Response
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory

private class StraviaCookieJar : CookieJar {

    private val cookies = mutableListOf<Cookie>()

    override fun saveFromResponse(url: HttpUrl, cookieList: List<Cookie>) {
        cookies.addAll(cookieList)
    }

    override fun loadForRequest(url: HttpUrl): List<Cookie> =
        cookies
}

class OnlineSession(
    url: String,
    private val user: User,
    var cx: Context,
    private val cache: LocalDB =
        Room.databaseBuilder(cx.applicationContext, LocalDB::class.java, "cache.db")
            .allowMainThreadQueries().build(),
) : Session {
    private val service: StraviaService

    init {
        val gson = GsonBuilder().serializeNulls().create()
        val client = OkHttpClient.Builder().cookieJar(StraviaCookieJar()).build()
        val retrofit =
            Retrofit.Builder()
                .baseUrl(url)
                .client(client)
                .addConverterFactory(GsonConverterFactory.create(gson))
                .build()
        service = retrofit.create(StraviaService::class.java)
    }

    fun synchronize(){
        val localUsers = cache.userDao().getAll()
        val activities = cache.activityDao().getAll()

        //we'll repopulate them after user checks
        cache.clearAllTables()

        //re-validate saved credentials
        localUsers.forEach { user ->
            run {
                service.checkLogin(user).enqueue(
                    object : Cb<LoginResponse>() {
                        override fun onResponse(call: Call<LoginResponse>, response: Response<LoginResponse>) {
                            if (response.code() == 200) {
                                cache.userDao().insertAll(user)
                            }
                        }
                    }
                )
            }
        }

        // sync activities
        activities.forEach { activity ->
            saveActivity(activity) {}
        }
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
            service.checkLogin(user).enqueue(
                object : Cb<LoginResponse>() {
                    override fun onResponse(call: Call<LoginResponse>, response: Response<LoginResponse>) {
                        if (response.code() == 200) {
                            cache.userDao().deleteByUsername(user.username)
                            cache.userDao().insertAll(user)
                            synchronize()
                            auth(true)
                        } else {
                            auth(false)
                        }
                    }
                }
            )
    }

    override fun saveActivity(activity: Activity, afterOp: (Boolean) -> Unit) {
        val user = activity.user
        //extract gpx
        val gpx = RequestBody.create(MediaType.parse("application/xml"), activity.gpx);
        val newActivity = NewActivity(
            activity.start, activity.end, activity.type, activity.length
        )
        val afterActivity : (Int) -> Unit = { id ->
            // try to add track gpx to activity in server
            service.addActivityGPX(id, gpx).enqueue(
                object : Cb<Unit>() {
                    override fun onResponse(
                        call: Call<Unit>,
                        response: Response<Unit>
                    ) {
                        when (response.code()) {
                            400 -> {
                                // bad gpx probably
                                simpleDialog(cx, "Bad Request")
                                afterOp(false)
                            }
                            404
                            -> {
                                // inconsistent state in the server
                                simpleDialog(
                                    cx,
                                    "Activity Not Found"
                                )
                                afterOp(false)
                            }
                            200 , 204 -> {
                                afterOp(true)
                            }
                            else -> {
                                simpleDialog(cx, "Unknown error.")
                                afterOp(false)
                            }
                        }
                    }
                }
            )
        }
        val addActivity : ()-> Unit = {
            //try to add activity
            service.addActivity(newActivity).enqueue(
                object : Cb<ActivityId>() {
                    override fun onResponse(call: Call<ActivityId>, response: Response<ActivityId>) {
                        when (response.code()) {
                            400 -> {
                                // failed to add activity, bad info
                                simpleDialog(cx, "Bad Request")
                                afterOp(false)
                            }
                            201 -> {
                                // managed to create activity
                                response.body()?.let {
                                    afterActivity(it.id);
                                }

                            }
                        }
                    }
                }
            )
        }
        //refresh cookie based on user info
        service.checkLogin(user).enqueue(
            object : Cb<LoginResponse>() {
                override fun onResponse(call: Call<LoginResponse>, response: Response<LoginResponse>) {
                    if (response.code() != 200) {
                        simpleDialog(cx, "Error refreshing cookie")
                    }
                    addActivity();

                }
            }
        )
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