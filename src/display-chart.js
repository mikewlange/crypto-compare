/**
 * Created by istrauss on 1/20/2017.
 */

import {inject, bindable} from 'aurelia-framework';
import Chart from 'chart.js/src/chart'

@inject(Element)
export class DisplayChartCustomElement {

    @bindable config;

    constructor(element) {
        this.element = element;
    }

    configChanged() {
        if (this.chart) {
            this.chart.destroy();
        }
        if (!this.config) {
            return;
        }
        const canvas = $(this.element).find('canvas')[0];
        this.chart = new Chart(canvas, this.config);
    }
}
