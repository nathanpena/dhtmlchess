/**
 * This is a text/input-field showing position of current move. It will be updated when one of the following events is fired by
 * the controller: newGame, setPosition, newMove, nextMove.
 * @namespace chess.view.metadata
 * @class FenField
 * @extends form.Text
 */
chess.view.metadata.FenField = new Class({
    Extends : ludo.form.Text,
    type : 'chess.view.metadata.FenField',
    module:'chess',
    submodule : 'metadata.FenField',
    stretchField : true,
    label : chess.__('FEN'),
    formCss : { 'font-size' : '10px'},
    labelWidth : 30,
    selectOnFocus : true,
    setController : function(controller){
        this.parent(controller);
        controller.on('newGame', this.showFen.bind(this));
        controller.on('setPosition', this.showFen.bind(this));
        controller.on('newMove', this.showFen.bind(this));
        controller.on('nextmove', this.showFen.bind(this));
    },

    __rendered:function(){
        this.parent();
        this.getFormEl().on('click', this.selectEl.bind(this));
    },
    selectEl:function(){
        this.getFormEl().select();
    },

    showFen : function(model){
        var fen = model.getCurrentPosition();
        this._set(fen);
    }

});