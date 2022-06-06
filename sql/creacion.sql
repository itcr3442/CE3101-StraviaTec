CREATE XML SCHEMA COLLECTION gpx
AS
N'<?xml version="1.0" encoding="UTF-16"?>
<xsd:schema xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns="http://www.topografix.com/GPX/1/1" targetNamespace="http://www.topografix.com/GPX/1/1" elementFormDefault="qualified">

<xsd:annotation>
 <xsd:documentation>
  GPX schema version 1.1 - For more information on GPX and this schema, visit http://www.topografix.com/gpx.asp

  GPX uses the following conventions: all coordinates are relative to the WGS84 datum.  All measurements are in metric units.
 </xsd:documentation>
</xsd:annotation>

  <xsd:element name="gpx" type="gpxType">
    <xsd:annotation>
      <xsd:documentation>
        GPX is the root element in the XML file.
      </xsd:documentation>
    </xsd:annotation>
  </xsd:element>

  <xsd:complexType name="gpxType">
    <xsd:annotation>
      <xsd:documentation>
        GPX documents contain a metadata header, followed by waypoints, routes, and tracks.  You can add your own elements
        to the extensions section of the GPX document.
      </xsd:documentation>
    </xsd:annotation>
    <xsd:sequence>
     <xsd:element name="metadata" type="metadataType" minOccurs="0">
      <xsd:annotation>
       <xsd:documentation>
        Metadata about the file.
       </xsd:documentation>
      </xsd:annotation>
     </xsd:element>
     <xsd:element name="wpt" type="wptType" minOccurs="0" maxOccurs="unbounded">
      <xsd:annotation>
       <xsd:documentation>
        A list of waypoints.
       </xsd:documentation>
      </xsd:annotation>
     </xsd:element>
     <xsd:element name="rte" type="rteType" minOccurs="0" maxOccurs="unbounded">
      <xsd:annotation>
       <xsd:documentation>
        A list of routes.
       </xsd:documentation>
      </xsd:annotation>
     </xsd:element>
     <xsd:element name="trk" type="trkType" minOccurs="0" maxOccurs="unbounded">
      <xsd:annotation>
       <xsd:documentation>
        A list of tracks.
       </xsd:documentation>
      </xsd:annotation>
     </xsd:element>
     <xsd:element name="extensions" type="extensionsType" minOccurs="0">
      <xsd:annotation>
       <xsd:documentation>
        You can add extend GPX by adding your own elements from another schema here.
       </xsd:documentation>
      </xsd:annotation>
     </xsd:element>
    </xsd:sequence>

    <xsd:attribute name="version" type="xsd:string" use="required" fixed="1.1">
     <xsd:annotation>
      <xsd:documentation>
        You must include the version number in your GPX document.
      </xsd:documentation>
     </xsd:annotation>
    </xsd:attribute>
    <xsd:attribute name="creator" type="xsd:string" use="required">
     <xsd:annotation>
      <xsd:documentation>
        You must include the name or URL of the software that created your GPX document.  This allows others to
        inform the creator of a GPX instance document that fails to validate.
      </xsd:documentation>
     </xsd:annotation>
    </xsd:attribute>
  </xsd:complexType>

  <xsd:complexType name="metadataType">
    <xsd:annotation>
      <xsd:documentation>
        Information about the GPX file, author, and copyright restrictions goes in the metadata section.  Providing rich,
        meaningful information about your GPX files allows others to search for and use your GPS data.
      </xsd:documentation>
    </xsd:annotation>
    <xsd:sequence>    <!-- elements must appear in this order -->
     <xsd:element name="name" type="xsd:string" minOccurs="0">
      <xsd:annotation>
       <xsd:documentation>
        The name of the GPX file.
       </xsd:documentation>
      </xsd:annotation>
     </xsd:element>
     <xsd:element name="desc" type="xsd:string" minOccurs="0">
      <xsd:annotation>
       <xsd:documentation>
        A description of the contents of the GPX file.
       </xsd:documentation>
      </xsd:annotation>
     </xsd:element>
     <xsd:element name="author" type="personType" minOccurs="0">
      <xsd:annotation>
       <xsd:documentation>
        The person or organization who created the GPX file.
       </xsd:documentation>
      </xsd:annotation>
     </xsd:element>
     <xsd:element name="copyright" type="copyrightType" minOccurs="0">
      <xsd:annotation>
       <xsd:documentation>
        Copyright and license information governing use of the file.
       </xsd:documentation>
      </xsd:annotation>
     </xsd:element>
     <xsd:element name="link" type="linkType" minOccurs="0" maxOccurs="unbounded">
      <xsd:annotation>
       <xsd:documentation>
        URLs associated with the location described in the file.
       </xsd:documentation>
      </xsd:annotation>
     </xsd:element>
     <xsd:element name="time" type="xsd:dateTime" minOccurs="0">
      <xsd:annotation>
       <xsd:documentation>
        The creation date of the file.
       </xsd:documentation>
      </xsd:annotation>
     </xsd:element>
     <xsd:element name="keywords" type="xsd:string" minOccurs="0">
      <xsd:annotation>
       <xsd:documentation>
        Keywords associated with the file.  Search engines or databases can use this information to classify the data.
       </xsd:documentation>
      </xsd:annotation>
     </xsd:element>
     <xsd:element name="bounds" type="boundsType" minOccurs="0">
      <xsd:annotation>
       <xsd:documentation>
        Minimum and maximum coordinates which describe the extent of the coordinates in the file.
       </xsd:documentation>
      </xsd:annotation>
     </xsd:element>

     <xsd:element name="extensions" type="extensionsType" minOccurs="0">
      <xsd:annotation>
       <xsd:documentation>
        You can add extend GPX by adding your own elements from another schema here.
       </xsd:documentation>
      </xsd:annotation>
     </xsd:element>
    </xsd:sequence>
  </xsd:complexType>

  <xsd:complexType name="wptType">
    <xsd:annotation>
      <xsd:documentation>
        wpt represents a waypoint, point of interest, or named feature on a map.
      </xsd:documentation>
    </xsd:annotation>
    <xsd:sequence>    <!-- elements must appear in this order -->
      <!-- Position info -->
      <xsd:element name="ele" type="xsd:decimal" minOccurs="0">
        <xsd:annotation>
          <xsd:documentation>
            Elevation (in meters) of the point.
          </xsd:documentation>
        </xsd:annotation>
      </xsd:element>
      <xsd:element name="time" type="xsd:dateTime" minOccurs="0">
        <xsd:annotation>
          <xsd:documentation>
            Creation/modification timestamp for element. Date and time in are in Univeral Coordinated Time (UTC), not local time! Conforms to ISO 8601 specification for date/time representation. Fractional seconds are allowed for millisecond timing in tracklogs. 
          </xsd:documentation>
        </xsd:annotation>
      </xsd:element>
      <xsd:element name="magvar" type="degreesType" minOccurs="0">
        <xsd:annotation>
          <xsd:documentation>
            Magnetic variation (in degrees) at the point
          </xsd:documentation>
        </xsd:annotation>
      </xsd:element>
      <xsd:element name="geoidheight" type="xsd:decimal" minOccurs="0">
        <xsd:annotation>
          <xsd:documentation>
            Height (in meters) of geoid (mean sea level) above WGS84 earth ellipsoid.  As defined in NMEA GGA message.
          </xsd:documentation>
        </xsd:annotation>
      </xsd:element>

      <!-- Description info -->
      <xsd:element name="name" type="xsd:string" minOccurs="0">
        <xsd:annotation>
          <xsd:documentation>
            The GPS name of the waypoint. This field will be transferred to and from the GPS. GPX does not place restrictions on the length of this field or the characters contained in it. It is up to the receiving application to validate the field before sending it to the GPS.
          </xsd:documentation>
        </xsd:annotation>
      </xsd:element>
      <xsd:element name="cmt" type="xsd:string" minOccurs="0">
        <xsd:annotation>
          <xsd:documentation>
            GPS waypoint comment. Sent to GPS as comment. 
          </xsd:documentation>
        </xsd:annotation>
      </xsd:element>
      <xsd:element name="desc" type="xsd:string" minOccurs="0">
        <xsd:annotation>
          <xsd:documentation>
            A text description of the element. Holds additional information about the element intended for the user, not the GPS.
          </xsd:documentation>
        </xsd:annotation>
      </xsd:element>
      <xsd:element name="src" type="xsd:string" minOccurs="0">
        <xsd:annotation>
          <xsd:documentation>
            Source of data. Included to give user some idea of reliability and accuracy of data.  "Garmin eTrex", "USGS quad Boston North", e.g.
          </xsd:documentation>
        </xsd:annotation>
      </xsd:element>
      <xsd:element name="link" type="linkType" minOccurs="0" maxOccurs="unbounded">
        <xsd:annotation>
          <xsd:documentation>
            Link to additional information about the waypoint.
          </xsd:documentation>
        </xsd:annotation>
      </xsd:element>
      <xsd:element name="sym" type="xsd:string" minOccurs="0">
        <xsd:annotation>
          <xsd:documentation>
            Text of GPS symbol name. For interchange with other programs, use the exact spelling of the symbol as displayed on the GPS.  If the GPS abbreviates words, spell them out.
          </xsd:documentation>
        </xsd:annotation>
      </xsd:element>
      <xsd:element name="type" type="xsd:string" minOccurs="0">
        <xsd:annotation>
          <xsd:documentation>
            Type (classification) of the waypoint.
          </xsd:documentation>
        </xsd:annotation>
      </xsd:element>

      <!-- Accuracy info -->
      <xsd:element name="fix" type="fixType" minOccurs="0">
        <xsd:annotation>
          <xsd:documentation>
            Type of GPX fix.
          </xsd:documentation>
        </xsd:annotation>
      </xsd:element>
      <xsd:element name="sat" type="xsd:nonNegativeInteger" minOccurs="0">
        <xsd:annotation>
          <xsd:documentation>
            Number of satellites used to calculate the GPX fix.
          </xsd:documentation>
        </xsd:annotation>
      </xsd:element>
      <xsd:element name="hdop" type="xsd:decimal" minOccurs="0">
        <xsd:annotation>
          <xsd:documentation>
            Horizontal dilution of precision.
          </xsd:documentation>
        </xsd:annotation>
      </xsd:element>
      <xsd:element name="vdop" type="xsd:decimal" minOccurs="0">
        <xsd:annotation>
          <xsd:documentation>
            Vertical dilution of precision.
          </xsd:documentation>
        </xsd:annotation>
      </xsd:element>
      <xsd:element name="pdop" type="xsd:decimal" minOccurs="0">
        <xsd:annotation>
          <xsd:documentation>
            Position dilution of precision.
          </xsd:documentation>
        </xsd:annotation>
      </xsd:element>
      <xsd:element name="ageofdgpsdata" type="xsd:decimal" minOccurs="0">
        <xsd:annotation>
          <xsd:documentation>
            Number of seconds since last DGPS update.
          </xsd:documentation>
        </xsd:annotation>
      </xsd:element>
      <xsd:element name="dgpsid" type="dgpsStationType" minOccurs="0">
        <xsd:annotation>
          <xsd:documentation>
            ID of DGPS station used in differential correction.
          </xsd:documentation>
        </xsd:annotation>
      </xsd:element>

     <xsd:element name="extensions" type="extensionsType" minOccurs="0">
      <xsd:annotation>
       <xsd:documentation>
        You can add extend GPX by adding your own elements from another schema here.
       </xsd:documentation>
      </xsd:annotation>
     </xsd:element>
    </xsd:sequence>

    <xsd:attribute name="lat" type="latitudeType" use="required">
     <xsd:annotation>
      <xsd:documentation>
        The latitude of the point.  This is always in decimal degrees, and always in WGS84 datum.
      </xsd:documentation>
     </xsd:annotation>
    </xsd:attribute>
    <xsd:attribute name="lon" type="longitudeType" use="required">
     <xsd:annotation>
      <xsd:documentation>
      The longitude of the point.  This is always in decimal degrees, and always in WGS84 datum.
    </xsd:documentation>
     </xsd:annotation>
    </xsd:attribute>
  </xsd:complexType>

  <xsd:complexType name="rteType">
    <xsd:annotation>
      <xsd:documentation>
        rte represents route - an ordered list of waypoints representing a series of turn points leading to a destination.
      </xsd:documentation>
    </xsd:annotation>
    <xsd:sequence>
      <xsd:element name="name" type="xsd:string" minOccurs="0">
        <xsd:annotation>
          <xsd:documentation>
            GPS name of route.
          </xsd:documentation>
        </xsd:annotation>
      </xsd:element>
      <xsd:element name="cmt" type="xsd:string" minOccurs="0">
        <xsd:annotation>
          <xsd:documentation>
            GPS comment for route.
          </xsd:documentation>
        </xsd:annotation>
      </xsd:element>
      <xsd:element name="desc" type="xsd:string" minOccurs="0">
        <xsd:annotation>
          <xsd:documentation>
            Text description of route for user.  Not sent to GPS.
          </xsd:documentation>
        </xsd:annotation>
      </xsd:element>
      <xsd:element name="src" type="xsd:string" minOccurs="0">
        <xsd:annotation>
          <xsd:documentation>
            Source of data. Included to give user some idea of reliability and accuracy of data.
          </xsd:documentation>
        </xsd:annotation>
      </xsd:element>
      <xsd:element name="link" type="linkType" minOccurs="0" maxOccurs="unbounded">
        <xsd:annotation>
          <xsd:documentation>
            Links to external information about the route.
          </xsd:documentation>
        </xsd:annotation>
      </xsd:element>
      <xsd:element name="number" type="xsd:nonNegativeInteger" minOccurs="0">
        <xsd:annotation>
          <xsd:documentation>
            GPS route number.
          </xsd:documentation>
        </xsd:annotation>
      </xsd:element>
      <xsd:element name="type" type="xsd:string" minOccurs="0">
        <xsd:annotation>
          <xsd:documentation>
            Type (classification) of route.
          </xsd:documentation>
        </xsd:annotation>
      </xsd:element>

     <xsd:element name="extensions" type="extensionsType" minOccurs="0">
      <xsd:annotation>
       <xsd:documentation>
        You can add extend GPX by adding your own elements from another schema here.
       </xsd:documentation>
      </xsd:annotation>
     </xsd:element>
 
      <xsd:element name="rtept" type="wptType" minOccurs="0" maxOccurs="unbounded">
      <xsd:annotation>
       <xsd:documentation>
        A list of route points.
       </xsd:documentation>
      </xsd:annotation>
     </xsd:element>
    </xsd:sequence>
  </xsd:complexType>

  <xsd:complexType name="trkType">
    <xsd:annotation>
      <xsd:documentation>
        trk represents a track - an ordered list of points describing a path.
      </xsd:documentation>
    </xsd:annotation>
    <xsd:sequence>
      <xsd:element name="name" type="xsd:string" minOccurs="0">
        <xsd:annotation>
          <xsd:documentation>
            GPS name of track.
          </xsd:documentation>
        </xsd:annotation>
      </xsd:element>
      <xsd:element name="cmt" type="xsd:string" minOccurs="0">
        <xsd:annotation>
          <xsd:documentation>
            GPS comment for track.
          </xsd:documentation>
        </xsd:annotation>
      </xsd:element>
      <xsd:element name="desc" type="xsd:string" minOccurs="0">
        <xsd:annotation>
          <xsd:documentation>
            User description of track.
          </xsd:documentation>
        </xsd:annotation>
      </xsd:element>
      <xsd:element name="src" type="xsd:string" minOccurs="0">
        <xsd:annotation>
          <xsd:documentation>
            Source of data. Included to give user some idea of reliability and accuracy of data.
          </xsd:documentation>
        </xsd:annotation>
      </xsd:element>
      <xsd:element name="link" type="linkType" minOccurs="0" maxOccurs="unbounded">
        <xsd:annotation>
          <xsd:documentation>
            Links to external information about track.
          </xsd:documentation>
        </xsd:annotation>
      </xsd:element>
      <xsd:element name="number" type="xsd:nonNegativeInteger" minOccurs="0">
        <xsd:annotation>
          <xsd:documentation>
            GPS track number.
          </xsd:documentation>
        </xsd:annotation>
      </xsd:element>
      <xsd:element name="type" type="xsd:string" minOccurs="0">
        <xsd:annotation>
          <xsd:documentation>
            Type (classification) of track.
          </xsd:documentation>
        </xsd:annotation>
      </xsd:element>

     <xsd:element name="extensions" type="extensionsType" minOccurs="0">
      <xsd:annotation>
       <xsd:documentation>
        You can add extend GPX by adding your own elements from another schema here.
       </xsd:documentation>
      </xsd:annotation>
     </xsd:element>
  
     <xsd:element name="trkseg" type="trksegType" minOccurs="0" maxOccurs="unbounded">
      <xsd:annotation>
       <xsd:documentation>
        A Track Segment holds a list of Track Points which are logically connected in order. To represent a single GPS track where GPS reception was lost, or the GPS receiver was turned off, start a new Track Segment for each continuous span of track data.
       </xsd:documentation>
      </xsd:annotation>
     </xsd:element>
    </xsd:sequence>
  </xsd:complexType>
 
  <xsd:complexType name="extensionsType">
   <xsd:annotation>
    <xsd:documentation>
     You can add extend GPX by adding your own elements from another schema here.
    </xsd:documentation>
   </xsd:annotation>
    <xsd:sequence>
     <xsd:any namespace="##other" processContents="lax" minOccurs="0" maxOccurs="unbounded">
       <xsd:annotation>
        <xsd:documentation>
         You can add extend GPX by adding your own elements from another schema here.
        </xsd:documentation>
       </xsd:annotation>
     </xsd:any>
    </xsd:sequence>
  </xsd:complexType>

  <xsd:complexType name="trksegType">
   <xsd:annotation>
    <xsd:documentation>
      A Track Segment holds a list of Track Points which are logically connected in order. To represent a single GPS track where GPS reception was lost, or the GPS receiver was turned off, start a new Track Segment for each continuous span of track data.
    </xsd:documentation>
   </xsd:annotation>
   <xsd:sequence>    <!-- elements must appear in this order -->
     <xsd:element name="trkpt" type="wptType" minOccurs="0" maxOccurs="unbounded">
      <xsd:annotation>
       <xsd:documentation>
        A Track Point holds the coordinates, elevation, timestamp, and metadata for a single point in a track.
       </xsd:documentation>
      </xsd:annotation>
     </xsd:element>

     <xsd:element name="extensions" type="extensionsType" minOccurs="0">
      <xsd:annotation>
       <xsd:documentation>
        You can add extend GPX by adding your own elements from another schema here.
       </xsd:documentation>
      </xsd:annotation>
     </xsd:element>
    </xsd:sequence>
  </xsd:complexType>

  <xsd:complexType name="copyrightType">
   <xsd:annotation>
    <xsd:documentation>
     Information about the copyright holder and any license governing use of this file.  By linking to an appropriate license,
     you may place your data into the public domain or grant additional usage rights.
    </xsd:documentation>
   </xsd:annotation>
   <xsd:sequence>    <!-- elements must appear in this order -->
    <xsd:element name="year" type="xsd:gYear" minOccurs="0">
     <xsd:annotation>
      <xsd:documentation>
        Year of copyright.
      </xsd:documentation>
     </xsd:annotation>
    </xsd:element>
    <xsd:element name="license" type="xsd:anyURI" minOccurs="0">
     <xsd:annotation>
      <xsd:documentation>
        Link to external file containing license text.
      </xsd:documentation>
     </xsd:annotation>
    </xsd:element>
   </xsd:sequence>
   <xsd:attribute name="author" type="xsd:string" use="required">
     <xsd:annotation>
      <xsd:documentation>
        Copyright holder (TopoSoft, Inc.)
      </xsd:documentation>
     </xsd:annotation>
    </xsd:attribute>
  </xsd:complexType>

  <xsd:complexType name="linkType">
   <xsd:annotation>
    <xsd:documentation>
     A link to an external resource (Web page, digital photo, video clip, etc) with additional information.
    </xsd:documentation>
   </xsd:annotation>
   <xsd:sequence>    <!-- elements must appear in this order -->
    <xsd:element name="text" type="xsd:string" minOccurs="0">
     <xsd:annotation>
      <xsd:documentation>
        Text of hyperlink.
      </xsd:documentation>
     </xsd:annotation>
    </xsd:element>
    <xsd:element name="type" type="xsd:string" minOccurs="0">
     <xsd:annotation>
      <xsd:documentation>
        Mime type of content (image/jpeg)
      </xsd:documentation>
     </xsd:annotation>
    </xsd:element>
   </xsd:sequence>
   <xsd:attribute name="href" type="xsd:anyURI" use="required">
     <xsd:annotation>
      <xsd:documentation>
        URL of hyperlink.
      </xsd:documentation>
     </xsd:annotation>
    </xsd:attribute>
  </xsd:complexType>

  <xsd:complexType name="emailType">
   <xsd:annotation>
    <xsd:documentation>
     An email address.  Broken into two parts (id and domain) to help prevent email harvesting.
    </xsd:documentation>
   </xsd:annotation>
   <xsd:attribute name="id" type="xsd:string" use="required">
     <xsd:annotation>
      <xsd:documentation>
        id half of email address (billgates2004)
      </xsd:documentation>
     </xsd:annotation>
    </xsd:attribute>
   <xsd:attribute name="domain" type="xsd:string" use="required">
     <xsd:annotation>
      <xsd:documentation>
        domain half of email address (hotmail.com)
      </xsd:documentation>
     </xsd:annotation>
    </xsd:attribute>
  </xsd:complexType>

  <xsd:complexType name="personType">
   <xsd:annotation>
    <xsd:documentation>
     A person or organization.
    </xsd:documentation>
   </xsd:annotation>
    <xsd:sequence>    <!-- elements must appear in this order -->
      <xsd:element name="name" type="xsd:string" minOccurs="0">
     <xsd:annotation>
      <xsd:documentation>
        Name of person or organization.
      </xsd:documentation>
     </xsd:annotation>
    </xsd:element>
      <xsd:element name="email" type="emailType" minOccurs="0">
     <xsd:annotation>
      <xsd:documentation>
        Email address.
      </xsd:documentation>
     </xsd:annotation>
    </xsd:element>
      <xsd:element name="link" type="linkType" minOccurs="0">
     <xsd:annotation>
      <xsd:documentation>
        Link to Web site or other external information about person.
      </xsd:documentation>
     </xsd:annotation>
    </xsd:element>
    </xsd:sequence>
  </xsd:complexType>

  <xsd:complexType name="ptType">
   <xsd:annotation>
    <xsd:documentation>
     A geographic point with optional elevation and time.  Available for use by other schemas.
    </xsd:documentation>
   </xsd:annotation>
   <xsd:sequence>    <!-- elements must appear in this order -->
    <xsd:element name="ele" type="xsd:decimal" minOccurs="0">
     <xsd:annotation>
      <xsd:documentation>
        The elevation (in meters) of the point.
      </xsd:documentation>
     </xsd:annotation>
    </xsd:element>
    <xsd:element name="time" type="xsd:dateTime" minOccurs="0">
     <xsd:annotation>
      <xsd:documentation>
        The time that the point was recorded.
      </xsd:documentation>
     </xsd:annotation>
    </xsd:element>
   </xsd:sequence>
    <xsd:attribute name="lat" type="latitudeType" use="required">
     <xsd:annotation>
      <xsd:documentation>
        The latitude of the point.  Decimal degrees, WGS84 datum.
      </xsd:documentation>
     </xsd:annotation>
    </xsd:attribute>
    <xsd:attribute name="lon" type="longitudeType" use="required">
     <xsd:annotation>
      <xsd:documentation>
        The latitude of the point.  Decimal degrees, WGS84 datum.
      </xsd:documentation>
     </xsd:annotation>
    </xsd:attribute>
  </xsd:complexType>

  <xsd:complexType name="ptsegType">
   <xsd:annotation>
    <xsd:documentation>
     An ordered sequence of points.  (for polygons or polylines, e.g.)
    </xsd:documentation>
   </xsd:annotation>
   <xsd:sequence>    <!-- elements must appear in this order -->
     <xsd:element name="pt" type="ptType" minOccurs="0" maxOccurs="unbounded">
       <xsd:annotation>
        <xsd:documentation>
         Ordered list of geographic points.
        </xsd:documentation>
       </xsd:annotation>
     </xsd:element>
   </xsd:sequence>
  </xsd:complexType>

  <xsd:complexType name="boundsType">
   <xsd:annotation>
    <xsd:documentation>
     Two lat/lon pairs defining the extent of an element.
    </xsd:documentation>
   </xsd:annotation>
    <xsd:attribute name="minlat" type="latitudeType" use="required">
     <xsd:annotation>
      <xsd:documentation>
        The minimum latitude.
      </xsd:documentation>
     </xsd:annotation>
    </xsd:attribute>
    <xsd:attribute name="minlon" type="longitudeType" use="required">
     <xsd:annotation>
      <xsd:documentation>
        The minimum longitude.
      </xsd:documentation>
     </xsd:annotation>
    </xsd:attribute>
    <xsd:attribute name="maxlat" type="latitudeType" use="required">
     <xsd:annotation>
      <xsd:documentation>
        The maximum latitude.
      </xsd:documentation>
     </xsd:annotation>
    </xsd:attribute>
    <xsd:attribute name="maxlon" type="longitudeType" use="required">
     <xsd:annotation>
      <xsd:documentation>
        The maximum longitude.
      </xsd:documentation>
     </xsd:annotation>
    </xsd:attribute>
  </xsd:complexType>


  <xsd:simpleType name="latitudeType">
     <xsd:annotation>
      <xsd:documentation>
        The latitude of the point.  Decimal degrees, WGS84 datum.
      </xsd:documentation>
     </xsd:annotation>
    <xsd:restriction base="xsd:decimal">
      <xsd:minInclusive value="-90.0"/>
      <xsd:maxInclusive value="90.0"/>
    </xsd:restriction>
  </xsd:simpleType>

  <xsd:simpleType name="longitudeType">
     <xsd:annotation>
      <xsd:documentation>
        The longitude of the point.  Decimal degrees, WGS84 datum.
      </xsd:documentation>
     </xsd:annotation>
    <xsd:restriction base="xsd:decimal">
      <xsd:minInclusive value="-180.0"/>
      <xsd:maxExclusive value="180.0"/>
    </xsd:restriction>
  </xsd:simpleType>

  <xsd:simpleType name="degreesType">
     <xsd:annotation>
      <xsd:documentation>
        Used for bearing, heading, course.  Units are decimal degrees, true (not magnetic).
      </xsd:documentation>
     </xsd:annotation>
    <xsd:restriction base="xsd:decimal">
      <xsd:minInclusive value="0.0"/>
      <xsd:maxExclusive value="360.0"/>
    </xsd:restriction>
  </xsd:simpleType>

  <xsd:simpleType name="fixType">
     <xsd:annotation>
      <xsd:documentation>
        Type of GPS fix.  none means GPS had no fix.  To signify "the fix info is unknown, leave out fixType entirely. pps = military signal used
      </xsd:documentation>
     </xsd:annotation>
    <xsd:restriction base="xsd:string">
      <xsd:enumeration value="none"/>
      <xsd:enumeration value="2d"/>
      <xsd:enumeration value="3d"/>
      <xsd:enumeration value="dgps"/>
      <xsd:enumeration value="pps"/>
    </xsd:restriction>
  </xsd:simpleType>

  <xsd:simpleType name="dgpsStationType">
   <xsd:annotation>
    <xsd:documentation>
     Represents a differential GPS station.
    </xsd:documentation>
   </xsd:annotation>
    <xsd:restriction base="xsd:integer">
      <xsd:minInclusive value="0"/>
      <xsd:maxInclusive value="1023"/>
    </xsd:restriction>
  </xsd:simpleType>

