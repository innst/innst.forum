
/*адрес сервера с API*/
window.startUrl = 'http://www.forum-nnov.ru/api/forum/';
/*уникальный идентификатор устройства (НЕ IMAI!!!)*/
window.deviceId = '';
/*флаг интернета*/
window.connection = false;
/*количество единовременно загружаемых позиций*/
window.itemsCount = 20;

/*для совместимости jqury*/
var $$ = Dom7;


/*ждем готовность устройства*/
document.addEventListener("deviceready",onRd,false);




function onRd(){
    
    window.myApp = new Framework7({
        animateNavBackIcon:true,
            //pushState: true,
            modalButtonOk: 'Подвердить',
            modalButtonCancel: 'Отменить',
            swipeBackPage: false,
            sortable: false,
            swipeout: false,
            swipePanel: 'left',
            router: true,
            cache: false,
            dynamicPageUrl: 'content-{{name}}',
    });

    // Add view
    window.mainView = window.myApp.addView('.view-main',{
      dynamicNavbar: true,
      //reloadPages: true
    });

    window.myApp.onPageBeforeInit('*', function (page){
        if(typeof initPageBeforeLoadCallback == 'function'){
                initPageBeforeLoadCallback(page);
        }


            if(page.name == "actions"){

        }
    })

    window.myApp.onPageInit('*', function (page){
        if(typeof initPageLoadCallback == 'function'){
                initPageLoadCallback(page);
        }
    })

    if(typeof device != 'undefined') {
            window.deviceId = device.uuid;
    }else{
            function makeid(){
                    var text = "";
                    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
                    for( var i=0; i < 12; i++ )
                            text += possible.charAt(Math.floor(Math.random() * possible.length));
                    return text;
            }
            window.deviceId = localStorage.getItem('device_id');
            if(!window.deviceId) {
                    window.deviceId = makeid();
                    localStorage.setItem('device_id',window.deviceId);
            }
    }
    
    /*загружаем первую начальную страницу (в последствии проверять соединений (онлайн или офлайн))*/
    mainView.router.load({
        url: 'tmpl/main.html',
        animatePages: false
    });
    
    checkConnection();
    
    
    if(window.connection){
        
    }
    
    
    
}


/*проверяем соединение c интернетом*/
function checkHistory(pege){

    var historyPage = [];
    var cntHistory = 0;
    var conect = "N";
    
    checkConnection();
    if(window.connection) conect = "Y";
    
    if(localStorage.getItem("historyPage") != null){
        var historyPage = JSON.parse(localStorage.getItem("historyPage"));
        cntHistory = historyPage.length;
    }

    historyPage[cntHistory] = {
        conect: conect,
        page: pege,
        dateView: Math.round(new Date().getTime() / 1000)
    };

    if(conect == "N"){
        localStorage.setItem ("historyPage", JSON.stringify(historyPage));
    }else{

        $$.ajax({
            url : window.startUrl+"history/",
            data : {device:window.deviceId, key: localStorage.getItem('authorize_key'), historyPage:historyPage},
            dataType: 'json',
            timeout: 5000,
            success : function(data){ 

                window.connection = true;
                if(data.status == "ok"){
                    localStorage.removeItem("historyPage");
                }else{
                    historyPage[cntHistory] = {
                        conect: "N",
                    };
                    localStorage.setItem ("historyPage", JSON.stringify(historyPage));
                }
            },
            error: function(data){
                window.connection = false;
                historyPage[cntHistory] = {
                    conect: "N",
                };
                localStorage.setItem ("historyPage", JSON.stringify(historyPage));
            }
        }); 
    }
}


/*проверяем соединение c интернетом*/
function checkConnection(){
    console.log("checkConnection - "+(typeof navigator.connection));
	if(typeof navigator.connection != 'undefined'){
	
	var Connection = {
		UNKNOWN: "unknown",
        ETHERNET: "ethernet",
        WIFI: "wifi",
        CELL_2G: "2g",
        CELL_3G: "3g",
        CELL_4G: "4g",
        CELL:"cellular",
        NONE: "none"
	};
	var networkState = navigator.connection.type;
    var states = {};
    states[Connection.UNKNOWN]  = true;
    states[Connection.ETHERNET] = true;
    states[Connection.WIFI]     = true;
    states[Connection.CELL_2G]  = true;
    states[Connection.CELL_3G]  = true;
    states[Connection.CELL_4G]  = true;
    states[Connection.CELL]     = true;
    states[Connection.NONE]     = false;

    if(states[networkState]===true) {
		window.connection = states[networkState];
	}else if(states[networkState]===false){
		window.connection = states[networkState];
	}else{
		window.connection = true;
	}
	}else{
	window.connection = true;
	}
        
        console.log("checkConnection2 - "+(window.connection));
	
}


















