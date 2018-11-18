
var tick = new Wad({source:'audio/hatClosed.wav'})
var mainVm = new Vue({
    el: '#vue-root',
    data: {
        ls: {}, // (L)ocal (S)torage data
        clock: {
            start: 0,

        },
        prevBeat: 0,
        curBeat: 0,
        beatsPerBar: 4,
        barsPerLoop: 2,
        beatLen: 1000,

    },
    created: function(){
    },
    computed: {
        beatBoxWidth: function(){
            return (100 / this.beatsPerBar) + '%'
        },
        beatsPerLoop: function(){
            return this.beatsPerBar * this.barsPerLoop
        },
    },
    methods: {
        startClock: function(){
            this.clock.start = performance.now() + 1000
            this.animateFrame()
        },

        animateFrame: function(){
            var now = performance.now()
            var beatsPerLoop = this.beatsPerBar * this.barsPerLoop
            var progressInBeat = ( ( ( now - this.clock.start ) % this.beatLen ) / this.beatLen )
            var progressInLoop = ( ( ( now - this.clock.start ) % ( this.beatLen * this.beatsPerLoop ) ) / ( this.beatLen * this.beatsPerLoop ) )
            // console.log(Math.floor(progressInLoop / 0.0625) + 1)
            this.prevBeat = this.curBeat
            this.curBeat = Math.floor(progressInLoop / ( 1 / this.beatsPerLoop )) + 1
            // console.log(progressInBeat)
            if ( this.curBeat > 0 ) {
                if ( this.curBeat < this.prevBeat ) {
                    // first tic of first beat of loop
                    console.log('fire!')
                }
                if ( this.curBeat != this.prevBeat ) {
                    console.log('beat!', this.curBeat)
                    tick.play()
                }
                if      ( Math.floor(progressInLoop / ( 1 / this.beatsPerLoop )) > 0 ) {
                    // console.log(Math.floor(progressInLoop / ( 1 / beatsPerLoop )) )
                    // not first beat of loop
                }
                else if ( Math.floor(progressInLoop / ( 1 / this.beatsPerLoop )) === 0 ) {
                    // first beat of loop
                    // console.log(this.curBeat)
                }

            }
            this.rafID = requestAnimationFrame(this.animateFrame)
        }
    }
})