import * as crypto from 'crypto';
import * as fs from 'fs';
import * as https from 'https';
import * as openpgp from 'openpgp';
import * as semver from 'semver';
import * as yauzl from 'yauzl';

import { httpsRequest } from './utils';

const hashiPublicKey = `-----BEGIN PGP PUBLIC KEY BLOCK-----

mQENBFMORM0BCADBRyKO1MhCirazOSVwcfTr1xUxjPvfxD3hjUwHtjsOy/bT6p9f
W2mRPfwnq2JB5As+paL3UGDsSRDnK9KAxQb0NNF4+eVhr/EJ18s3wwXXDMjpIifq
fIm2WyH3G+aRLTLPIpscUNKDyxFOUbsmgXAmJ46Re1fn8uKxKRHbfa39aeuEYWFA
3drdL1WoUngvED7f+RnKBK2G6ZEpO+LDovQk19xGjiMTtPJrjMjZJ3QXqPvx5wca
KSZLr4lMTuoTI/ZXyZy5bD4tShiZz6KcyX27cD70q2iRcEZ0poLKHyEIDAi3TM5k
SwbbWBFd5RNPOR0qzrb/0p9ksKK48IIfH2FvABEBAAG0K0hhc2hpQ29ycCBTZWN1
cml0eSA8c2VjdXJpdHlAaGFzaGljb3JwLmNvbT6JAU4EEwEKADgWIQSRpuf4XQXG
VjC+8YlRhS2HNI/8TAUCXn0BIQIbAwULCQgHAgYVCgkICwIEFgIDAQIeAQIXgAAK
CRBRhS2HNI/8TJITCACT2Zu2l8Jo/YLQMs+iYsC3gn5qJE/qf60VWpOnP0LG24rj
k3j4ET5P2ow/o9lQNCM/fJrEB2CwhnlvbrLbNBbt2e35QVWvvxwFZwVcoBQXTXdT
+G2cKS2Snc0bhNF7jcPX1zau8gxLurxQBaRdoL38XQ41aKfdOjEico4ZxQYSrOoC
RbF6FODXj+ZL8CzJFa2Sd0rHAROHoF7WhKOvTrg1u8JvHrSgvLYGBHQZUV23cmXH
yvzITl5jFzORf9TUdSv8tnuAnNsOV4vOA6lj61Z3/0Vgor+ZByfiznonPHQtKYtY
kac1M/Dq2xZYiSf0tDFywgUDIF/IyS348wKmnDGjuQENBFMORM0BCADWj1GNOP4O
wJmJDjI2gmeok6fYQeUbI/+Hnv5Z/cAK80Tvft3noy1oedxaDdazvrLu7YlyQOWA
M1curbqJa6ozPAwc7T8XSwWxIuFfo9rStHQE3QUARxIdziQKTtlAbXI2mQU99c6x
vSueQ/gq3ICFRBwCmPAm+JCwZG+cDLJJ/g6wEilNATSFdakbMX4lHUB2X0qradNO
J66pdZWxTCxRLomPBWa5JEPanbosaJk0+n9+P6ImPiWpt8wiu0Qzfzo7loXiDxo/
0G8fSbjYsIF+skY+zhNbY1MenfIPctB9X5iyW291mWW7rhhZyuqqxN2xnmPPgFmi
QGd+8KVodadHABEBAAGJATwEGAECACYCGwwWIQSRpuf4XQXGVjC+8YlRhS2HNI/8
TAUCXn0BRAUJEvOKdwAKCRBRhS2HNI/8TEzUB/9pEHVwtTxL8+VRq559Q0tPOIOb
h3b+GroZRQGq/tcQDVbYOO6cyRMR9IohVJk0b9wnnUHoZpoA4H79UUfIB4sZngma
enL/9magP1uAHxPxEa5i/yYqR0MYfz4+PGdvqyj91NrkZm3WIpwzqW/KZp8YnD77
VzGVodT8xqAoHW+bHiza9Jmm9Rkf5/0i0JY7GXoJgk4QBG/Fcp0OR5NUWxN3PEM0
dpeiU4GI5wOz5RAIOvSv7u1h0ZxMnJG4B4MKniIAr4yD7WYYZh/VxEPeiS/E1CVx
qHV5VVCoEIoYVHIuFIyFu1lIcei53VD6V690rmn0bp4A5hs+kErhThvkok3c
=+mCN
-----END PGP PUBLIC KEY BLOCK-----`;

const releasesUrl = "https://releases.hashicorp.com";

interface Build {
	url: string,
	filename: string
}

export class Release {
	public name: string;
	public version: string;
	public builds?: any[];
	public shasums?: string;
	public shasums_signature?: string;

	constructor(
		release: any
	) {
		this.name = release.name;
		this.version = release.version;
		this.builds = release.builds;
		this.shasums = release.shasums;
		this.shasums_signature = release.shasums_signature;
	}
	
