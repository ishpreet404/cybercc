#include "telemetry.h"

String TelemetrySerializer::serialize(
    const char *nodeId,
    uint32_t sequence,
    const char *transportName,
    int rssi,
    const PowerManager::BatteryStatus &battery,
    const RadarSensor::RadarReading &radar,
    const ADXL345Sensor::RawReading &s1Raw,
    float s1Rms,
    const SeismicFeatures &s1Features,
    const ADXL345Sensor::RawReading &s2Raw,
    float s2Rms,
    const char *eventState
) {
    StaticJsonDocument<1024> doc;

    doc["nodeId"] = nodeId;
    doc["timestamp"] = millis();
    doc["sequence"] = sequence;
    doc["firmware"] = "1.2.0";
    doc["transport"] = transportName;

    JsonObject batObj = doc.createNestedObject("battery");
    batObj["voltage"] = serialized(String(battery.voltage, 2));
    batObj["percentage"] = battery.percentage;

    JsonObject sigObj = doc.createNestedObject("signal");
    sigObj["rssi"] = rssi;

    JsonObject radObj = doc.createNestedObject("radar");
    radObj["presence"] = radar.presence;
    radObj["distance"] = serialized(String(radar.distance, 2));
    radObj["confidence"] = serialized(String(radar.confidence, 2));

    JsonObject accelObj = doc.createNestedObject("accelerometer");

    JsonObject s1Obj = accelObj.createNestedObject("sensor1");
    s1Obj["x"] = serialized(String(s1Raw.x, 3));
    s1Obj["y"] = serialized(String(s1Raw.y, 3));
    s1Obj["z"] = serialized(String(s1Raw.z, 3));
    s1Obj["vibrationRms"] = serialized(String(s1Rms, 4));

    JsonObject s1Feat = s1Obj.createNestedObject("features");
    s1Feat["rms"] = serialized(String(s1Features.rms, 4));
    s1Feat["peak"] = serialized(String(s1Features.peak, 4));
    s1Feat["peakToPeak"] = serialized(String(s1Features.peakToPeak, 4));
    s1Feat["variance"] = serialized(String(s1Features.variance, 6));
    s1Feat["dominantFrequency"] = serialized(String(s1Features.dominantFrequency, 2));
    s1Feat["spectralEnergy"] = serialized(String(s1Features.spectralEnergy, 4));
    s1Feat["spectralCentroid"] = serialized(String(s1Features.spectralCentroid, 2));
    s1Feat["interPeakInterval"] = serialized(String(s1Features.interPeakInterval, 2));

    JsonObject s2Obj = accelObj.createNestedObject("sensor2");
    s2Obj["x"] = serialized(String(s2Raw.x, 3));
    s2Obj["y"] = serialized(String(s2Raw.y, 3));
    s2Obj["z"] = serialized(String(s2Raw.z, 3));
    s2Obj["vibrationRms"] = serialized(String(s2Rms, 4));

    doc["eventState"] = eventState;

    String output;
    serializeJson(doc, output);
    return output;
}
