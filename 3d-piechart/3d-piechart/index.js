var Event = require('bcore/event');
var $ = require('jquery');
var _ = require('lodash');
var Echarts = require('echarts');
require('echarts-gl');
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
     const cfgLegend = cfg.options.chart.legend
    let emptyColor = []
    // isEmpty,emptyData判断占位数据
    let isEmpty = false
    let emptyData = []

    if(data.every(k=>!k.value)){
      isEmpty = true
      data.forEach(item=>{
        item.isEmpty = true
        emptyColor.push('#455fd2')
        emptyData.push({name:item.name,value:100})
      })
    }
    if(!data||!data.length){
      isEmpty = true
      emptyColor.push('#455fd2')
      emptyData.push({name:'',value:100})
    }
    //更新图表
    //this.chart.render(data, cfg);
    // this.container.html(data[0].value)
    //更新图表
    //this.chart.render(data, cfg);
    // this.container.html(data[0].value)
    const dataT = isEmpty?emptyData:data
    const ratio =cfg.options.coordinate.ratios.ratio
    function toFixedNum(val, size = 2) {
      if (isNaN(+val)) return 0
      return +(+val).toFixed(size)
    }
  const color = cfg.options.series.tabs||[]
  
   function setLabel (data) {
      data.forEach((item, index) => {
        item.itemStyle = {
          color: color[index]&&color[index].seriesColor
        }
      })
    }

/**
 * 绘制3d图
 * @param pieData 总数据
 * @param internalDiameterRatio:透明的空心占比
 * @param distance 视角到主体的距离
 * @param alpha 旋转角度
 * @param pieHeight 立体的高度
 * @param opacity 饼或者环的透明度
 */
