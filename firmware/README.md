# Cyber Chaukidaar - ESP32 Firmware Documentation

## Hardware Pinout & Wiring Diagram

### 1. Dual ADXL345 3-Axis Accelerometers (Ground Probes A & B)
Both sensors share the hardware I2C bus (`Wire`), distinguished by their `SDO / ALT ADDRESS` pin:

| ADXL345 Pin | ESP32 Pin | Function | Notes |
|-------------|-----------|----------|-------|
| VCC | 3.3V | Power (3.3V) | Do not connect to 5V |
| GND | GND | Ground | Connect to common ground |
| SDA | GPIO 21 | I2C Data | Shared bus with 4.7kΩ pull-up |
| SCL | GPIO 22 | I2C Clock | Shared bus with 4.7kΩ pull-up |
| **Sensor #1 SDO** | **GND** | I2C Address Select | Configures I2C address to **`0x53`** |
| **Sensor #2 SDO** | **3.3V** | I2C Address Select | Configures I2C address to **`0x54`** |

> **Mechanical Coupling Note**: Each ADXL345 PCB must be bolted rigidly inside a waterproof IP67 pod connected to a steel ground spike driven 15–25cm into the soil. The two spikes should be spaced 1.5–2.0 meters apart.

### 2. 24GHz mmWave Human Detection Radar (HLK-LD2410 / LD1115H)
| Radar Pin | ESP32 Pin | Function | Notes |
|-----------|-----------|----------|-------|
| VCC | 5V / VIN | Power (5V) | Radar requires 5V 200mA rail |
| GND | GND | Ground | Common ground |
| TX | GPIO 16 (RX2) | Radar UART Transmit | Receives target distance frame |
| RX | GPIO 17 (TX2) | Radar UART Receive | Sends configuration commands |
| OUT | GPIO 18 | Digital Presence Out | Active HIGH on human presence |

### 3. Battery Voltage Divider
Measures a single 18650 3.7V Li-ion cell (3.0V – 4.2V):
- $R_1$: 100kΩ (Between Battery (+) and GPIO 34)
- $R_2$: 100kΩ (Between GPIO 34 and GND)
- Ratio: 2.0x divider ($V_{\text{in}} = 2 \times V_{\text{pin}}$, max pin voltage 2.1V at 4.2V battery).

### 4. LoRa Transceiver (SX1276 / SX1278 SPI)
| SX1278 Pin | ESP32 Pin | Notes |
|------------|-----------|-------|
| NSS / CS | GPIO 5 | Chip Select |
| RESET | GPIO 14 | Hardware Reset |
| DIO0 / IRQ | GPIO 2 | Packet Interrupt |
| SCK | GPIO 18 | SPI Clock (shared) |
| MISO | GPIO 19 | SPI Data Out |
| MOSI | GPIO 23 | SPI Data In |

---

## Flashing the Firmware

### Using PlatformIO (Recommended)
1. Open the `firmware/` directory in VS Code with the PlatformIO extension.
2. Connect your ESP32 board via USB.
3. Build and upload:
   ```bash
   pio run --target upload
   ```
4. Open the Serial Monitor at 115200 baud:
   ```bash
   pio device monitor -b 115200
   ```

### Using Arduino IDE
1. Install ESP32 board support via Boards Manager.
2. Install `ArduinoJson` (v6.x) and `LoRa` libraries.
3. Open `firmware/src/main.cpp`, select your ESP32 board and COM port, and click **Upload**.
