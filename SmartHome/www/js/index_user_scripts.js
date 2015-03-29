(function()
{
 "use strict";
 /*
   hook up event handlers 
 */
 function register_event_handlers()
 {
    
    
         $(document).on("click", "#addButton", function(evt)
        {
        /* your code goes here */ 
        });
        $(document).on("click", ".uib_w_1006", function(evt)
        {
        /* your code goes here */ 
        });
        $(document).on("click", ".uib_w_1002", function(evt)
        {
        /* your code goes here */ 
        });
}
 document.addEventListener("app.Ready", register_event_handlers, false);
})();
