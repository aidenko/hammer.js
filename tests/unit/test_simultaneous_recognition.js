var el,
    hammer;

module('Simultaenous recognition', {

    setup: function () {

        el = document.createElement('div');

        document.body.appendChild(el);

    },
    teardown: function () {
        document.body.removeChild(el);
        hammer && hammer.destroy();
    }

});
asyncTest("should pinch and pan simultaneously be recognized when enabled", function () {

    expect(4);

    var panCount = 0,
        pinchCount = 0;
    hammer = new Hammer.Manager(el, {
        touchAction: 'none'
    });

    hammer.add(new Hammer.Pan({threshold: 5, pointers: 2}));

    var pinch = new Hammer.Pinch({ threshold: 0, pointers: 2});
    hammer.add(pinch);
    pinch.recognizeWith(hammer.get('pan'));

    hammer.on('panend', function () {
        panCount++;
    });
    hammer.on('pinchend', function () {
        pinchCount++;
    });

    var executeGesture = function (cb) {
        var event, touches;

        touches = [
            {clientX: 0, clientY: 10, identifier: 0 },
            {clientX: 10, clientY: 10, identifier: 1 }
        ];

        event = document.createEvent('Event');
        event.initEvent('touchstart', true, true);
        event.touches = touches;
        event.targetTouches = touches;
        event.changedTouches = touches;

        setTimeout(function() {
            touches = [
                {clientX: 10, clientY: 20, identifier: 0 },
                {clientX: 20, clientY: 20, identifier: 1 }
            ];

            event = document.createEvent('Event');
            event.initEvent('touchmove', true, true);
            event.touches = touches;
            event.targetTouches = touches;
            event.changedTouches = touches;

            el.dispatchEvent(event);
        }, 100);

        setTimeout(function() {
            start();
            touches = [
                {clientX: 20, clientY: 30, identifier: 0 },
                {clientX: 40, clientY: 30, identifier: 1 }
            ];

            event = document.createEvent('Event');
            event.initEvent('touchmove', true, true);
            event.touches = touches;
            event.targetTouches = touches;
            event.changedTouches = touches;

            el.dispatchEvent(event);

            event = document.createEvent('Event');
            event.initEvent('touchend', true, true);
            event.touches = touches;
            event.targetTouches = touches;
            event.changedTouches = touches;

            el.dispatchEvent(event);

            cb();
        }, 200);


    };

    // 2 gesture will be recognized
    executeGesture(function() {
        equal(panCount, 1);
        equal(pinchCount, 1);

        pinch.dropRecognizeWith(hammer.get('pan'));
        stop();

        // only the pan gesture will be recognized
        executeGesture(function() {
            equal(panCount, 2);
            equal(pinchCount, 1);
        });
    });



});

test("the first gesture should block the following gestures (Tap & DoubleTap)", function () {
    expect(4);
    var tapCount = 0,
        doubleTapCount = 0;

    hammer = new Hammer.Manager(el, {
        touchAction: 'none'
    });

    var tap = new Hammer.Tap();
    var doubleTap = new Hammer.Tap({event: 'doubletap', taps: 2});

    hammer.add(tap);
    hammer.add(doubleTap);

    hammer.on('tap', function () {
        tapCount++;
    });
    hammer.on('doubletap', function () {
        doubleTapCount++;
    });


    testUtils.dispatchTouchEvent(el, 'start', 0, 10);
    testUtils.dispatchTouchEvent(el, 'end', 0, 10);
    testUtils.dispatchTouchEvent(el, 'start', 0, 10);
    testUtils.dispatchTouchEvent(el, 'end', 0, 10);

    equal(tapCount, 2, 'on a double tap gesture, the tap gesture is recognized twice');
    equal(doubleTapCount, 0, 'double tap gesture is not recognized because the prior tap gesture does not recognize it simultaneously');

    doubleTap.recognizeWith(hammer.get('tap'));

    testUtils.dispatchTouchEvent(el, 'start', 0, 10);
    testUtils.dispatchTouchEvent(el, 'end', 0, 10);
    testUtils.dispatchTouchEvent(el, 'start', 0, 10);
    testUtils.dispatchTouchEvent(el, 'end', 0, 10);

    equal(tapCount, 4);
    equal(doubleTapCount, 1, 'when the tap gesture is configured to work simultaneously, tap & doubleTap can be recognized simultaneously');
});

test("when disabled, the first gesture should not block gestures  (Tap & DoubleTap )", function () {

    expect(4);
    var tapCount = 0,
        doubleTapCount = 0;

    hammer = new Hammer.Manager(el, {
        touchAction: 'none'
    });

    var tap = new Hammer.Tap();
    var doubleTap = new Hammer.Tap({event: 'doubletap', taps: 2});

    hammer.add(tap);
    hammer.add(doubleTap);

    hammer.on('tap', function () {
        tapCount++;
    });
    hammer.on('doubletap', function () {
        doubleTapCount++;
    });


    testUtils.dispatchTouchEvent(el, 'start', 0, 10);
    testUtils.dispatchTouchEvent(el, 'end', 0, 10);
    testUtils.dispatchTouchEvent(el, 'start', 0, 10);
    testUtils.dispatchTouchEvent(el, 'end', 0, 10);

    equal(tapCount, 2, 'on a double tap gesture, the tap gesture is recognized twice');
    equal(doubleTapCount, 0, 'double tap gesture is not recognized because the prior tap gesture does not recognize it simultaneously');


    hammer.get('tap').set('enable', false);

    testUtils.dispatchTouchEvent(el, 'start', 0, 10);
    testUtils.dispatchTouchEvent(el, 'end', 0, 10);
    testUtils.dispatchTouchEvent(el, 'start', 0, 10);
    testUtils.dispatchTouchEvent(el, 'end', 0, 10);

    equal(tapCount, 2, 'tap gesture should not be recognized when the recognizer is disabled');
    equal(doubleTapCount, 1, 'when the tap gesture is disabled, doubleTap can be recognized');
});

test("the first gesture should block the following gestures (DoubleTap & Tap)", function() {
    expect(4);
    var tapCount = 0,
        doubleTapCount = 0;

    hammer = new Hammer.Manager(el, {
        touchAction: 'none'
    });

    var tap = new Hammer.Tap();
    var doubleTap = new Hammer.Tap({event: 'doubletap', taps: 2});

    hammer.add(doubleTap);
    hammer.add(tap);

    hammer.on('tap', function() {
      tapCount++;
    });
    hammer.on('doubletap', function() {
      doubleTapCount++;
    });

    testUtils.dispatchTouchEvent(el, 'start', 0, 10);
    testUtils.dispatchTouchEvent(el, 'end', 0, 10);
    testUtils.dispatchTouchEvent(el, 'start', 0, 10);
    testUtils.dispatchTouchEvent(el, 'end', 0, 10);

    equal(doubleTapCount, 1, 'double tap is recognized because it is configured at the beggining');
    equal(tapCount, 0, 'tap gesture are blocked by doubleTap');

    doubleTap.recognizeWith( hammer.get('tap') );

    testUtils.dispatchTouchEvent(el, 'start', 0, 10);
    testUtils.dispatchTouchEvent(el, 'end', 0, 10);
    testUtils.dispatchTouchEvent(el, 'start', 0, 10);
    testUtils.dispatchTouchEvent(el, 'end', 0, 10);

    equal(doubleTapCount, 2 );
    equal(tapCount, 2, 'when the tap gesture is configured to work simultaneously, tap & doubleTap can be recognized simultaneously');

});

