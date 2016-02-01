(function($){
 
    $.fn.extend({

        selectConvert: function(options) {
            var defaults = {
                color: "#EEE",
                indentMark: "-",
            }
                
            var options =  $.extend(defaults, options);

          
            this.each(function() {
                var o = options;

                var currentItem = $(this);
                var select = $('<select>');

                $(currentItem).find("li").each(function() {

                    var link  = $(this).find('> a');
                    var level     = $(this).parents('li').length;

                    var indent = "";
                    for(i=0;i<level;i++){
                        indent += o.indentMark;
                    }

                    var option = $('<option>').text(indent + ' ' + link.text())
                    .val(link.attr('href')).css("background",o.color)
                    .appendTo(select);
                });
                $(currentItem).replaceWith(select);
                return select;
            });
 


        }
    });
    
})(jQuery);