/*-----------------Ловим события----------------------------------------*/
/*ловим клик нижнего тулбара*/
$$(document).on('click','.toolbar a',function(e){
    e.preventDefault();

    if($$(this).attr("href").indexOf("#content-")===0){
        
        var page = $$(this).attr("href").replace("#content-","");
        
        if(typeof getDinamicPageLoad == 'function'){
            getDinamicPageLoad(page);
        }
        
    }else{
        
        var page = $$(this).attr("href");
        mainView.router.load({
            url: page,
            animatePages: true
        });
        
    }
});

/*ссылки на динамические странички*/
$$(document).on('click','.link_pege_d',function(e){
    e.preventDefault();

    var page = $$(this).attr("href").replace("#content-","");

    if(typeof getDinamicPageLoad == 'function'){
        getDinamicPageLoad(page);
    }
})

/*ссылки на детальные странички элемента*/
$$(document).on('click','.link_detail',function(e){
    e.preventDefault();

    var page = $$(this).attr("href").replace("#content-","");
    var id = $$(this).attr("data-detail_id");
    

    if(typeof getDinamicPageLoad == 'function'){
        getDinamicPageLoad(page, id);
    }
})

/*чистим телефон*/
function checkPhoneNumber(phone){
    phone = phone.replace(/[^0-9]/gim,'');
    if(phone.length < 10)
        return false;
    
    phone = phone.substr(-10);
    return phone;
}




/*авторизация по телефону*/
$$(document).on('click', '#form_phone_link_code', function(e){
        e.preventDefault();
        $$('#form_phone_error').html('').hide();

        var formData = window.myApp.formToJSON('#form_phone');
        formData.device = window.deviceId;
        if (formData.phone.length <=0){
            $$('#form_phone_error').html('<p class="error__page">Незаполнен телефон</p>').show();
            $$('#form_phone_filds_phone i').addClass('color-red');
            $$('#form_phone_filds_phone input').addClass('error');
            return false;
        }
        
        formData.phone = checkPhoneNumber(formData.phone);
        if(formData.phone === false){
            $$('#form_phone_error').html('<p class="error__page">Неверен формат телефона</p>').show();
            $$('#form_phone_filds_phone i').addClass('color-red');
            $$('#form_phone_filds_phone input').addClass('error');
            return false;
        }
        $$.ajax({
            url : window.startUrl+"history/?step=code&type=phone",
            data : formData,
            dataType: 'json',
            timeout: 5000,
            async : false,
            success : function(data){ 
                if(!data.ERROR){
                        localStorage.setItem('authorize_key',data.KEY);
                        localStorage.setItem('authorize_right',data.RIGHT);
                        localStorage.setItem('card_num',data.CARD_NUM);
                        localStorage.setItem('card_image',data.CARD_IMAGE);
                        localStorage.setItem('card_image_2',data.CARD_IMAGE_2);
                        
                        mainView.router.load({
                            url: 'tmpl/main.html',
                            animatePages: false
                        });
                        //window.menuHide();
                }else{
                        $$('#form_phone_error').html('<p class="error__page">'+data.ERROR+'</p>').show();
                }
            },
            error: function(data){
                $$('#form_phone_error').html('<p class="error__page">Ошибка авторизации. Нет соединения с сервером.</p>').show();
            }
        });




});
/*гбираем ошибки с полей*/
$$(document).on('click', 'input.error', function(){
    $$('#form_phone_error').html('').hide();
    $$('#form_phone_filds_phone i').removeClass('color-red');
});


/*авторизация по номеру карты(ручной ввод)*/
$$(document).on('click', '#card_link_autch_manual', function(e){
    e.preventDefault();
    $$('#card_link_autch_manual').parent().hide();
    $$('#form_card_autch_error').html('').hide();

    $$('#card_autch').show();
    $$('#card_autch_button').show();
    
});

