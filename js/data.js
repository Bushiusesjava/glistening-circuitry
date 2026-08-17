/* ============================================================
   Spark Workshop  |  data
   Project database + fundamentals lessons
   ============================================================ */

const CATEGORIES = [
  "Embedded & Arduino",
  "Analog & Signal",
  "Power & Solar",
  "Robotics",
  "Audio & Music",
  "Measurement & Test",
  "IoT & Wireless",
];

const PROJECTS = [
  {
    id: "blinky-led",
    title: "First Blink: Your LED Goes Blink-Blink",
    category: "Embedded & Arduino",
    difficulty: "Beginner",
    time: "30 min",
    cost: "$5",
    blurb: "The electronics rite of passage: light an LED, then make it blink, and meet the full Arduino toolchain.",
    description: "This is the 'Hello, World' of electronics. You wire an LED through a current-limiting resistor to a microcontroller pin, then write, compile and upload a sketch that toggles the pin. Once it blinks you understand digital output, code timing, and breadboarding, the three skills every later build uses.",
    components: ["Arduino board (Uno/Nano)", "USB cable", "Breadboard", "1× LED (any color)", "1× 220 Ω resistor", "Jumper wires"],
    steps: [
      "Plug the LED into the breadboard with its long leg (anode) on one side and short leg (cathode) on the other.",
      "Connect the anode through a 220 Ω resistor to Arduino digital pin 13.",
      "Connect the cathode to a GND pin.",
      "Open the Arduino IDE and load File → Examples → 01.Basics → Blink.",
      "Select your board and port, then click Upload. The on-board LED blinks first.",
      "Move the wire from pin 13 to another pin and edit the sketch to use it, then re-upload.",
      "Change the delay(1000) values to delay(100) and delay(900) and watch the rhythm change.",
    ],
    skills: ["Breadboarding", "Digital output", "Arduino IDE", "Reading resistor color codes"],
  },
  {
    id: "ldr-night-lamp",
    title: "Automatic Night Lamp (No Code)",
    category: "Analog & Signal",
    difficulty: "Beginner",
    time: "1 hr",
    cost: "$8",
    blurb: "A lamp that switches on when it gets dark, built purely from analog parts with no microcontroller.",
    description: "An LDR (light-dependent resistor) changes resistance with light. Put it in a voltage divider, feed that to a transistor's base, and the transistor turns an LED (or small lamp) on when the room goes dark. Pure analog magic that teaches voltage dividers and transistor switching with zero programming.",
    components: ["1× Light-dependent resistor (LDR)", "1× 10 kΩ resistor", "1× 2N2222 transistor", "1× LED or 3 V bulb", "1× 220 Ω resistor", "9 V battery + clip", "Breadboard", "Jumper wires"],
    steps: [
      "Build the divider: LDR from +9 V to node A, 10 kΩ from node A to ground.",
      "Wire node A to the transistor base.",
      "Put a 220 Ω resistor between +9 V and the LED anode; LED cathode to the transistor collector.",
      "Emitter goes to ground.",
      "Cover the LDR with your hand; the LED should light.",
      "Shine a light on the LDR; it should turn off.",
      "Swap the 10 kΩ for a different value to move the light/dark threshold.",
    ],
    skills: ["Voltage dividers", "Transistors as switches", "Sensors", "Schematic reading"],
  },
  {
    id: "continuity-tester",
    title: "DIY Continuity Tester",
    category: "Measurement & Test",
    difficulty: "Beginner",
    time: "45 min",
    cost: "$6",
    blurb: "Build the classic beeping probe every bench needs, and learn to hunt short circuits and broken traces.",
    description: "A continuity tester beeps when two points are electrically connected. Yours will be a transistor that drives a buzzer, powered by a battery, with two probe wires. This is the tool you will reach for whenever a circuit 'doesn't work'. It teaches good electrical probing and is genuinely useful.",
    components: ["1× Piezo buzzer (5 V)", "1× 2N2222 transistor", "1× 1 kΩ resistor", "9 V battery + clip", "2× probe leads (or stiff wire)", "2× alligator clips", "Small project box (optional)"],
    steps: [
      "Connect +9 V through the buzzer to the transistor collector.",
      "Emitter to ground. Base through the 1 kΩ resistor to probe tip A.",
      "Wire probe tip B to ground.",
      "Touch the two probes together; the buzzer should sound loudly.",
      "Test a piece of wire, a resistor, and an open switch to feel the difference.",
      "If it doesn't beep, check your transistor pinout against its datasheet.",
      "Mount it in a box with a few inches of probe wire for a permanent bench tool.",
    ],
    skills: ["Multimeter-style probing", "Short-circuit hunting", "Transistor basics", "Packaging a build"],
  },
  {
    id: "reaction-game",
    title: "555 Reaction Game",
    category: "Analog & Signal",
    difficulty: "Beginner",
    time: "1.5 hr",
    cost: "$10",
    blurb: "Two 555 timers, two buttons, and a light: who has the fastest reflexes at the bench?",
    description: "Build the classic two-player reaction game. One 555 generates a random 'go' delay, another lights a target LED, and each player's button lights their own LED. The first to hit their button after the light wins. You'll learn monostable timing, debouncing, and how to combine analog blocks.",
    components: ["2× NE555 timers", "3× LEDs", "2× push buttons", "2× 10 kΩ resistors", "2× 100 kΩ resistors (pot optional)", "1× 100 nF capacitor", "1× 47 µF electrolytic capacitor", "2× 220 Ω resistors", "9 V battery + clip", "Breadboard", "Jumper wires"],
    steps: [
      "Wire the first 555 in monostable mode with a longish delay. This is the 'referee' that lets players arm.",
      "Wire its output to trigger the second 555, whose monostable period sets the 'go' light duration.",
      "Add two player branches: each button routes the go-pulse to that player's latch LED.",
      "Use 10 kΩ pulldown resistors on the buttons and 100 nF caps to debounce.",
      "Power it from the 9 V battery. Press 'reset', watch the go light, and smash your buttons.",
      "Tune the 100 kΩ to make the response window tighter or more forgiving.",
    ],
    skills: ["555 timer (monostable)", "Button debouncing", "Logic combinations", "Timing design"],
  },
  {
    id: "temp-alarm",
    title: "Over-Temperature Alarm",
    category: "Analog & Signal",
    difficulty: "Intermediate",
    time: "2 hr",
    cost: "$12",
    blurb: "A thermistor, a comparator, and a buzzer warn you the moment your enclosure gets too hot.",
    description: "Use a thermistor in a voltage divider to sense temperature, feed the divider to one input of an LM393 comparator, and set the trip point with a trimmer pot. When the reading crosses the threshold the comparator drives a buzzer. This is a complete analog 'sensor → decision → actuator' chain.",
    components: ["1× LM393 comparator", "1× NTC thermistor (10 kΩ)", "1× 10 kΩ resistor", "1× 10 kΩ trimmer pot", "1× PNP transistor (2N3906)", "1× Active buzzer", "9 V battery + clip", "Breadboard", "Jumper wires"],
    steps: [
      "Build divider A: thermistor (cold, ~10 kΩ) from +9 V to node A, fixed 10 kΩ to ground.",
      "Build divider B: 10 kΩ from +9 V to node B, trimmer wiper forming the variable arm.",
      "Feed node A to comparator '+' input and node B to '−' input.",
      "Use the push-pull output to drive the PNP transistor that powers the buzzer.",
      "Power the comparator between +9 V and ground.",
      "Heat the thermistor with your fingers; the buzzer should sound past your set point.",
      "Trim the pot to choose the exact trip temperature.",
    ],
    skills: ["Comparators", "Sensors & thresholds", "Hysteresis (optional feedback)", "Driving loads"],
  },
  {
    id: "digital-thermometer",
    title: "Digital Thermometer + LCD",
    category: "Embedded & Arduino",
    difficulty: "Intermediate",
    time: "3 hr",
    cost: "$18",
    blurb: "Read temperature with a sensor and display it on a 16×2 LCD. Your first 'instrument'.",
    description: "An Arduino reads a digital temperature sensor (the DS18B20 or DHT22) and prints live readings to a 16×2 LCD using the I2C backpack. You'll meet real serial protocols (OneWire/I2C), learn to calibrate readings, and build something that looks like a genuine instrument.",
    components: ["Arduino board", "1× DS18B20 temperature sensor (or DHT22)", "1× 16×2 LCD with I2C backpack", "1× 4.7 kΩ resistor (for DS18B20 pull-up)", "1× 10 kΩ pot (LCD contrast)", "Breadboard", "Jumper wires"],
    steps: [
      "Wire the DS18B20: VCC to 5 V, GND to ground, data to a digital pin with a 4.7 kΩ pull-up to 5 V.",
      "Connect the LCD backpack: SDA → A4, SCL → A5 (Uno), VCC 5 V, GND.",
      "Install the OneWire, DallasTemperature, and LiquidCrystal_I2C libraries.",
      "Write a sketch that reads the sensor every second and prints °C (and °F) to the LCD.",
      "Test with your finger on the sensor; readings should rise smoothly.",
      "Add a min/max hold feature by storing the extremes across readings.",
      "Optionally replace the DS18B18B with a DHT22 to also log humidity.",
    ],
    skills: ["I2C & OneWire protocols", "LCDs", "Library usage", "Calibration & averaging"],
  },
  {
    id: "line-follower",
    title: "Line-Following Robot",
    category: "Robotics",
    difficulty: "Intermediate",
    time: "6 hr",
    cost: "$35",
    blurb: "A little robot that chases a black line on the floor using IR sensors, an H-bridge, and simple logic.",
    description: "Two infrared reflectance sensors under the chassis watch a black line on white tape. When the line drifts under one sensor, the Arduino steers the two motors through an H-bridge driver to chase it. This is the classic robotics first build and it packs in sensors, motor drivers, PWM, and feedback control.",
    components: ["Arduino Nano", "2× IR reflectance sensors (TCRT5000)", "1× L298N or TB6612 motor driver", "2× DC motors with wheels", "Robot chassis (or laser-cut base)", "Battery pack (4× AA) or 2S LiPo", "White board + black electrical tape", "Jumper wires"],
    steps: [
      "Build the chassis: mount both motors and the battery pack; attach wheels.",
      "Mount the two IR sensors at the front, spaced about one tape-width apart.",
      "Wire sensors to two analog inputs and the motor driver to four digital pins + two PWM pins.",
      "Write a sketch that reads both sensors and drives motors: straight, left, right, stop.",
      "Calibrate the sensor thresholds in direct sunlight vs. indoor light.",
      "Lay a track with black electrical tape on white cardboard.",
      "Tune speed and threshold until it follows smoothly; add a third sensor for smoother curves.",
    ],
    skills: ["IR sensing", "H-bridge motor control", "PWM", "Simple feedback logic", "Mechanical assembly"],
  },
  {
    id: "solar-charger",
    title: "Solar Charger + Battery Monitor",
    category: "Power & Solar",
    difficulty: "Intermediate",
    time: "4 hr",
    cost: "$30",
    blurb: "Store the sun in a lithium cell and keep an eye on it: a usable phone-juicing power bank.",
    description: "A small solar panel charges a protected 18650 lithium cell through a TP4056 charge module, and an Arduino measures battery voltage with a voltage divider to show state-of-charge on an LED bar. You'll learn charge controllers, Li-ion safety, and reading battery voltage accurately.",
    components: ["1× 6 V solar panel (2–5 W)", "1× TP4056 charger module (with protection)", "1× 18650 lithium cell", "1× 18650 holder", "1× MT3608 boost module (USB 5 V out)", "Arduino Nano", "3× 10 kΩ resistors (divider + LEDs)", "5× LEDs", "Schottky diode (1N5819)", "Jumper wires, perfboard"],
    steps: [
      "Connect the solar panel to the TP4056 input through the Schottky diode (blocks reverse current at night).",
      "Mount the 18650 in its holder and connect to the TP4056 output.",
      "Add the MT3608 boost module to step battery voltage up to a stable 5 V USB out.",
      "Build the monitor: voltage divider (2× 10 kΩ) from battery+ to an Arduino analog pin.",
      "Read the divided voltage, multiply back, and light LEDs based on state-of-charge.",
      "Verify no cell gets drawn below ~2.8 V; the protection circuit should cut it off.",
      "Enclose it and try charging under sun vs. a desk lamp to compare rates.",
    ],
    skills: ["Battery protection", "Charge controllers", "DC-DC boost", "Voltage dividers", "Power budgeting"],
  },
  {
    id: "buck-converter",
    title: "Hand-Built Buck Converter",
    category: "Power & Solar",
    difficulty: "Advanced",
    time: "5 hr",
    cost: "$25",
    blurb: "Design and solder a switching regulator that steps 12 V down to 5 V at real current, ripple and all.",
    description: "Move from 'module hacker' to 'power designer'. Using the LM2596 (or XL4015), you'll lay out the minimum external parts (inductor, Schottky diode, output caps) on perfboard, then measure the results: output ripple, efficiency, and transient response under load. Switching power supplies are in everything from phones to EVs.",
    components: ["1× LM2596 or XL4015 regulator IC", "1× 33 µH power inductor", "1× 1N5822 Schottky diode", "1× 220 µF low-ESR electrolytic cap", "1× 100 nF + 10 nF ceramics", "1× 100 µF input cap", "Feedback resistor network (or fixed version)", "Heatsink, perfboard, load resistors", "Bench supply or 12 V adapter"],
    steps: [
      "Study the datasheet schematic for the LM2596-5.0 and note every recommended part.",
      "Solder the IC and input caps first, keeping traces short and thick.",
      "Add the inductor and Schottky diode, respecting the switching loop layout.",
      "Add the feedback divider (for adjustable) and output caps.",
      "Apply 12 V and verify 5 V appears unloaded.",
      "Load it with power resistors and measure ripple on an oscilloscope.",
      "Measure efficiency = (Vout×Iout)/(Vin×Iin) at several loads and plot the curve.",
    ],
    skills: ["Switch-mode design", "Inductors & capacitors in SMPS", "PCB layout discipline", "Oscilloscope use", "Efficiency measurement"],
  },
  {
    id: "pc-oscilloscope",
    title: "Soundcard Oscilloscope",
    category: "Measurement & Test",
    difficulty: "Intermediate",
    time: "2.5 hr",
    cost: "$15",
    blurb: "Turn your PC's audio input into a 2-channel oscilloscope, and learn input protection on the way.",
    description: "A soundcard is a 44 kS/s, 2-channel ADC. Build a probe front-end that scales and protects it: resistive dividers for range, zener clamps to stop the soundcard from frying, and a DC-blocking coupling cap. Pair it with free scope software and you have a real test instrument from parts in your drawer.",
    components: ["1× 3.5 mm audio plug + cable", "2× 1 MΩ resistors", "2× 10 kΩ resistors", "2× 5.1 V zener diodes", "2× 100 nF capacitors", "2× probe tips (or BNC + adapter)", "Small project box"],
    steps: [
      "Understand the range: audio inputs accept ~±1 V; any input above that needs scaling and clamping.",
      "Build the divider: input → 1 MΩ → node A → 10 kΩ → ground, giving ~1/100 of the input at node A.",
      "Clamp node A with back-to-back 5.1 V zeners to ground; the soundcard never sees over ~0.6 V.",
      "Couple node A through the 100 nF cap to remove DC offset.",
      "Connect the result to tip (left) and ring (right) of the audio plug; sleeve is ground.",
      "Install soundcard-scope software (e.g. the classic Soundcard Scope).",
      "Probe a 5 V square wave through a resistor and confirm the scaled waveform and readings.",
    ],
    skills: ["Input protection", "AC coupling & DC blocking", "Attenuators", "ADC sampling concepts"],
  },
  {
    id: "rf-thermometer",
    title: "Wireless Temperature Sensor (nRF24L01)",
    category: "IoT & Wireless",
    difficulty: "Intermediate",
    time: "4 hr",
    cost: "$25",
    blurb: "Two tiny boards, one radio link: a battery-friendly sensor in the shed reporting to a receiver in the house.",
    description: "An Arduino Nano + nRF24L01 reads temperature and sends it over 2.4 GHz to a second board that shows it on an LCD. You'll learn packet radio: addressing, channels, and low-power duty cycling so the sensor sips battery. This is the skeleton of every remote sensor project.",
    components: ["2× Arduino Nano", "2× nRF24L01 modules (+PA+LNA version optional)", "1× DHT22 or DS18B20 sensor", "1× 16×2 LCD with I2C", "1× 100 µF cap on each radio's power", "Battery holder for sensor node", "Jumper wires"],
    steps: [
      "Wire both radios: VCC, GND, and CE/CSN to two pins each, plus SCK/MOSI/MISO to SPI pins.",
      "Add a 100 µF capacitor right at each module's power pins, because the radio draws sharp current spikes.",
      "Install the RF24 library. On the sensor, read temperature and build a 6-byte packet.",
      "On the receiver, print the payload and timestamp to the LCD.",
      "Test range in the same room first, then through one wall, then outdoors.",
      "Duty-cycle the transmitter: wake, send, sleep for 5–10 s. Measure current draw.",
      "Add packet numbering and an RSSI display so you can watch link quality.",
    ],
    skills: ["SPI", "Radio packets & addressing", "Low-power design", "Library integration"],
  },
  {
    id: "capacitance-meter",
    title: "Capacitance Meter (555 + Arduino)",
    category: "Measurement & Test",
    difficulty: "Advanced",
    time: "3 hr",
    cost: "$18",
    blurb: "Make a 555 timer oscillate at a frequency that reveals an unknown capacitor's value.",
    description: "Wire the unknown capacitor into a 555 astable circuit, measure the oscillation frequency with an Arduino, and compute C from the timing formula. It doubles as a frequency counter and is a great bridge between analog timing circuits and digital measurement.",
    components: ["Arduino board", "1× NE555 timer", "1× 16×2 LCD (or serial monitor)", "Known resistors (1 kΩ, 10 kΩ, 100 kΩ)", "Socket/probe for unknown caps", "100 nF decoupling cap", "Breadboard, jumpers"],
    steps: [
      "Wire the 555 in astable mode with R1, R2 and the unknown capacitor in place.",
      "Connect the 555 output to an Arduino digital input (the 5 V rail is fine).",
      "Write a sketch that times 1000 rising edges to find the frequency.",
      "Solve C = 1.44 / (f × (R1 + 2·R2)) and print it.",
      "Use three different R values to cover pF, nF, and µF ranges.",
      "Measure a known capacitor to calibrate; expect ~2–5% accuracy.",
      "Add auto-ranging by switching resistors via relay or analog switch.",
    ],
    skills: ["555 astable timing", "Frequency measurement", "Auto-ranging logic", "Uncertainty & calibration"],
  },
  {
    id: "h-bridge",
    title: "Discrete H-Bridge Motor Driver",
    category: "Robotics",
    difficulty: "Intermediate",
    time: "3 hr",
    cost: "$15",
    blurb: "Build a motor controller from four transistors and a handful of diodes, the heart of every robot.",
    description: "An H-bridge is four switches arranged in an 'H' so current can flow through a motor in either direction. Building one from discrete transistors teaches you flyback diodes, base-drive calculations, shoot-through danger, and how a datasheet's current ratings actually work. Then you control it with PWM from an Arduino.",
    components: ["4× TIP120 Darlington transistors (or 2N3055)", "4× 1N4007 flyback diodes", "4× 1 kΩ base resistors", "1× DC motor", "Arduino (or manual switches)", "2× 10 kΩ resistors", "9 V or 12 V supply", "Heat sinks (optional)"],
    steps: [
      "Arrange the four transistors as an H: high-side pair (upper legs) and low-side pair (lower legs).",
      "Add a flyback diode across the motor in each direction to clamp inductive spikes.",
      "Calculate the base resistor so each transistor saturates (I_b ≈ I_c / 10).",
      "Wire the four bases to Arduino digital pins (with common ground).",
      "Drive one high-side + the opposite low-side → motor spins one way; swap → the other way.",
      "Add a short dead-time in software before reversing to avoid shoot-through.",
      "Test PWM speed control, then watch the transistors get warm at high current.",
    ],
    skills: ["H-bridge theory", "Saturation & base drive", "Flyback diodes", "PWM speed control", "Thermal awareness"],
  },
  {
    id: "headphone-amp",
    title: "DIY Headphone Amplifier",
    category: "Audio & Music",
    difficulty: "Advanced",
    time: "4 hr",
    cost: "$25",
    blurb: "A real audio design with an op-amp, clean rails, and a volume control. Then actually listen to it.",
    description: "Design and build a stereo headphone amp around the NE5532 op-amp. You'll create a virtual ground or split supply, set gain with a resistor pair, add input/output coupling caps, and think about decoupling so the rails stay quiet. When you plug in headphones, you hear the difference clean design makes.",
    components: ["1× NE5532 (or OPA2134) dual op-amp", "2× 100 kΩ gain resistors", "2× 10 kΩ resistors", "2× 10 µF coupling caps", "2× 100 nF + 2× 100 µF decoupling", "1× 10 kΩ stereo volume pot", "3.5 mm stereo jacks", "12 V supply (or 9 V battery with virtual ground)", "Perfboard, sockets"],
    steps: [
      "Start from the non-inverting topology: gain = 1 + R_f / R_g. Pick a gain around 3–5 for headphones.",
      "Build the power section: split a single supply with two equal resistors to make a virtual ground, heavily decoupled.",
      "Wire each op-amp channel: coupling cap on input, pot as input attenuator, feedback network, output coupling cap.",
      "Add 100 nF caps right at the power pins of the op-amp (decoupling is what keeps it quiet).",
      "Solder it up and probe with your PC-scope to check for DC offset and oscillation.",
      "Measure gain and frequency response into a dummy load.",
      "Plug in headphones and A/B it against a phone's output, listening for noise floor.",
    ],
    skills: ["Op-amp gain design", "Virtual ground", "Decoupling", "Audio fidelity", "Solder work"],
  },
];

