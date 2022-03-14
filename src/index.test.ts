import * as assert from 'assert';
import * as path from 'path';

import { Release } from './index';

describe('LS installer', () => {
	it('should calculate correct file sha256 sum', async () => {
		const release = new Release({ name: "terraform-ls", version: "1.0.0" });
		const expectedSum = "0314c6a66b059bde92c5ed0f11601c144cbd916eff6d1241b5b44e076e5888dc";
		const testPath = path.resolve(__dirname, "..", "testFixture", "shasumtest.txt");

		const sum = await release.calculateFileSha256Sum(testPath);
		assert.strictEqual(sum, expectedSum);
	});

	it('should download the correct sha256 sum', async () => {
		const validSum =
			'8629ccc47ee8d4dfe6d23efb93b293948a088a936180d07d3f2ed118f6dd64a5';
		const release = new Release({
			name: 'terraform-ls',
			version: '0.25.2',
			shasums: 'terraform-ls_0.25.2_SHA256SUMS',
			shasums_signature: 'terraform-ls_0.25.2_SHA256SUMS.sig',
			shasums_signatures: [
				'terraform-ls_0.25.2_SHA256SUMS.72D7468F.sig',
				'terraform-ls_0.25.2_SHA256SUMS.sig',
			],
			builds: [
				{
					name: 'terraform-ls',
					version: '0.25.2',
					os: 'darwin',
					arch: 'amd64',
					filename: 'terraform-ls_0.25.2_darwin_amd64.zip',
					url: 'https://releases.hashicorp.com/terraform-ls/0.25.2/terraform-ls_0.25.2_darwin_amd64.zip',
				},
			],
		});

		const remoteSum = await release.downloadSha256Sum(
			release.builds[0].filename
		);

		assert.strictEqual(remoteSum, validSum);
	});
});