/*сканирование штрихкода(и/или QR-кода)*/
$$(document).on('click', '#card_link_autch_scan', function(e){
    e.preventDefault();
    $$("#card_num").val('');
    cordova.plugins.barcodeScanner.scan(
        function (result) {
            if(result.text){
                /*вставляем результат в форму и отображаем ее*/
                
                    $$('#card_link_autch_manual').parent().hide();
                    $$('#form_card_autch_error').html('').hide();

                    $$("#card_num").val(result.text);
                    $$('#card_autch').show();
                    $$('#card_autch_button').show();
                
                
                //setTimeout(function(){$$('.getCardLink').click()},500);
                
            }
        },
      function (error){
              //window.myApp.alert("Не удалось отсканировать: " + error,'Уведомление');
      },
      {
      "prompt" : "Наведите камеру на код.",
      "formats" : "QR_CODE,DATA_MATRIX,UPC_E,UPC_A,EAN_8,EAN_13,CODE_128,CODE_39,CODE_93,CODABAR,ITF,RSS14,PDF417,RSS_EXPANDED",
      }
   );
});







/*----------------пользовательские функции-------------------*/

/*функция обработки динамических страничек*/
function getDinamicPageLoad(page,id){
    
    if(page == "maps"){
        mainView.router.loadContent(tmpl_stat_maps());
    }
    
    if(page == "actions"){
        getListNewPage(page);
    }
    
    if(page == "action"){
        getDetail(page,id);
    }

}


/*функция возникает сразу после загрузки страницы*/
function initPageLoadCallback(page){
    
    checkHistory(page.name)
    if(page.name == "maps"){
        fn_contacts();
    }

    if(page.name == "actions"){
        getListInfinite(page.name);
    }

    
}





/*запрос для получения динамического контента в формате json*/
function getRequest(page, url, type){
        console.log(url);
        $$.ajax({
            url : url,
            data : {device:window.deviceId, key: localStorage.getItem('authorize_key')},
            dataType: 'json',
            timeout: 5000,
            success : function(data){ 
                console.log(data);
                if(type === "listItems"){
                    getListItemsAct(page, data);
                }
                if(type === "listNew"){
                    getListPageAct(page, data);
                }
                if(type === "detail"){
                    tmpldetail(page, data);
                }
            },
            error: function(){
                    window.connection = false;
            }
        });                

}
/*Подкрузка детальной странички элемента*/
function getDetail(page,id){
    var url = window.startUrl+page+'s/'+id+'/';
    getRequest(page, url, "detail");
}

/*подгрузка списка элементов динамической странички*/
//function getList(page){
//        var url;
//        var lastIndex = $$('.infinite-scroll .list-block li').length;
//        
//        if(lastIndex >0){
//            var page_count = lastIndex / window.itemsCount + 1;
//            url = window.startUrl+page+'/?PAGEN_1='+page_count+'&SIZEN_1='+window.itemsCount;
//            getRequest(page, url, "listItems");
//        }else{
//            url = window.startUrl+page+'/?PAGEN_1=1&SIZEN_1='+window.itemsCount;
//            getRequest(page, url, "listNew");
//        }
//}

/*открываем страничку со скролом*/
function getListNewPage(page){
        var url = window.startUrl+page+'/';
        getRequest(page, url, "listNew");
}


/*Подгрузка самой динамической странички*/
function getListPageAct(page, data){
    var html;
    
    if(page === "actions"){
        html = tmpl_list_actions(data);
    }
    mainView.router.loadContent(html);
}

/*заполнение данных динамической страницы по скролу*/
function getListInfinite(page){
    var loading = false;

    $$('.infinite-scroll').on('infinite', function(){
        /*если незакончена подрузка не реагируем*/
        if(loading) return;

        loading = true;
        var lastIndex = $$('.pages').children(':last-child').find('.infinite-scroll .list-block li').length;
        console.log($$('.pages').children(':last-child').attr('data-page'));
        var page_count = lastIndex / window.itemsCount + 1;
        var url = window.startUrl+page+'/?PAGEN_1='+page_count+'&SIZEN_1='+window.itemsCount;
        getRequest(page, url, "listItems");
        
        loading = true;
    });
}

/*дозагрузка элементов списка*/
function getListItemsAct(page, data){

        if(data.body.length < window.itemsCount){
            //Если лимит достигнут, снимаем событие загрузки
            myApp.detachInfiniteScroll($$('.infinite-scroll'));
            //Удалить прелоадер
            $$('.infinite-scroll-preloader').remove();
        }
        
        // Генерируем новый хтмл HTML
        var html = tmplListItems(page, data);
        //Добавляем элементы в конец списка
        $$('.pages').children(':last-child').find('.infinite-scroll .list-block ul').append(html);
}
    
/*подставляем необходимые шаблоны для элементов списка*/  
function  tmplListItems(page, data){
    var html;
    if(page === "actions"){
        html = tmpl_list_item_actions(data);
    }
    return html;
}

