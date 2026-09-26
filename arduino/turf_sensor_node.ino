const int moisturePin = A0;
const int tempPin = A1;
const int wearPin = A2;

void setup() {
  Serial.begin(9600);
  

  delay(1000);
  Serial.println("SYSTEM: Turf Telemetry Node Active");
}

void loop() {

  int moisture = analogRead(moisturePin);
  int temp = analogRead(tempPin);
  int wear = analogRead(wearPin);
  

  Serial.print("TELEMETRY:");
  Serial.print(moisture);
  Serial.print(",");
  Serial.print(temp);
  Serial.print(",");
  Serial.println(wear);
  

  delay(1000); 
}
