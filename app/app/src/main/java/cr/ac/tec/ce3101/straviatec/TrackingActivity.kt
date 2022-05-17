package cr.ac.tec.ce3101.straviatec

import android.annotation.SuppressLint
import android.content.IntentSender
import android.graphics.Color
import android.location.Location
import androidx.appcompat.app.AppCompatActivity
import android.os.Bundle
import android.os.Looper
import android.os.SystemClock
import android.util.Log
import android.view.View
import android.widget.Button
import android.widget.Chronometer
import android.widget.TextView
import com.google.android.gms.common.api.ResolvableApiException
import com.google.android.gms.location.*
import com.google.android.gms.maps.CameraUpdateFactory
import com.google.android.gms.maps.GoogleMap
import com.google.android.gms.maps.MapView
import com.google.android.gms.maps.OnMapReadyCallback
import com.google.android.gms.maps.model.LatLng
import com.google.android.gms.maps.model.Polyline
import com.google.android.gms.maps.model.PolylineOptions
import com.google.android.gms.tasks.Task
import cr.ac.tec.ce3101.tecair.simpleDialog
import java.text.SimpleDateFormat
import java.time.Instant
import java.time.format.DateTimeFormatter
import java.util.*

class TrackingActivity : AppCompatActivity(), OnMapReadyCallback {
    private lateinit var mMap: GoogleMap
    private lateinit var mapView: MapView
    private lateinit var locationCallback: LocationCallback
    private lateinit var fusedLocationProviderClient: FusedLocationProviderClient
    private lateinit var locationRequest: LocationRequest

    private lateinit var route: Polyline
    private lateinit var chronometer: Chronometer
    private lateinit var stopBtn: Button
    private lateinit var startBtn: Button
    private lateinit var distanceText: TextView
    private lateinit var speedText: TextView
    private var distance = 0F
    private var startTime = 0L
    private lateinit var lastLocation: Location
    private var locations: MutableList<Location> = mutableListOf()

    fun locationsToPoints(locations: List<Location>): List<LatLng> {
        var list = mutableListOf<LatLng>()
        locations.forEach { location ->
            list.add(LatLng(location.latitude, location.longitude))
        }
        return list
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_tracking)

        chronometer = findViewById(R.id.timeCounter)
        stopBtn = findViewById(R.id.stopBtn)
        startBtn = findViewById(R.id.startBtn)
        distanceText = findViewById(R.id.distanceText)
        speedText = findViewById(R.id.speedText)


        mapView = findViewById(R.id.mapx)
        mapView.onCreate(savedInstanceState)

        mapView.getMapAsync(this)

        fusedLocationProviderClient = LocationServices.getFusedLocationProviderClient(this)
        locationRequest = LocationRequest.create().apply {
            interval = 1
            priority = LocationRequest.PRIORITY_HIGH_ACCURACY
        }

        var builder = LocationSettingsRequest.Builder()
            .addLocationRequest(locationRequest)


        val client: SettingsClient = LocationServices.getSettingsClient(this)
        val task: Task<LocationSettingsResponse> = client.checkLocationSettings(builder.build())

        locationCallback = object : LocationCallback() {
            override fun onLocationResult(locationResult: LocationResult) {
                for (location in locationResult.locations) {

                    if (this@TrackingActivity::lastLocation.isInitialized) {
                        distance += lastLocation.distanceTo(location)  //m
                        distanceText.text = String.format("%.2f Km", distance / 1000)
                        val elapsedTime = SystemClock.elapsedRealtime() //ms
                        val speed = distance * 360 / (elapsedTime - startTime)
                        speedText.text = String.format("%.2f Km/h", speed)
                    }
                    if (this@TrackingActivity::mMap.isInitialized) {
                        var newPoint = LatLng(location.latitude, location.longitude)
                        locations.add(location)
                        route.points = locationsToPoints(locations)
                        mMap.moveCamera(CameraUpdateFactory.newLatLngZoom(newPoint, 20f))
                    }

                    lastLocation = location
                }
            }
        }

