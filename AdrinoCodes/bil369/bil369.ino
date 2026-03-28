const int motorPin = 9; // PWM pin for motor

// Define Braille dot patterns for A–Z (1 = dot active, 0 = inactive)
const byte brailleAlphabet[26][6] = {
  {1,0,0,0,0,0}, // A
  {1,1,0,0,0,0}, // B
  {1,0,0,1,0,0}, // C
  {1,0,0,1,1,0}, // D
  {1,0,0,0,1,0}, // E
  {1,1,0,1,0,0}, // F
  {1,1,0,1,1,0}, // G
  {1,1,0,0,1,0}, // H
  {0,1,0,1,0,0}, // I
  {0,1,0,1,1,0}, // J
  {1,0,1,0,0,0}, // K
  {1,1,1,0,0,0}, // L
  {1,0,1,1,0,0}, // M
  {1,0,1,1,1,0}, // N
  {1,0,1,0,1,0}, // O
  {1,1,1,1,0,0}, // P
  {1,1,1,1,1,0}, // Q
  {1,1,1,0,1,0}, // R
  {0,1,1,1,0,0}, // S
  {0,1,1,1,1,0}, // T
  {1,0,1,0,0,1}, // U
  {1,1,1,0,0,1}, // V
  {0,1,0,1,1,1}, // W
  {1,0,1,1,0,1}, // X
  {1,0,1,1,1,1}, // Y
  {1,0,1,0,1,1}  // Z
};

void setup() {
  pinMode(motorPin, OUTPUT);
  Serial.begin(9600);
  Serial.println("Enter a letter A–Z to feel its Braille pattern.");
}

void loop() {
  if (Serial.available()) {
    char inputChar = toupper(Serial.read());

    if (inputChar >= 'A' && inputChar <= 'Z') {
      int index = inputChar - 'A';
      Serial.print("Vibrating Braille for: ");
      Serial.println(inputChar);
      vibrateBraille(brailleAlphabet[index]);
    } else {
      Serial.println("Invalid input. Enter A–Z only.");
    }
  }
}

void vibrateBraille(const byte brailleDots[6]) {
  for (int i = 0; i < 6; i++) {
    if (brailleDots[i] == 1) {
      analogWrite(motorPin, 200); // Vibrate
      delay(150);
      analogWrite(motorPin, 0);   // Pause
    } else {
      delay(150); // Skip vibration for inactive dot
    }
    delay(100); // Space between dots
  }
  delay(500); // Pause before next character
}

