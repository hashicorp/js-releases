import * as assert from 'assert';
import * as path from 'path';
import * as fs from 'fs';
import * as tempy from 'tempy';


import { Release } from './index';

describe('LS installer', () => {
	let release;

	before(() => {
		release = new Release({
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
	});

	it('should calculate correct file sha256 sum', async () => {
		const expectedSum = "0314c6a66b059bde92c5ed0f11601c144cbd916eff6d1241b5b44e076e5888dc";
		const testPath = path.resolve(__dirname, "..", "testFixture", "shasumtest.txt");

		const sum = await release.calculateFileSha256Sum(testPath);
		assert.strictEqual(sum, expectedSum);
	});

	it('should download the correct sha256 sum', async () => {
		const expectedSum = '8629ccc47ee8d4dfe6d23efb93b293948a088a936180d07d3f2ed118f6dd64a5';

		const remoteSum = await release.downloadSha256Sum(
			release.builds[0].filename
		);
		assert.strictEqual(remoteSum, expectedSum);
	});

	it('should download the release', async () => {
		const build = release.getBuild('darwin', 'amd64');
		const tmpDir = tempy.directory();
		const zipFile = path.resolve(tmpDir, `terraform-ls_v${release.version}.zip`);

		await release.download(build.url, zipFile, 'js-releases/mocha-test');
		await release.verify(zipFile, build.filename);

		fs.rmSync(tmpDir, {
			recursive: true
		});
	}).timeout(20 * 1000) // increase timeout for file download
});