</xsd:schema>';

GO

-- Tomado de <https://gist.github.com/abroadbent/6233480>
CREATE TABLE countries
(
  -- ISO 3166-1 alfa-2
  iso        char(2)     NOT NULL PRIMARY KEY,
  name       varchar(80) NOT NULL,
  iso3       char(3)         NULL,
  num_code   int             NULL,
  phone_code int         NOT NULL,
) 

CREATE TABLE users
(
  id           int         NOT NULL IDENTITY PRIMARY KEY,
  username     varchar(64) NOT NULL UNIQUE,
  first_name   varchar(64) NOT NULL,
  last_name    varchar(64) NOT NULL,
  birth_date   DATE        NOT NULL,
  country      char(2)     NOT NULL REFERENCES countries(iso),
  is_organizer bit         NOT NULL,
  hash         binary(16)  NOT NULL,
  salt         binary(16)  NOT NULL,

  CHECK(LEN(username) > 0 AND username NOT LIKE '%[^a-z]%'),
  CHECK(LEN(first_name) > 0 AND LEN(last_name) > 0),
);

CREATE TABLE photos
(
  user_id int            NOT NULL REFERENCES users(id),
  photo   varbinary(max) NOT NULL, -- El parámetro es max o < 8000
);

CREATE TABLE friends
(
  follower int NOT NULL REFERENCES users(id),
  followee int NOT NULL REFERENCES users(id),

  PRIMARY KEY(follower, followee),
  CHECK(follower <> followee),
);

