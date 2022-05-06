var looperConfig = {
    clock: {
        start: 0,
        prevBeat: 0,
        curBeat: 0,
        beatsPerBar: 4,
        barsPerLoop: 2,
        beatLen: 1000,
    },
    sliders: {
        beatLen: 20
    },
    knobs: { // keeps track of the last known position of the physical knobs on the keyboard
        volume: 0,
        pitchBend: 0,
        modulation: 0,

    },
    instruments: {
        alpha: {
            source:'sawtooth',
            env: {
                attack: .01,
                release: .3,
            },
            filter  : {
                type      : 'lowpass', 
                frequency : 300,
                // env : { attack: .01 }
            },
        },
        ALPHA: {
            source:'sawtooth',
            env: {
                attack: .01,
                release: .3,
            },
            filter  : {
                type      : 'lowpass', 
                frequency : 300,
                // env : { attack: .01 }
            },
        },
        beta: {
			volume: .01,
            source:'sine',
            env: {
                attack: .01,
                release: .3,
            },
            filter  : {
                type      : 'lowpass', 
                frequency : 900,
                // env : { attack: .01 }
            },
        },
        BETA: {
            source:'square',
            env: {
                attack: .01,
                release: .3,
            },
            filter  : {
                type      : 'lowpass', 
                frequency : 300,
                // env : { attack: .01 }
            },
        },
        gamma: {
            source:'sawtooth',
            env: {
                attack: .01,
                release: .3,
            },
            filter  : {
                type      : 'lowpass', 
                frequency : 300,
                // env : { attack: .01 }
            },
        },
        GAMMA: {
            source:'sawtooth',
            env: {
                attack: .01,
                release: .3,
            },
            filter  : {
                type      : 'lowpass', 
                frequency : 300,
                // env : { attack: .01 }
            },
        },
        delta: {
			pedal: { 
				source: 'audio/kick.mp3',
				filter: {
					type: 'lowpass',
					frequency: 600
				},
				volume: .5,
				
			},
			c1: { 
				source: 'audio/hatClosed.wav',
				volume: .4,
			},
            db1: {
				source: 'audio/snare.wav',
				volume: .4,
			},
            d1: { 
				source: 'audio/hatOpen.wav', 
				volume: .4,
			},
            eb1: {
				source: 'audio/snare.wav', 
				volume: .4,
			},
            e1: {
				source: 'audio/crash.wav', 
				volume: .4,
			},
            f1: {
				source: 'audio/lowTom.wav', 
				volume: .4,
			},
            g1: {
				source: 'audio/midTom.wav', 
				volume: .4,
			},
            a1: {
				source: 'audio/highTom.wav', 
				volume: .4,
			},
            b1: {
				source: 'audio/cowbell.wav', 
				volume: .4,
			},
        },
        epsilon: { 
            source : 'mic',
            filter : {
                type : 'lowpass',
                frequency : 400
            },
			delay : {
				delayTime: .1,
				maxDelayTime: 10,
				feedback : .5,
				wet      : 0
			},
            panning: 0,

            tuna: {
                // Delay: {
                //     feedback: 0.45,    //0 to 1+
                //     delayTime: 150,    //1 to 10000 milliseconds
                //     wetLevel: 0.45,    //0 to 1+
                //     dryLevel: 1,       //0 to 1+
                //     cutoff: 2000,      //cutoff frequency of the built in lowpass-filter. 20 to 22050
                //     bypass: 0
                // },

                // it sounds like i'm under water
                // WahWah: {
                //     automode: true,                //true/false
                //     baseFrequency: 0.5,            //0 to 1
                //     excursionOctaves: 2,           //1 to 6
                //     sweep: 0.2,                    //0 to 1
                //     resonance: 10,                 //1 to 100
                //     sensitivity: 0.5,              //-1 to 1
                //     bypass: 0
                // },
                // Bitcrusher:{
                //     bits: 16,          //1 to 16
                //     normfreq: 0.1,    //0 to 1
                //     bufferSize: 256  //256 to 16384 // it gets slow when this number is high
                // },

            }
    
        },
        EPSILON: { 
            source : 'mic',
            filter : {
                type : 'highpass',
                frequency : 900
            },
            // delay : {
            //     delayTime: 1,
            //     maxDelayTime: 20,
            //     feedback : 1,
            //     wet      : 1
            // },
            panning: 0,

            tuna: {
                // Delay: {
                //     feedback: 0.45,    //0 to 1+
                //     delayTime: 150,    //1 to 10000 milliseconds
                //     wetLevel: 0.45,    //0 to 1+
                //     dryLevel: 1,       //0 to 1+
                //     cutoff: 2000,      //cutoff frequency of the built in lowpass-filter. 20 to 22050
                //     bypass: 0
                // },

                // it sounds like i'm under water
                // WahWah: {
                //     automode: true,                //true/false
                //     baseFrequency: 0.5,            //0 to 1
                //     excursionOctaves: 2,           //1 to 6
                //     sweep: 0.2,                    //0 to 1
                //     resonance: 10,                 //1 to 100
                //     sensitivity: 0.5,              //-1 to 1
                //     bypass: 0
                // },
                // Bitcrusher:{
                //     bits: 16,          //1 to 16
                //     normfreq: 0.1,    //0 to 1
                //     bufferSize: 256  //256 to 16384 // it gets slow when this number is high
                // },

            }
    
        },
        metronome: null,
    },
    activeInstrument: 'alpha',
    config: {
        numLoopTracks: 7,
        metronomeIsEnabled : false,
        metronomeDuration: null, // how many measures to play the metronome for. Will play indefinitely if set to a falsey value
    },
    currentTab: 'instruments'
}
