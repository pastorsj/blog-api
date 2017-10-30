import request from 'supertest';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import chai from 'chai';

import app from '../../src/app';
import log from '../src/log';

chai.use(sinonChai);

let sandbox;

function spyOnLogger() {
    sandbox.spy(log, 'debug');
    sandbox.spy(log, 'info');
    sandbox.spy(log, 'critical');
    sandbox.spy(log, 'fatal');
    sandbox.spy(log, 'warning');
}

before(() => {
    sandbox = sinon.sandbox.create();
    spyOnLogger();
});

after(() => {
    sandbox.restore();
    setTimeout(() => {
        process.exit(0);
    }, 5);
});
