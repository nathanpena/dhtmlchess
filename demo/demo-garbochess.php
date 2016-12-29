<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01//EN" "http://www.w3.org/TR/html4/strict.dtd">
<html>
<head>
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Demo - Play against GarboChess</title>

    <script type="text/javascript">
        var hostname = location.hostname.toLowerCase();
        if (hostname.indexOf('dhtml-chess.com') >= 0) {
            var _gaq = _gaq || [];
            _gaq.push(['_setAccount', 'UA-34147162-1']);
            _gaq.push(['_trackPageview']);

            (function () {
                var ga = document.createElement('script');
                ga.type = 'text/javascript';
                ga.async = true;
                ga.src = ('https:' == document.location.protocol ? 'https://ssl' : 'http://www') + '.google-analytics.com/ga.js';
                var s = document.getElementsByTagName('script')[0];
                s.parentNode.insertBefore(ga, s);
            })();
        }
    </script>

    <script type="text/javascript" src="../jquery/jquery-3.1.0.min.js"></script>
    <script type="text/javascript" src="../js/dhtml-chess.js?rnd=3"></script>
    <script type="text/javascript" src="../src/controller/garbochess-controller.js?rnd=3"></script>
    <script type="text/javascript" src="../garbochess-engine/garbochess.js"></script>
    <script type="text/javascript" src="../src/view/score/bar.js?rnd=3"></script>
    <link rel="stylesheet" href="../css-source/buttonbar/gray.css" type="text/css">
    <link rel="stylesheet" href="../css/dhtml-chess-all.css" type="text/css">
    <style type="text/css">
        body, html {
            width: 100%;
            height: 100%;
            font-family: arial !important;
        }
        .ludo-chess-board-container{
            border:0;
            background-color: transparent;
        }
        .ludo-view-container{
            background-color:transparent;
        }
        .ludo-chess-board-label-ranks-container,.ludo-chess-board-label-files-container{
            color:#669900;

        }

    </style>

</head>
<body>
<script type="text/javascript">

    var app = new ludo.Application({
        title:'Analysis board, DHTML Chess 3.0',
        layout:{
            type:'linear',
            orientation:'vertical'
        },
        children:[
            {
                id:'scoreBar',
                css:{
                    'margin': 5
                },
                type:'chess.view.score.Bar',
                layout:{
                    height:50
                }
            },
            {
                id:'board',
                type:'chess.view.board.Board',
                pieceLayout:'alphapale',
                boardLayout:'wood',
                labels:true,
                layout:{
                    weight:1
                },
                addOns:[
                    {
                        type:'chess.view.highlight.Arrow'
                    }
                ]

            },
            {
                id:'engineoutput',
                layout:{
                    height:30
                },
                css:{
                    'text-align' : 'center'
                }
            },
            {
                height:50,
                layout:{
                    type:'linear',orientation:'horizontal'
                },
                children:[
                    { weight:1 },
                    { type:'form.Button', value:'Resign',listeners:{
                        'click' : function(){
                            controller.newGame();
                        }
                    } },
                    { weight:1 }
                ]
            },
            {
                type:'chess.view.notation.Panel',
                layout:{
                    height:100
                },
                css:{
                    "text-align": "center"
                },
                framed:true,
                resizable:false

            }
        ]
    });

    var myColor = 'white';

    var controller = new chess.controller.GarboChessController({
        garboChess:'../garbochess/js/garbochess.js',    // Path to garbo chess, relative to html/php file
        myColor:myColor,    // Human color
        listeners:{
            'start': onNewGame,
            'engineupdate' :updateMove, //
            'gameover':onGameOver  // Function to call when game is over

        },
        'thinkingTime' : 3000 // Time in 1/1000 seconds
    });

    function onNewGame(myColor){
        // Auto flip board, players color at the bottom
        if(myColor == 'black'){
            ludo.get('board').flipToBlack();
        }else{
            ludo.get('board').flipToWhite();
        }
    }


    function onGameOver(result){
        // result is either 1(White win), 0.5(draw) or -1(black wins)

        var message = result == 0.5 ? "The game is a draw" : result == 1 && myColor == 'white' ? "You won" : "You lost";

        new ludo.Notification({
            elCss:{
                "background-color" : "#f5f5f5",
                "color" : "#000"

            },
            css:{
                "font-size":20
            },
            html : message,
            duration:5
        });

    }

    function updateMove(move){
        var s = move.replace(/.*?Score:([\-0-9]+?)[^0-9].*/g, '$1');
        ludo.$('scoreBar').setScore(-(s/1000));
        var moves = move.replace(/.*NPS:[0-9]+?[^0-9](.+)/g, '$1');
        ludo.get('engineoutput').html(moves);
    }

    // Update engines thinking time if required
    function setThinkingTime(thinkingTime){
        controller.setThinkingTime(thinkingTime);
    }


</script>
</body>
</html>