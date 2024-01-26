var Event = require('bcore/event');
var $ = require('jquery');
var _ = require('lodash');
var Echarts = require('echarts');

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
    this.chart = Echarts.init(this.container[0])
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
    
    const chart = cfg.options.chart
    const axis = cfg.options.axis
    const cfgSeries = cfg.options.series


    // legend位置
    let legendTop = null,legendLeft = null,legendBottom = null,legendRight = null;
    if(chart.legend.suite.orient==='handleSelf'){
      legendTop = chart.legend.suite.top&&chart.legend.suite.top||null
      legendLeft = chart.legend.suite.left&&chart.legend.suite.left||null
      legendBottom = chart.legend.suite.bottom&&chart.legend.suite.bottom||null
      legendRight = chart.legend.suite.right&&chart.legend.suite.right||null
    }else{
      switch(chart.legend.suite.orient){
        case 'top-left' :
          legendLeft='left'
          break
        case 'top-center' :
          legendLeft='center'
          break
        case 'top-right' :
          legendLeft='right'
          break
        case 'bottom-left' :
          legendTop='bottom'
          legendLeft='left'
          break
        case 'bottom-center' :
          legendTop='bottom'
          legendLeft='center'
          break
        case 'bottom-right' :
          legendTop='bottom'
          legendLeft='right'
          break
      }
    }

    // 组装数据
    let legendData = []
    let xData = []
    let series = []
    data.map(item=>{
      if(!legendData.some(v=>v===item.s)){
        legendData.push(item.s)
      }
      if(!xData.some(v=>v===item.x)){
        xData.push(item.x)
      }
    })
    legendData.map((item,idx)=>{
      let itemData = []
      const list = data.filter(v=>v.s===item)
      itemData = list.map(el=>{return el.y})

      series.push({
        name: item,
        type: 'line',
        symbol:chart.symbol.type,
        symbolSize:chart.symbol.symbolSize,
        stack: chart.stack?'total':null,
        smooth:chart.smooth,
        label: {
          show: false
        },
        lineStyle:{
          width:chart.lineStyle.width
        },
        areaStyle: {
          color:new Echarts.graphic.LinearGradient(0, 0, 0, 1, [
            {
              offset: 0,
              color: cfgSeries.tabs[idx].seriesColor,
            },
            // {
            //   offset: 0.6,
            //   color: 'rgb(0, 0, 0,0)'
            // },
            {
              offset: 1,
              color: 'rgb(0, 0, 0,0)'
            }
          ]),
          opacity:chart.areaStyle.opacity
        },
        lineStyle:{
          color:cfgSeries.tabs[idx].seriesColor
        },
        itemStyle:{
          color:cfgSeries.tabs[idx].seriesColor
        },
        emphasis: {
          focus: 'series'
        },
        data: itemData
      })
    })

    const options = {
      tooltip: {
        trigger: 'axis',
        backgroundColor:'rgba(50,50,50,0.7)',
        borderColor:'rgba(50,50,50,0.7)',
        textStyle:{
          color:'#FFFFFF'
        }
      },
      legend: {
        show:chart.legend.show,
        type:chart.legend.suite.type,
        // icon:'emptyCircle',
        top:legendTop,
        left:legendLeft,
        bottom:legendBottom,
        right:legendRight,
        itemGap:chart.legend.suite.itemGap,
        textStyle:{
          color:'#FFFFFF'
        },
        data: legendData
      },
      grid: {
        top: chart.grid.top,
        left: chart.grid.left,
        right: chart.grid.right,
        bottom: chart.grid.bottom,
        containLabel: true
      },
      xAxis: [
        {
          type: 'category',
          boundaryGap: false,
          axisTick:{
            show:false
          },
          boundaryGap:[5,5],
          axisLabel:{
            interval: 0,//强制显示
            color:axis.xAxis.axisLabel.color,
            padding:[axis.xAxis.axisLabel.padding.top,axis.xAxis.axisLabel.padding.right,axis.xAxis.axisLabel.padding.bottom,axis.xAxis.axisLabel.padding.left]
          },
          axisLine:{
            show:axis.xAxis.axisLine.show,
            lineStyle:{
              width:axis.xAxis.axisLine.width,
              color:axis.xAxis.axisLine.color
            }
          },
          data: xData
        }
      ],
      yAxis: [
        {
          type: 'value',
          axisLabel:{
            color:"#FFFFFF",
          },
          axisLine:{
            show:axis.yAxis.axisLine.show,
          },
          splitLine:{
            lineStyle:{
              color:axis.yAxis.splitLine.color,
              type:axis.yAxis.splitLine.type
            }
          },
        }
      ],
      series: series
    };
    this.chart.setOption(options)

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
    this.chart.resize()
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
    this.container.css({
      'font-size': cfg.size + 'px',
      'color': cfg.color || '#fff'
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
   destroy: function(){
    console.log('请实现 destroy 方法')
    this.chart.dispose()
  }
});