/*подставляем необходимые шаблоны для детальных страничек*/  
function  tmpldetail(page, data){
    var html;
    if(page === "action"){
        html = tmpl_detail_action(data);
    }
    mainView.router.loadContent(html);
}







/*---------------ШАБЛОНЫ НАЧАЛО--------------------*/

/*шаблон страницы акций*/
tmpl_list_actions = (function(data){
        var html =   '<div class="navbar"><div class="navbar-inner">'+
                            '<div class="left"><a href="#" class="link icon-only open-panel"><i class="icon icon-bars"></i></a></div>'+
                            '<div class="center sliding">Акции</div>'+
                            '<div class="right"></div>'+
                        '</div></div>'+
                    '<div class="pages"><div data-page="actions" class="page">';

        if(data.body.length >= window.itemsCount){
            html += '<div class="page-content infinite-scroll" data-distance="100">';
        }else{
            html += '<div class="page-content">';
        }
        html += '<div class="list-block media-list"><ul>';
        
        /*вставляем элементы*/
        html +=tmpl_list_item_actions(data);
        
        html += '</ul></div>';
        if(data.body.length >= window.itemsCount){
            html +='<div class="infinite-scroll-preloader"><div class="preloader"></div></div>';
        }
        html += '</div></div>';
                    
        return html;  
});
/*шаблон элементов списка акций*/
tmpl_list_item_actions = (function(data){
        // Генерируем новый хтмл HTML
        var html = '';
        $$.each(data.body, function (index, value) {
            html += '<li>'+
                    '<a href="#content-action" data-detail_id="'+value.id+'" class="item-link link_detail">'+
                        '<div class="item-content">'+
                            '<div class="item-media"><img src="'+value.preview_picture+'" width="70"></div>'+
                            '<div class="item-inner">'+
                                '<div class="item-title-row">'+
                                    '<div class="title">'+value.name+'</div>'+
                                '</div>'+
                            '</div>'+
                        '</div>'+
                    '</a>'+
                    '</li>';
        });
        return html;
});
/*шаблон для детальной странички с акцией*/
tmpl_detail_action = (function(data){
    
    var status = "Завершена";
    if(data.body.activ_data ==="activ"){status = "Действует"}

    var html = '<div class="navbar">'+
                    '<div class="navbar-inner">'+
                        '<div class="left"><a href="#" class="back link"><i class="icon icon-back"></i><span>Назад</span></a></div>'+
                        '<div class="center sliding">Акции</div>'+
                        '<div class="right"></div>'+
                    '</div>'+
                '</div>'+
                '<div class="pages">'+
                    '<div data-page="action" class="page">'+
                        '<div class="page-content">'+
                            '<div class="card">'+
                                '<div class="card-header">'+data.body.name+'</div>'+
                                '<div class="card-content">'+
                                    '<div class="card-content-inner">'+data.body.detail_text+'</div>'+
                                '</div>'+
                                '<div class="card-footer">'+status+'</div>'+
                            '</div>'+
                        '</div>'+
                    '</div>'+
                '</div>';
    return html;
});

/*шаблон страницы контактов*/
tmpl_stat_maps = (function(){
    var html =  '<div class="navbar">'+
                    '<div class="navbar-inner">'+
                        '<div class="left"><a href="#" class="back link"><i class="icon icon-back"></i><span>Назад</span></a></div>'+
                        '<div class="center sliding">на карте</div>'+
                        '<div class="right"></div>'+
                    '</div>'+
                '</div>'+
                '<div class="pages">'+
                    '<div data-page="maps" class="page">'+
                        '<div class="page-content">'+
                            '<div id="map" style="width:100%;height:100%;"></div>'+
                        '</div>'+
                    '</div>'+
                '</div>';
    return html;
});




/*---------------ШАБЛОНЫ КОНЕЦ--------------------*/



/*----------ФУНКЦИИ СТРАНИЦ НАЧАЛО-----------*/
fn_contacts = (function(){
   
    ymaps.ready(function(){
    
        var myMap = new ymaps.Map("map", {
                center: [56.305913, 43.855375],
                zoom: 13
            }, {
                searchControlProvider: 'yandex#search'
            });


        myMap.geoObjects

            .add(new ymaps.Placemark([56.305913, 43.855375], {
                balloonContent: 'Оптовая продажа автозапчастей<strong> ООО Форум</strong>',
                iconCaption: 'Компания <strong>Форум</strong>'
            }));
    });
    
});


/*----------ФУНКЦИИ СТРАНИЦ КОНЕЦ-----------*/