const getPie3D = (pieData, internalDiameterRatio, distance, alpha, pieHeight, opacity) => {
  const series = []
  let sumValue = 0
  let startValue = 0
  let endValue = 0
  let legendData = []
  let legendBfb = []
  const k = 1 - internalDiameterRatio
  pieData.sort((a, b) => {
    return b.value - a.value
  })
  setLabel(pieData)
  // 为每一个饼图数据，生成一个 series-surface 配置
  for (let i = 0; i < pieData.length; i++) {
    sumValue += pieData[i].value
    const seriesItem = {
      name:
          typeof pieData[i].name === 'undefined'
            ? `series${i}`
            : pieData[i].name,
      type: 'surface',
      parametric: true,
      wireframe: {
        show: false
      },
      pieData: pieData[i],
      pieStatus: {
        selected: false,
        hovered: false,
        k: k
      },
      center: ['10%', '50%']
    }
    if (typeof pieData[i].itemStyle !== 'undefined') {
      const itemStyle = {}
      itemStyle.color =
          typeof pieData[i].itemStyle.color !== 'undefined'
            ? pieData[i].itemStyle.color
            : opacity
      itemStyle.opacity =
          typeof pieData[i].itemStyle.opacity !== 'undefined'
            ? pieData[i].itemStyle.opacity
            : opacity
      seriesItem.itemStyle = itemStyle
    }
    series.push(seriesItem)
  }

  // 使用上一次遍历时，计算出的数据和 sumValue，调用 getParametricEquation 函数，
  // 向每个 series-surface 传入不同的参数方程 series-surface.parametricEquation，也就是实现每一个扇形。
  legendData = []
  legendBfb = []
  for (let i = 0; i < series.length; i++) {
    endValue = startValue + series[i].pieData.value
    series[i].pieData.startRatio = startValue / sumValue
    series[i].pieData.endRatio = endValue / sumValue
    series[i].parametricEquation = getParametricEquation(
      series[i].pieData.startRatio,
      series[i].pieData.endRatio,
      false,
      false,
      k,
      series[i].pieData.value
    )
    startValue = endValue
    const bfb = fomatFloat(series[i].pieData.value / sumValue, 4)
    legendData.push({
      name: series[i].name,
      value: bfb
    })
    legendBfb.push({
      name: series[i].name,
      value: bfb
    })
  }
  const boxHeight = getHeight3D(series, pieHeight) // 通过pieHeight设定3d饼/环的高度，单位是px
  // 准备待返回的配置项，把准备好的 legendData、series 传入。
  const option = {
     legend: {
          show: cfgLegend.show,
          data: legendData,
          type:cfgLegend.suite.type,
          orient: cfgLegend.suite.orient,
          // orient: 'horizontal',
          // bottom: 0,
          // itemGap: 10,
          right:cfgLegend.suite.position2==='right'?0:null,
          left:cfgLegend.suite.position2==='right'?null:(cfgLegend.suite.position2Small?cfgLegend.suite.position2Small:cfgLegend.suite.position2),
          // top:'bottom',
          top:cfgLegend.suite.positionSmall?cfgLegend.suite.positionSmall:cfgLegend.suite.position,
          height: cfgLegend.suite.height+'%',
          width:cfgLegend.suite.width+'%',
          icon:cfgLegend.suite.icon,
          itemGap:cfgLegend.suite.itemGap,
          itemWidth:cfgLegend.suite.itemWidth,
          itemHeight:cfgLegend.suite.itemHeight,
          textStyle:{
            color:cfgLegend.font.color,
            fontSize:cfgLegend.font.fontSize,
            fontFamily:cfgLegend.font.fontFamily,
            fontWeight:cfgLegend.font.fontWeight
          },
          formatter: 
            function (name) {
            console.log(3333,name, pieData)
            const valueL = cfgLegend.suite.value
            const percentL = cfgLegend.suite.percent
            const data_current = pieData.find(v=>v.name===name)||null
            const value_ = data_current?(data_current.value+(data_current.unit||cfg.options.chart.valueLabel.unit)):''
            const percent_ = data_current?data_current.percent+'%':''
            // const color_ = data_current ? data_current.itemStyle.color:'#ffffff'

              return name + (valueL ? ('  ' + `\n` + `\n` + value_) : '') + (percentL ? ('  ' + percent_) : '');
                  //  return `<span style="display:inline-block;margin-right:5px;width:10px;height:10px;background-color:'#ffffff';"></span>`
                  //  `${name}<br/>` + `${valueL?value_:''}` +
                  //  `${percentL?percent_:''}`;
          }
        
        },
        tooltip: {
          formatter: params => {
            if (params.seriesName !== 'mouseoutSeries' && params.seriesName !== 'pie2d') {
              let bfb = ((option.series[params.seriesIndex].pieData.endRatio - option.series[params.seriesIndex].pieData.startRatio) *
                100).toFixed(2);
              return `${params.seriesName}<br/>` +
                `<span style="display:inline-block;margin-right:5px;border-radius:10px;width:10px;height:10px;background-color:${params.color};"></span>` +
                `${isEmpty?0:bfb}%`;
            }
          }
        },
    xAxis3D: {
      min: -1,
      max: 1
    },
    yAxis3D: {
      min: -1,
      max: 1
    },
    zAxis3D: {
      min: -1,
      max: 1
    },
    grid3D: {
      show: false,
      boxHeight: boxHeight, // 圆环的高度
      viewControl: {
        // 3d效果可以放大、旋转等，请自己去查看官方配置
        alpha, // 角度
        beta:0,
        distance, // 调整视角到主体的距离，类似调整zoom
        rotateSensitivity: 0, // 设置为0无法旋转
        zoomSensitivity: 0, // 设置为0无法缩放
        panSensitivity: 0, // 设置为0无法平移
        autoRotate: false // 自动旋转
      },
      // postEffect: {//配置这项会出现锯齿，请自己去查看官方配置有办法解决 
      //   enable: true,
      //   bloom: {
      //       enable: true,
      //       bloomIntensity: 0.1
      //   },
      //   SSAO: {
      //       enable: true,
      //       quality: 'medium',
      //       radius: 2
      //   }
      // }
    },
    series: series
  }
  return option
}

/**
 * 生成扇形的曲面参数方程，用于 series-surface.parametricEquation
 */
