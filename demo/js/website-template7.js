chess.GameViewer = new Class({

    renderTo: undefined,
    pgn: undefined,
    gameIndex: undefined,
    module: undefined,

    initialize: function (config) {

        this.renderTo = $(config.renderTo);

        this.pgn = this.renderTo.attr("data-dhtmlchess-pgn");
        // Using 1 based numbering on the view(1 = first game). decrement by 1 since DHTML Chess is 0-based(0 = first game)
        this.gameIndex = this.renderTo.attr("data-dhtmlchess-game") - 1;


        // Creating unique module id for each instance of the game viewer
        // each view and the controller is assigned to this.
        this.module = 'dhtml-chess' + String.uniqueID();

        // Call the render functino below
        this.render();

    },

    render: function () {

        this.view = new ludo.View({
            renderTo: this.renderTo,
            layout: {
                width: 'matchParent', height: 'matchParent',
                type: 'linear',
                orientation: ludo.util.isTabletOrMobile() ? 'vertical' : 'horizontal'
            },
            css: {
                padding: 5
            },
            children: [
                {
                    layout: {
                        weight: 1,
                        type: 'linear', orientation: 'vertical'
                    },
                    children: [

                        {
                            type: 'chess.view.board.Board',
                            pieceLayout: 'svg_bw',
                            labels: !ludo.util.isTabletOrMobile(),
                            layout: {
                                height:'wrap'
                            },
                            module: this.module, // To make the controller aware of this view
                            background: {
                                borderRadius: 5,
                                horizontal: '../images/board/wood-strip-horizontal.png',
                                vertical: '../images/board/wood-strip-vertical.png'
                            }
                        },
                        {
                            type: 'chess.view.buttonbar.Game',
                            module: this.module, // To make the controller aware of this view
                            elCss: {
                                margin: 2,
                                'background-color': '#eee'
                            },
                            layout: {
                                height: 30

                            }
                        }
                    ]
                }
                ,
                {
                    type: 'chess.view.notation.Panel',
                    module: this.module, // To make the controller aware of this view
                    layout: {
                        weight: 1
                    },
                    figurines: 'svg_egg',
                    figurineHeight: 18,
                    showResult: true
                }
            ]
        });

        this.controller = new chess.controller.Controller({
            applyTo: [this.module],// The module the controller should look for.
            pgn: this.pgn // The pgn file
        });

        // Load the selected game from server.
        this.controller.loadGameFromFile(this.gameIndex);

    }


});

$(document).ready(function () {

    var els = $(document.body).find('.dhtmlchess');

    jQuery.each(els, function (i, el) {


        new chess.GameViewer({
            renderTo: el

        });

    });
    console.log(els.length);


});
