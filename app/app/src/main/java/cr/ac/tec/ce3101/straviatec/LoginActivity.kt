package cr.ac.tec.ce3101.straviatec

import android.content.Intent
import android.content.IntentSender
import android.location.Location
import androidx.appcompat.app.AppCompatActivity
import android.os.Bundle
import android.os.Looper
import android.util.Log
import android.view.View
import android.widget.EditText
import android.widget.Switch
import android.widget.TextView
import com.google.android.gms.common.api.CommonStatusCodes
import com.google.android.gms.common.api.ResolvableApiException
import com.google.android.gms.location.*
import com.google.android.gms.tasks.Task

class LoginActivity : AppCompatActivity() {
    private var isOffline: Boolean = false
    private lateinit var locationCallback: LocationCallback
    private lateinit var fusedLocationProviderClient: FusedLocationProviderClient
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_login)


    }

    fun login(view: View) {
        val username = findViewById<EditText>(R.id.loginUsernameText).text.toString()
        val password = findViewById<EditText>(R.id.loginPasswordText).text.toString()
        val user = User(username, password)
        val session: Session = if (findViewById<Switch>(R.id.offlineSwitch).isChecked) {
            OfflineSession(
                user, this
            )
        } else {
            OnlineSession(
                findViewById<EditText>(R.id.serverSettingsText).text.toString(),
                user,
                this
            )
        }
        session.login { success ->
            run {
                if (success) {
                    (application as StraviaTECApp).session = session
                    //val intent = Intent(this, MainMenuActivity::class.java)
                    val intent = Intent(this, TrackingActivity::class.java)
                    startActivity(intent)
                } else {
                    findViewById<TextView>(R.id.credentialsErrorText).visibility = View.VISIBLE
                }
            }
        }


    }

    /**
     * Make visible the textbox that contains the server address in order to edit it
     */
    fun showServerSettings(view: View) {
        val serverSettings = findViewById<EditText>(R.id.serverSettingsText)
        if (serverSettings.visibility == View.VISIBLE) {
            serverSettings.visibility = View.INVISIBLE
        } else {
            serverSettings.visibility = View.VISIBLE
        }
    }

    /**
     * React to changes in the offlineSwitch widget
     */
    fun offlineCheck(view: View) {
        isOffline = findViewById<Switch>(R.id.offlineSwitch).isChecked
    }

    fun noLoginSync(view: View) {
        OnlineSession(
            findViewById<EditText>(R.id.serverSettingsText).text.toString(),
            User("Empty ", ""),
            this
        ).synchronize()
    }
}