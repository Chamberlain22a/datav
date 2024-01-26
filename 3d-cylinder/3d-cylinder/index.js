var Event = require('bcore/event');
var $ = require('jquery');
var _ = require('lodash');
var EChart = require('echarts');
//var Chart = require('XXX');

/**
 * 马良基础类
 */
module.exports = Event.extend(function Base(container, config) {
    this.config = { series: [], yAxis: { data: [], type: 'value' }, xAxis: { data: [], type: 'category' }, legend: { data: [] } };
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
        console.log(this._data, 'this._data');
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
        let dataDefine = []
        if (config.lineSeries) {
            data.forEach((itemy, index) => {
                dataDefine.push({
                    value: itemy.y,
                    itemStyle: {
                        color: config.lineSeries[index].areaStyle3
                    }
                })
                itemy.value = itemy.y
                itemy.itemStyle = {
                    opacity: 0.6,
                    // color: {
                    //     type: 'linear',
                    //     x: 0,
                    //     y: 0,
                    //     x2: 0,
                    //     y2: 1,
                    //     colorStops: [{
                    //         offset: 0,
                    //         color: config.lineSeries[index].areaStyle // 0% 处的颜色
                    //     }, {
                    //         offset: 0.5,
                    //         color: config.lineSeries[index].areaStyle1, // 100% 处的颜色
                    //     },
                    //    {
                    //        offset: 1,
                    //        color: config.lineSeries[index].areaStyle2, // 100% 处的颜色
                    //    }],
                    //     global: false // 缺省为 false
                    // },
                    borderRadius: 0,
                }

            })

            this.config.series = [

                //自定义背景的柱子
                {
                    type: 'pictorialBar',
                    name: 'pictorial element',
                    symbolSize: ['35%', '100%'],
                    symbolPosition: 'end',
                    z: 100,
                    data: [{
                            value: this._data[0].value,
                            // Image link.
                            symbol: 'image://' +
                                'https://10.20.152.2/api/operation/static/img/project/barChartOne.png'
                        },
                        {
                            value: this._data[1].value,
                            // Image link.
                            symbol: 'image://' +
                                'https://10.20.152.2/api/operation/static/img/project/barChartTwo.png'
                        },

                        {
                            value: this._data[2].value,
                            // Image link.
                            symbol: 'image://' +
                                'https://10.20.152.2/api/operation/static/img/project/barChartThree.png'

                        },
                        {
                            value: this._data[3].value,
                            // Image link.
                            symbol: 'image://' +
                                'https://10.20.152.2/api/operation/static/img/project/barChartFour.png'

                        },
                        {
                            value: this._data[4].value,
                            // Image link.
                            symbol: 'image://' +
                                'https://10.20.152.2/api/operation/static/img/project/barChartFive.png'

                        },



                    ]
                },
                //下方有颜色填充的的柱子
                // {
                //     type: "bar",
                //     barWidth: config.axis.yAxis.width,
                //     barGap: "10%",
                //     stack: "1",
                //     data: _.defaultsDeep(data || []),

                // },


            ]
            this.config.xAxis = config.axis.xAxis
            this.config.xAxis.data = data.map(item => item.x)
            this.config.xAxis.axisLabel.formatter = function(params) {
                var result = ""
                let labelLength = config.axis.xAxis.axisLabel.ellipsis
                if (params.length > labelLength) {
                    result = params.substring(0, labelLength) + "..."
                } else {
                    result = params
                }
                return result;
            }
            this.config.yAxis = config.axis.yAxis
            this.config.grid = config.chart.margin
            this.config.tooltip = _.defaultsDeep(config.others.tooltip),
                this.config.tooltip.trigger = "axis"
            this.config.tooltip.axisPointer = { type: 'shadow' }
            this.config.tooltip.formatter = function(params) {
                var result = '<strong>' + params[0].name + '</strong><br>';
                result += '数量：' + params[0].value + '<br>';
                return result;
            }

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
    }
});