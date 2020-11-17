import * as assert from 'assert';
import * as path from 'path';

import { Release, getRelease } from './index';

describe('LS installer', () => {
	it('should calculate correct file sha256 sum', async () => {
		const release = new Release({ name: "terraform-ls", version: "1.0.0"});
		const expectedSum = "0314c6a66b059bde92c5ed0f11601c144cbd916eff6d1241b5b44e076e5888dc";
		const testPath = path.resolve(__dirname, "..", "testFixture", "shasumtest.txt");

		const sum = await release.calculateFileSha256Sum(testPath);
		assert.strictEqual(sum, expectedSum);
	});

	// it('should find the requested version', async () => {
	// 	const release = await getRelease('terraform', '~0.14');
	// 	assert.strictEqual(release.name, "terraform");
	// 	assert.strictEqual(release.version, "0.13.5");
	// });
});