        task.addOnSuccessListener { locationSettingsResponse ->
            startLocationRequests()
        }
        task.addOnFailureListener { exception ->
            if (exception is ResolvableApiException) {
                // Location settings are not satisfied, but this can be fixed
                // by showing the user a dialog.
                try {
                    // Show the dialog by calling startResolutionForResult(),
                    // and check the result in onActivityResult().
                    val REQUEST_CHECK_SETTINGS = 1
                    exception.startResolutionForResult(
                        this@TrackingActivity,
                        REQUEST_CHECK_SETTINGS
                    )
                } catch (sendEx: IntentSender.SendIntentException) {
                    // Ignore the error.
                }
            }
        }
    }

    @SuppressLint("MissingPermission")
    fun startLocationRequests() {
        fusedLocationProviderClient.requestLocationUpdates(
            locationRequest,
            locationCallback,
            Looper.getMainLooper()
        )
    }

    fun stopLocationRequests() {
        fusedLocationProviderClient.removeLocationUpdates(locationCallback)
    }

    @SuppressLint("MissingPermission")
    override fun onMapReady(googleMap: GoogleMap) {

        mMap = googleMap
        mMap.isMyLocationEnabled = true
        mMap.uiSettings.isCompassEnabled = true
        mMap.uiSettings.isMyLocationButtonEnabled = false

        val options = PolylineOptions().color(Color.RED).zIndex(123F).width(20F)
        route = mMap.addPolyline(options)
    }

    override fun onStart() {
        super.onStart()
        mapView.onStart()

    }

    override fun onResume() {
        super.onResume()
        mapView.onResume()
        startLocationRequests()
    }

    override fun onPause() {
        super.onPause()
        mapView.onPause()
        fusedLocationProviderClient.removeLocationUpdates(locationCallback)
    }

    override fun onStop() {
        super.onStop()
        mapView.onStop()
    }

    override fun onDestroy() {
        super.onDestroy()
        mapView.onDestroy()
    }

    override fun onSaveInstanceState(outState: Bundle) {
        super.onSaveInstanceState(outState)
        mapView.onSaveInstanceState(outState)
    }

    override fun onLowMemory() {
        mapView.onLowMemory()
    }

    fun onStartClick(view: View) {
        stopBtn.isEnabled = true

        startTime = SystemClock.elapsedRealtime()
        chronometer.base = startTime
        chronometer.start()
        startBtn.isEnabled = false
    }

    fun onStopClick(view: View) {
        chronometer.stop()
        stopLocationRequests()

        val activity = Activity(
            DateTimeFormatter.ISO_INSTANT.format(Instant.now())
            ,distance, startTime - SystemClock.elapsedRealtime(),
            generateGPX("route", locations),
            (application as StraviaTECApp).session!!.getUser(),
        )

        (application as StraviaTECApp).session?.saveActivity(activity){success ->
            run {
                if (success) {
                    finish()
                } else {
                    simpleDialog(this, "Error")
                }
            }
        }
        finish()
    }

    fun generateGPX(name: String, points: List<Location>): String {
        val header = "<?xml version=\"1.0\" encoding=\"UTF-8\" standalone=\"no\" ?><gpx xmlns=\"http://www.topografix.com/GPX/1/1\" creator=\"MapSource 6.15.5\" version=\"1.1\" xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\"  xsi:schemaLocation=\"http://www.topografix.com/GPX/1/1 http://www.topografix.com/GPX/1/1/gpx.xsd\"><trk>\n";
        val name = "<name>$name</name><trkseg>\n"
        var segments = ""
        val df = SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ssZ")
        points.forEach{ location ->
            segments += "<trkpt lat=\"" + location.latitude + "\" lon=\"" + location.longitude + "\"><time>" + df.format(
                Date(location.getTime())
            ) + "</time></trkpt>\n";
        }
        val footer = "</trkseg></trk></gpx>";
        return header + name + segments + footer
    }


}