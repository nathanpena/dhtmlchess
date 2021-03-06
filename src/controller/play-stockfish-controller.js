chess.controller.PlayStockFishController = new Class({
    Extends: chess.controller.Controller,
    stockfish: undefined,

    history: undefined,
    engineStatus: {},
    whiteTime: 1000 * 60,
    blackTime: 1000 * 60,
    whiteIncrement: 1,
    blackIncrement: 1,
    playerColor: 'white',
    elo: undefined,
    clock: undefined,
    playingStrength: undefined,
    stockfishElo: undefined,
    gameType: undefined,
    turn: undefined,
    isPlaying: false,
    clockAndElo: true,

    startFen: undefined,
    autoFlip: true,

    __construct: function (config) {
        if (config.playerColor != undefined) this.playerColor = config.playerColor;
        if (config.stockfish != undefined) this.stockfish = config.stockfish;
        if (config.thinkingTime != undefined) {
            this.thinkingTime = config.thinkingTime;
        }
        if (this.clockAndElo) {
            this.elo = new chess.computer.Elo();
            this.clock = new chess.computer.Clock();
            this.clock.on('end', this.onTimesUp.bind(this));
        }

        this.parent(config);
        this.history = [];
    },

    addView: function (view) {
        this.parent(view);

        switch (view.submodule) {
            case 'chess.computer.gamedialog':
                view.on('newGame', this.prepareNewGame.bind(this));
                break;
            case 'computer.clockview':
                if (!view.isHidden()) {
                    if (view.pos == 'top') {
                        this.views.clockTop = view;
                    } else {
                        this.views.clockBottom = view;
                    }
                }

                break;
            case 'chess.computer.gameoverdialog':
                view.on('newgame', function () {
                    this.fireEvent('newgamedialog');
                }.bind(this));
                break;
        }

    },

    getSkillLevel: function () {
        if (this.stockfishElo < 1400)return 0;

        /*
         20 0 0 2894 [2859, 2929]
         19 -1 -66 2828 [2786, 2868]
         18 -2 -133 2761 [2714, 2807]
         17 -3 -199 2695 [2642, 2745]
         16 -4 -265 2629 [2570, 2684]
         15 -5 -331 2563 [2498, 2623]
         14 -6 -398 2496 [2426, 2562]
         13 -7 -464 2430 [2354, 2500]
         12 -8 -530 2364 [2282, 2439]
         11 -9 -596 2298 [2209, 2378]
         10 -10 -663 2231 [2137, 2317]
         9 -11 -729 2165 [2065, 2255]
         8 -12 -795 2099 [1993, 2194]
         7 -13 -861 2033 [1921, 2133]
         6 -14 -928 1966 [1849, 2071]

         */
        var elo = this.stockfishElo;
        if (elo > 2800)return 20;
        if (elo > 2700)return 19;
        if (elo > 2600)return 17;
        if (elo > 2500)return 15;
        if (elo > 2400)return 13;
        if (elo > 2300)return 11;
        if (elo > 2200)return 10;
        if (elo > 2100)return 9;
        if (elo > 2000)return 8;
        if (elo > 1900)return 6;
        if (elo > 1800)return 5;
        if (elo > 1700)return 4;
        if (elo > 1600)return 3;
        if (elo > 1500)return 2;
        return 1;

    },

    prepareNewGame: function (timeControl) {

        this.turn = 'white';
        this.playerColor = timeControl.color;
        this.stockfishElo = timeControl.elo;

        this.history = [];

        this.clock.setTime(timeControl.time * 60, timeControl.inc);
        this.clock.start();

        this.currentModel.newGame();

        this.gameType = this.elo.getGameType(timeControl.time * 60, timeControl.inc);

        this.playingStrength = this.elo.getEloByTime(timeControl.time * 60, timeControl.inc);

        this.isPlaying = true;

        this.runGameStartCommands();

        this.prepareBoard(timeControl);

        this.prepareMove();
    },

    runGameStartCommands: function () {
        this.uciCmd('setoption name Mobility (Middle Game) value 150');
        this.uciCmd('setoption name Mobility (Endgame) value 150');
        this.uciCmd('setoption name Contempt Factor value 0');
        this.uciCmd('setoption name UCI_LimitStrength value 1200');
        this.uciCmd('setoption name Skill Level value ' + this.getSkillLevel());
        this.uciCmd('ucinewgame');
    },

    prepareBoard: function (timeControl) {
        if (timeControl.color == 'white') {
            this.views.board.flipToWhite();
            this.views.clockTop.setColor('black');
            this.views.clockBottom.setColor('white');

        } else {
            this.views.board.flipToBlack();
            this.views.clockTop.setColor('white');
            this.views.clockBottom.setColor('black');
        }
    },

    promotion: function (promoteTo) {

    },

    engineLoaded: function () {
        return this.engineStatus.engineLoaded;
    },

    createEngine: function () {

        try {
            var that = this;

            this.fireEvent('createngine');

            this.engine = new Worker(this.stockfish);

            this.fireEvent('enginestatus', chess.__('loading StockfishJS'));

            this.uciCmd('uci');
            this.uciCmd('ucinewgame');

            this.engine.onmessage = function (event) {
                var line = event.data;

                if (line == 'uciok') {
                    that.fireEvent('enginestatus', chess.__('StockfishJS loaded. Loading Opening Book'));
                    if (!that.engineStatus.engineLoaded) {
                        that.engineStatus.engineLoaded = true;

                        jQuery.ajax({
                            url: ludo.config.getUrl() + '/stockfish-js/book.bin',
                            complete: function (response) {
                                this.engine.postMessage({book: response.responseText});
                                this.fireEvent('enginestatus', [chess.__('Stockfish Ready'), true]);
                                this.fireEvent('newgamedialog');
                            }.bind(that)
                        });
                    }


                } else if (line == 'readyok') {
                    that.engineStatus.engineReady = true;
                } else {
                    var match = line.match(/^bestmove ([a-h][1-8])([a-h][1-8])([qrbk])?/);
                    if (match) {
                        if (that.turn != that.playerColor) {
                            that.currentModel.move({from: match[1], to: match[2], promoteTo: match[3]});
                        }
                    }

                    if (match = line.match(/^info .*\bscore (\w+) (-?\d+)/)) {
                        var bestMoves = line.replace(/.*pv(.+?)$/g, '$1').trim();

                        var nps = line.replace(/.*nps.*?([0-9]+?)[^0-9].+/g, '$1');
                        var depth = line.replace(/.*?depth ([0-9]+?)[^0-9].*/g, '$1').trim();
                        var ret = {
                            depth: depth,
                            bestMoves: bestMoves,
                            nps: nps,
                            mate: false,
                            currentPly: that.currentPly
                        };

                        if (match[1] == 'cp') {
                            var score = parseInt(match[2]) * (that.colorToMove == 'white' ? 1 : -1);
                            score = (score / 100.0).toFixed(2);
                        } else if (match[1] == 'mate') {
                            ret.mate = match[2] * (that.colorToMove == 'white' ? 1 : -1);
                            score = '#' + Math.abs(parseInt(ret.mate));
                        }

                        ret.score = score;
                        ret.scoreLiteral = !isNaN(score) && score > 0 ? '+' + score : score;

                        that.fireEvent('engineupdate', ret);
                    }

                }
            };
            this.engine.error = function (e) {
                this.fireEvent('message', "Error from background worker:" + e.message);
            }.bind(this);


        } catch (error) {
            this.backgroundEngineValid = false;
        }
    },

    newGame: function () {
        this.history = [];
        this.currentModel.newGame();
        this.start();
        this.prepareMove();
    },

    start: function () {
        this.uciCmd('ucinewgame');
        this.uciCmd('isready');
        this.engineStatus.engineReady = false;
        this.engineStatus.search = null;

        this.prepareMove();
    },

    prepareMove: function () {

        var c = this.currentModel.turn();

        if (c != this.playerColor) {
            if (this.history == undefined) this.history = [];
            var cmd = this.startFen ? 'position fen ' + this.startFen : 'position startpos';
            this.uciCmd(cmd + ' moves ' + this.history.join(' '));
            if (this.playingStrength <= 1200) {
                this.uciCmd('go depth ' + this.strengthToDepth());
            } else {
                this.uciCmd('go wtime ' + this.getWTime() + ' winc ' + this.getInc('white') + ' btime ' + this.getBTime() + ' binc ' + this.getInc('black'));

            }
        }
    },

    getWTime: function () {
        if (this.playerColor == 'white')return this.clock.wTime();
        return this.strengthToTime();
    },

    getBTime: function () {
        if (this.playerColor == 'black')return this.clock.bTime();
        return this.strengthToTime();
    },

    strengthToTime: function () {
        var s = this.stockfishElo;
        if (s <= 800)return 500;
        if (s <= 1000)return 1000;
        if (s <= 1200)return 2000;
        if (s <= 1400)return 3000;
        if (s <= 1500)return 4000;
        if (s <= 1600)return 5000;
        if (s <= 1700)return 7000;
        if (s <= 1800)return 9000;
        if (s <= 1900)return 12000;
        return 20000;
    },

    getInc: function (color) {
        if (this.clock && this.playerColor == color)return this.clock.inc();
        return 0;
    },

    strengthToDepth: function () {
        var eloPlayer = this.stockfishElo;

        var d;

        for (var elo in this._strengthToDepths) {
            if (eloPlayer <= elo) {
                d = this._strengthToDepths[elo];
                break;
            }
        }
        if (d == undefined) d = 20;


        return d;
    },

    _strengthToDepths: {
        800: 1,
        900: 2,
        1000: 3,
        1200: 4,
        1300: 5,
        1400: 6,
        1600: 8,
        1700: 10,
        1800: 12,
        1900: 13,
        2000: 14,
        2100: 16,
        2200: 18,
        2250: 20,
        2300: 21,
        2400: 22,
        2500: 23,
        2600: 23

    },

    uciCmd: function (cmd) {
        this.engine.postMessage(cmd);
    },

    modelEventFired: function (event, model, move) {
        if (event === 'newMove' || event == 'newGame') {

            if (event == 'newGame') {
                if (this.autoFlip) {
                    if (this.playerColor == 'white') {
                        this.views.board.flipToWhite();
                    } else {
                        this.views.board.flipToBlack();
                    }
                }
                if (this.engine == undefined) {
                    this.createEngine();
                }
            }

            var colorToMove = this.colorToMove = model.turn();
            if (event == 'newMove') {
                if (this.clock) this.clock.tap();

                this.turn = this.turn == 'white' ? 'black' : 'white';

                if (this.history == undefined) this.history = [];
                this.history.push(move.from + move.to + (move.promoteTo ? move.promoteTo : ''));

                this.start();

                if (colorToMove != this.playerColor) {
                    this.prepareMove();
                }
            }

            if (model.getResult() != 0) {
                var result = model.getResult();
                this.onGameOver(result);
                return;
            }

            if (colorToMove === this.playerColor) {
                this.views.board.enableDragAndDrop(model);
            } else {

                this.views.board.disableDragAndDrop();
                if (event == 'newGame') {
                    this.prepareMove();
                }
            }
        }
    },

    onGameOver: function (result) {
        if (!this.isPlaying)return;
        this.views.board.disableDragAndDrop();

        this.elo.saveResult(result, this.stockfishElo, this.gameType, this.playerColor);

        var newElo = Math.round(this.elo.getElo(this.gameType));
        var myResult = this.playerColor == 'black' ? result * -1 : result;

        this.fireGameOverEvent.delay(300, this, [myResult, Math.round(this.playingStrength), newElo]);
        this.clock.stop();

        this.isPlaying = false;
    },

    fireGameOverEvent: function (myResult, strength, newElo) {
        this.fireEvent("gameover", [myResult, strength, newElo]);
    },

    onTimesUp: function (loser) {
        this.onGameOver(loser == 'white' ? -1 : 1);
    },

    claimDraw: function () {
        if (this.currentModel.canClaimDraw()) {
            this.onGameOver(0);
        }
    },

    resign: function () {
        this.onGameOver(this.playerColor == 'white' ? -1 : 1);
    }

});