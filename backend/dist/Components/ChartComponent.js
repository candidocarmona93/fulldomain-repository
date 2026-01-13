import { BaseWidget } from "../../../src/core/BaseWidget";
import ApexCharts from 'apexcharts';

export class ChartComponent extends BaseWidget {
    constructor({
        type = "bar",
        height = "auto",
        width = "100%",
        style = {},
        className = [],
        props = {},
        options = {},
        series = [],
        labels = [],
        categories = []
    }) {
        super({
            tagName: "div",
            style: {
                height,
                width,
                ...style
            },
            className,
            props,
            onMounted: (el) => {
                this.chartElement = el;
                this.initChart();
            }
        });

        this.chartType = type;
        this.height = height;
        this.width = width;
        this.userOptions = options;
        this.series = series;
        this.labels = labels;
        this.categories = categories;
        this._chart = null;
    }

    initChart() {
        if (!this.chartElement) return;
        this._destroyChart();

        this._chart = new ApexCharts(this.chartElement, this.getChartConfig());
        this._chart.render();
    }

    _destroyChart() {
        if (this._chart) {
            this._chart.destroy();
            this._chart = null;
        }
    }

    getChartConfig() {
        const isPieChart = ['pie', 'donut'].includes(this.chartType);
        
        const baseConfig = {
            chart: {
                type: this.chartType,
                height: this.height,
                width: this.width,
                animations: { enabled: true },
                ...(this.userOptions.chart || {})
            },
            series: this.series,
            ...this.userOptions
        };

        if (isPieChart) {
            baseConfig.labels = this.labels;
        } else {
            baseConfig.xaxis = {
                categories: this.categories.length ? this.categories : this.labels,
                ...(this.userOptions.xaxis || {})
            };
        }

        return {
            ...baseConfig,
            ...this.getTypeSpecificConfig()
        };
    }

    getTypeSpecificConfig() {
        switch (this.chartType) {
            case 'bar':
                return {
                    plotOptions: {
                        bar: {
                            horizontal: false,
                            columnWidth: '55%',
                            endingShape: 'rounded',
                            ...this.userOptions.plotOptions?.bar
                        }
                    },
                    dataLabels: {
                        enabled: false,
                        ...this.userOptions.dataLabels
                    },
                    stroke: {
                        show: true,
                        width: 2,
                        colors: ['transparent'],
                        ...this.userOptions.stroke
                    }
                };

            case 'line':
                return {
                    stroke: {
                        curve: 'smooth',
                        width: 3,
                        ...this.userOptions.stroke
                    },
                    markers: {
                        size: 5,
                        ...this.userOptions.markers
                    }
                };

            case 'pie':
            case 'donut':
                return {
                    labels: this.labels,
                    plotOptions: {
                        pie: {
                            donut: {
                                labels: {
                                    show: true,
                                    name: {
                                        show: true,
                                        fontSize: '12px'
                                    },
                                    value: {
                                        show: true,
                                        fontSize: '16px',
                                        fontWeight: 600
                                    },
                                    total: {
                                        show: true,
                                        showAlways: true,
                                        label: 'Total',
                                        color: '#6c757d'
                                    }
                                }
                            },
                            ...this.userOptions.plotOptions?.pie
                        }
                    },
                    legend: {
                        position: 'right',
                        markers: {
                            radius: 2
                        },
                        ...this.userOptions.legend
                    },
                    dataLabels: {
                        enabled: true,
                        formatter: function(val, { seriesIndex }) {
                            return this.labels[seriesIndex] + ': ' + val.toFixed(1) + '%';
                        }.bind(this),
                        ...this.userOptions.dataLabels
                    }
                };

            default:
                return {};
        }
    }

    onUpdate() {
        this.initChart();
    }

    render() {
        return super.render();
    }
}