
var tick = new Wad({source:'audio/hatClosed.wav'})
var mainVm = new Vue({
    el: '#vue-root',
    data: {
        ls: {
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
                    source:'square',
                    env: {
                        attack: .01,
                        release: .3,
                    },
                    filter  : {
                        type      : 'lowpass', 
                        // env : { attack: .01 }
                    },
                },
                beta: '4'
            }
        }, // (L)ocal (S)torage data
        instruments : {
            alpha: null,
            beta : null,
            gamma : null,
            delta: null,
            epsilon: null,
        }

    },
    created: function(){
        var thatVm = this
        window.addEventListener('beforeunload', thatVm.beforeunload)
        // if ( localStorage.loopData ) {
        //     thatVm.ls = JSON.parse(localStorage.loopData)
        // }
        thatVm.instruments.alpha = new Wad(thatVm.ls.instruments.alpha)
        console.log(Wad.midiInputs)
        Wad.midiInputs[0].onmidimessage = this.midiRig88

    },
    computed: {
        beatBoxWidth: function(){
            return (100 / this.ls.clock.beatsPerBar) + '%'
        },
        beatsPerLoop: function(){
            return this.ls.clock.beatsPerBar * this.ls.clock.barsPerLoop
        },
    },
    methods: {
        midiRig88 : function(event){
            // console.log(event.receivedTime, event.data)
            var thatVm = this
            if ( event.data[0] === 128 ) {
                thatVm.instruments.alpha.stop(Wad.pitchesArray[event.data[1]-12])
            }
            else if ( event.data[0] === 144 ) { // 144 means the midi message has note data

                if ( event.data[2] === 0 ) { // noteOn velocity of 0 means this is actually a noteOff message
                    // console.log('|| stopping note: ', Wad.pitchesArray[event.data[1]-12])
                    thatVm.instruments.alpha.stop(Wad.pitchesArray[event.data[1]-12])
                }
                else if ( event.data[2] > 0 ) {
                    // console.log('> playing note: ', Wad.pitchesArray[event.data[1]-12])
                    var detune = ( event.data[2] - 64 ) * ( 100 / 64 ) * 12
                    thatVm.instruments.alpha.play({pitch : Wad.pitchesArray[event.data[1]-12], label : Wad.pitchesArray[event.data[1]-12], detune : thatVm.ls.knobs.detune, callback : function(that){
                    }})
                }
            }
            // else if ( event.data[0] === 176 ) { // 176 means the midi message has controller data
            //     console.log('controller')
            //     if ( event.data[1] == 64 ) {
            //         if ( event.data[2] == 127 ) { looper.add(mt) ; console.log('on')}
            //         else if ( event.data[2] == 0 ) { looper.remove(mt); console.log('off')}
            //     }
            // }
            else if ( event.data[0] === 224 ) { // 224 means the midi message has pitch bend data
                console.log('pitch bend')
                console.log( ( event.data[2] - 64 ) * ( 100 / 64 ) )
                thatVm.instruments.alpha.setDetune( ( event.data[2] - 64 ) * ( 100 / 64 ) * 12 )
                thatVm.ls.knobs.detune = ( event.data[2] - 64 ) * ( 100 / 64 ) * 12
            }
        },
        beforeunload: function(){
            localStorage.loopData = JSON.stringify(this.ls)
        },
        startClock: function(){
            if ( this.rafID ) {
                cancelAnimationFrame(this.rafID)
            }
            this.ls.clock.start = performance.now() + 1000
            this.animateFrame()
        },
        stopClock: function(){
            if ( this.rafID ) {
                cancelAnimationFrame(this.rafID)
            }
        },
        play: function(instrument){
            this.instruments[instrument].play()
        },
        resetApp: function(){
            localStorage.loopData = ''
            window.removeEventListener('beforeunload', this.beforeunload)
            window.location.reload()
        },
        changeSource: function(which, event){
            console.log(mainVm.instruments[which].source) 
            mainVm.instruments[which].source = event.target.value
        },
        animateFrame: function(){
            var now = performance.now()
            var clock = this.ls.clock
            var beatsPerLoop = clock.beatsPerBar * clock.barsPerLoop
            var progressInBeat = ( ( ( now - clock.start ) % clock.beatLen ) / clock.beatLen )
            var progressInLoop = ( ( ( now - clock.start ) % ( clock.beatLen * beatsPerLoop ) ) / ( clock.beatLen * beatsPerLoop ) )
            // console.log(Math.floor(progressInLoop / 0.0625) + 1)
            clock.prevBeat = clock.curBeat
            clock.curBeat = Math.floor(progressInLoop / ( 1 / beatsPerLoop )) + 1
            // console.log(progressInBeat)
            if ( clock.curBeat > 0 ) {
                if ( clock.curBeat < clock.prevBeat ) {
                    // first tic of first beat of loop
                    console.log('fire!')
                }
                if ( clock.curBeat != clock.prevBeat ) {
                    console.log('beat!',clock.curBeat)
                    tick.play()
                }
                if      ( Math.floor(progressInLoop / ( 1 / beatsPerLoop )) > 0 ) {
                    // console.log(Math.floor(progressInLoop / ( 1 / beatsPerLoop )) )
                    // not first beat of loop
                }
                else if ( Math.floor(progressInLoop / ( 1 / beatsPerLoop )) === 0 ) {
                    // first beat of loop
                    // console.log(this.curBeat)
                }

            }
            this.rafID = requestAnimationFrame(this.animateFrame)
        }
    },
    watch: {
        'ls.sliders.beatLen' : function(val){
            console.log(val)
            this.ls.clock.beatLen = val * val
        }
    }
})