CREATE INDEX idx_friends_follower ON friends(follower);
CREATE INDEX idx_friends_followee ON friends(followee);

CREATE TABLE activity_types
(
  id   int         NOT NULL IDENTITY PRIMARY KEY,
  name varchar(32) NOT NULL UNIQUE,
);

CREATE TABLE activities
(
  id         int            NOT NULL IDENTITY PRIMARY KEY,
  athlete    int            NOT NULL REFERENCES users(id),
  start_time datetime       NOT NULL,
  end_time   datetime       NOT NULL,
  type       int            NOT NULL REFERENCES activity_types(id),
  length     decimal(18, 9) NOT NULL,

  CHECK(start_time < end_time),
);

CREATE INDEX idx_activities_athlete ON activities(athlete);

CREATE TABLE activity_tracks
(
  activity int      NOT NULL PRIMARY KEY REFERENCES activities(id),
  track    xml(gpx) NOT NULL,
);

CREATE TABLE groups
(
  id    int         NOT NULL IDENTITY PRIMARY KEY,
  name  varchar(64) NOT NULL UNIQUE,
  admin int         NOT NULL REFERENCES users(id),

  CHECK(LEN(name) > 0),
);

CREATE TABLE group_members
(
  group_id int NOT NULL REFERENCES groups(id),
  member   int NOT NULL REFERENCES users(id),
);

