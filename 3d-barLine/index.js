var Event = require('bcore/event');
var $ = require('jquery');
var _ = require('lodash');
var EChart = require('echarts');
//var Chart = require('XXX');

/**
 * 马良基础类
 */
module.exports = Event.extend(function Base(container, config) {
    this.config = {
        series: [],
        yAxis: [{ data: [], type: 'value' }],
        xAxis: [{ data: [], type: 'category' }],
        legend: { data: [] }
    };
    this.container = $(container); //容器
    this.apis = config.apis; //hook一定要有
    this._data = null; //数据
    this.chart = null; //图表
    this.init(config);
}, {
    /**
     * 公有初始化
     */
    init: function(config) {
        //1.初始化,合并配置
        config = this.mergeConfig(config);
        this.chart = EChart.init(this.container[0]);
        this.chart.setOption(config);
    },
    /**
     * 绘制
     * @param data
     * @param options 不一定有
     * !!注意: 第二个参数支持config, 就不需要updateOptions这个方法了
     */
    render: function(data, config) {
        config = this.mergeConfig(config);
        data = this.data(data);
        var cfg = this.mergeData(data, config);
        this.chart.setOption(cfg);
        //如果有需要的话,更新样式
        this.updateStyle();
    },
    /**
     *
     * @param width
     * @param height
     */
    resize: function(width, height) {
        this.updateLayout(width, height);
        //更新图表

        this.chart.resize({
            width: width,
            height: height
        })

    },
    /**
     * 每个组件根据自身需要,从主题中获取颜色 覆盖到自身配置的颜色中.
     * 暂时可以不填内容
     */
    setColors: function() {
        //比如
        //var cfg = this.config;
        //cfg.color = cfg.theme.series[0] || cfg.color;
    },
    /**
     * 数据,设置和获取数据
     * @param data
     * @returns {*|number}
     */
    data: function(data) {
        if (data) {
            this._data = data;
        }
        return this._data;
    },
    abilitySort: function(arr, property) {
        let map = {};
        for (let i = 0; i < arr.length; i++) {
            const ai = arr[i];
            if (!map[ai[property]]) map[ai[property]] = [ai];
            else map[ai[property]].push(ai);
        }
        let res = [];
        Object.keys(map).forEach((key) => {
            res.push({
                [property]: key,
                data: map[key]
            });
        });

        return res;
    },
    /**
     * 更新配置
     * 优先级: config.colors > config.theme > this.config.theme > this.config.colors
     * [注] 有数组的配置一定要替换
     * @param config
     * @private
     */
    mergeData: function(data, config) {
        // let dataDefine = []
        let dataBar1 = []
        let dataBar2 = []
        let dataLine1 = []
        let dataLine2 = []
        this.config.legend.data = [
            '优化前使用量', '优化后使用量', '优化前使用率', '优化后使用率'
        ]
        this.config.legend.textStyle = {
            color: config.chart.legend.textStyle.color,
            fontSize: config.chart.legend.textStyle.fontSize
        }
        this.config.legend.right = '0px'
        this.config.legend.top = '-5px'
        if (config.lineSeries) {
            data.forEach((itemy, index) => {
                itemy.value = itemy.y
                if (itemy.s == 'bar1') {
                    dataBar1.push({
                        value: itemy.y,
                        itemStyle: {

                        }
                    })
                } else if (itemy.s == 'bar2') {
                    dataBar2.push({
                        value: itemy.y,
                        itemStyle: {

                        }
                    })
                } else if (itemy.s == 'line1') {
                    dataLine1.push({
                        value: itemy.y,
                        itemStyle: {

                        }
                    })
                } else if (itemy.s == 'line2') {
                    dataLine2.push({
                        value: itemy.y,
                        itemStyle: {}
                    })
                }



            })
            this.config.series = [{
                    name: '优化前使用量顶部',
                    type: 'pictorialBar',
                    symbolSize: [config.axis.yAxis.width, 5],
                    symbolOffset: ['-81%', -2],
                    symbolPosition: 'end',
                    z: 15,
                    zlevel: 2,
                    data: dataBar1,
                    color: '#D2FAFD',
                },
                {
                    name: '优化后使用量顶部',
                    type: 'pictorialBar',
                    symbolSize: [config.axis.yAxis.width, 5],
                    symbolOffset: ['81%', -2],
                    symbolPosition: 'end',
                    z: 15,
                    zlevel: 2,
                    data: dataBar2,
                    color: '#E8EEFD',
                },
                {
                    name: '优化前使用量',
                    type: 'bar',
                    barGap: '60%',

                    barWidth: config.axis.yAxis.width,
                    itemStyle: {
                        opacity: 0.6,
                        color: {
                            type: 'linear',
                            x: 0,
                            y: 0,
                            x2: 0,
                            y2: 1,
                            colorStops: [{
                                    offset: 0,
                                    color: '#00C8CB' // 0% 处的颜色
                                },
                                {
                                    offset: 0.5,
                                    color: '#196291' // 0% 处的颜色
                                },
                                {
                                    offset: 1,
                                    color: '#0D2A68' // 100% 处的颜色
                                }
                            ],
                            global: false // 缺省为 false
                        },
                        // borderColor: color1,
                        borderWidth: 1,
                        borderType: 'solid',
                    },
                    label: {
                        show: false,
                        position: 'top',
                        // color: 'rgba(119,167,255,1)',
                        color: '#fff',
                        fontSize: 12,
                        textAlign: 'center',
                    },
                    zlevel: 1,
                    data: _.defaultsDeep(dataBar1 || []),
                },
                {
                    name: '优化后使用量',
                    type: 'bar',
                    barGap: '60%',

                    barWidth: config.axis.yAxis.width,
                    itemStyle: {
                        opacity: 0.6,
                        color: {
                            type: 'linear',
                            x: 0,
                            y: 0,
                            x2: 0,
                            y2: 1,
                            colorStops: [{
                                    offset: 0,
                                    color: '#08289E' // 0% 处的颜色
                                },
                                {
                                    offset: 0.5,
                                    color: '#0C2B8B' // 0% 处的颜色
                                },
                                {
                                    offset: 1,
                                    color: '#0A2469' // 100% 处的颜色
                                }
                            ],
                            global: false // 缺省为 false
                        },
                        // borderColor: color2,
                        borderWidth: 1,
                        borderType: 'solid',
                    },
                    label: {
                        show: false,
                        position: 'top',
                        color: '#fff',
                        fontSize: 12,
                        textAlign: 'center',
                    },
                    zlevel: 1,
                    data: _.defaultsDeep(dataBar2 || []),
                },
                {
                    name: '绿色底座',
                    type: 'pictorialBar',
                    symbolSize: [config.axis.yAxis.width, 5],
                    symbolOffset: ['-81%', 1],
                    z: 12,
                    color: '#84E1E3',
                    data: [{
                            name: '',
                            value: '100',
                        },
                        {
                            name: '',
                            value: '100',
                        },
                        {
                            name: '',
                            value: '100',
                        },
                        {
                            name: '',
                            value: '100',
                        },
                        {
                            name: '',
                            value: '100',
                        },
                    ],
                },
                {
                    name: '蓝色底座',
                    type: 'pictorialBar',
                    symbolSize: [config.axis.yAxis.width, 5],
                    symbolOffset: ['81%', 1],
                    z: 12,
                    color: '#6279E8',
                    show: false,
                    data: [{
                            name: '',
                            value: '100',
                        },
                        {
                            name: '',
                            value: '100',
                        },
                        {
                            name: '',
                            value: '100',
                        },
                        {
                            name: '',
                            value: '100',
                        },
                        {
                            name: '',
                            value: '100',
                        }
                    ],
                },
                {
                    name: '优化前使用率',
                    type: 'line',
                    xAxisIndex: 1,
                    yAxisIndex: 1,
                    data: dataLine1,
                    symbolSize: 5,
                    itemStyle: {
                        opacity: 1,
                        color: {
                            type: 'linear',
                            x: 0,
                            y: 0,
                            x2: 0,
                            y2: 1,
                            colorStops: [{
                                    offset: 0,
                                    color: '#64C4CF' // 0% 处的颜色
                                },

                                {
                                    offset: 1,
                                    color: '#115E89' // 100% 处的颜色
                                }
                            ],
                            global: false // 缺省为 false
                        },
                        // borderColor: color1,
                        borderWidth: 1,
                        borderType: 'solid',
                    },
                    smooth: true
                },

                {
                    name: '优化后使用率',
                    type: 'line',
                    xAxisIndex: 1,
                    yAxisIndex: 1,
                    symbolSize: 5,
                    data: dataLine2,
                    itemStyle: {
                        opacity: 1,
                        color: {
                            type: 'linear',
                            x: 0,
                            y: 0,
                            x2: 0,
                            y2: 1,
                            colorStops: [{
                                    offset: 0,
                                    color: '#08289E' // 0% 处的颜色
                                },
                                {
                                    offset: 1,
                                    color: '#2D49AC' // 0% 处的颜色
                                }
                            ],
                            global: false // 缺省为 false
                        },
                        // borderColor: color2,
                        borderWidth: 1,
                        borderType: 'solid',
                    },
                    smooth: true
                }
            ]
            this.config.xAxis[0] = config.axis.xAxis
            this.config.xAxis[0].data = this.filterArray(data, 'x').map(item => item.x)
             this.config.xAxis[0].axisLabel = config.axis.xAxis.axisLabel
            this.config.xAxis[0].axisLabel.formatter = function(params) {
                var result = ""
                let labelLength = config.axis.xAxis.axisLabel.ellipsis
                if (params.length > labelLength) {
                    result = params.substring(0, labelLength) + "..."
                } else {
                    result = params
                }
                return result;
            }

            this.config.grid = config.chart.margin
            this.config.tooltip = _.defaultsDeep(config.others.tooltip),
                this.config.tooltip.trigger = "axis"
            this.config.tooltip.axisPointer = { type: 'shadow' }
            this.config.tooltip.formatter = function(params) {
                var result = '<strong>' + params[0].name + '</strong><br>';
                result += '优化前使用量：' + params[2].value + '<br>';
                result += '优化后使用量：' + params[3].value + '<br>';
              
                    //返回数据类型为line的数据
           let paramsArray=params.filter((item,index)=>{
            return item.componentSubType=='line'
           })
             if (paramsArray[0].seriesName != undefined && paramsArray[0].seriesName == '优化前使用率') {
 result += '优化前使用率：' + (paramsArray[0].value[1]) + '%' + '<br>';
             }
            
                else if (paramsArray[0].seriesName != undefined && paramsArray[0].seriesName == '优化后使用率') {
                    result += '优化后使用率：' + (paramsArray[0].value[1]) + '%' + '<br>';
                }

                return result;
            }

            
            //为了使折线的点对齐柱状图, 增加了一个隐藏的x轴，用来控制线图的点的位置
            this.config.xAxis[1] = {
                type: 'value',
                max: 1000,
                show: false
            }
            //为了使折线标记点恰好浮于柱状图上方
            let that = this
            getNumber(this.config.series[6].data.length)

            function getNumber(prop) {
                console.log(this, '311111111');

                let num = (5 - prop) / 5
                that.config.series[6].data = that.config.series[6].data.map((x, i) => [(1000 / prop) * 0.5 - 30 + i * (1000 / prop), x.value])
                //   that.config.series[7].data = that.config.series[7].data.map((x, i) => [130 + (130 * num) + i * (1000 / prop), x.value])
                that.config.series[7].data = that.config.series[7].data.map((x, i) => [(1000 / prop) * 0.5 + 30 + i * (1000 / prop), x.value])

                //动态改变底座个数
                for (let i = 0; i < prop; i++) {
                    that .config .series[4].data = [],
                        that .config .series[5].data = [],
                        that .config .series[4].data.push({

                            name: '',
                            value: '100',

                        })
                    that .config .series[5].data.push({

                        name: '',
                        value: '100',

                    })

                }
   


            }


            this.config.yAxis[0] = {
                    type: 'value',
                    name: '核',
                    nameTextStyle: {
                        color: "#7A91BE", //颜色
                        padding: [15, 30, 0, 0],
                    },
                    min: 0,
                    max: 4000,
                    axisLabel: { ...config.axis.yAxis.axisLabel },
                    axisLine: { ...config.axis.yAxis.axisLine },
                    axisTick: { ...config.axis.yAxis.axisTick },
                    splitLine: { ...config.axis.yAxis.splitLine },
                    show: config.axis.yAxis.show,
                    width: config.axis.yAxis.width
                },
                //开启第二y轴
                this.config.yAxis[1] = {
                    min: 0,
                    max: 100,
                    nameTextStyle: {
                        color: "#7A91BE", //颜色
                        padding: [15, 0, 0, 55],
                    },
                    //  axisLabel: {
                    //     
                    //  },
                    type: 'value',
                    name: '使用率',
                    axisLabel: {
                        ...config.axis.yAxis.axisLabel,
                        formatter: '{value}%'
                    },
                    axisLine: { ...config.axis.yAxis.axisLine },
                    axisTick: { ...config.axis.yAxis.axisTick },
                    splitLine: { ...config.axis.yAxis.splitLine },
                    show: config.axis.yAxis.show,
                    width: config.axis.yAxis.width
                }

            //取数据中的最大值作为最大值单位
            this.config.yAxis[0].max = Math.max.apply(Math, data.map(item => { return item.y })),
                this.config.yAxis[0].name = config.axis.yAxis.name,
                this.config.yAxis[1].name = '使用率',
                this.config.yAxis[1].splitLine.show = false
            //自定义图例点击事件
            this.chart.on('legendselectchanged', function(params) {
                console.log(this, 'this', params, 'params');
                if (params.name == '优化前使用量') {
                    this.config.legend.selected = {
                        优化前使用量顶部: params.selected.优化前使用量,
                        绿色底座: params.selected.优化前使用量

                    }
                } else if (params.name == '优化后使用量') {
                    this.config.legend.selected = {
                        优化后使用量顶部: params.selected.优化后使用量,
                        蓝色底座: params.selected.优化后使用量

                    }
                }
                this.render()
            }.bind(this))

        }
        return config
    },
    mergeConfig: function(config) {
        if (!config) { return this.config }

        config.options.lineSeries = config.options.lineSeries.tabs
        this.config = _.defaultsDeep(config.options || {}, this.config);

        return this.config;
    },
    /**
     * 更新布局
     * 可有可无
     */
    updateLayout: function() {},
    /**
     * 更新样式
     * 有些子组件控制不到的,但是需要控制改变的,在这里实现
     */

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
    updateStyle: function() {
        var cfg = this.config;
    },
    clear: function() {
        this.chart && this.chart.clear && this.chart.clear();
    },
    /**
     * 销毁组件
     */
    destroy: function() {
        this.chart && this.chart.dispose && this.chart.dispose();
    },

    /**
     * 自定义的数组去重的方法
     *(arr代表需要去重的数组, prop代表传入的属性名) 
     */
    filterArray: function(arr, prop) {
        // 创建一个空的map对象，用于存储去重后的数组对象
        let map = new Map();
        // 遍历数组对象，以属性值为键，整个对象为值，存入map对象
        arr.forEach(item => {
            map.set(item[prop], item);
        });
        // 将map对象转换为数组对象，使用Set方法去除重复的键
        let result = [...new Set(map.values())];
        // 返回结果
        return result;

    },


});