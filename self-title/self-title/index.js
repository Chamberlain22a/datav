var Event = require('bcore/event');
const { fn } = require('jquery');
var $ = require('jquery');
var _ = require('lodash');
//var Chart = require('XXX');

/**
 * 马良基础类
 */
module.exports = Event.extend(function Base(container, config) {
  this.config = {
    theme: {}
  }
  this.container = $(container);           //容器
  this.apis = config.apis;                 //hook一定要有
  this._data = null;                       //数据
  this.chart = null;                       //图表
  this.init(config);
}, {
  /**
   * 公有初始化
   */
  init: function (config) {
    //1.初始化,合并配置
    this.mergeConfig(config);
    //2.刷新布局,针对有子组件的组件 可有可无
    this.updateLayout();
    //3.子组件实例化
    //this.chart = new Chart(this.container[0], this.config);
    //4.如果有需要, 更新样式
    this.updateStyle();
  },
  /**
   * 绘制
   * @param data
   * @param options 不一定有
   * !!注意: 第二个参数支持config, 就不需要updateOptions这个方法了
   */
  render: function (data, config) {
    data = this.data(data);
    var cfg = this.mergeConfig(config);
    //更新图表
    //this.chart.render(data, cfg);
    let fn = function(){
      const el = document.getElementById(`${randomNumber}`)

      // 鼠标移入事件
      el.addEventListener('mouseover',function(e){
          e.stopPropagation();
        console.log(data,'自定义标题data');
        let tooltipHtml = document.getElementById('tooltip-div')
        // 获取el宽度 将tooltip放在右边显示
        const w = el.clientWidth
        const h = el.clientHeight
        if(!tooltipHtml){
          // tooltip样式
          tooltipHtml = document.createElement('div')
          tooltipHtml.setAttribute('id','tooltip-div')
          tooltipHtml.style.cursor="pointer"
          tooltipHtml.style.padding="5px 10px"
          tooltipHtml.style.background="rgba(0,0,0,0.5)"
          tooltipHtml.style.position="absolute"
          tooltipHtml.style.top='-'+(h+15)+'px'
          // tooltipHtml.style.left=w+'px'
          tooltipHtml.style.left='0px'
          tooltipHtml.style.zIndex="2001"
          tooltipHtml.style.whiteSpace="nowrap"
          tooltipHtml.style.borderRadius="5px"
          tooltipHtml.innerHTML = `<span>${data[0].value}</span>`

          el.appendChild(tooltipHtml)
           console.log(tooltipHtml, '56inner-tooltipHtml');
           console.log(el, '56inner-el');

           
        }
        return
      })

      // 鼠标移出事件
      el.addEventListener('mouseleave',function(){
        let tooltipHtml = document.getElementById('tooltip-div')
        // console.log(tooltipHtml, 'tooltipHtml');
        // if (document.body.contains(tooltipHtml)) {
        //     document.body.removeChild(tooltipHtml);
        // }
        if (tooltipHtml!=null){
 document.getElementById('tooltip-div').remove();
        }
        else{
          return
        }
       
        // el.removeChild(tooltipHtml)
      })
    }
    // 不知道为啥配置突然不生效了
    console.log(5555555,cfg)
const randomNumber=Math.random() + 'a'
    const html = `
    <div id = "${randomNumber}"
    style = "width:100%;height:100;z-index=10000">
      <div style="
        width:100%;
        height:100%;
        font-size:16px;
        font-weight:bold;
        font-family:'SimHei';
        color:#fff;
        position:relative;
        overflow:hidden;
        white-space:nowrap;
        text-overflow:ellipsis;
        -o-text-overflow:ellipsis;">
        <span>${data[0].value}</span>
      </div>
    </div>`
    this.container.html(html)
    fn()
    //如果有需要的话,更新样式
    this.updateStyle();
  },
  /**
   *
   * @param width
   * @param height
   */
  resize: function (width, height) {
    this.updateLayout(width, height);
    //更新图表
    //this.chart.render({
    //  width: width,
    //  height: height
    //})
  },
  /**
   * 每个组件根据自身需要,从主题中获取颜色 覆盖到自身配置的颜色中.
   * 暂时可以不填内容
   */
  setColors: function () {
    //比如
    //var cfg = this.config;
    //cfg.color = cfg.theme.series[0] || cfg.color;
  },
  /**
   * 数据,设置和获取数据
   * @param data
   * @returns {*|number}
   */
  data: function (data) {
    if (data) {
      this._data = data;
    }
    return this._data;
  },
  /**
   * 更新配置
   * 优先级: config.colors > config.theme > this.config.theme > this.config.colors
   * [注] 有数组的配置一定要替换
   * @param config
   * @private
   */
  mergeConfig: function (config) {
    if (!config) {return this.config}
    this.config.theme = _.defaultsDeep(config.theme || {}, this.config.theme);
    this.setColors();
    this.config = _.defaultsDeep(config || {}, this.config);
    return this.config;
  },
  /**
   * 更新布局
   * 可有可无
   */
  updateLayout: function () {},
  /**
   * 更新样式
   * 有些子组件控制不到的,但是需要控制改变的,在这里实现
   */
  updateStyle: function () {
    var cfg = this.config;
    // 不知道为啥控制不了，需要排查一下原因
    this.container.css({
      'font-size': cfg.font.size + 'px',
      'color': cfg.font.color || '#fff',
      'font-weight':cfg.font.fontWeight||'normal',
      'font-family':cfg.font.fontFamily||'Microsoft Yahei',
    });
  },
  /**
   * 更新配置
   * !!注意:如果render支持第二个参数options, 那updateOptions不是必须的
   */
  //updateOptions: function (options) {},
  /**
   * 更新某些配置
   * 给可以增量更新配置的组件用
   */
  //updateXXX: function () {},
  /**
   * 销毁组件
   */
   destroy: function(){console.log('请实现 destroy 方法')}
});