CREATE TABLE categories
(
  id   int         NOT NULL IDENTITY PRIMARY KEY,
  name varchar(32) NOT NULL UNIQUE,
);

CREATE TABLE sponsors
(
  id         int         NOT NULL IDENTITY PRIMARY KEY,
  brand_name varchar(64) NOT NULL UNIQUE,
  legal_rep  varchar(64) NOT NULL,
  legal_tel  varchar(32) NOT NULL,

  CHECK(LEN(brand_name) > 0),
);

CREATE TABLE sponsor_logos
(
  sponsor int            NOT NULL REFERENCES sponsors(id),
  logo    varbinary(max) NOT NULL,
);

CREATE TABLE races
(
  id      int            NOT NULL IDENTITY PRIMARY KEY,
  name    varchar(64)    NOT NULL UNIQUE,
  on_date date           NOT NULL,
  type    int            NOT NULL REFERENCES activity_types(id),
  price   decimal(18, 9) NOT NULL,

  CHECK(LEN(name) > 0),
  CHECK(price > 0),
);

CREATE TABLE race_categories
(
  race     int NOT NULL REFERENCES races(id),
  category int NOT NULL REFERENCES categories(id),

  PRIMARY KEY(race, category),
);

CREATE INDEX idx_race_categories ON race_categories(race);

