/**
 * Class representing the view of chess pieces in DHTML Chess.
 * Instances of this class are created dynamically by chess.view.Board
 * @module View
 * @submodule Board
 * @namespace chess.view.board
 * @class Piece
 * @extends Core
 */
ludo_CHESS_PIECE_GLOBAL_Z_INDEX = 200;
chess.view.board.Piece = new Class({
    Extends: ludo.Core,
    type: 'chess.view.board.Piece',
    /**
     Color of piece, "white" or "black"
     @config {String} color
     @default "white"
     */
    color: 'white',
    pieceLayout: 'alpha',
    size: null,
    validSizes: [30, 45, 60, 75, 90, 105],
    /**
     * 0x88 board position of piece
     * @config {Number} square
     */
    square: undefined,
    el: null,
    flipped: false,
    toSquare: null,
    board: undefined,
    ddEnabled: false,
    aniDuration: .25,
    /**
     Type of piece
     @config {String} pieceType
     @example
     pieceType:'n'
     */
    pieceType: 'p',
    dd: {
        active: false,
        el: {x: 0, y: 0},
        mouse: {x: 0, y: 0}
    },
    internal: {
        files: {
            a: 0, b: 1, c: 2, d: 3, e: 4, f: 5, g: 6, h: 7
        }
    },

    validTargetSquares: [],

    svg: false,
    extension: 'pgn',

    __construct: function (config) {
        this.parent(config);
        this.square = config.square;
        this.setPieceLayout(config.pieceLayout);
        this.numSquare = config.numSquare;
        this.flipped = config.flipped;
        this.pieceType = config.pieceType;
        this.color = config.color;
        this.board = config.board;
        this.aniDuration = config.aniDuration != undefined ? config.aniDuration : this.aniDuration;

        this.createDOM();
        this.resize(30);
        this.position();
    },


    setPieceLayout:function(layout){
        this.pieceLayout = layout;
        this.svg = this.pieceLayout.indexOf('svg') === 0;
        this.extension = this.svg ? 'svg' : 'png';
        this.bgUpdated = false;
        if(this.el){
            this.updateBackgroundImage();
        }
    },

    /**
     * Create DOM elements for the chess piece
     * @method createDOM
     * @private
     */
    createDOM: function () {
        var el = this.el = jQuery('<div>');
        el.css({
            'position': 'absolute',
            padding: 0,
            margin: 0,
            borders: 0,
            width: '12.5%',
            height: '12.5%',
            'z-index': 200,
            overflow: 'hidden'
        });

        el.mouseenter(this.mouseEnterPiece.bind(this));
        el.mouseleave(this.mouseLeavePiece.bind(this));

        el.on(ludo.util.getDragStartEvent(), this.initDragPiece.bind(this));

        el.addClass('dhtml-chess-piece');
        this.position();

    },
    /**
     * Method executed when mouse enters a chess piece
     * @method mouseEnterPiece
     * @private
     */
    mouseEnterPiece: function () {
        this.fireEvent('mouseenter', this)
    },
    /**
     * Method executed when mouse leaves a chess piece
     * @method mouseLeavePiece
     * @private
     */
    mouseLeavePiece: function () {
        this.fireEvent('mouseleave', this)
    },

    /**
     * Disable drag and drop for the chess piece. This will set the internal ddEnabled property to
     * false and reset cursor to arrow.
     * @method disableDragAndDrop
     */
    disableDragAndDrop: function () {
        this.ddEnabled = false;
        this.el.css('cursor', 'default');
    },
    /**
     * Enable drag and drop for the chess piece. This will set the internal ddEnabled property to true
     * and update the cursor to a pointer/hand.
     * @method enableDragAndDrop
     */
    enableDragAndDrop: function () {
        this.ddEnabled = true;
        this.el.css('cursor', 'pointer');
    },
    /**
     * Returns true if chess piece is currently on board.
     * @method isVisible
     * @return {Boolean}
     */
    isVisible: function () {
        return this.el.css('display') !== 'none';
    },
    /**
     * Hide the chess piece
     * @method hide
     */
    hide: function () {

        this.el.css('display', 'none');
    },
    /**
     * Show the chess piece
     * @method show
     */
    show: function () {
        this.el.css('display', '');
    },
    /**
     * Start dragging a chess piece
     * @method initDragPiece
     * @param {Event} e
     * @return {Boolean|undefined}
     * @private
     */
    initDragPiece: function (e) {

        if (this.ddEnabled) {
            this.increaseZIndex();
            this.validTargetSquares = this.board.getValidMovesForPiece(this);
            this.fireEvent('initdrag', this);
            var pos = this.el.position();
            this.el.css({
                left: pos.left,
                top : pos.top
            });
            var p = ludo.util.pageXY(e);
            this.dd = {
                active: true,
                mouse: {x: p.pageX, y: p.pageY},
                el: {x: pos.left, y: pos.top},
                current: ludo.util.pageXY(e)
            };
            return false;
        }
        return undefined;
    },

    /**
     * Method executed when dragging has started and mouse moves
     * @method dragPiece
     * @param {Event} e
     * @return {Boolean|undefined}
     * @private
     */
    dragPiece: function (e) {
        if (this.dd.active === true) {
            var d = this.dd;
            var p = ludo.util.pageXY(e);
            d.current = p;
            this.el.css(
                {
                    left: (p.pageX + d.el.x - d.mouse.x) + 'px',
                    top: (p.pageY + d.el.y - d.mouse.y) + 'px'
                }
            );

            return false;
        }
        return undefined;
    },
    /**
     * Stop dragging the chess piece.
     * @method stopDragPiece
     * @private
     */
    stopDragPiece: function () {
        var d = this.dd;
        if (d.active) {
            var coords = {
                x: d.current.pageX + d.el.x - d.mouse.x,
                y: d.current.pageY + d.el.y - d.mouse.y
            };

            var square = this.getSquareByCoordinates(
                coords.x,
                coords.y
            );

            if (this.validTargetSquares.indexOf(square) >= 0) {
                this.position(square);
                this.fireEvent('move', {
                    from: Board0x88Config.numberToSquareMapping[this.square],
                    to: Board0x88Config.numberToSquareMapping[square]
                });
            } else {
                this.position();
            }
            d.active = false;
        }
    },
    /**
     * Return 0x88 square by screen coordinates
     * @method getSquareByCoordinates
     * @param {Number} x
     * @param {Number} y
     * @return {Number}
     * @private
     */
    getSquareByCoordinates: function (x, y) {
        var s = this.board.squareSize;
        x += s / 2;
        y += s / 2;

        x = Math.max(0, x);
        y = Math.max(0, y);

        x = Math.min(s * 8, x);
        y = Math.min(s * 8, y);

        x = Math.floor(x / s);
        y = Math.floor(8 - (y / s));
        if (this.isFlipped()) {
            x = 7 - x;
            y = 7 - y;
        }
        return x + y * 16;
    },
    /**
     * Return square of piece
     * @method getSquare
     * @return {String} square
     */
    getSquare: function () {
        return this.square;
    },

    /**
     Promote piece to this type
     @method promote
     @param {String} toType
     @example
     piece.promote('q');
     */
    promote: function (toType) {
        this.pieceType = toType;
        this.updateBackgroundImage();
    },
    bgUpdated: false,
    /**
     * Update background image of piece when piece type is set or changed and when size of square is changed.
     * @method updateBackgroundImage
     * @private
     */
    updateBackgroundImage: function () {

        var s = this.svg ? 45 : this.size;

        var c = this.getColorCode() + this.getTypeCode();

        if (this.svg && c === this.bgUpdated) {

        } else {
            this.el.css('background-image', 'url(' + ludo.config.getDocumentRoot() + '/images/' + this.pieceLayout + s + this.getColorCode() + this.getTypeCode() + '.' + this.extension + ')');
        }

        if (this.svg && !this.bgUpdated) {
            this.el.css({
                'background-size' :'100% 100%',
                '-moz-background-size': 'cover',
                '-o-background-size': 'cover',
                '-webkit-background-size' :'cover'

            });
        }
        this.bgUpdated = c;
    },

    /**
     * Resize piece
     * @method resize
     * @param {Number} squareSize
     */
    resize: function (squareSize) {
        if(this.svg){
            this.size = squareSize;
            this.updateBackgroundImage();
            return;
        }
        var vs = this.validSizes;
        if (squareSize < vs[0]) {
            squareSize = vs[0];
        }
        if (squareSize > vs[vs.length - 1]) {
            squareSize = vs[vs - 1];
        }

        var tmpSquareSize = squareSize * 1.1;
        var pieceSize = tmpSquareSize - tmpSquareSize % 15;

        if (pieceSize != this.size) {
            this.size = pieceSize;
            this.updateBackgroundImage();
        }
    },

    /**
     * Position piece on board by 0x88 board square coordinate
     * @method position
     * @param {Number} square
     * @optional
     */
    position: function (square) {
        var pos = this.getPos(square);

        this.el.css({
            'left': pos.x,
            'top': pos.y
        });


    },

    /**
     * Move piece on board to square
     * @method playMove
     * @param {String} toSquare
     */
    playMove: function (toSquare) {
        toSquare = Board0x88Config.mapping[toSquare];

        if (this.isAlreadyOnSquare(toSquare)) {
            this.toSquare = toSquare;
            this.animationComplete();
        } else {
            var posTo = this.getPosOfSquare(toSquare);
            this.increaseZIndex();
            this.el.animate({
                top: posTo.y + '%',
                left: posTo.x + '%'
            }, this.aniDuration * 1000, this.animationComplete.bind(this));
            this.toSquare = toSquare;
        }
    },

    /**
     * Returns true if piece is already on a given 0x88 square number
     * @method isAlreadyOnSquare
     * @param {Number} square
     * @return {Boolean}
     * @private
     */
    isAlreadyOnSquare: function (square) {
        var pos = this.getPos(square);
        return pos.x == this.el[0].style.left && pos.y === this.el[0].style.top;
    },
    /**
     * Move piece to front
     * @method increaseZindex
     * @private
     */
    increaseZIndex: function () {
        ludo_CHESS_PIECE_GLOBAL_Z_INDEX++;
        this.el.css('zIndex', ludo_CHESS_PIECE_GLOBAL_Z_INDEX);
    },
    /**
     * Method executed when move animation is complete
     * @method animationComplete
     * @private
     */
    animationComplete: function () {
        this.fireEvent('animationComplete', {
            from: this.square,
            to: this.toSquare
        });
        this.square = this.toSquare;
    },
    /**
     Return x and y coordinate by 0x88 square number
     @method getPos
     @param {Number} square
     @return {Object}
     @example
     var pos = piece.getPos();
     // may return
     {
         "x":"12.5%",
         "y":"25%"
     }
     */
    getPos: function (square) {
        var pos = this.getPosOfSquare(square !== undefined ? square : this.square);
        return {
            'x': pos.x + '%',
            'y': pos.y + '%'
        };
    },
    /**
     * Return x and y position of square by 0x88 coordinate(without the % suffix)
     * @method getPosOfSquare
     * @param {Number} square
     * @return {Object}
     */
    getPosOfSquare: function (square) {
        var file = (square & 15);
        var rank = 7 - ((square & 240) / 16);

        if (this.flipped) {
            file = 7 - file;
            rank = 7 - rank;
        }
        return {
            x: (file * 12.5),
            y: (rank * 12.5)
        }
    },
    /**
     * Return HTML element of piece
     * @method getEl
     * @return {HTMLElement}
     */
    getEl: function () {
        return this.el;
    },
    /**
     * Return color code of piece, "w" or "b"
     * @method getColorCode
     * @return {String}
     * @private
     */
    getColorCode: function () {
        return this.color == 'white' ? 'w' : 'b';
    },
    /**
     * Return lowercase piece type, i.e. "k","q","r","b","n" or "p"
     * @method getTypeCode
     * @return {String}
     * @private
     */
    getTypeCode: function () {
        switch (this.pieceType) {
            case 'p':
            case 'r':
            case 'b':
            case 'q':
            case 'k':
                return this.pieceType.substr(0, 1).toLowerCase();
            case 'n':
                return 'n';
            default:
                return undefined;
        }
    },
    /**
     * Executed when board is flipped. It will call the position method.
     * @method flip
     */
    flip: function () {
        this.flipped = !this.flipped;
        this.position();
    },
    /**
     * Returns true if piece is already flipped
     * @method isFlipped
     * @return {Boolean}
     */
    isFlipped: function () {
        return this.flipped;
    }
});