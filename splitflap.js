/*
Solari Split Flap Display Reference: https://www.youtube.com/watch?v=8iGczCSIi90
This code was influenced by: Jaume Sanchez Elias's https://github.com/spite/SolariDisplay
*/
var SFD = SFD || {};

/*
    config.flaps = ['A', 'B', ...];
    config.parent = ... a div or other element
*/
SFD.Segment = function(config) {

    var _config = config;
    /** letter we are 'seeking' */
    var _target = null;
    /** current angle of the flap */
    var _angle = 0;
    /** character shown at the top */
    var _valueTop = ' ';
    /** character shown at the bottom */
    var _valueBottom = ' ';
    var _fallFrom = 180.0;
    /** angle per update() that _angle changes */
    var _angleDeltaPerUpdate = -30.0;

    /** container for everything; no content of its own */
    var _div = document.createElement('div');
    /** the flap which rotates in 3d */
    var _flap = document.createElement('div');
    /** child of _flap, to be able to independently transform content */
    var _flapContent = document.createElement('div');
    /** the top half of the display; stays still but content changes */
    var _halfTop  = document.createElement('div');
    /** bottom half of the display; stays still but content changes */
    var _halfBottom = document.createElement('div');

    function _init() {
        _target = _valueTop = _valueBottom = _config.flaps[0];

        _div.className = 'sfd_segment';
        _flap.className = 'sfd_segment_flap';
        _halfTop.className = 'sfd_half_top';
        _halfBottom.className = 'sfd_half_bottom';
        _div.appendChild(_halfTop);
        _div.appendChild(_halfBottom);
        _div.appendChild(_flap);
        _flap.appendChild(_flapContent);
        _config.parent.appendChild(_div);

        _update();
    }

    function _characterIsFlap(ch) {
        for( var j = 0; j < _config.flaps.length; j++ ) {
            var v = _config.flaps[j];
            if (v == ch) {
                return true;
            }
        }
        return false;
    }

    function _setCharacter(ch) {
        if (!_characterIsFlap(ch)) {
            console.error('Ignoring character not found in flaps: ' + ch);
            return;
        }
        _target = ch;
    }

    function _characterAfter(ch) {
        for( var j = 0; j < _config.flaps.length; j++ ) {
            var v = _config.flaps[j];
            if (v == ch) {
                if (j + 1 == _config.flaps.length) {
                    return _config.flaps[0];
                }
                else {
                    return _config.flaps[j + 1];
                }
            }
        }
        console.error("Couldn't find character: " + ch);
        return null;
    }

    function _update() {
        if (_angle == 0.0 && _target == _valueTop) {
            return; // nothing to do; we are at rest
        }

        _flapContent.style.lineHeight = '0px';

        if (_angle > 0) {
            _angle += _angleDeltaPerUpdate;
            if (_angle <= 0.0) {
                _angle = 0.0;
            }
            if (_angle < _fallFrom/2) {
                _flapContent.innerText = _valueTop;
            }
        }
        if (_angle == 0.0 && _valueTop != _target) {
            _angle = _fallFrom; // start the next flip
            _valueBottom = _valueTop;
            _valueTop = _characterAfter(_valueTop);

            _halfTop.innerText = _valueTop;
            _halfBottom.innerText = _valueBottom;
            _flapContent.innerText = _valueBottom;
        }
        // update style for angle
        if (_angle >= _fallFrom/2) { // top half of the fall
            _flap.style.transform =
                'translateZ(0.1px) '+
                'rotateX(' + (-(_fallFrom - _angle)) + 'deg) '+
                '';
            _flapContent.style.transform = '';
            _flapContent.style.lineHeight = '120px';
        } else {
            _flap.style.transform = 
                'translateZ(0.1px) ' +
                'rotateX(' + (-(_fallFrom - _angle)) + 'deg) '
                ;
            _flapContent.style.transform = 'scaleY(-1)';
            _flapContent.style.lineHeight = '0px';
        }
        var w = Math.round(Math.sin((_angle * 1.0) * Math.PI/180.0) * 255.0) * 0.25;
        _flapContent.style.backgroundColor = 'rgb('+w+','+w+','+w+')';
        // console.log(_config.index + ' angle=' + _angle + ' _current=('+_valueBottom + ') _next=('+_valueTop+')')
    }

    _init();

    return {
        setCharacter: _setCharacter,
        update: _update,
        div: _div
    };
};

/*
    config.numberOfSegments
*/
SFD.SegmentGroup = function(config) {

    var _config = config,
        _segments = [];
    var _div = document.createElement('div');

    function _init() {

        for( var j = 0; j < _config.numberOfSegments; j++ ) {
            var segment = new SFD.Segment({
                index: j,
                parent: _div,
                flaps: _config.flaps
            });
            _segments.push(segment);
        }

        _config.parent.appendChild(_div);
        _update();
    }

    function _setText(text) {
		for( var j = 0; j < _config.numberOfSegments; j++ ) {
            if (j < text.length) {
                var val = text[ j ];
                _segments[ j ].setCharacter( val );
            } else {
                _segments[ j ].setCharacter(' ');
            }
		}
    }

    function _update() {
        window.requestAnimationFrame( _update );
        for( var j = 0; j < _segments.length; j++ ) {
			_segments[ j ].update();
		}
    }

    _init();

    return {
        setText: _setText,
        update: _update
    };
};

SFD.Flaps = {
    Alpha: [' ', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'],
    Digits: ['1','2','3','4','5','6','7','8','9','0']
};