CREATE TABLE race_tracks
(
  race  int      NOT NULL PRIMARY KEY REFERENCES races(id),
  track xml(gpx) NOT NULL,
);

CREATE TABLE race_private_groups
(
  race     int NOT NULL REFERENCES races(id),
  group_id int NOT NULL REFERENCES groups(id),

  PRIMARY KEY(race, group_id),
);

CREATE INDEX idx_race_private_groups ON race_private_groups(race);

CREATE TABLE race_participants
(
  race     int NOT NULL REFERENCES races(id),
  athlete  int NOT NULL REFERENCES users(id),
  category int NOT NULL REFERENCES categories(id),
  activity int     NULL REFERENCES activities(id),

  PRIMARY KEY(race, athlete),
);

CREATE INDEX idx_race_participants ON race_participants(race);

CREATE TABLE race_sponsors
(
  race    int NOT NULL REFERENCES races(id),
  sponsor int NOT NULL REFERENCES sponsors(id),

  PRIMARY KEY(race, sponsor),
);

CREATE INDEX idx_race_sponsors ON race_sponsors(race);

CREATE TABLE receipts
(
  race     int            NOT NULL REFERENCES races(id),
  athlete  int            NOT NULL REFERENCES users(id),
  category int            NOT NULL REFERENCES categories(id),
  receipt  varbinary(max)     NULL,

  PRIMARY KEY(race, athlete),
);

