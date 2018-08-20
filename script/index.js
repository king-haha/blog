$(function () {
    /* 动态响应式轮播图 */
    banner();
    /* 初始化 tables 页签 */
    initTabs();
    /* 初始化工具提示 */
    $('[data-toggle="tooltip"]').tooltip();
});

/* 动态响应式轮播图 */
function banner() {
    /* 
    1. 获取后台的轮播图 图片数据       （ajax）
    2. 需要判断当前的屏幕是不是移动端       （屏幕的宽度 760px 以下都是移动端）
    3. 把后台数据渲染成对应的html字符串        （1.字符串拼接  2.模板引擎 artTemplate   native-template与underscore 语法相似）
        underscore 介绍和学习underscore
    4. 把渲染完成的html填充在对应的盒子里面，也就是完成了页面渲染     （渲染到页面当中  即：html()函数方法 ）
    5. 在屏幕尺寸改变的时候需要重新渲染页面         （通过监听页面尺寸的改变  通过resize()函数方法）
    6. 在移动端需要 通过手势来控制图片控制轮播图 左 next 右 prev 滑动
    */

    /* 声明全局的变量来做缓存
       用 myData 来接收数据  缓存在内存当中
    */
    var myData = '';
    /* 1.获取后台的轮播图数据    （ajax） */
    var getData = function (callback) {
        if (myData) {
            callback && callback(myData);
            return false;
        }
        /* ajax */
        $.ajax({
            /* js 是被 html 引用的  
            但是发出的请求是相对于 html 文件发出的 
            html 相对于 index.json 多了一层 js 文件 
            相对应的还需要加上  目录 “js"
            */
            url: './data/index.json',
            /* 相对于 html 文件 需要获取数据的地址 */
            data: {},
            /* 获取数据后放到这里 */
            type: 'get',
            /* 获取数据的方式 */
            dataType: 'json',
            /* 获取的数据的类型 */
            success: function (data) {
                /* 数据缓存
                   当我们已经请求成功之后  把数据缓存在内存当中
                   当下一次调用这个方法的时候  去判断内存当中有没有记录这个数据
                   如果有记录 直接返回内存当中
                   如果没有   再做请求
                */
                myData = data;
                // 此时的 data 仅为参数  可以自定义
                // 之所以取名为 data 就是为了方便明白传入进来的东西就是上面的data数据

                /* 数据获取成功后 需要执行的函数 */
                callback && callback(myData); // '&&' 逻辑与  即：两个都成立
            }

        });
    }
    /* getData(); */

    /* 渲染的方法
    2. 需要判断当前的屏幕是不是移动端       （屏幕的宽度 760px 以下都是移动端）
    3. 把后台数据渲染成对应的html字符串        （1.字符串拼接  2.模板引擎 artTemplate   native-template与underscore 语法相似）
        underscore 介绍和学习underscore
    4. 把渲染完成的html填充在对应的盒子里面，也就是完成了页面渲染     （渲染到页面当中  即：html()函数方法 ）
    */

    /* 定义渲染方法（渲染成html） */
    var renderHtml = function () {
        /* 获取数据 */
        getData(function (data) {
            // 此时的 data 仅为参数  可以自定义
            /* 请求结束  也就是获取数据完成之后执行的函数 */
            // console.log(data);
            /* 开始页面逻辑的编写 */
            /* 1.获取当前屏幕的宽度 */
            var width = $(window).width();
            /* 2.是否是移动端 */
            var isMobile = false;
            if (width < 768) {
                isMobile = true; //书名当前屏幕大小为移动端
            }
            /* 准备需要解析的数据 */
            /* 我们需要两个模板
                1.轮播图中的点
                2.图片
             */
            /* 获取模板对象  并返回一个函数*/
            var templatePoint = _.template($('#template_point').html());
            var templateImage = _.template($('#template_image').html());
            /* 渲染成html字符 即解析成html */
            /* 传入数据  根据模板解析  返回html字符 */
            /* {model:data}  意思是传入的数据  名字叫 model  数据叫 data */
            // console.log(templatePoint);
            var pointHtml = templatePoint({
                model: data
            });
            var imageData = {
                list: data,
                /* t图片数据 */
                isMobile: isMobile /* 是不是移动端数据 */
            }
            /* 面向对象思想（相对论）  imageData 中第一个元素属性值为数组，第二个元素属性值为 Boolean 类型的数值 */
            var imageHtml = templateImage({
                model: imageData
            });
            /* 渲染页面(将模板引擎中的字符串放入 html容器中) */
            $('.carousel-indicators').html(pointHtml);
            $('.carousel-inner').html(imageHtml);
        });
    }
    /* 5. 在屏幕尺寸改变的时候需要重新渲染页面 */
    $(window).on('resize', function () {
        /* 重新渲染 */
        renderHtml();
    }).trigger('resize');
    /* trigger('resize'); 即时执行这个事件  也就是触发这个事件
        通俗一点就是   某元素被 .trigger('event') 之后立刻执行该方法
    */

    /* 6.在移动端需要通过收拾老控制图片的轮播 左next  右prev   滑动 */
    /* 使用jQuery完成手势 */

    var startX = 0; // 开始的距离
    var moveX = 0; // 移动距离
    var distanceX = 0; // 移动的距离
    var isMove = false; // 是否移动
    /* 绑定事件 */
    $('.wjs_banner').on('touchstart', function (e) {
        /* 怎么获取到第一个触摸点 */
        /* jquery e 返回的是 originalEvent  
         originalEvent 就是原生js中的 touchevent */
        // console.log(e.originalEvent);
        // console.log(e.originalEvent.touches[0].clientX);
        startX = e.originalEvent.touches[0].clientX;
        console.log('开始的点：' + startX);
    });
    $('.wjs_banner').on('touchmove', function (e) {
        moveX = e.originalEvent.touches[0].clientX;
        distanceX = moveX - startX;
        isMove = true;
        console.log('移动的距离：'+distanceX);
    });
    $('.wjs_banner').on('touchend', function (e) {
        /* 需要有一定的滑动距离 才认为他滑动过 
         必须移动过50px的距离才认为滑动过 */

        /* 判断对应的手势 来判断轮轮播图的滚动 */
        console.log(132);

        if (Math.abs(distanceX) > 50 && isMove) {

            console.log(654);

            if (distanceX < 0) {
                /* 向左滑动  下一张 */
                console.log(000);

                $('.carousel').carousel('next'); //bootstrap 提供的方法
            } else {
                /* 向右滑动  上一张 */
                $('.carousel').carousel('prev'); //bootstrap 提供的方法

            }
        }
        /* 参数重置  否则会影响之后的滑动 */
        startX = 0; // 开始的距离
        moveX = 0; // 移动距离
        distanceX = 0; // 移动的距离
        isMove = false; // 是否移动

    });
}

/* 初始化页签页（tabs） */
function initTabs() {
    /* 设置父容器的宽度等于所有的子容器的宽度和 */
    var ul = $('.wjs_product .nav-tabs');
    var lis = ul.find('li');
    // console.log(lis);
    var width = 0;
    $.each(lis,function (i,o) {
        // console.log($(o).innerWidth());
        /* width()  内容的宽度 */
        /* innerwidth()  内容+内边距的宽度 */
        /* outerwidth()  内容+内边距+边框的宽度 */
        /* outerwidth(true)  内容+内边距+边框+外边距的宽度 */
        width += $(o).innerWidth(); 
        
    })
    console.log(width);
    /* 将ul的宽度设置成width（所有子元素的宽度和） */
    ul.width(width);

    /* 实现在移动端的滑动 */
    itcast.iScroll({
        swipeDom:$('.wjs_product_tabsParent').get(0),
        /* 
        $('.wjs_product_tabsParent')  为 jQuery 对象
        所以需要  .get(0)来拿到 DOM 对象
        */
        swipeType:'x',
        /* 滑动的方向 */
        swipeDistance:50
        /* 缓冲的距离 */
    });
    
}