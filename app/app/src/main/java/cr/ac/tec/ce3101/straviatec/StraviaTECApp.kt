package cr.ac.tec.ce3101.straviatec

import android.app.Application
import android.content.IntentSender
import android.location.Location
import com.google.android.gms.common.api.ResolvableApiException
import com.google.android.gms.location.*
import com.google.android.gms.tasks.Task

/**
 * Singleton that contains the global state of the application
 */
class StraviaTECApp : Application(){
    var session: Session? = null
    var mCurrentLocation: Location? = null

    fun configLocations(){

    }
}