CREATE TABLE bank_accounts
(
  race int         NOT NULL REFERENCES races(id),
  iban varchar(34) NOT NULL, -- ISO 13616

  PRIMARY KEY(race, iban),
);

CREATE INDEX idx_bank_accounts_race ON bank_accounts(race);

CREATE TABLE challenges
(
  id         int            NOT NULL IDENTITY PRIMARY KEY,
  name       varchar(64)    NOT NULL UNIQUE,
  start_time datetime       NOT NULL,
  end_time   datetime       NOT NULL,
  type       int            NOT NULL REFERENCES activity_types(id),
  goal       decimal(18, 9) NOT NULL,

  CHECK(LEN(name) > 0),
  CHECK(start_time < end_time),
  CHECK(goal > 0),
);

CREATE TABLE challenge_private_groups
(
  challenge int NOT NULL REFERENCES challenges(id),
  group_id  int NOT NULL REFERENCES groups(id),

  PRIMARY KEY(challenge, group_id),
);

CREATE INDEX idx_challenge_private_groups ON challenge_private_groups(challenge);

CREATE TABLE challenge_participants
(
  challenge int NOT NULL REFERENCES challenges(id),
  athlete   int NOT NULL REFERENCES users(id),

  PRIMARY KEY(challenge, athlete),
);