/* ============================================================
   Fundamentals lessons
   ============================================================ */

const LESSONS = [
  {
    id: "ohms",
    title: "Voltage, Current & Resistance",
    level: "Beginner",
    blurb: "The three quantities every circuit is built from, and the law that ties them together.",
    html: `
      <p>Imagine a water loop: a pump (the <strong>battery</strong>) pushes water around a pipe. <strong>Voltage</strong> is the pressure the pump creates, <strong>current</strong> is how much water flows per second, and <strong>resistance</strong> is how narrow the pipe is.</p>
      <blockquote><p><strong>Voltage (V)</strong>, electrical pressure, measured in volts.<br>
      <strong>Current (I)</strong>, flow of charge, measured in amperes (amps).<br>
      <strong>Resistance (R)</strong>, opposition to flow, measured in ohms (Ω).</p></blockquote>
      <p>These three are locked together by <strong>Ohm's law</strong>, the most-used formula in electronics:</p>
      <p><span class="formula">V = I × R</span></p>
      <p>Know any two of the three and you can always find the third:</p>
      <ul>
        <li><strong>V = I × R</strong>, find voltage</li>
        <li><strong>I = V ÷ R</strong>, find current</li>
        <li><strong>R = V ÷ I</strong>, find resistance</li>
      </ul>
      <p>Here's the practical version that keeps LEDs alive: an LED drops about 2 V and should carry ~20 mA. On a 5 V supply, the resistor must drop the remaining 3 V at 20 mA, so R = 3 ÷ 0.02 = <strong>150 Ω</strong>. That's exactly what the LED resistor calculator below does.</p>
      <div class="calc" data-calc="ohms">
        <h4>Ohm's Law Calculator</h4>
        <p class="muted small">Leave exactly one field empty and press Solve; it will be computed from the other two.</p>
        <div class="calc-grid">
          <div><label>Voltage (V)</label><input type="number" id="oh-v" placeholder="?"></div>
          <div><label>Current (A)</label><input type="number" id="oh-i" placeholder="?"></div>
          <div><label>Resistance (Ω)</label><input type="number" id="oh-r" placeholder="?"></div>
        </div>
        <button class="btn" data-calc-run>Solve</button>
        <p class="calc-out"></p>
      </div>
      <div class="calc" data-calc="led">
        <h4>LED Resistor Calculator</h4>
        <div class="calc-grid">
          <div><label>Supply voltage (V)</label><input type="number" id="ld-vs" value="5"></div>
          <div><label>LED forward drop (V)</label><input type="number" id="ld-vf" value="2"></div>
          <div><label>LED current (mA)</label><input type="number" id="ld-i" value="20"></div>
        </div>
        <button class="btn" data-calc-run>Compute resistor</button>
        <p class="calc-out"></p>
      </div>
    `,
  },
  {
    id: "series-parallel",
    title: "Series & Parallel Circuits",
    level: "Beginner",
    blurb: "Two ways to connect parts, and why Christmas lights taught you about both.",
    html: `
      <p><strong>Series</strong> means parts are chained one after another, with current flowing through each in turn. <strong>Parallel</strong> means parts sit side by side across the same two nodes, each getting the full supply voltage.</p>
      <table>
        <tr><th></th><th>Series</th><th>Parallel</th></tr>
        <tr><td><strong>Current</strong></td><td>Same in every part</td><td>Splits between branches</td></tr>
        <tr><td><strong>Voltage</strong></td><td>Splits across parts</td><td>Same across every branch</td></tr>
        <tr><td><strong>Equivalent R</strong></td><td>R<sub>eq</sub> = R<sub>1</sub> + R<sub>2</sub> + …</td><td>1/R<sub>eq</sub> = 1/R<sub>1</sub> + 1/R<sub>2</sub> + …</td></tr>
      </table>
      <p>Resistors add up in series, so total resistance <em>grows</em>. In parallel the total is always <em>smaller</em> than the smallest branch, because each new path lets more current through.</p>
      <blockquote><p><strong>Why old Christmas light strings died:</strong> they were series strings. One bulb out = open circuit = the whole string goes dark. Newer strings run parallel so the rest survive a failed bulb.</p></blockquote>
      <p><strong>Worked example:</strong> a 10 Ω and a 10 Ω in series give 20 Ω. The same two in parallel give 1/(1/10 + 1/10) = 5 Ω.</p>
      <p><strong>Why it matters on a breadboard:</strong> reading whether components share a node (parallel) or pass current in a chain (series) is the first step to understanding <em>any</em> schematic you meet.</p>
    `,
  },
  {
    id: "power",
    title: "Power, Energy & Safety",
    level: "Beginner",
    blurb: "How fast a circuit burns energy, and the three rules that keep you unharmed.",
    html: `
      <p><strong>Power</strong> is energy per second. Combining Ohm's law with P = V × I gives three equivalent forms:</p>
      <p><span class="formula">P = V × I = I² × R = V² ÷ R</span></p>
      <ul>
        <li>A 5 V load drawing 2 A consumes <strong>10 W</strong>.</li>
        <li>That wattage must be dissipated as heat by the resistor or transistor doing the work.</li>
        <li><strong>Energy</strong> is power × time. A 10 W load on for 1 hour uses 10 watt-hours. Batteries are rated the same way: a 2000 mAh cell at 3.7 V stores 7.4 Wh.</li>
      </ul>
      <p>Wattage is why you must size resistors: a 1/8 W (0.125 W) resistor passing 30 mA at 5 V burns P = 0.15 W, <em>more than it can handle</em>. It will run hot, then fail. If your parts are hot to the touch, recheck your power math.</p>
      <blockquote><p><strong>Three safety rules for the bench:</strong></p>
        <ul>
          <li>Current is what hurts. <strong>Over ~10 mA</strong> across your body is dangerous; that is why circuits use voltage dividers and why you never touch live wires.</li>
          <li>Use the <strong>right supply</strong>: check polarity, and current-limit bench supplies before powering up new builds.</li>
          <li>Mind the <strong>energy stored in capacitors</strong>; a charged big cap can bite long after power is off. Discharge before touching.</li>
        </ul>
      </blockquote>
    `,
  },
  {
    id: "capacitors",
    title: "Capacitors & RC Timing",
    level: "Beginner",
    blurb: "A component that stores charge, smooths voltage, and with one resistor becomes a clock.",
    html: `
      <p>A capacitor is two plates separated by an insulator. It stores charge, and the voltage across it cannot change instantly. That single property does three huge jobs.</p>
      <ul>
        <li><strong>Decoupling:</strong> place a 100 nF right at a chip's power pin to absorb quick current spikes the wire can't deliver.</li>
        <li><strong>Filtering:</strong> a big capacitor across a power rail smooths the 'bumpy' DC left by a rectifier.</li>
        <li><strong>Timing:</strong> charge it through a resistor and you have a clock. The 555 timer is built around this.</li>
      </ul>
      <p>A resistor charging a capacitor follows an exponential curve. The time constant τ (tau) is the product R × C:</p>
      <p><span class="formula">τ = R × C</span></p>
      <ul>
        <li>After <strong>1τ</strong> the cap is 63% charged.</li>
        <li>After <strong>5τ</strong> it is ~99% charged, call it 'full'.</li>
      </ul>
      <p>One unit check saves a lifetime of confusion: ohms × farads = seconds. 10 kΩ × 100 µF = 10 kΩ × 0.0001 F = <strong>1 second</strong>.</p>
      <div class="calc" data-calc="rc">
        <h4>RC Time Constant Calculator</h4>
        <div class="calc-grid">
          <div><label>Resistance (Ω)</label><input type="number" id="rc-r" value="10000"></div>
          <div><label>Capacitance (µF)</label><input type="number" id="rc-c" value="100"></div>
        </div>
        <button class="btn" data-calc-run>Compute</button>
        <p class="calc-out"></p>
      </div>
    `,
  },
  {
    id: "diodes",
    title: "Diodes & Rectification",
    level: "Beginner",
    blurb: "The one-way valve of electronics, and how a bridge rectifier turns AC into usable DC.",
    html: `
      <p>A diode lets current flow <strong>one way only</strong>. From anode to cathode it conducts when the voltage difference (forward drop, ~0.7 V for silicon) is exceeded; in reverse it blocks. A <strong>zener</strong> is a special diode that also conducts deliberately in reverse once a set voltage is reached, handy for clamping and references.</p>
      <p>Their everyday jobs:</p>
      <ul>
        <li><strong>Protection:</strong> 'flyback' diodes across relays and motors clamp the voltage spike when an inductive load switches off.</li>
        <li><strong>Reference:</strong> an LED's ~2 V drop makes it a visible voltage marker.</li>
        <li><strong>Rectification:</strong> converting AC into DC, the wall adapter's first job.</li>
      </ul>
      <p><strong>Rectifier logic:</strong> one diode conducts on positive half-cycles only (half-wave, lots of ripple). Four diodes in a <em>bridge</em> conduct on both halves, always steering current the same way through the load. Follow it through a full AC cycle and you'll see both half-cycles come out positive:</p>
      <ul>
        <li>Half-wave: 1 diode → big gaps in output.</li>
        <li>Full-wave bridge: 4 diodes → bumps packed together.</li>
        <li>Add a large capacitor across the output → the bumps get smoothed into near-flat DC (still with a little ripple).</li>
      </ul>
      <blockquote><p>Check the <strong>PIV (peak inverse voltage)</strong> rating: each bridge diode sees the full AC peak in reverse, so undersized diodes fail in spectacular, smoky fashion.</p></blockquote>
    `,
  },
  {
    id: "transistors",
    title: "Transistors as Switches",
    level: "Intermediate",
    blurb: "A tiny base current controls a much bigger current, the switch that makes all of electronics possible.",
    html: `
      <p>A BJT (bipolar junction transistor) has three pins: base, collector, emitter. In the common <strong>NPN</strong> switch setup, a small current into the base lets a much larger current flow from collector to emitter.</p>
      <p><span class="formula">I<sub>collector</sub> ≈ β × I<sub>base</sub></span></p>
      <p>β (beta, current gain) is often 100–300. Drive the base hard enough and the transistor <strong>saturates</strong>, switching fully on and sitting the collector near ground like a closed switch.</p>
      <p><strong>The two rules to follow:</strong></p>
      <ul>
        <li><strong>Always limit base current.</strong> The base looks like a diode to the driver, so a base resistor is mandatory. Use I<sub>b</sub> ≈ I<sub>c</sub>/10 to guarantee saturation.</li>
        <li><strong>Add a flyback diode</strong> across any inductive load (relay coil, motor) or the kickback will destroy the transistor.</li>
      </ul>
      <blockquote><p><strong>Worked example: driving an LED.</strong> You want to switch a 5 V LED (needing 20 mA) from a 3.3 V microcontroller pin. Choose I<sub>b</sub> = 20 mA / 10 = 2 mA. Then R<sub>b</sub> = (3.3 V − 0.7 V) / 2 mA ≈ <strong>1.3 kΩ</strong> (use 1 kΩ). The transistor does the heavy lifting; the pin just steers it.</p></blockquote>
      <p>That is the same circuit as the Night Lamp and Continuity Tester projects in this hub, a sensor, a switch, and a load, connected by one transistor.</p>
    `,
  },
  {
    id: "timer555",
    title: "The 555 Timer",
    level: "Intermediate",
    blurb: "Eight pins that became the most successful chip ever: blinker, buzzer, and metronome rolled into one.",
    html: `
      <p>The NE555 is an 8-pin timer with two comparators, a flip-flop, and a discharge transistor inside. Feed it a resistor and a capacitor and it counts time. Its two classic modes:</p>
      <p><strong>Monostable (one-shot):</strong> trigger it and the output goes high for one fixed period, then drops.</p>
      <p><span class="formula">T = 1.1 × R × C</span></p>
      <p><strong>Astable (oscillator):</strong> it free-runs, charging and discharging the capacitor forever, a square-wave generator.</p>
      <p><span class="formula">f = 1.44 ÷ ((R<sub>1</sub> + 2·R<sub>2</sub>) × C)</span></p>
      <p><strong>How astable works, in one paragraph:</strong> the capacitor charges through R1+R2 until it hits 2/3 of the supply; the upper comparator flips the output low and grounds the discharge pin; the cap then drains through R2 until it hits 1/3 of the supply; the lower comparator flips it high again. Repeat forever. That charge-to-2/3, drain-to-1/3 rhythm is the 'blink' you hear from every buzzer circuit.</p>
      <ul>
        <li><strong>Duty cycle.</strong> R1 vs R2 set how long high vs low. Equal halves need R1 tiny.</li>
        <li><strong>Decouple the control pin (pin 5)</strong> with a 10 nF cap to ground, or noise will jitter your timing.</li>
        <li>It works from ~4.5 V to 15 V and sips so little power it's battery-friendly.</li>
      </ul>
      <blockquote><p>Try it: R1 = 1 kΩ, R2 = 100 kΩ, C = 10 µF → f = 1.44 ÷ (201 kΩ × 10 µF) ≈ <strong>0.72 Hz</strong>, about one slow blink per 1.4 seconds. Change C and watch the blink speed change.</p></blockquote>
    `,
  },
  {
    id: "opamps",
    title: "Op-Amps: The Universal Building Block",
    level: "Intermediate",
    blurb: "The amplifier that does arithmetic on voltages: gain, buffers, and comparators.",
    html: `
      <p>An operational amplifier ('op-amp') is a differential amplifier with huge gain: it amplifies the difference between its two inputs. Used <em>without</em> feedback it's a comparator, output slamming high or low. Used <em>with</em> feedback it becomes a precise, predictable amplifier.</p>
      <p><strong>The golden rules</strong> (when feedback is applied):</p>
      <ul>
        <li>The inputs draw (almost) no current.</li>
        <li>Feedback makes the inputs try to equalize, creating 'virtual ground' on the inverting input.</li>
      </ul>
      <p><strong>Non-inverting amp:</strong> signal into the '+' input, gain set by two resistors.</p>
      <p><span class="formula">V<sub>out</sub> = V<sub>in</sub> × (1 + R<sub>f</sub> ÷ R<sub>g</sub>)</span></p>
      <p><strong>Inverting amp:</strong> signal into '−' through R<sub>in</sub>, feedback R<sub>f</sub> to '−'.</p>
      <p><span class="formula">V<sub>out</sub> = −V<sub>in</sub> × (R<sub>f</sub> ÷ R<sub>in</sub>)</span></p>
      <p><strong>Buffer (follower):</strong> output wired straight back to '−' gives gain = 1 but copies the voltage perfectly without loading the source, great for sensors and LCD drivers.</p>
      <p><strong>Comparator:</strong> two inputs, no feedback; '+' above '−' flips the output. That's the heart of the Over-Temperature Alarm project.</p>
      <blockquote><p><strong>Practice:</strong> with R<sub>f</sub> = 100 kΩ and R<sub>g</sub> = 10 kΩ, non-inverting gain is 1 + 100k/10k = <strong>11×</strong>. A 0.2 V input becomes 2.2 V. Just remember the rails are the ceiling, so you can't amplify beyond the supply.</p></blockquote>
    `,
  },
  {
    id: "analog-digital",
    title: "Analog vs Digital & Arduino Basics",
    level: "Intermediate",
    blurb: "How a microcontroller sees the continuous world: ADCs, PWM, and the pull-up/pull-down habit.",
    html: `
      <p>A microcontroller is a digital brain: everything is 0s and 1s. To interact with the continuous analog world it uses two bridge tools.</p>
      <p><strong>ADC, analog to digital.</strong> An analog pin measures a voltage (0–5 V) and reports it as a number (0–1023 on a 10-bit ADC). Resolution = 5 V ÷ 1024 ≈ 4.9 mV per step. The Arduino's <code>analogRead()</code> is the door through which every sensor enters.</p>
      <p><strong>PWM, pulse width modulation.</strong> To fake a variable voltage on a digital pin, the pin flips fast between 0 and 5 V and you vary the duty cycle (percent high). Average voltage = duty × 5 V. This dims LEDs and sets motor speed via <code>analogWrite()</code>.</p>
      <blockquote><p>Key wiring habit: <strong>pull-up / pull-down resistors.</strong> A bare switch leaves a pin floating, and noise decides its state. Pull the pin to 5 V with a 10 kΩ (pull-up) or to ground (pull-down), and the switch then does the opposite cleanly. Many chips also have internal pull-ups you can enable in software.</p></blockquote>
      <p><strong>Digital vs analog decision guide:</strong></p>
      <table>
        <tr><th>Situation</th><th>Use</th></tr>
        <tr><td>Button, switch, sensor that's on/off</td><td>digitalRead() + pull-up</td></tr>
        <tr><td>Voltage proportional to something (temp, light)</td><td>analogRead() + math</td></tr>
        <tr><td>Want a pseudo-variable voltage out</td><td>analogWrite() (PWM)</td></tr>
      </table>
      <p>And the classic beginner trap: <strong>when the smoke escapes, it's usually the current</strong>. A microcontroller pin delivers at most ~40 mA, so always switch heavier loads through a transistor or driver, never straight off a pin.</p>
    `,
  },
  {
    id: "schematics",
    title: "Reading Schematics & Datasheets",
    level: "Beginner",
    blurb: "The electrical 'map' and the component 'manual', the two documents you'll live in.",
    html: `
      <p>A <strong>schematic</strong> is the map of a circuit. Symbols represent components; lines represent wires. Master these few habits and you'll read any map:</p>
      <ul>
        <li><strong>Wires that cross are not connected.</strong> Only a dot on the junction means connected.</li>
        <li><strong>Ground symbols</strong> are the return path; every ground symbol on a page is wired together (common ground).</li>
        <li><strong>Power rails</strong> are usually drawn as labeled arrows/ports (+5 V, VCC, GND) instead of miles of lines.</li>
        <li>Current flows from higher voltage to lower, from the battery, through parts, back to ground.</li>
      </ul>
      <p>Common symbols: resistor (zigzag), capacitor (two parallel plates), diode (triangle + bar, bar = cathode), transistor (line + arrow), op-amp (triangle), LED (diode + two arrows), ground (three lines).</p>
      <p>A <strong>datasheet</strong> is the manual for one component. When a part misbehaves, 90% of the time the answer lives here. What to check first:</p>
      <table>
        <tr><th>Spec</th><th>What it really means</th></tr>
        <tr><td>Absolute Maximum Ratings</td><td>Exceed these and the part dies. Voltage, current, temperature.</td></tr>
        <tr><td>Pinout diagram</td><td>Which physical pin is which; get this wrong and nothing works.</td></tr>
        <tr><td>V<sub>CC</sub> / supply range</td><td>What voltage(s) it will tolerate.</td></tr>
        <tr><td>Output current / sink-sourcing</td><td>How much load it can actually drive.</td></tr>
        <tr><td>Typical Application circuit</td><td>The recommended external parts; copy it first.</td></tr>
      </table>
      <blockquote><p><strong>Reading a datasheet is a skill, not knowledge.</strong> Don't read it end to end. Ask a question, like 'can this switch 3 A?', then jump to the exact table that answers it.</p></blockquote>
    `,
  },
];