	public getBuild(platform: string, arch: string): Build {
		return this.builds.find(b => b.os === platform && b.arch === arch);
	}

	public download(downloadUrl: string, installPath: string, identifier: string): Promise<void> {
		const headers = { 'User-Agent': identifier };
		return new Promise<void>((resolve, reject) => {
			https.request(downloadUrl, { headers: headers }, (response) => {
				if (response.statusCode === 301 || response.statusCode === 302) { // redirect for CDN
					const redirectUrl: string = response.headers.location;
					return resolve(this.download(redirectUrl, installPath, identifier));
				}
				if (response.statusCode !== 200) {
					return reject(response.statusMessage);
				}
				response
					.on('error', reject)
					.on('end', resolve)
					.pipe(fs.createWriteStream(installPath))
					.on('error', reject);
			})
				.on('error', reject)
				.end();
		});
	}

	public async verify(pkg: string, buildName: string): Promise<void> {
		const [localSum, remoteSum] = await Promise.all([
			this.calculateFileSha256Sum(pkg),
			this.downloadSha256Sum(buildName)
		]);
		if (remoteSum !== localSum) {
			throw new Error(`Install error: SHA sum for ${buildName} does not match.\n` +
				`(expected: ${remoteSum} calculated: ${localSum})`);
		}
	}

	calculateFileSha256Sum(path: string): Promise<string> {
		return new Promise<string>((resolve, reject) => {
			const hash = crypto.createHash('sha256');
			fs.createReadStream(path)
				.on('error', reject)
				.on('data', data => hash.update(data))
				.on('end', () => resolve(hash.digest('hex')));
		});
	}

	async downloadSha256Sum(buildName: string): Promise<string> {
		const [shasumResponse, signature] = await Promise.all([
			httpsRequest(`${releasesUrl}/${this.name}/${this.version}/${this.shasums}`),
			httpsRequest(`${releasesUrl}/${this.name}/${this.version}/${this.shasums_signature}`, {}, 'hex'),
		]);
		const verified = await openpgp.verify({
			message: openpgp.message.fromText(shasumResponse),
			publicKeys: (await openpgp.key.readArmored(hashiPublicKey)).keys,
			signature: await openpgp.signature.read(Buffer.from(signature, 'hex'))
		});
		const { valid } = verified.signatures[0];
		if (!valid) {
			throw new Error('signature could not be verified');
		}
		const shasumLine = shasumResponse.split(`\n`).find(line => line.includes(buildName));
		if (!shasumLine) {
			throw new Error(`Install error: no matching SHA sum for ${buildName}`);
		}

		return shasumLine.split("  ")[0];
	}

	public unpack(directory: string, pkgName: string): Promise<void> {
		return new Promise<void>((resolve, reject) => {
			let executable: string;
			yauzl.open(pkgName, { lazyEntries: true }, (err, zipfile) => {
				if (err) {
					return reject(err);
				}
				zipfile.readEntry();
				zipfile.on('entry', (entry) => {
					zipfile.openReadStream(entry, (err, readStream) => {
						if (err) {
							return reject(err);
						}
						readStream.on('end', () => {
							zipfile.readEntry(); // Close it
						});

						executable = `${directory}/${entry.fileName}`;
						const destination = fs.createWriteStream(executable);
						readStream.pipe(destination);
					});
				});
				zipfile.on('close', () => {
					fs.chmodSync(executable, '755');
					return resolve();
				});
			});
		});
	}
}

export async function getRelease(product: string, version?: string, userAgent?: string, includePrerelease?: boolean): Promise<Release> {
	const validVersion = semver.validRange(version, { includePrerelease, loose: true }); // "latest" will return invalid but that's ok because we'll select it by default
	const indexUrl = `${releasesUrl}/${product}/index.json`;
	const headers = userAgent ? { 'User-Agent': userAgent } : null;
	const body = await httpsRequest(indexUrl, { headers });
	const response = JSON.parse(body);
	let release: Release;
	if (!validVersion) { // pick the latest release (prereleases will be skipped for safety, set an explicit version instead)
		const releaseVersions = Object.keys(response.versions).filter(v => !semver.prerelease(v));
		version = releaseVersions.sort((a, b) => semver.rcompare(a, b))[0];
		release = new Release(response.versions[version]);
	} else {
		release = matchVersion(response.versions, validVersion, includePrerelease);
	}
	return release;
}

function matchVersion(versions: Release[], range: string, includePrerelease?: boolean): Release {
	// If a prerelease version range is given, it will match in that series (0.14-rc0, 0.14-rc1)
	// https://www.npmjs.com/package/semver#prerelease-tags
	const version = semver.maxSatisfying(Object.keys(versions), range, { includePrerelease });
	if (version) {
		return new Release(versions[version]);
	} else {
		throw new Error("No matching version found");
	}
}
