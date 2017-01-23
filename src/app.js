import {HttpClient} from 'aurelia-fetch-client';
import {inject} from 'aurelia-framework';

@inject(HttpClient)
export class App {

    errorMessage = '';

    relationConfigs = [];

    newConfig = {};

    constructor(httpClient) {
        this.httpClient = httpClient;

        this.fitTypes = [
            'linear',
            'exponential',
            'logarithmic',
            'power',
            'polynomial'
        ];
    }

    activate() {
        return this.httpClient.fetch('https://poloniex.com/public?command=returnTicker')
            .then(response => response.json())
            .then(tickers => {
                this.currencyPairs = Object.keys(tickers).sort();
            });
    }

    addConfig() {
        if (!this.newConfig.underlyingCurrencyPair) {
            this.errorMessage = 'Underlying Pair is required.';
            return;
        }

        if (!this.newConfig.relatedCurrencyPair) {
            this.errorMessage = 'Related Pair is required.';
            return;
        }

        if (!this.newConfig.fitType) {
            this.errorMessage = 'Fit Type is required.';
            return;
        }

        if (!this.newConfig.numMonths) {
            this.errorMessage = '# Months is required.';
            return;
        }

        this.relationConfigs.push(Object.assign({}, this.newConfig));

        this.errorMessage = '';
    }

    viewChart(evt) {
        this.chartConfig = evt.detail;
    }
}