CREATE INDEX idx_challenge_participants ON challenge_participants(challenge);

CREATE TABLE challenge_activities
(
  challenge int NOT NULL REFERENCES challenges(id),
  activity  int NOT NULL REFERENCES activities(id),
  seq_no    int NOT NULL,

  PRIMARY KEY(challenge, activity),
  CHECK(seq_no >= 0),
);

CREATE INDEX idx_challenge_activities ON challenge_activities(challenge);

GO

CREATE VIEW challenge_progress AS
  SELECT     challenge_participants.challenge,
             challenge_participants.athlete,
             COALESCE(SUM(length), 0) AS progress,
             COALESCE(MAX(seq_no), -1) AS last_seq
  FROM       challenge_activities
  JOIN       activities
  ON         activity = id
  RIGHT JOIN challenge_participants
  ON         activities.athlete = challenge_participants.athlete
  GROUP BY   challenge_participants.challenge,
             challenge_participants.athlete;

GO

CREATE VIEW race_positions AS
  SELECT race, race_participants.athlete, category, activity, length,
           CONVERT(decimal(18, 9), DATEDIFF(MILLISECOND, start_time, end_time)) / 1000
           AS duration
  FROM   race_participants
  JOIN   activities
  ON     activity = id;

GO

CREATE VIEW last_challenge_updates AS
  SELECT   challenge, athlete, MAX(end_time) AS latest_time
  FROM     challenge_activities
  JOIN     activities
  ON       activity = id
  GROUP BY challenge, athlete;

