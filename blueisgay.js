// BLUEISGAY.js - Okay, just run it as "blueisgay.js (soundtrack).gbs" and then it will work.

// this is the place where we are pissing on the libraries. I hate libraries!
const { spawn } = require('child_process');
const fs = require('fs');
const readline = require('readline');

// Where the HELL are my Gameboy!
const BINARY_PATH = './SameBoy/build/bin/SameBoy.app/Contents/MacOS/SameBoy';
const ROM_PATH = process.argv[2];

if (!ROM_PATH) {
    console.error("You used it wrong bro... read the readme...");
    process.exit(1);
}

// Seriously, this is the part where I spawn the Sameboy binary. So it will run and we can actually listen up on these sweet tunes!
const sameboy = spawn(BINARY_PATH, [ROM_PATH]);
const rl = readline.createInterface({ input: sameboy.stdout });

// Basic instructions
console.log("I transcribe GAMEBOY into MIDI. Press Ctrl+C to save the MIDI after it is done playing.");

// The midi event lists
const events_1 = [];
const events_2 = [];
const events_3 = [];
const events_4 = [];

const TICKS_PER_MS = 0.96;
const START_TIME = Date.now();

function msToTicks(ms) {
    return Math.max(1, Math.floor(ms * TICKS_PER_MS));
}

function pushCC7(events, channel, ticks, vol) {
    events.push({ ticks, data: [0xB0 | channel, 0x07, Math.round((vol / 15) * 127)] });
}

function pushNoteOn(events, channel, ticks, pitch) {
    events.push({ ticks, data: [0x90 | channel, pitch, 100] });
}

function pushNoteOff(events, channel, ticks, pitch) {
    events.push({ ticks, data: [0x80 | channel, pitch, 0] });
}

let active_pitch_1 = null;
let note_start_time_1 = null;
let last_trig_1 = false;
let last_vol_1 = null;

let active_pitch_2 = null;
let note_start_time_2 = null;
let last_trig_2 = false;
let last_vol_2 = null;

let active_pitch_3 = null;
let note_start_time_3 = null;
let last_trig_3 = false;
let last_vol_3 = null;

let active_pitch_4 = null;
let note_start_time_4 = null;
let last_trig_4 = false;
let last_vol_4 = null;

rl.on('line', (line) => {
    if (!line.startsWith("APU_DUMP:")) return;

    const hex = line.split(":")[1];
    const now = Date.now();
    const ticks = msToTicks(now - START_TIME);

    // CHANNEL 1
        // Live volume from the appended current_volume field
        const live_vol_1 = parseInt(hex.substring(78, 80), 16);
        const is_muted = live_vol_1 === 0;

        // Frequency
        const GB1_freq_raw = parseInt(hex.substring(6, 8), 16);
        const GB1_trig_raw = parseInt(hex.substring(8, 10), 16);
        const frequency = ((GB1_trig_raw & 0x07) << 8) | GB1_freq_raw;
        const hz = 131072 / (2048 - frequency);
        const midiNote = (frequency > 0 && frequency < 2048) ? Math.round(12 * Math.log2(hz / 440) + 69) : null;

        const isTriggered = (GB1_trig_raw & 0x80) !== 0;
        const triggerJustPressed = isTriggered && !last_trig_1;
        last_trig_1 = isTriggered;

        if (triggerJustPressed || midiNote !== active_pitch_1) {
            if (active_pitch_1 !== null) {
                pushNoteOff(events_1, 0, ticks, active_pitch_1);
            }
            active_pitch_1 = is_muted ? null : midiNote;
            note_start_time_1 = now;
            if (active_pitch_1 !== null) {
                pushCC7(events_1, 0, ticks, live_vol_1);
                pushNoteOn(events_1, 0, ticks, active_pitch_1);
            }
        }

        if (live_vol_1 !== last_vol_1 && active_pitch_1 !== null) {
            pushCC7(events_1, 0, ticks, live_vol_1);
        }

        last_vol_1 = live_vol_1;

    // CHANNEL 2
        const live_vol_2 = parseInt(hex.substring(80, 82), 16);
        const is_muted_2 = live_vol_2 === 0;

        const GB2_freq_raw = parseInt(hex.substring(16, 18), 16);
        const GB2_trig_raw = parseInt(hex.substring(18, 20), 16);
        const frequency_2 = ((GB2_trig_raw & 0x07) << 8) | GB2_freq_raw;
        const hz_2 = 131072 / (2048 - frequency_2);
        const midiNote_2 = (frequency_2 > 0 && frequency_2 < 2048) ? Math.round(12 * Math.log2(hz_2 / 440) + 69) : null;

        const isTriggered_2 = (GB2_trig_raw & 0x80) !== 0;
        const triggerJustPressed_2 = isTriggered_2 && !last_trig_2;
        last_trig_2 = isTriggered_2;

        if (triggerJustPressed_2 || midiNote_2 !== active_pitch_2) {
            if (active_pitch_2 !== null) {
                pushNoteOff(events_2, 1, ticks, active_pitch_2);
            }
            active_pitch_2 = is_muted_2 ? null : midiNote_2;
            note_start_time_2 = now;
            if (active_pitch_2 !== null) {
                pushCC7(events_2, 1, ticks, live_vol_2);
                pushNoteOn(events_2, 1, ticks, active_pitch_2);
            }
        }

        if (live_vol_2 !== last_vol_2 && active_pitch_2 !== null) {
            pushCC7(events_2, 1, ticks, live_vol_2);
        }

        last_vol_2 = live_vol_2;

    // CHANNEL 3
        const NR32 = parseInt(hex.substring(24, 26), 16);
        const wave_vol_shift = (NR32 >> 5) & 0x03;
        const wave_vol = [0, 15, 7, 3][wave_vol_shift];
        const NR30 = parseInt(hex.substring(20, 22), 16);
        const wave_enabled = (NR30 & 0x80) !== 0;
        const is_muted_3 = wave_vol === 0 || !wave_enabled;

        const GB3_freq_raw = parseInt(hex.substring(26, 28), 16);
        const GB3_trig_raw = parseInt(hex.substring(28, 30), 16);
        const frequency_3 = ((GB3_trig_raw & 0x07) << 8) | GB3_freq_raw;
        const hz_3 = 65536 / (2048 - frequency_3);
        const midiNote_3 = (frequency_3 > 0 && frequency_3 < 2048) ? Math.round(12 * Math.log2(hz_3 / 440) + 69) : null;

        const isTriggered_3 = (GB3_trig_raw & 0x80) !== 0;
        const triggerJustPressed_3 = isTriggered_3 && !last_trig_3;
        last_trig_3 = isTriggered_3;

        if (triggerJustPressed_3 || midiNote_3 !== active_pitch_3) {
            if (active_pitch_3 !== null) {
                pushNoteOff(events_3, 2, ticks, active_pitch_3);
            }
            active_pitch_3 = is_muted_3 ? null : midiNote_3;
            note_start_time_3 = now;
            if (active_pitch_3 !== null) {
                pushCC7(events_3, 2, ticks, wave_vol);
                pushNoteOn(events_3, 2, ticks, active_pitch_3);
            }
        }

        if (wave_vol !== last_vol_3 && active_pitch_3 !== null) {
            pushCC7(events_3, 2, ticks, wave_vol);
        }

        last_vol_3 = wave_vol;

    // CHANNEL 4 (Noise)
        const live_vol_4 = parseInt(hex.substring(82, 84), 16);
        const is_muted_4 = live_vol_4 === 0;

        const GB4_trig_raw = parseInt(hex.substring(36, 38), 16);
        const isTriggered_4 = (GB4_trig_raw & 0x80) !== 0;
        const triggerJustPressed_4 = isTriggered_4 && !last_trig_4;
        last_trig_4 = isTriggered_4;

        if (triggerJustPressed_4 || is_muted_4 !== (active_pitch_4 === null)) {
            if (active_pitch_4 !== null) {
                pushNoteOff(events_4, 9, ticks, 38);
            }
            active_pitch_4 = is_muted_4 ? null : 38;
            note_start_time_4 = now;
            if (active_pitch_4 !== null) {
                pushCC7(events_4, 9, ticks, live_vol_4);
                pushNoteOn(events_4, 9, ticks, 38);
            }
        }

        if (live_vol_4 !== last_vol_4 && active_pitch_4 !== null) {
            pushCC7(events_4, 9, ticks, live_vol_4);
        }

        last_vol_4 = live_vol_4;
});




