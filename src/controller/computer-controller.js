chess.controller.ComputerController = new Class({
    Extends: chess.controller.PlayStockFishController,
    gameModel: undefined,
    engineGameModel: undefined,

    clockAndElo: false,
    compMode: false,

    autoFlip: false,
    w:undefined,b:undefined,

    __construct: function (config) {
        this.parent(config);

        this.w = chess.__("white");
        this.b = chess.__("black");

        this.on('enginestatus', this.receiveEngineStatus.bind(this));
        this.on('engineupdate', this.receiveEngineUpdate.bind(this));
    },

    receiveEngineUpdate: function (e) {
        var m = this.currentModel.getCurrentMove();
        if (m && e.scoreLiteral != '#0') {
            this.currentModel.setCommentAfter(e.scoreLiteral, m);
        }
    },

    receiveEngineStatus: function () {
        if (this.engineLoaded()) {
            this.newGame();
        }
    },

    prepareBoard: function () {

    },

    onGameOver: function (result) {
        this.fireEvent('compGameOver', [result, this.playerColor]);
    },

    enableEngine: function () {

    },

    disableEngine: function () {

    },

    compClick: function () {
        this.toggleComputerMode();
    },

    toggleComputerMode: function () {
        if (this.compMode) {
            this.views.board.disableDragAndDrop();
            this.compMode = false;
            this.currentModel = this.gameModel;
            this.currentModel.activate();
        } else {
            this.compMode = true;
            this.prepareNewGame();
        }
        this.fireEvent('comp');
    },

    getWTime: function () {
        return 60000;
    },

    getBTime: function () {
        return 60000;

    },

    prepareNewGame: function () {

        if (this.gameModel == undefined) {
            this.gameModel = this.currentModel;
        }

        this.playerColor = this.turn = this.currentModel.turn();

        if (this.engineGameModel == undefined) {
            this.engineGameModel = this.getNewModel();
        }

        this.currentModel = this.engineGameModel;
        this.history = [];
        this.startFen = this.gameModel.fen();
        var m = Object.clone(this.gameModel.getMetadata());
        m.fen = this.startFen;
        m.result = '*';
        this.engineGameModel.setPosition(this.startFen);
        this.engineGameModel.setMetadata(m);

        var c = this.playerColor == 'white' ? this.w : this.b;
        var txt = chess.__("You play {color} vs StockFishJS").replace('{color}', c);
        this.engineGameModel.setGameComment(txt);

        this.currentModel.activate();

        if (this.engineLoaded()) {
            this.newGame();
        } else {
            this.createEngine();
        }
    },

    newGame: function () {
        this.history = [];
        this.start();
        this.runGameStartCommands();
        this.prepareMove();
    },

    modelEventFired: function (event, model, move) {
        if (!this.compMode) {
            return;
        }
        this.parent(event, model, move);
    }
});