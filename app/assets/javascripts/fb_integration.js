var couponfb = (function(){
    var fb_connected = false;
    var login_dialog;
    var applying_item;
    var access_token;

    function  fb_connectionStatusChanged (response){
        if(response.status=="connected"){
            access_token = response.authResponse.accessToken;
            fb_connected = true;
            $("#logged_in_panel").css('display', 'block');
            FB.api('/me', function(response) {
                $('#fb_user_name').html(response.name);
            });
            $("#not_logged_in_panel").css('display', 'none');

            if(login_dialog.dialog( "isOpen" )){
                login_dialog.dialog('close');
                fb_postFeed();
            }
        }
        else{
            fb_connected = false;
            $("#logged_in_panel").css('display', 'none');
            $("#not_logged_in_panel").css('display', 'block');
        }
    }

    function fb_postFeed(){
        var obj = {
            method: 'feed',
            link: applying_item.dataset.link,
            picture: applying_item.dataset.pic,
            name: applying_item.dataset.title,
            privacy: {value: "ALL_FRIENDS"},
            caption: applying_item.dataset.ad
        };

        function callback(response) {
            if(response && response['post_id']){
                $.get("/coupons/get_coupon_code/" + applying_item.dataset.id,  showCouponCode);
            }
            else
            {
                alert('sorry you have to share the information to get the code');
            }
        }

        function showCouponCode(response){
            alert(response);
        }

        FB.ui(obj, callback);
    }

    function bindApplyButton(){
        $('.apply').click(function(eventObject) {
            applying_item = eventObject.currentTarget;

            if(!fb_connected){
                login_dialog.dialog('open');
            }
            else{
                fb_postFeed();
            }
            return false;
        });
    }

    function bindMenu(){
        $('#menu').click( function(e){
            var target = e.target;
            if(target != undefined){
                var current_item = $(this).find('.current_page_item');
                if(target == current_item)
                    return false;
                current_item.attr('class', '');
                target.parentNode.attr('class', '.current_page_item');
                window.location.href = target.attribute['href'];
            }
        })
    }

    function bindFbLogOut(){
        $('#fb_log_out').click(function(){
            FB.logout();
        });
    }

    return {
        init : function(){
            login_dialog = $("#fb_login_dialog").dialog({
                autoOpen: false,
                title: 'Welcome to couponfb'
            });

            window.fbAsyncInit = function() {
                FB.init({
                appId      : '207038556072765',
                status     : false,
                cookie     : true,
                xfbml      : true,
                oauth      : true
                });

                FB.getLoginStatus(function(response) {fb_connectionStatusChanged(response)});

                FB.Event.subscribe('auth.statusChange', function(response) {fb_connectionStatusChanged(response)});
            };
        },

        bind_controls : function(){
            bindApplyButton();
            bindFbLogOut();
            bindMenu();
        }

    };
})();

(function(d){
    var js, id = 'facebook-jssdk'; if (d.getElementById(id)) {return;}
    js = d.createElement('script'); js.id = id; js.async = true;
    js.src = "//connect.facebook.net/en_US/all.js";
    d.getElementsByTagName('head')[0].appendChild(js);
}(document));

$(function() {
    couponfb.init();
    couponfb.bind_controls();
});