// And then finally, when the whole deal we made's over...
process.on('SIGINT', () => {
    try {
        const midiData = buildMidiFile([events_1, events_2, events_3, events_4]);
        fs.writeFileSync('gameboy_dump.mid', midiData);
        console.log("\nMIDI file saved successfully!");
    } catch (error) {
        console.error("\nError saving MIDI:", error);
        console.log("\nDang it, get yourself a GBS or something!");
    }

    process.exit();
});




// Raw MIDI file builder DO NOT TOUCH THIS BROTHER
function varLen(n) {
    // Encode a number as a MIDI variable-length quantity
    const bytes = [];
    bytes.unshift(n & 0x7F);
    n >>= 7;
    while (n > 0) {
        bytes.unshift((n & 0x7F) | 0x80);
        n >>= 7;
    }
    return bytes;
}

function buildTrack(events) {
    // Sort by tick, then encode delta times
    events.sort((a, b) => a.ticks - b.ticks);

    const bytes = [];
    let lastTick = 0;

    for (const event of events) {
        const delta = event.ticks - lastTick;
        lastTick = event.ticks;
        bytes.push(...varLen(delta));
        bytes.push(...event.data);
    }

    // End of track event
    bytes.push(0x00, 0xFF, 0x2F, 0x00);

    const header = [
        0x4D, 0x54, 0x72, 0x6B, // "MTrk"
        (bytes.length >> 24) & 0xFF,
        (bytes.length >> 16) & 0xFF,
        (bytes.length >> 8) & 0xFF,
        bytes.length & 0xFF,
    ];

    return Buffer.from([...header, ...bytes]);
}

function buildMidiFile(tracks) {
    const BPM = 120;
    const TICKS_PER_BEAT = 480;
    const MICROS_PER_BEAT = Math.round(60000000 / BPM);

    // Header chunk
    const header = Buffer.from([
        0x4D, 0x54, 0x68, 0x64, // "MThd"
        0x00, 0x00, 0x00, 0x06, // chunk length = 6
        0x00, 0x01,             // format 1
        0x00, tracks.length + 1,// number of tracks (tempo track + our tracks)
        (TICKS_PER_BEAT >> 8) & 0xFF, TICKS_PER_BEAT & 0xFF, // ticks per beat
    ]);

    // Tempo track
    const tempoEvents = [
        {
            ticks: 0,
            data: [
                0xFF, 0x51, 0x03,
                (MICROS_PER_BEAT >> 16) & 0xFF,
                (MICROS_PER_BEAT >> 8) & 0xFF,
                MICROS_PER_BEAT & 0xFF,
            ]
        },
        {
            ticks: 0,
            data: [0xFF, 0x58, 0x04, 0x04, 0x02, 0x18, 0x08] // 4/4 time signature
        }
    ];
    const tempoTrack = buildTrack(tempoEvents);

    const trackBuffers = tracks.map(buildTrack);

    return Buffer.concat([header, tempoTrack, ...trackBuffers]);
}