import {HttpClient} from 'aurelia-fetch-client';
import {inject} from 'aurelia-framework';
import regression from 'regression';

@inject(Element, HttpClient)
export class RelationRowCustomElement {

    constructor(element, httpClient) {
        this.element = element;
        this.httpClient = httpClient;
    }

    activate(config) {
        this.config = config;
        this.recalculate();
    }

    recalculate() {
        this.calculating = true;
        return Promise.all([
                this.getChartData(this.config.underlyingCurrencyPair, this.config.numMonths).then(values => values.map(d => d.weightedAverage)),
                this.getChartData(this.config.relatedCurrencyPair, this.config.numMonths).then(values => values.map(d => d.weightedAverage))
            ])
            .then(values => {
                this.underlyingData = values[0];
                this.relatedData = values[1];
                this.regression = this.calculateRegression(this.underlyingData, this.relatedData);
                const slope = this.regression.equation[0];
                const yIntercept = this.regression.equation[1];
                this.predictedValue = this.regression.points[this.regression.points.length - 1][1];
                this.actualValue = this.relatedData[this.relatedData.length - 1];
                this.calculating = false;
            });
    }

    calculateRegression(underlyingData, relatedData) {
        const regressionData = underlyingData.map((dataPoint, index) => {
            return [dataPoint, relatedData[index]];
        });
        return regression(this.config.fitType, regressionData);
    }

    getChartData(currencyPair, months) {
        const now = new Date();
        const then = new Date();
        then.setMonth(now.getMonth() - months);
        const nowUnix = parseInt((now.getTime() / 1000).toFixed(0));
        const thenUnix = parseInt((then.getTime() / 1000).toFixed(0));

        const url = 'https://poloniex.com/public?command=returnChartData&currencyPair=' + currencyPair +'&start=' + thenUnix + '&end=' + nowUnix + '&period=14400';
        return this.httpClient.fetch(url)
            .then(response => {
                return response.json();
            });
    }

    viewChart() {
        const event = new CustomEvent('view-chart', {
            detail: {
                type: 'line',
                data: {
                    labels: this.underlyingData,
                    datasets: [
                        {
                            label: 'Actual',
                            data: this.relatedData,
                            backgroundColor: "rgba(227,103,103,0.4)"
                        },
                        {
                            label: 'Predicted',
                            data: this.regression.points.map(p => p[1]),
                            backgroundColor: "rgba(124,166,224,0.4)"
                        }
                    ]
                }
            }
        });

        this.element.dispatchEvent(event);
    }

    viewRelationship() {
        const sortedUnderlying = this.regression.points.slice(0).sort((a, b) => {
            return a[0] < b[0] ? -1 : b[0] < a[0] ? 1 : 0;
        });

        const event = new CustomEvent('view-chart', {
            detail: {
                type: 'line',
                data: {
                    labels: sortedUnderlying.map(p => p[0]),
                    datasets: [
                        {
                            label: 'Predicted',
                            data: sortedUnderlying.map(p => p[1]),
                            backgroundColor: "rgba(124,166,224,0.4)"
                        }
                    ]
                }
            }
        });

        this.element.dispatchEvent(event);
    }
}
