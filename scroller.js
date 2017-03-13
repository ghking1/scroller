
/*
*   页面向下滚动为正方向，向上滚动为负方向,所谓向上向下和滚动条运动方向一致
*   speed是速度方向及大小，表示每次滚动的像素值
*   accelerate是加速度方向及大小,注意它总是和速度方向相反
*/

function Scroller(element)
{
    element.style.overflow='hidden';//把要配置的元素设为隐藏溢出，方便scoller接管
    var scrollTop_max=0;            //向下滚动的最大值,实时计算
    var isscrolling=false;         //防止触摸或拖动多次同时滚动

    //********************************
    //下面实现鼠标滚轮滚动
    //********************************
    var wheel_length=0;     //要滚动的累计距离
    var wheel_speed=0;      //滚动速度大小和方向

    //添加滚轮监听事件,兼容火狐浏览器
    element.addEventListener('DOMMouseScroll', wheel_set, false);
    element.addEventListener('mousewheel', wheel_set, false);

    //当发生滚动时设置wheel_count和wheel_speed
    function wheel_set(event)
    {
        event.preventDefault();
        event.stopPropagation();

        if(wheel_speed*(-event.wheelDelta)>0 || wheel_speed*event.detail>0) //滚轮的方向和上次一样
        {
            wheel_length+=Math.sign(wheel_speed)*50;                    //********可调滚动距离*********
            scrollTop_max=element.scrollHeight-element.clientHeight;    //计算滚动到底部时的scrollTop值
        }
        else                                                                //滚轮的方向和上次不一样
        {
            wheel_speed=Math.sign(-event.wheelDelta || event.detail)*4; //********可调速度*********
            wheel_length=Math.sign(wheel_speed)*50;                     //********可调滚动距离*********
        }
        wheel_scroll(); //发起滚动
    }

    //设置定时器每隔一段时间进行滚动
    function wheel_scroll()
    {
        //如果滚动的累计长度没有滚完 而且 （页面向上滚动时没有滚到顶 或者 页面向下滚动时没有滚到底）
        if(wheel_length*wheel_speed>0 && ((wheel_speed<0 && element.scrollTop>0) || (wheel_speed>0 && element.scrollTop<scrollTop_max)))
        {
            element.scrollTop+=wheel_speed;     //按速度进行滚动
            wheel_length-=wheel_speed;          //调整滚动长度
            window.setTimeout(wheel_scroll, 16);//设置定时器进行下一次滚动
        }
    }

    //********************************
    //下面实现鼠标拖动滚动
    //********************************
    var mouse_timer=null;       //鼠标拖动滚动定时器
    var mouse_last_Y= 0;        //上一次拖动事件发生的Y坐标
    var mouse_last_time=0;      //上一次拖动事件发生的时间
    var mouse_last_length=0;    //上一次进行滚动的距离
    var mouse_last_speed=0;     //上两次滚动的平均速度
    var mouse_last_speed1=0;    //上上次滚动的速度
    var mouse_last_speed2=0;    //上一次滚动的速度
    var mouse_last_accelerate=0;//上一次滚动的加速度,方向和速度相反，大小固定
    var mouse_downX= 0, mouse_downY=0; //鼠标按下时的坐标位置
    var mouse_upX= 0, mouse_upY=0;     //鼠标抬起时的坐标位置

    //添加监听事件
    element.addEventListener('mousedown', onmousedown, false);
    element.addEventListener('click', onmouseclick, true);

    //如果有移动就禁止click事件触发
    function onmouseclick(event)
    {
        var boundary=5;  //鼠标移动距离大于该值就禁止触发click事件
        if(Math.abs(mouse_downX-mouse_upX)>boundary || Math.abs(mouse_downY-mouse_upY)>boundary)
        {
            event.preventDefault();
            event.stopPropagation();
            return false;
        }
        else
        {
            return true;
        }
    }

    //鼠标左键按下时开始任务
    function onmousedown(event)
    {
        if(event.button==0 && isscrolling==false) //判断是否为鼠标左键,以及是否有其他滚动操作
        {
            isscrolling=true;
            //初始上面定义的各个参数
            clearInterval(mouse_timer);
            mouse_last_Y=event.clientY;
            mouse_last_time=event.timeStamp;
            mouse_last_length=0;
            mouse_last_speed=0;
            mouse_last_speed1=0;
            mouse_last_speed2=0;
            mouse_last_accelerate=0;
            mouse_downX=event.clientX;
            mouse_downY=event.clientY;
            //计算向下滚动的最大值，这个需要每次都计算，因为页面大小可能经常改变
            scrollTop_max=element.scrollHeight-element.clientHeight;
            //开始监听其他事件
            element.addEventListener('mousemove', onmousemove, false);
            element.addEventListener('mouseup', onmouseup, false);
            element.addEventListener('mouseleave', onmouseup, false);
        }
    }

    //鼠标左键按下时会设置监听器，鼠标左键抬起时会清除监听器
    function onmousemove(event)
    {
        mouse_last_speed1=mouse_last_speed2;    //上一次变为上上次
        mouse_last_length=-(event.clientY-mouse_last_Y);    //计算本次移动距离，这个距离就是两次事件中鼠标指针移到的距离,作为上一次移动距离
        mouse_last_speed2=mouse_last_length/(event.timeStamp-mouse_last_time);//计算本次速度,作为上一次速度
        //页面向上滚动时没有滚到顶 或者 页面向下滚动时没有滚到底
        if(((mouse_last_length<0 && element.scrollTop>0) || (mouse_last_length>0 && element.scrollTop<scrollTop_max)))
        {
            if((event.timeStamp-mouse_last_time)>16)//为了避免事件触发过多时性能下降，这里最多16ms执行一次
            {
                mouse_last_Y=event.clientY;                     //本次事件触发Y坐标，作为上一次事件触发Y坐标
                mouse_last_time=event.timeStamp;                //本次事件触发时间，作为上一次事件触发时间
                element.scrollTop+=mouse_last_length;           //按本次计算出来的值进行滚动
            }
            event.preventDefault(); //阻止鼠标移到时的默认操作，非常重要，否则页面会非常卡
            event.stopPropagation();//如果页面没滚完，就停止事件传播，防止页面卡顿
        }
    }

    //鼠标左键抬起后作善后工作，并进行惯性滚动
    function onmouseup(event)
    {
        //设置抬起时的坐标
        mouse_upX=event.clientX;
        mouse_upY=event.clientY;

        //清除事件监听器
        element.removeEventListener('mousemove', onmousemove, false);
        element.removeEventListener('mouseup', onmouseup, false);
        element.removeEventListener('mouseleave', onmouseup, false);

        //计算最后两次移动的平均速度,以及加速度
        mouse_last_speed=(mouse_last_speed1*mouse_last_speed2>0) ? (mouse_last_speed1+mouse_last_speed2)/2 : mouse_last_speed2;
        mouse_last_speed=Math.round(mouse_last_speed*20);       //********可调速度*********
        mouse_last_accelerate=-Math.sign(mouse_last_speed)*0.5; //********可调加速度*********
        //设置定时器开始惯性滚动
        mouse_timer=setInterval(function(){
            //速度没有减到停止 而且 没有滚到顶 而且 没有滚到底
            if(mouse_last_speed*mouse_last_accelerate<0 && element.scrollTop>0 && element.scrollTop<scrollTop_max)
            {
                element.scrollTop+=mouse_last_speed;    //按速度滚动页面
                mouse_last_speed+=mouse_last_accelerate;//按加速度调整速度
            }
            else//满足停止滚动的条件
            {
                clearInterval(mouse_timer);             //清除定时器,停止滚动
            }
        }, 16);

        isscrolling=false;
    }

    //********************************
    //下面实现触摸滚动
    //********************************
    var touch_timer=null;       //手指拖动滚动定时器
    var touch_last_Y= 0;        //上一次拖动事件发生的Y坐标
    var touch_last_time=0;      //上一次拖动事件发生的时间
    var touch_last_length=0;    //上一次进行滚动的距离
    var touch_last_speed=0;     //上两次滚动的平均速度
    var touch_last_speed1=0;    //上上次滚动的速度
    var touch_last_speed2=0;    //上一次滚动的速度
    var touch_last_accelerate=0;//上一次滚动的加速度,方向和速度相反，大小固定

    //添加监听事件
    element.addEventListener('touchstart', ontouchstart, false);

    //手指放上时开始任务
    function ontouchstart(event)
    {
        if(isscrolling==false) //是否有其他滚动操作
        {
            isscrolling = true;
            //初始化上面的各个参数
            clearInterval(touch_timer);
            touch_last_Y = event.touches[0].clientY;
            touch_last_time = event.timeStamp;
            touch_last_length = 0;
            touch_last_speed = 0;
            touch_last_speed1 = 0;
            touch_last_speed2 = 0;
            touch_last_accelerate = 0;
            //计算向下滚动的最大值，这个需要每次都计算，因为页面大小可能经常改变
            scrollTop_max = element.scrollHeight - element.clientHeight;
            //开始监听其他事件
            element.addEventListener('touchmove', ontouchmove, false);
            element.addEventListener('touchend', ontouchend, false);
        }
    }

    //手指按下时会设置监听器，手指抬起时会清除监听器
    function ontouchmove(event)
    {
        //下面代码类似onmousemove中的代码，请参考其注释
        touch_last_speed1=touch_last_speed2;
        touch_last_length=-(event.changedTouches[0].clientY-touch_last_Y);
        touch_last_speed2=touch_last_length/(event.timeStamp-touch_last_time);
        if((touch_last_length<0 && element.scrollTop>0) || (touch_last_length>0 && element.scrollTop<scrollTop_max))
        {
            if((event.timeStamp-touch_last_time)>16)
            {
                touch_last_Y=event.changedTouches[0].clientY;
                touch_last_time=event.timeStamp;
                element.scrollTop+=touch_last_length;
            }
            event.preventDefault(); //屏蔽默认操作，防止页面卡顿
            event.stopPropagation();//如果页面没滚完，就停止事件传播，防止页面卡顿
        }
    }

    //手指抬起后作善后工作，并进行惯性滚动
    function ontouchend(event)
    {
        //下面代码类似onmouseup中的代码，请参考其注释
        element.removeEventListener('touchmove', ontouchmove, false);
        element.removeEventListener('touchend', ontouchend, false);

        touch_last_speed=(touch_last_speed1*touch_last_speed2>0) ? (touch_last_speed1+touch_last_speed2)/2 : touch_last_speed2;
        touch_last_speed=Math.round(touch_last_speed*20);       //********可调速度*********
        touch_last_accelerate=-Math.sign(touch_last_speed)*0.4; //********可调加速度*********

        touch_timer=setInterval(function(){
            if(touch_last_speed*touch_last_accelerate<0 && element.scrollTop>0 && element.scrollTop<scrollTop_max)
            {
                element.scrollTop+=touch_last_speed;
                touch_last_speed+=touch_last_accelerate;
            }
            else
            {
                clearInterval(touch_timer);
            }
        }, 16);

        isscrolling=false;
    }
}

