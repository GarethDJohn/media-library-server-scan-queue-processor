import 'mocha';
import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import sinon from 'sinon';
import mongoose from 'mongoose';
import { SourceFile } from '@media-library/media-library-models';
import { processDir } from '../src/index';

chai.use(chaiAsPromised);

const expect = chai.expect;

const dataDir = `${__dirname}/data/root`;

describe('processDir', function() {
    let sandbox;

    beforeEach(function() {
        sandbox = sinon.createSandbox();
    });

    afterEach(function() {
        sandbox.restore();
    });

    it('creates a new SourceFile and saves it', async function() {
        const fakeSourceFileSave = sinon.fake.resolves(undefined);
        sandbox.replace(SourceFile.prototype, 'save', fakeSourceFileSave);

        await processDir(mongoose.Types.ObjectId('0123456789ab'), dataDir);

        expect(fakeSourceFileSave.callCount).to.equal(1);
    });
});