GO

CREATE FULLTEXT CATALOG search;
CREATE UNIQUE INDEX idx_users_id ON users(id);
CREATE UNIQUE INDEX idx_groups_id ON groups(id);
CREATE UNIQUE INDEX idx_races_id ON races(id);
CREATE UNIQUE INDEX idx_challenges_id ON challenges(id);
CREATE UNIQUE INDEX idx_sponsors_id ON sponsors(id);

GO

CREATE FULLTEXT INDEX ON users
( first_name LANGUAGE 5130 -- es-CR
, last_name  LANGUAGE 5130 -- es-Cr
) KEY INDEX idx_users_id ON search;

CREATE FULLTEXT INDEX ON groups
( name LANGUAGE 5130 -- es-CR
) KEY INDEX idx_groups_id ON search;

CREATE FULLTEXT INDEX ON races
( name LANGUAGE 5130 -- es-CR
) KEY INDEX idx_races_id ON search;

CREATE FULLTEXT INDEX ON challenges
( name LANGUAGE 5130 -- es-CR
) KEY INDEX idx_challenges_id ON search;

CREATE FULLTEXT INDEX ON sponsors
( brand_name LANGUAGE 5130 -- es-CR
) KEY INDEX idx_sponsors_id ON search;

GO

CREATE TRIGGER reject_receipts_for_registered_athletes
ON     receipts
FOR    INSERT
AS BEGIN
  SET NOCOUNT ON;

  IF (
    SELECT COUNT(*)
    FROM   INSERTED
    JOIN   race_participants
    ON     INSERTED.race    = race_participants.race
       AND INSERTED.athlete = race_participants.athlete
  ) > 0
  BEGIN
    ROLLBACK;
    RAISERROR('No se puede poner en lista de comprobación de pago a un atleta ya registrado', 16, 1);
  END
END;

GO

CREATE TRIGGER reject_activity_type_updates
ON     activity_types
FOR    UPDATE
AS BEGIN
  SET NOCOUNT ON;

  IF (
    SELECT COUNT(*)
    FROM   INSERTED
    JOIN   DELETED
	ON     INSERTED.id = DELETED.id
  ) > 0
  BEGIN
    ROLLBACK;
    RAISERROR('Los nombres de tipos de actividad son inmutables', 16, 1);
  END
END;

GO

CREATE PROCEDURE current_age
  @id  int
, @age int OUTPUT
AS BEGIN
  DECLARE @birth_date datetime;
  DECLARE @years      int;
  DECLARE @now        datetime;

  IF @id IS NULL
  BEGIN
    PRINT 'User ID cannot be null';
    RETURN 1;
  END

  SELECT @birth_date = birth_date FROM users WHERE id = @id;

  IF @birth_date IS NOT NULL
  BEGIN
    SELECT @now = GETDATE();
    SELECT @years = DATEDIFF(year, @birth_date, @now);

    IF MONTH(@now) < MONTH(@birth_date)
    OR (MONTH(@now) = MONTH(@birth_date) AND DAY(@now) < DAY(@birth_date))
      SELECT @age = @years - 1;
    ELSE
      SELECT @age = @years;
  END;
END;

GO

CREATE PROCEDURE delete_user
  @id    int
, @count int OUTPUT
AS BEGIN
  DELETE FROM photos WHERE user_id = @id;
  DELETE FROM friends WHERE follower = @id OR followee = @id;
  DELETE FROM race_participants WHERE athlete = @id;
  DELETE FROM challenge_participants WHERE athlete = @id;
  DELETE FROM receipts WHERE athlete = @id;
  DELETE FROM group_members WHERE member = @id;

  DELETE activity_tracks
  FROM   activities
  JOIN   activity_tracks
  ON     activity = id
  WHERE  athlete = @id;

  DELETE challenge_activities
  FROM   activities
  JOIN   challenge_activities
  ON     activity = id
  WHERE  athlete = @id;

  DELETE FROM activities WHERE athlete = @id;
  SELECT @count = COUNT(id) FROM users WHERE id = @id;
  DELETE FROM users WHERE id = @id;
END;
