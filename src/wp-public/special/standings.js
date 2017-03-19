chess.WPStandings1 = new Class({
    Extends: chess.WPTemplate,

    initialize:function(config){
        this.parent(config);

        jQuery.ajax({
            url: ludo.config.getUrl(),
            method: 'post',
            cache: false,
            dataType: 'json',
            data: {
                action:'get_standings',
                pgn:config.pgn.id
            },
            complete: function (response, status) {
                if(status == "success"){
                    var standings = response.responseJSON.response;
                    new chess.wordpress.PgnStandings({
                        renderTo:this.renderTo,
                        layout:{
                            height:'auto'
                        },
                        dataSource:{
                            data:standings
                        }
                    });
                }
            }.bind(this),
            fail: function (text, error) {
                this.fireEvent(error);
            }.bind(this)
        });
    }

});