const getParametricEquation = (startRatio, endRatio, isSelected, isHovered, k, h) => {
  // 计算
  const midRatio = (startRatio + endRatio) / 2
  const startRadian = startRatio * Math.PI * 2
  const endRadian = endRatio * Math.PI * 2
  const midRadian = midRatio * Math.PI * 2
  // 如果只有一个扇形，则不实现选中效果。
  if (startRatio === 0 && endRatio === 1) {
    isSelected = false
  }
  // 通过扇形内径/外径的值，换算出辅助参数 k（默认值 1/3）
  k = typeof k !== 'undefined' ? k : 1 / 3
  // 计算选中效果分别在 x 轴、y 轴方向上的位移（未选中，则位移均为 0）
  const offsetX = isSelected ? Math.cos(midRadian) * 0.1 : 0
  const offsetY = isSelected ? Math.sin(midRadian) * 0.1 : 0
  // 计算高亮效果的放大比例（未高亮，则比例为 1）
  const hoverRate = isHovered ? 1.05 : 1
  // 返回曲面参数方程
  return {
    u: {
      min: -Math.PI,
      max: Math.PI * 3,
      step: Math.PI / 32
    },
    v: {
      min: 0,
      max: Math.PI * 2,
      step: Math.PI / 20
    },
    x: function (u, v) {
      if (u < startRadian) {
        return (
          offsetX +
          Math.cos(startRadian) * (1 + Math.cos(v) * k) * hoverRate
        )
      }
      if (u > endRadian) {
        return (
          offsetX + Math.cos(endRadian) * (1 + Math.cos(v) * k) * hoverRate
        )
      }
      return offsetX + Math.cos(u) * (1 + Math.cos(v) * k) * hoverRate
    },
    y: function (u, v) {
      if (u < startRadian) {
        return (
          offsetY +
          Math.sin(startRadian) * (1 + Math.cos(v) * k) * hoverRate
        )
      }
      if (u > endRadian) {
        return (
          offsetY + Math.sin(endRadian) * (1 + Math.cos(v) * k) * hoverRate
        )
      }
      return offsetY + Math.sin(u) * (1 + Math.cos(v) * k) * hoverRate
    },
    z: function (u, v) {
      if (u < -Math.PI * 0.5) {
        return Math.sin(u)
      }
      if (u > Math.PI * 2.5) {
        return Math.sin(u) * h * 0.1
      }
      return Math.sin(v) > 0 ? 1 * h * 0.1 : -1
    }
  }
}

/**
 * 获取3d丙图的最高扇区的高度
 */
const getHeight3D = (series, height) => {
  series.sort((a, b) => {
    return b.pieData.value - a.pieData.value
  })
  return (height * 25) / series[0].pieData.value
}

/**
 * 格式化浮点数
 */
const fomatFloat = (num, n) => {
  let f = parseFloat(num)
  if (isNaN(f)) {
    return false
  }
  f = Math.round(num * Math.pow(10, n)) / Math.pow(10, n) // n 幂
  let s = f.toString()
  let rs = s.indexOf('.')
  // 判定如果是整数，增加小数点再补0
  if (rs < 0) {
    rs = s.length
    s += '.'
  }
  while (s.length <= rs + n) {
    s += '0'
  }
  return s
}

    const options = getPie3D(dataT, ratio, 240, 28, 26, cfg.options.chart.transparent)
    const pieData = JSON.parse(JSON.stringify(dataT))
    pieData.sort((a, b) => {
      return (b.value - a.value);
    });
    
    options.series.push({
      name: 'pie2d',
      type: 'pie',
      //  backgroundColor: 'transparent',
      labelLine: {
        show:cfg.options.chart.LabelLine,
        length: cfg.options.chart.LabelLine.slider1,
        length2: cfg.options.chart.LabelLine.slider2,
        lineStyle: {
          color: cfg.options.chart.LabelLine.color
        }
      },
      startAngle: 10, //起始角度，支持范围[0, 360]。
      clockwise: false,//饼图的扇区是否是顺时针排布。上述这两项配置主要是为了对齐3d的样式
      radius: ['20%', '55%'],
      center: ['50%', '50%'],
      data: pieData,
      itemStyle: {
        opacity: 0
      },
     // itemStyle: cfg.options.series.tabs!= 'undefined' ?{color:cfg.options.series.tabs[0].seriesColor} :{color:"red"},
      label: {
        opacity: 1,
        formatter: function (params) {
          const isValueLabel = cfg.options.chart.valueLabel.show
          const isPercentLabel = cfg.options.chart.percentLabel.show
          const isCategoryLabel = cfg.options.chart.categoryLabel.show
          const valueLabel = `{valueStyle|${params.value}${cfg.options.chart.valueLabel.unit}}`;
          const percentLabel = `{percentSty|${isEmpty?0:params.percent}%}`
          const categoryLabel = `{categorySty|${params.name}}`
          return (isValueLabel ? `{valueStyle|${isEmpty?0:params.value}${cfg.options.chart.valueLabel.unit}}` : '') + (isPercentLabel ? ` {percentSty|${isEmpty?0:params.percent}%}` : '')
            + (isCategoryLabel ? `\n{categorySty|${params.name}}` : '')
        },
        rich: {
          categorySty: {
            lineHeight: 20,
            ...cfg.options.chart.categoryLabel.font
          },
          percentSty: {
            // lineHeight: 14,
            ...cfg.options.chart.percentLabel.font
          },
          valueStyle: {
            // lineHeight: 14,
            ...cfg.options.chart.valueLabel.font
          }
        }
      }
    })

    //更新图表
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
    //更新图表
    this.chart.resize()
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